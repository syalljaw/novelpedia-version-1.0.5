import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const email = searchParams.get("email");
    const adminEmail = searchParams.get("adminEmail");
    
    if (action === "get_balance") {
      if (!email) {
        return NextResponse.json({ success: false, error: "Missing email parameter" }, { status: 400 });
      }
      const wallet = db.getWallet(email);
      return NextResponse.json({ success: true, wallet });
    }
    
    // Custom data query for the system admin dashboard
    if (action === "admin_get_data" && adminEmail) {
      const wallet = db.getWallet(adminEmail);
      if (!wallet.isAdmin) {
        return NextResponse.json({ success: false, error: "Unauthorized admin access" }, { status: 403 });
      }
      const allNovels = db.getNovels();
      const flaggedCount = allNovels.filter(n => n.isFlagged && !n.isBypassed).length;
      return NextResponse.json({ 
        success: true, 
        wallet, 
        flaggedCount, 
        totalPlatformFeex: 2470000,
        withdrawals: db.getWithdrawals(),
        wallets: db.getWallets(),
        systemLogs: db.getSystemLogs(),
        announcements: db.getAnnouncements(),
        novels: allNovels
      });
    }

    if (action === "get_announcements") {
      return NextResponse.json({ success: true, announcements: db.getAnnouncements() });
    }

    if (action === "get_public_authors") {
      const allWallets = db.getWallets();
      const publicAuthors = allWallets.map(w => ({
        email: w.email,
        username: w.username || w.email.split('@')[0],
        bio: w.bio || "Sastrawan di Novelpedia Retro.",
        isVerified: !!w.isVerified,
        customTitle: w.customTitle || "",
        followersCount: w.followersCount || 0,
        followers: w.followers || [],
        avatarUrl: w.avatarUrl || null
      }));
      return NextResponse.json({ success: true, authors: publicAuthors });
    }

    
    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, email, quantity, novelId, chapterId, targetUserId } = body;
    
    if (!email) {
      return NextResponse.json({ success: false, error: "Missing email parameter" }, { status: 400 });
    }
    
    const wallet = db.getWallet(email);
    
    if (action === "buy_coins") {
      const qty = Number(quantity) || 50;
      wallet.coins += qty;
      db.saveWallet(wallet);
      db.addSystemLog(`[PAYMENT] Top-up sukses! @${email} membeli ${qty} Koin Pixel.`);
      return NextResponse.json({ success: true, wallet, message: `Sukses membeli ${qty} Koin Pixel.` });
    }

    if (action === "update_profile") {
      const { username, bio, password, customTitle, avatarUrl } = body;
      if (username) wallet.username = username;
      if (typeof bio === "string") wallet.bio = bio;
      if (password) {
        wallet.password = password;
        wallet.provider = "local"; // indicate custom credential edit
      }
      if (typeof customTitle === "string") wallet.customTitle = customTitle;
      if (typeof avatarUrl === "string") wallet.avatarUrl = avatarUrl;
      
      db.saveWallet(wallet);
      // Synchronize in-memory novels author usernames too!
      const novelsList = db.getNovels();
      novelsList.forEach((n) => {
        if ((n.author || "").toLowerCase() === email.toLowerCase()) {
          n.authorUsername = wallet.username || username;
          db.saveNovel(n);
        }
      });
      
      db.addSystemLog(`[PROFILE] @${email} memperbarui profil publik mereka.`);
      return NextResponse.json({ success: true, wallet, message: "Profil berhasil diperbarui!" });
    }

    if (action === "buy_premium") {
      const { customTitle: reqTitle } = body;
      
      wallet.isVerified = true;
      wallet.isPremium = true;
      if (reqTitle) {
        wallet.customTitle = reqTitle;
      } else if (!wallet.customTitle || wallet.customTitle === "Sastrawan Baru") {
        wallet.customTitle = "Verified Member";
      }
      
      db.saveWallet(wallet);
      db.addSystemLog(`[PREMIUM] @${email} mengaktifkan langganan Premium! Verifikasi Ceklis Biru & Gelar '${wallet.customTitle}' aktif.`);
      return NextResponse.json({ success: true, wallet, message: `Langganan Premium aktif! Lencana ceklis biru didapatkan. Gelar kustom: ${wallet.customTitle}` });
    }
    
    if (action === "follow_user") {
      if (!targetUserId) {
        return NextResponse.json({ success: false, error: "Target email missing" }, { status: 400 });
      }
      const targetVal = db.getWallet(targetUserId);
      if (!wallet.following) wallet.following = [];
      if (!targetVal.followers) targetVal.followers = [];
      
      if (!wallet.following.includes(targetUserId.toLowerCase())) {
        wallet.following.push(targetUserId.toLowerCase());
      }
      if (!targetVal.followers.includes(email.toLowerCase())) {
        targetVal.followers.push(email.toLowerCase());
        targetVal.followersCount = (targetVal.followersCount || 0) + 1;
      }
      db.saveWallet(wallet);
      db.saveWallet(targetVal);
      db.addSystemLog(`[COMMUNITY] @${wallet.username || email} sekarang mengikuti @${targetVal.username || targetUserId}`);
      return NextResponse.json({ success: true, wallet, message: `Berhasil mengikuti @${targetVal.username || targetUserId}!` });
    }

    if (action === "unfollow_user") {
      if (!targetUserId) {
        return NextResponse.json({ success: false, error: "Target email missing" }, { status: 400 });
      }
      const targetVal = db.getWallet(targetUserId);
      if (!wallet.following) wallet.following = [];
      if (!targetVal.followers) targetVal.followers = [];
      
      wallet.following = wallet.following.filter(e => e.toLowerCase() !== targetUserId.toLowerCase());
      targetVal.followers = targetVal.followers.filter(e => e.toLowerCase() !== email.toLowerCase());
      targetVal.followersCount = Math.max(0, (targetVal.followers.length));
      
      db.saveWallet(wallet);
      db.saveWallet(targetVal);
      db.addSystemLog(`[COMMUNITY] @${wallet.username || email} berhenti mengikuti @${targetVal.username || targetUserId}`);
      return NextResponse.json({ success: true, wallet, message: `Berhenti mengikuti @${targetVal.username || targetUserId}.` });
    }

    if (action === "give_gift") {
      const { targetEmail, giftAmount } = body;
      if (!targetEmail || !giftAmount || giftAmount <= 0) {
        return NextResponse.json({ success: false, error: "Target email dan jumlah koin donasi diperlukan." }, { status: 400 });
      }
      if (wallet.coins < giftAmount) {
        return NextResponse.json({ success: false, error: "Koin tidak cukup untuk memberikan hadiah." }, { status: 400 });
      }
      
      const targetVal = db.getWallet(targetEmail);
      wallet.coins -= giftAmount;
      // Gifts are converted directly to revenue for the author (1 coin = Rp 100)
      targetVal.revenueExp += giftAmount * 100;
      
      db.saveWallet(wallet);
      db.saveWallet(targetVal);
      db.addSystemLog(`[GIFT] Pembaca @${wallet.username || email} mendonasikan ${giftAmount} Koin kepada Kreator @${targetVal.username || targetEmail}.`);
      return NextResponse.json({ success: true, wallet, message: `Berhasil memberikan hadiah dukungan ${giftAmount} Koin kepada penulis!` });
    }

    if (action === "admin_add_announcement") {
      const adminWallet = db.getWallet(email);
      if (!adminWallet.isAdmin) {
        return NextResponse.json({ success: false, error: "Unauthorized admin access." }, { status: 403 });
      }
      const { title, content, type } = body;
      if (!title || !content) {
        return NextResponse.json({ success: false, error: "Title dan konten pengumuman tidak boleh kosong" }, { status: 400 });
      }
      const freshAnn = {
        id: "a_" + Math.random().toString(36).substring(2, 9),
        title,
        content,
        createdAt: new Date().toISOString(),
        type: type || "info"
      };
      db.saveAnnouncement(freshAnn);
      db.addSystemLog(`[ADMIN INFO] Admin @${email} merilis info update: ${title}`);
      return NextResponse.json({ success: true, message: "Pengumuman berhasil disiarkan!", announcement: freshAnn });
    }

    if (action === "admin_delete_announcement") {
      const adminWallet = db.getWallet(email);
      if (!adminWallet.isAdmin) {
        return NextResponse.json({ success: false, error: "Unauthorized admin access." }, { status: 403 });
      }
      const { announcementId } = body;
      if (!announcementId) {
        return NextResponse.json({ success: false, error: "Announcement id missing." }, { status: 400 });
      }
      db.deleteAnnouncement(announcementId);
      db.addSystemLog(`[ADMIN INFO] Admin @${email} menghapus pengumuman.`);
      return NextResponse.json({ success: true, message: "Pengumuman berhasil diarsipkan." });
    }

    if (action === "admin_modify_user_direct") {
      const adminWallet = db.getWallet(email);
      if (!adminWallet.isAdmin) {
        return NextResponse.json({ success: false, error: "Unauthorized admin access." }, { status: 403 });
      }
      const { targetEmail, coinsDelta, setCoins, isBanned, isVerified, customTitle, isPremium } = body;
      if (!targetEmail) {
        return NextResponse.json({ success: false, error: "Target email missing." }, { status: 400 });
      }
      const targetVal = db.getWallet(targetEmail);
      
      if (typeof setCoins === "number") {
        targetVal.coins = setCoins;
      } else if (typeof coinsDelta === "number") {
        targetVal.coins = Math.max(0, targetVal.coins + coinsDelta);
      }
      
      if (typeof isBanned === "boolean") {
        targetVal.isBanned = isBanned;
      }
      if (typeof isVerified === "boolean") {
        targetVal.isVerified = isVerified;
      }
      if (typeof isPremium === "boolean") {
        targetVal.isPremium = isPremium;
        if (isPremium) {
          targetVal.isVerified = true;
        }
      }
      if (typeof customTitle === "string") {
        targetVal.customTitle = customTitle;
      }
      
      db.saveWallet(targetVal);
      db.addSystemLog(`[ADMIN MANAGE] Admin @${email} mengubah profil/akses @${targetEmail}. Coins: ${targetVal.coins}, Banned: ${targetVal.isBanned}`);
      return NextResponse.json({ success: true, wallet: targetVal, message: `Akses @${targetEmail} berhasil diperbarui!` });
    }

    if (action === "toggle_trending") {
      const { novelId } = body;
      if (!novelId) {
        return NextResponse.json({ success: false, error: "Novel ID missing." }, { status: 400 });
      }
      const novel = db.getNovels().find(n => n.id === novelId);
      if (!novel) {
        return NextResponse.json({ success: false, error: "Novel tidak ditemukan" }, { status: 404 });
      }
      if ((novel.author || "").toLowerCase() !== email.toLowerCase() && !wallet.isAdmin) {
        return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 403 });
      }
      
      // Only premium authors or admin can request trending
      if (!wallet.isPremium && !wallet.isAdmin) {
        return NextResponse.json({ success: false, error: "Hanya akun Premium yang diperbolehkan mengaktifkan status Top Trending!" }, { status: 403 });
      }
      
      // Toggle boolean trending status
      const anyNovel = novel as any;
      anyNovel.isTrending = !anyNovel.isTrending;
      db.saveNovel(novel);
      
      db.addSystemLog(`[TRENDING] @${email} mengubah status trending novel '${novel.title}' menjadi: ${anyNovel.isTrending ? "Trending" : "Standar"}`);
      return NextResponse.json({ success: true, novel, message: `Status Top Trending novel berhasil diubah menjadi: ${anyNovel.isTrending ? "Sedang Populer" : "Standar"}` });
    }
    
    if (action === "withdraw_revenue") {
      const { bankName, bankAccount, accountHolder } = body;
      if (wallet.revenueExp < 100000) {
        return NextResponse.json({ success: false, error: "Batas minimum pencairan pendapatan adalah Rp 100.000" }, { status: 400 });
      }
      const val = wallet.revenueExp;
      wallet.revenueExp = 0;
      db.saveWallet(wallet);
      
      const reqId = "w_" + Math.random().toString(36).substring(2, 9);
      db.saveWithdrawal({
        id: reqId,
        email: wallet.email,
        bankName: bankName || "BANK SIMULASI",
        bankAccount: bankAccount || "000-000-000",
        accountHolder: accountHolder || wallet.email.split('@')[0].toUpperCase(),
        amount: val,
        status: "pending",
        createdAt: new Date().toISOString()
      });
      
      db.addSystemLog(`[PAYMENT] Mengajukan pencairan royalti! @${email} sebesar Rp ${val.toLocaleString('id-ID')}`);
      return NextResponse.json({ success: true, wallet, message: "Pengajuan penarikan dana royalti berhasil diajukan ke antrean Admin." });
    }
    
    if (action === "unlock_chapter") {
      if (!novelId || !chapterId) {
        return NextResponse.json({ success: false, error: "Missing novelId or chapterId" }, { status: 400 });
      }
      
      const novel = db.getNovels().find(n => n.id === novelId);
      if (!novel) return NextResponse.json({ success: false, error: "Novel tidak ditemukan" }, { status: 404 });
      
      const basePrice = novel.priceCoins || 5;
      const price = wallet.isPremium ? Math.max(1, Math.ceil(basePrice * 0.5)) : basePrice;

      if (wallet.coins < price) {
        return NextResponse.json({ success: false, error: `Koin tidak mencukupi. Bab ini butuh ${price} koin (Saldo Anda: ${wallet.coins} koin).` }, { status: 400 });
      }
      
      // Deduct coins
      wallet.coins -= price;
      db.saveWallet(wallet);
      
      // Give simulated IDR revenue (1 coin = Rp 15,000) to the author. Give based on basePrice to benefit authors, or price? basePrice is better so writers don't lose revenue from premium users.
      const authorWallet = db.getWallet(novel.author);
      const earnedIDR = basePrice * 15000;
      authorWallet.revenueExp += earnedIDR;
      db.saveWallet(authorWallet);
      
      db.addSystemLog(`[PAYMENT] Pembaca @${email} membuka bab terkunci pada novel '${novel.title}' senilai ${price} Koin`);
      
      return NextResponse.json({ 
        success: true, 
        wallet, 
        authorEarnedIDR: earnedIDR,
        message: "Chapter berhasil dibuka! Selamat membaca." 
      });
    }
    
    // Admin Override and Plagiarism bypass action
    if (action === "override_flag") {
      const adminWallet = db.getWallet(email);
      if (!adminWallet.isAdmin) {
        return NextResponse.json({ success: false, error: "Akses ditolak. Anda bukan admin." }, { status: 403 });
      }
      
      if (!novelId) {
        return NextResponse.json({ success: false, error: "Novel tidak ditentukan" }, { status: 400 });
      }
      
      const novel = db.getNovels().find(n => n.id === novelId);
      if (!novel) return NextResponse.json({ success: false, error: "Novel tidak ditemukan" }, { status: 404 });
      
      novel.isBypassed = true;
      novel.isFlagged = false;
      db.saveNovel(novel);
      
      db.addSystemLog(`[ADMIN OVERRIDE] Akun Admin @${email} memulihkan blokir AI untuk novel '${novel.title}' (Penulis: ${novel.authorUsername})`);
      
      return NextResponse.json({ success: true, message: "Karantina Novel dipulihkan secara manual oleh Admin!" });
    }
    
    // Admin Payout processing
    if (action === "admin_update_withdrawal") {
      const adminWallet = db.getWallet(email);
      if (!adminWallet.isAdmin) {
        return NextResponse.json({ success: false, error: "Unauthorized admin access" }, { status: 403 });
      }
      
      const { withdrawalId, status: newStatus } = body;
      const withdrawal = db.getWithdrawals().find(w => w.id === withdrawalId);
      if (!withdrawal) {
        return NextResponse.json({ success: false, error: "Data pencairan tidak ditemukan" }, { status: 404 });
      }
      
      withdrawal.status = newStatus;
      db.saveWithdrawal(withdrawal);
      
      if (newStatus === "rejected") {
        // Refund back to writer wallet
        const targetWallet = db.getWallet(withdrawal.email);
        targetWallet.revenueExp += withdrawal.amount;
        db.saveWallet(targetWallet);
        db.addSystemLog(`[ADMIN DISMISS] Admin @${email} menolak penarikan Rp ${withdrawal.amount.toLocaleString('id-ID')} @${withdrawal.email}, saldo dikembalikan.`);
      } else {
        db.addSystemLog(`[ADMIN APPROVE] Admin @${email} menyetujui transfer Rp ${withdrawal.amount.toLocaleString('id-ID')} @${withdrawal.email}`);
      }
      
      return NextResponse.json({ success: true, message: `Status penarikan diperbarui ke ${newStatus}` });
    }
    
    // Admin coin penalty action for illegal users
    if (action === "admin_penalty_coins") {
      const adminWallet = db.getWallet(email);
      if (!adminWallet.isAdmin) {
        return NextResponse.json({ success: false, error: "Unauthorized admin access" }, { status: 403 });
      }
      
      const { targetEmail, penaltyAmount, reason } = body;
      if (!targetEmail) {
        return NextResponse.json({ success: false, error: "Missing user target email parameter" }, { status: 400 });
      }
      
      const targetWallet = db.getWallet(targetEmail);
      const reduced = Number(penaltyAmount) || 0;
      
      targetWallet.coins = Math.max(0, targetWallet.coins - reduced);
      db.saveWallet(targetWallet);
      
      db.addSystemLog(`[ADMIN PENALTY] Admin @${email} menjatuhkan penalti koin kepada @${targetEmail} sebesar -${reduced} koin. Alasan: ${reason || "Tindakan ilegal detected"}`);
      return NextResponse.json({ success: true, message: `Berhasil mengurangi ${reduced} koin dari pengguna @${targetEmail}.` });
    }
    
    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
