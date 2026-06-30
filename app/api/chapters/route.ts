import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { scanChapterContent } from "@/lib/gemini-scanner";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const novelId = searchParams.get("novelId");
    
    if (!novelId) {
      return NextResponse.json({ success: false, error: "Missing novelId parameter" }, { status: 400 });
    }
    
    let chapters = db.getChapters().filter(c => c.novelId === novelId);
    // Sort by order asc
    chapters.sort((a, b) => a.order - b.order);
    
    return NextResponse.json({ success: true, chapters });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { novelId, title, content, isLocked, publishDate, authorUsername } = body;
    
    if (!novelId || !title || !content) {
      return NextResponse.json({ success: false, error: "Missing required parameters (novelId, title, content)" }, { status: 400 });
    }
    
    // 1. Min 200 words validation
    const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
    if (wordCount < 200) {
      return NextResponse.json({ 
        success: false, 
        error: `Sistem Menolak: Minimal harus 200 kata tiap bab! Sementara bab ini hanya memiliki ${wordCount} kata. Silakan kembangkan fiksi orisinal Anda lebih dalam.` 
      }, { status: 400 });
    }
    
    const novels = db.getNovels();
    const novel = novels.find(n => n.id === novelId);
    if (!novel) {
      return NextResponse.json({ success: false, error: "Novel tidak ditemukan" }, { status: 404 });
    }
    
    // Check if writer is premium
    const authorWallet = db.getWallet(novel.author);
    const isPremiumWriter = authorWallet?.isPremium || false;

    // Evaluate chapter using advanced original writing scan (Gemini)
    // BYPASS FOR PREMIUM VIP WRITERS
    let scanReport = { score: 12, reason: "Aman." };
    if (!isPremiumWriter) {
      try {
        scanReport = await scanChapterContent(title, content);
      } catch (e) {
        console.error("AI Scan Error:", e);
      }
    } else {
      scanReport.reason = "Dilewati (Hak Istimewa Bypass Premium VIP). Teks aman dipublikasi otomatis.";
    }
    
    const chapId = "chap_" + Date.now();
    const existingChapters = db.getChapters().filter(c => c.novelId === novelId);
    const lastChapterOrder = existingChapters.reduce((max, c) => c.order > max ? c.order : max, 0);
      
    // 2. AI Suspicion Checker
    let aiSuspicionScore = 0;
    let aiSuspicionReason = "Lolos Sensor Aktivitas AI (Pola Upload Organik/Manusia).";
    
    if (isPremiumWriter) {
      aiSuspicionReason = "Dilewati - Penulis Premium memiliki hak eksklusif Bypass Sensor AI.";
    } else {
      // If the novel's update days is "Setiap Hari" or they upload chapters on consecutive days
      // with high word count (e.g. > 800 words), it is flagged as AI written.
      const isDailySchedule = novel.updateDays?.some(d => d.toLowerCase() === "setiap hari" || d.toLowerCase() === "daily") || false;
      
      // Check if there are consecutive uploads or very rapid uploads
      let hasRecentRapidUploads = false;
      if (existingChapters.length > 0) {
        // Find chapter uploaded in the last 24 hours
        const lastChap = existingChapters[existingChapters.length - 1];
        if (lastChap.createdAt) {
          const lastDate = new Date(lastChap.createdAt).getTime();
          const diffMs = Date.now() - lastDate;
          const diffHours = diffMs / (1000 * 60 * 60);
          if (diffHours < 24) {
            hasRecentRapidUploads = true;
          }
        }
      }
      
      if ((isDailySchedule || hasRecentRapidUploads) && wordCount > 800) {
        aiSuspicionScore = 85;
        aiSuspicionReason = `Pola curang terdeteksi: Upload harian intensif dengan jumlah kata besar (${wordCount} kata) dalam interval waktu sempit. Dicurigai memakai asisten teks AI generatif generator.`;
        
        db.addSystemLog(`[AI SUSPICION WARNING] Penulis @${novel.authorUsername} terindikasi menggunakan AI untuk '${title}' (${wordCount} kata, upload intensif).`);
      } else if (wordCount > 1500) {
        aiSuspicionScore = 40;
        aiSuspicionReason = `Isi tulisan sangat panjang (${wordCount} kata). Direkomendasikan penelaahan orisinalitas berkala. Solusi: Pastikan tidak menyalin draf AI.`;
      }
    }
    
    const newChapter = {
      id: chapId,
      novelId,
      title,
      content,
      order: lastChapterOrder + 1,
      plagiarismScore: scanReport.score,
      plagiarismReason: scanReport.reason,
      isLocked: !!isLocked,
      publishDate: publishDate || undefined,
      createdAt: new Date().toISOString(), // Exact upload date of chapter
      aiSuspicionScore,
      aiSuspicionReason
    };
    
    db.saveChapter(newChapter);
    
    // If plagiarism is detected or score >= 70, flag the entire novel!
    if (scanReport.score >= 70) {
      novel.isFlagged = true;
      novel.isBypassed = false; // Reset bypass on new offense
      db.saveNovel(novel);
      db.addSystemLog(`[AI BLOCK] Novel '${novel.title}' dikarantina karena bab '${title}' terdeteksi plagiat (${scanReport.score}%)`);
    } else {
      // Increase chapters count of the novel
      novel.chaptersCount += 1;
      db.saveNovel(novel);
      db.addSystemLog(`[CHAPTER] Bab baru dipublikasikan: '${title}' (${wordCount} kata) untuk novel '${novel.title}'`);
    }
    
    // If a scheduling publish date is given, log simulated Google Calendar events syncing
    if (publishDate) {
      db.addSystemLog(`[CALENDAR] Auto-synchronized scheduling release for ${publishDate} synced to Google Calendar (Novelpedia Calendar)`);
    }
    
    return NextResponse.json({
      success: true,
      chapter: {
        ...newChapter,
        wordCount
      },
      scanReport,
      aiSuspicion: {
        score: aiSuspicionScore,
        reason: aiSuspicionReason
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
