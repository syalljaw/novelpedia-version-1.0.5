import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const novelId = searchParams.get("novelId");
    
    if (!novelId) {
      return NextResponse.json({ success: false, error: "Missing novelId parameter" }, { status: 400 });
    }
    
    const comments = db.getComments().filter(c => c.novelId === novelId);
    return NextResponse.json({ success: true, comments });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { novelId, username, email, content } = body;
    
    if (!novelId || !username || !content) {
      return NextResponse.json({ success: false, error: "Missing required parameters (novelId, username, content)" }, { status: 400 });
    }
    
    const commentId = "comm_" + Date.now();
    const newComment = {
      id: commentId,
      novelId,
      username,
      email: email || "",
      content,
      likes: 0,
      createdAt: new Date().toISOString()
    };
    
    db.saveComment(newComment);
    
    const novels = db.getNovels();
    const novel = novels.find(n => n.id === novelId);
    
    db.addSystemLog(`User @${username} meninggalkan ulasan untuk novel '${novel?.title || ''}'`);
    
    return NextResponse.json({ success: true, comment: newComment });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { commentId, action, authorReply } = body;
    
    const comments = db.getComments();
    const comment = comments.find(c => c.id === commentId);
    
    if (!comment) {
      return NextResponse.json({ success: false, error: "Comment not found" }, { status: 404 });
    }
    
    if (action === "like") {
      comment.likes = (comment.likes || 0) + 1;
    } else if (action === "reply" && authorReply) {
      comment.authorReply = authorReply;
    }
    
    db.saveComment(comment);
    
    return NextResponse.json({ success: true, comment });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
