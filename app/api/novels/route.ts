import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function DELETE(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ success: false, error: "Too many requests. Anti-DDoS protection active." }, { status: 429 });
  }
  
  try {
    const { searchParams } = new URL(request.url);
    const novelId = searchParams.get("novelId");
    
    if (!novelId) {
      return NextResponse.json({ success: false, error: "Missing novelId parameter" }, { status: 400 });
    }
    
    db.deleteNovel(novelId);
    
    return NextResponse.json({ success: true, message: "Novel deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
  if (!checkRateLimit(ip, 200)) { // Higher limit for GET
    return NextResponse.json({ success: false, error: "Too many requests. Anti-DDoS protection active." }, { status: 429 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const authorEmail = searchParams.get("authorEmail");
    
    let list = db.getNovels();
    
    if (authorEmail) {
      list = list.filter(n => (n.author || "").toLowerCase() === authorEmail.toLowerCase());
    }
    
    return NextResponse.json({ success: true, novels: list });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ success: false, error: "Too many requests. Anti-DDoS protection active." }, { status: 429 });
  }

  try {
    const body = await request.json();
    const { action, novelId, deviceId } = body;
    
    if (action === "record_view" && novelId && deviceId) {
      const novels = db.getNovels();
      const novel = novels.find(n => n.id === novelId);
      
      if (novel) {
        novel.views = novel.views || 0;
        novel.viewedDevices = novel.viewedDevices || [];
        
        if (!novel.viewedDevices.includes(deviceId)) {
          novel.views += 1;
          novel.viewedDevices.push(deviceId);
          db.saveNovel(novel);
        }
        return NextResponse.json({ success: true, views: novel.views });
      } else {
        return NextResponse.json({ success: false, error: "Novel not found" }, { status: 404 });
      }
    }
    
    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ success: false, error: "Too many requests. Anti-DDoS protection active." }, { status: 429 });
  }

  try {
    const body = await request.json();
    const { title, synopsis, genre, genres, author, authorUsername, priceCoins, status, updateDays, coverUrl } = body;
    
    if (!title || !synopsis || !genre || !author) {
      return NextResponse.json({ success: false, error: "Missing required parameters (title, synopsis, genre, author)" }, { status: 400 });
    }
    
    // Auto color gradient for retro cards styling variation
    const gradients = [
      "from-purple-900 to-indigo-950",
      "from-blue-900 to-emerald-950",
      "from-red-950 to-slate-900",
      "from-amber-950 to-orange-950",
      "from-rose-950 to-pink-950"
    ];
    const bannerColor = gradients[Math.floor(Math.random() * gradients.length)];
    
    // Auto generate high-quality placeholder cover seed from Title if empty
    const finalCoverUrl = coverUrl ? coverUrl.trim() : `https://picsum.photos/seed/${encodeURIComponent(title)}/450/800`;
    
    const novelId = "novel_" + Date.now();
    const newNovel = {
      id: novelId,
      title,
      synopsis,
      author,
      authorUsername: authorUsername || "PenulisMisterius",
      genre, // backward compatibility
      genres: genres || [genre], // Multiple genres list
      status: status || "ongoing", // 'ongoing' | 'hiatus' | 'tamat'
      updateDays: updateDays || ["Setiap Hari"], // Scheduled update days
      coverUrl: finalCoverUrl,
      rating: 5.0,
      bannerColor,
      chaptersCount: 0,
      isFlagged: false,
      isBypassed: false,
      createdAt: new Date().toISOString().split('T')[0],
      priceCoins: Number(priceCoins) || 0,
      views: 0,
      viewedDevices: []
    };
    
    db.saveNovel(newNovel);
    db.addSystemLog(`Penulis @${newNovel.authorUsername} menerbitkan novel baru: ${title}`);
    
    return NextResponse.json({ success: true, novel: newNovel });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
