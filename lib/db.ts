import fs from "fs";
import path from "path";

// In-memory Full-Stack Server-Authoritative Database for Novelpedia Retro
export interface Novel {
  id: string;
  title: string;
  synopsis: string;
  author: string; // email of the author
  authorUsername: string; // username
  genre: string; // fallback
  genres?: string[]; // Multiple genres selection support
  status?: 'ongoing' | 'hiatus' | 'tamat'; // Novel status
  updateDays?: string[]; // E.g., ["Senin", "Rabu"] or ["Setiap Hari"]
  rating: number;
  bannerColor: string;
  coverUrl?: string; // Cover artwork URL
  chaptersCount: number;
  isFlagged: boolean; // Plagiarism/AI Blocked flag
  isBypassed: boolean; // Cleared by Admin Override
  createdAt: string;
  priceCoins: number; // 0 for free, higher for premium
  views?: number;
  viewedDevices?: string[];
}

export interface Chapter {
  id: string;
  novelId: string;
  title: string;
  content: string;
  order: number;
  plagiarismScore: number; // calculated by Gemini or mock scanner
  plagiarismReason: string;
  isLocked: boolean;
  publishDate?: string; // Calendar release scheduling
  createdAt?: string; // Exact upload date of chapter
}

export interface Comment {
  id: string;
  novelId: string;
  username: string;
  avatar?: string;
  rating?: number;
  content: string;
  createdAt: string;
  likes?: number;
  authorReply?: string;
  email?: string;
}

export interface ProofreadRequest {
  id: string;
  novelId: string;
  chapterId: string;
  novelTitle: string;
  chapterTitle: string;
  authorEmail: string;
  originalText: string;
  suggestedText: string;
  aiExplanation: string;
  status: 'pending' | 'applied' | 'rejected';
}

export interface WithdrawalRequest {
  id: string;
  email: string;
  bankName: string;
  bankAccount: string;
  accountHolder: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface UserWallet {
  email: string;
  coins: number;
  revenueExp: number; // for writers (IDR)
  isAdmin: boolean;
  username?: string;
  bio?: string;
  password?: string; // to edit password if not using thirdparty
  provider?: 'local' | 'google' | 'facebook'; // register provider
  followersCount?: number;
  isVerified?: boolean; // verified blue checkmark
  customTitle?: string; // custom request title
  isPremium?: boolean; // Active Premium subscription (No Ads, Blue check, custom title)
  isBanned?: boolean; // Banned flag
  following?: string[]; // Emails of users this user follows
  followers?: string[]; // Emails of users following this user
}

export interface SystemAnnouncement {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  type: 'info' | 'update' | 'warning';
}

// Global scope initialization to prevent hot-reload wipes
declare global {
  var globalNovels: Novel[] | undefined;
  var globalChapters: Chapter[] | undefined;
  var globalComments: Comment[] | undefined;
  var globalProofreads: ProofreadRequest[] | undefined;
  var globalWallets: UserWallet[] | undefined;
  var globalWithdrawals: WithdrawalRequest[] | undefined;
  var globalSystemLogs: string[] | undefined;
  var globalAnnouncements: SystemAnnouncement[] | undefined;
}

// // Pre-populated JRPG retro themes novels changed to empty starter dataset
const defaultNovels: Novel[] = [];

const defaultChapters: Chapter[] = [];

const defaultComments: Comment[] = [];

const defaultProofreads: ProofreadRequest[] = [];

const defaultWithdrawals: WithdrawalRequest[] = [
  {
    id: "w_1",
    email: "fajar.sastra@yahoo.com",
    bankName: "BANK CENTRAL ASIA (BCA)",
    bankAccount: "88201294811",
    accountHolder: "FAJAR JAYA SASTRA",
    amount: 450000,
    status: "pending",
    createdAt: new Date().toISOString()
  },
  {
    id: "w_2",
    email: "arsy.novelist@cyber.net",
    bankName: "BANK MANDIRI",
    bankAccount: "12000554529",
    accountHolder: "ARSY PENA UTAMA",
    amount: 1200000,
    status: "pending",
    createdAt: new Date().toISOString()
  }
];

const defaultWallets: UserWallet[] = [
  { email: "irsyalfaiz97@gmail.com", coins: 0, revenueExp: 0, isAdmin: true, isVerified: true, isPremium: true }, // Admin preset starter wallet
  { email: "yareyyaa0529@gmail.com", coins: 0, revenueExp: 0, isAdmin: true, isVerified: true, isPremium: true }, // Admin 2 preset starter wallet
  { email: "fajar.sastra@yahoo.com", coins: 340, revenueExp: 450000, isAdmin: false },
  { email: "arsy.novelist@cyber.net", coins: 80, revenueExp: 1200000, isAdmin: false }
];

const defaultSystemLogs: string[] = [
  "[SYSTEM INIT] Portal Novelpedia modern booted online.",
  "[SYSTEM] Database initialized. Waiting for Indie Authors to register novels."
];

const defaultAnnouncements: SystemAnnouncement[] = [
  {
    id: "a_1",
    title: "🎉 Selamat Datang di Portal Novelpedia Retro v2.0!",
    content: "Kami menghadirkan pemutakhiran total! Bab berbayar kini ditiadakan (bebas baca gratis), dan digantikan sistem keanggotaan Premium dengan lencana biru, kustomisasi judul pena, hilangkan iklan pembaca, serta hak istimewa promosi novel Trending bagi novelis.",
    createdAt: new Date().toISOString(),
    type: "info"
  },
  {
    id: "a_2",
    title: "📈 Novelis Premium: Kampanye Top Trending Diaktifkan!",
    content: "Penulis dengan keanggotaan Premium kini dapat menandai novel mereka untuk diajukan ke jajaran utama Top Trending Beranda! Klik tingkatkan akun untuk meluncurkan karya luar biasa Anda.",
    createdAt: new Date().toISOString(),
    type: "update"
  }
];

const DB_FILE = path.join(process.cwd(), "novelpedia_db.json");

function readDbFile() {
  try {
    if (typeof window === "undefined" && fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, "utf8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Gagal membaca database file:", err);
  }
  return {};
}

function writeDbFileRaw(data: any) {
  try {
    if (typeof window === "undefined") {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
    }
  } catch (err) {
    console.error("Gagal menyimpan database file:", err);
  }
}

function syncFromDisk() {
  if (typeof window !== "undefined") return;

  try {
    if (!fs.existsSync(DB_FILE)) {
      const initialData = {
        novels: defaultNovels,
        chapters: defaultChapters,
        comments: defaultComments,
        proofreads: defaultProofreads,
        wallets: defaultWallets,
        withdrawals: defaultWithdrawals,
        systemLogs: defaultSystemLogs,
        announcements: defaultAnnouncements
      };
      writeDbFileRaw(initialData);
    }

    const data = readDbFile();
    globalThis.globalNovels = data.novels || defaultNovels;
    globalThis.globalChapters = data.chapters || defaultChapters;
    globalThis.globalComments = data.comments || defaultComments;
    globalThis.globalProofreads = data.proofreads || defaultProofreads;
    globalThis.globalWallets = data.wallets || defaultWallets;
    globalThis.globalWithdrawals = data.withdrawals || defaultWithdrawals;
    globalThis.globalSystemLogs = data.systemLogs || defaultSystemLogs;
    globalThis.globalAnnouncements = data.announcements || defaultAnnouncements;
  } catch (err) {
    console.error("Error syncing from disk:", err);
  }
}

function persistToDisk() {
  if (typeof window !== "undefined") return;

  const data = {
    novels: globalThis.globalNovels || defaultNovels,
    chapters: globalThis.globalChapters || defaultChapters,
    comments: globalThis.globalComments || defaultComments,
    proofreads: globalThis.globalProofreads || defaultProofreads,
    wallets: globalThis.globalWallets || defaultWallets,
    withdrawals: globalThis.globalWithdrawals || defaultWithdrawals,
    systemLogs: globalThis.globalSystemLogs || defaultSystemLogs,
    announcements: globalThis.globalAnnouncements || defaultAnnouncements
  };
  writeDbFileRaw(data);
}

export const db = {
  getNovels: () => {
    syncFromDisk();
    return globalThis.globalNovels || defaultNovels;
  },
  deleteNovel: (novelId: string) => {
    syncFromDisk();
    const list = [...db.getNovels()].filter(n => n.id !== novelId);
    globalThis.globalNovels = list;
    persistToDisk();
  },
  saveNovel: (novel: Novel) => {
    syncFromDisk();
    const list = [...db.getNovels()];
    const index = list.findIndex(n => n.id === novel.id);
    if (index >= 0) {
      list[index] = { ...list[index], ...novel };
    } else {
      list.push(novel);
    }
    globalThis.globalNovels = list;
    persistToDisk();
    return novel;
  },
  getChapters: () => {
    syncFromDisk();
    return globalThis.globalChapters || defaultChapters;
  },
  saveChapter: (chapter: Chapter) => {
    syncFromDisk();
    const list = [...db.getChapters()];
    const index = list.findIndex(c => c.id === chapter.id);
    if (index >= 0) {
      list[index] = chapter;
    } else {
      list.push(chapter);
    }
    globalThis.globalChapters = list;
    persistToDisk();
    return chapter;
  },
  getComments: () => {
    syncFromDisk();
    return globalThis.globalComments || defaultComments;
  },
  saveComment: (comment: Comment) => {
    syncFromDisk();
    const list = [...db.getComments()];
    list.push(comment);
    globalThis.globalComments = list;
    persistToDisk();
    return comment;
  },
  getProofreads: () => {
    syncFromDisk();
    return globalThis.globalProofreads || defaultProofreads;
  },
  saveProofread: (req: ProofreadRequest) => {
    syncFromDisk();
    const list = [...db.getProofreads()];
    const index = list.findIndex(p => p.id === req.id);
    if (index >= 0) {
      list[index] = req;
    } else {
      list.push(req);
    }
    globalThis.globalProofreads = list;
    persistToDisk();
    return req;
  },
  getWithdrawals: () => {
    syncFromDisk();
    return globalThis.globalWithdrawals || defaultWithdrawals;
  },
  saveWithdrawal: (withdraw: WithdrawalRequest) => {
    syncFromDisk();
    const list = [...db.getWithdrawals()];
    const index = list.findIndex(w => w.id === withdraw.id);
    if (index >= 0) {
      list[index] = withdraw;
    } else {
      list.push(withdraw);
    }
    globalThis.globalWithdrawals = list;
    persistToDisk();
    return withdraw;
  },
  getWallets: () => {
    syncFromDisk();
    return globalThis.globalWallets || defaultWallets;
  },
  getWallet: (email: string) => {
    syncFromDisk();
    const list = [...db.getWallets()];
    const found = list.find(w => w.email.toLowerCase() === email.toLowerCase());
    if (found) {
      if (!found.following) found.following = [];
      if (!found.followers) found.followers = [];
      return found;
    }
    const isGlobalAdmin = email.toLowerCase() === 'irsyalfaiz97@gmail.com' || email.toLowerCase() === 'yareyyaa0529@gmail.com';
    // Autocreate wallet for new log-ins
    const fresh: UserWallet = {
      email,
      coins: 50, // default new user coins bonus
      revenueExp: 0,
      isAdmin: isGlobalAdmin,
      username: email.split("@")[0],
      bio: "Pembaca setia di Portal Novelpedia Retro.",
      password: "password123", // default fallback editable password
      provider: "google", // assume thirdparty unless custom login
      followersCount: 0, 
      isVerified: isGlobalAdmin,
      customTitle: isGlobalAdmin ? "Super Admin" : "Sastrawan Baru",
      isPremium: isGlobalAdmin,
      isBanned: false,
      following: [],
      followers: []
    };
    list.push(fresh);
    globalThis.globalWallets = list;
    persistToDisk();
    return fresh;
  },
  saveWallet: (wallet: UserWallet) => {
    syncFromDisk();
    const list = [...db.getWallets()];
    const index = list.findIndex(w => w.email.toLowerCase() === wallet.email.toLowerCase());
    if (index >= 0) {
      list[index] = { ...list[index], ...wallet };
    } else {
      list.push(wallet);
    }
    globalThis.globalWallets = list;
    persistToDisk();
    return wallet;
  },
  getSystemLogs: () => {
    syncFromDisk();
    return globalThis.globalSystemLogs || defaultSystemLogs;
  },
  addSystemLog: (log: string) => {
    syncFromDisk();
    const list = [...db.getSystemLogs()];
    list.unshift(`[${new Date().toISOString().slice(11, 19)}] ${log}`);
    if (list.length > 50) list.pop();
    globalThis.globalSystemLogs = list;
    persistToDisk();
  },
  getAnnouncements: () => {
    syncFromDisk();
    return globalThis.globalAnnouncements || defaultAnnouncements;
  },
  saveAnnouncement: (ann: SystemAnnouncement) => {
    syncFromDisk();
    const list = [...db.getAnnouncements()];
    const index = list.findIndex(a => a.id === ann.id);
    if (index >= 0) {
      list[index] = ann;
    } else {
      list.unshift(ann);
    }
    globalThis.globalAnnouncements = list;
    persistToDisk();
    return ann;
  },
  deleteAnnouncement: (id: string) => {
    syncFromDisk();
    const list = [...db.getAnnouncements()];
    const filtered = list.filter(a => a.id !== id);
    globalThis.globalAnnouncements = filtered;
    persistToDisk();
    return true;
  }
};
