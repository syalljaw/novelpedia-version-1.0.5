import React, { useState, useEffect } from "react";
import { 
  User, 
  Shield, 
  Landmark, 
  RefreshCw, 
  Award, 
  Send, 
  CheckCircle2, 
  PiggyBank, 
  Terminal, 
  LogOut, 
  LifeBuoy, 
  Mail, 
  Phone, 
  MessageSquare,
  ChevronRight,
  Settings,
  HelpCircle,
  FileText,
  ShieldCheck,
  Star,
  Sparkles,
  Heart,
  Lock,
  Unlock,
  BookOpen,
  Users,
  Plus,
  Minus,
  Check,
  Crown,
  Camera,
  Users2,
  LockKeyhole,
  Pencil,
  BarChart2,
  Wallet,
  TrendingUp,
  X,
  Eye,
  Share2,
  Bell
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import AccountSettings from "./AccountSettings";

interface Wallet {
  email: string;
  coins: number;
  revenueExp: number;
  isAdmin: boolean;
  username?: string;
  bio?: string;
  password?: string;
  provider?: 'local' | 'google' | 'facebook';
  followersCount?: number;
  isVerified?: boolean;
  customTitle?: string;
}

interface ProfileTabProps {
  user: { email: string; username: string };
  wallet: Wallet | null;
  onRefreshWallet: () => void;
  onLogin: (email: string, username: string) => void;
  onLogout?: () => void;
  setActiveTab?: (tab: string) => void;
}

export default function ProfileTab({
  user,
  wallet,
  onRefreshWallet,
  onLogin,
  onLogout,
  setActiveTab,
}: ProfileTabProps) {
  // Navigation internal tab
  const [subTab, setSubTab] = useState<"akun" | "karya" | "rekening" | "quest" | "bantuan" | "sosial">("akun");

  // Divided Settings menu tab state
  const [settingsTab, setSettingsTab] = useState<"umum" | "sandi" | "vip">("umum");

  // SOCIAL HUB TRACKER
  const [authors, setAuthors] = useState<any[]>([]);
  const [loadingAuthors, setLoadingAuthors] = useState(false);
  const [allNovelsData, setAllNovelsData] = useState<any[]>([]); // To display novels from followed authors
  const [actionLoadingAuthor, setActionLoadingAuthor] = useState<string | null>(null);

  const loadSocialHubData = async () => {
    setLoadingAuthors(true);
    try {
      const res = await fetch("/api/payment?action=get_public_authors");
      const data = await res.json();
      if (data.success && data.authors) {
        setAuthors(data.authors);
      }
      
      const novelsRes = await fetch("/api/novels");
      const novelsData = await novelsRes.json();
      if (novelsData.success && novelsData.novels) {
        setAllNovelsData(novelsData.novels);
      }
    } catch (e) {
      console.warn("Gagal memuat hub sosial:", e);
    } finally {
      setLoadingAuthors(false);
    }
  };

  const handleToggleFollow = async (targetEmail: string, isCurrentlyFollowing: boolean) => {
    if (targetEmail.toLowerCase() === user.email.toLowerCase()) {
      alert("Anda tidak dapat mengikuti diri sendiri!");
      return;
    }
    setActionLoadingAuthor(targetEmail);
    const action = isCurrentlyFollowing ? "unfollow_user" : "follow_user";
    try {
      const res = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          email: user.email,
          targetUserId: targetEmail
        })
      });
      const data = await res.json();
      if (data.success) {
        onRefreshWallet();
        await loadSocialHubData();
      } else {
        alert(data.error || "Gagal mengubah status pengikut.");
      }
    } catch (e) {
      alert("Kesalahan jaringan.");
    } finally {
      setActionLoadingAuthor(null);
    }
  };

  useEffect(() => {
    if (subTab === "sosial") {
      loadSocialHubData();
    }
  }, [subTab]);

  // Local profile states
  const [penName, setPenName] = useState(wallet?.username || user.username);
  const [bio, setBio] = useState(wallet?.bio || "Pembaca setia di Portal Novelpedia Retro.");
  const [avatarUrl, setAvatarUrl] = useState(wallet?.avatarUrl || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const DEFAULT_AVATARS = [
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Felix",
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Aneka",
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Midnight",
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Daisy",
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Precious",
    "https://api.dicebear.com/7.x/bottts/svg?seed=Robot1"
  ];

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Ukuran gambar maksimal 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Custom title input
  const [reqTitle, setReqTitle] = useState(wallet?.customTitle || "");
  
  // Bank details
  const [withdrawalCategory, setWithdrawalCategory] = useState<"Transfer Bank" | "E-Wallet" | "ShopeePay">("Transfer Bank");
  const [bankName, setBankName] = useState("BANK MANDIRI");
  const [bankAccount, setBankAccount] = useState("120-00-55452-9");
  const [accountHolder, setAccountHolder] = useState("IRSYAL FAIZ");
  
  // Works list
  const [myNovels, setMyNovels] = useState<any[]>([]);
  const [loadingNovels, setLoadingNovels] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [premiumLoading, setPremiumLoading] = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  const withdrawalOptions = {
    "Transfer Bank": ["BANK MANDIRI", "BANK CENTRAL ASIA (BCA)", "BANK NEGARA INDONESIA (BNI)", "BANK RAKYAT INDONESIA (BRI)", "BANK SYARIAH INDONESIA (BSI)"],
    "E-Wallet": ["DANA", "GOPAY", "OVO", "LINKAJA"],
    "ShopeePay": ["SHOPEEPAY"]
  };

  const [successAnimation, setSuccessAnimation] = useState(false);

  // Load books owned by author
  const loadMyNovels = async () => {
    setLoadingNovels(true);
    try {
      const res = await fetch(`/api/novels?authorEmail=${encodeURIComponent(user.email)}`);
      const data = await res.json();
      if (data.success) {
        setMyNovels(data.novels);
      }
    } catch (e) {
      console.warn("Gagal memuat karya Anda", e);
    } finally {
      setLoadingNovels(false);
    }
  };

  useEffect(() => {
    loadMyNovels();
    onRefreshWallet();
  }, [user.email]);

  useEffect(() => {
    if (wallet) {
      if (wallet.username) setPenName(wallet.username);
      if (wallet.bio) setBio(wallet.bio);
      if (wallet.customTitle) setReqTitle(wallet.customTitle);
    }
  }, [wallet]);

  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const mockRevenueData = [
    { name: "Senin", revenue: 120000 },
    { name: "Selasa", revenue: 85000 },
    { name: "Rabu", revenue: 156000 },
    { name: "Kamis", revenue: 98000 },
    { name: "Jumat", revenue: 210000 },
    { name: "Sabtu", revenue: 340000 },
    { name: "Minggu", revenue: 410000 },
  ];

  // Update profile details
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (newPassword && newPassword !== confirmPassword) {
      alert("Sandi baru dan konfirmasi sandi tidak cocok!");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_profile",
          email: user.email,
          username: penName,
          bio,
          password: newPassword || undefined,
          avatarUrl: avatarUrl
        })
      });
      const data = await res.json();
      if (data.success) {
        onLogin(user.email, penName);
        onRefreshWallet();
        setNewPassword("");
        setConfirmPassword("");
        alert("PROFIL SELESAI: Biodata, username & kata sandi berhasil diperbarui!");
      } else {
        alert(data.error || "Gagal memperbarui profil.");
      }
    } catch (e) {
      alert("Kesalahan jaringan.");
    } finally {
      setSubmitting(false);
    }
  };

  // Buy Premium Sastrawan Verification program
  const handleActivatePremium = async (e: React.FormEvent) => {
    e.preventDefault();
    setPremiumLoading(true);

    if (!confirm("Beli Premium Verifikasi: Apakah Anda ingin mengonfirmasi langganan premium Rp 5.000 / bulan untuk mendapatkan Verifikasi Ceklis Biru & Request Title?")) {
      setPremiumLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "buy_premium",
          email: user.email,
          customTitle: reqTitle
        })
      });
      const data = await res.json();
      if (data.success) {
        onRefreshWallet();
        setSuccessAnimation(true);
        setTimeout(() => setSuccessAnimation(false), 5000);
        alert(`Selamat! Akun verifikasi premium Anda telah diaktifkan! Gelar kustom: "@${reqTitle || "Verified Author"}" dan ceklis biru resmi telah dinobatkan.`);
      } else {
        alert(data.error || "Gagal mendaftarkan premium.");
      }
    } catch (e) {
      alert("Kesalahan jaringan.");
    } finally {
      setPremiumLoading(false);
    }
  };

  const handleWithdrawRevenue = async () => {
    if (!wallet || wallet.revenueExp < 100000) {
      alert("Batas minimum pencairan adalah Rp 100.000 (Saldo Anda saat ini: Rp " + (wallet?.revenueExp || 0).toLocaleString("id-ID") + ").");
      return;
    }

    if (!confirm(`Konfirmasi Transfer: Apakah Anda yakin ingin mengajukan pencairan royalti sebesar Rp ${wallet.revenueExp.toLocaleString("id-ID")} ke rekening ${bankName}?`)) {
      return;
    }

    setWithdrawLoading(true);

    try {
      const res = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "withdraw_revenue",
          email: user.email,
          bankName,
          bankAccount,
          accountHolder
        })
      });
      const data = await res.json();
      if (data.success) {
        onRefreshWallet();
        alert("Pengajuan pencairan royalty berhasil didaftarkan ke antrean admin Novelpedia!");
      } else {
        alert(data.error || "Gagal mencairkan dana.");
      }
    } catch (e) {
      alert("Kesalahan jaringan.");
    } finally {
      setWithdrawLoading(false);
    }
  };

  // Derived statistics info
  const followersCount = wallet?.followersCount ?? 0;
  const avgRating = myNovels.length > 0 
    ? (myNovels.reduce((sum, n) => sum + (n.rating || 5.0), 0) / myNovels.length).toFixed(1) 
    : "5.0";
  const totalChapters = myNovels.reduce((sum, n) => sum + (n.chaptersCount || 0), 0);

  // Programmatically calculate 15 different JRPG-inspired achievements based on true stats
  const achievements = [
    {
      id: "ach_1",
      title: "Sastrawan Terdaftar",
      description: "Diterima secara resmi di portal sastra Novelpedia Retro.",
      isUnlocked: true,
      role: "Sastrawan Umum"
    },
    {
      id: "ach_2",
      title: "Penulis Berkembang (Tingkat 1)",
      description: "Telah mendaftarkan naskah fiksi orisinal perdana Anda.",
      isUnlocked: myNovels.length >= 1,
      role: "Penulis Muda"
    },
    {
      id: "ach_3",
      title: "Pena Berdikari (Tingkat 2)",
      description: "Menerbitkan minimal 2 novel orisinal yang aktif dalam draf.",
      isUnlocked: myNovels.length >= 2,
      role: "Novelis Kreatif"
    },
    {
      id: "ach_4",
      title: "Maestro Publikasi (Tingkat 3)",
      description: "Buku fiksi Anda memiliki akumulasi total di atas 5 Bab.",
      isUnlocked: totalChapters >= 5,
      role: "Pujangga Senior"
    },
    {
      id: "ach_5",
      title: "Sastrawan Legendaris",
      description: "Berhasil mengunggah total bab terkumpul sebanyak 10 Bab.",
      isUnlocked: totalChapters >= 10,
      role: "Ahli Sastra Agung"
    },
    {
      id: "ach_6",
      title: "Cendekiawan Premium",
      description: "Mengaktifkan lisensi Verifikasi Ceklis Biru Sastrawan Bintang.",
      isUnlocked: !!wallet?.isVerified,
      role: "Penulis Bintang Rekanan"
    },
    {
      id: "ach_7",
      title: "Megabintang Pujaan",
      description: "Memperoleh ketenaran dengan sirkulasi di atas 20 Pengikut.",
      isUnlocked: followersCount >= 20,
      role: "Idola Penggemar"
    },
    {
      id: "ach_8",
      title: "Kolektor Koin Pixel",
      description: "Memiliki tabungan koin di tas digital sebesar 100 Koin Pixel.",
      isUnlocked: wallet ? wallet.coins >= 100 : false,
      role: "Pembaca Elite"
    },
    {
      id: "ach_9",
      title: "Kratingan Sempurna",
      description: "Mendapat reputasi bintang emas murni dengan rating rata-rata >= 4.9.",
      isUnlocked: myNovels.length > 0 && parseFloat(avgRating) >= 4.9,
      role: "Seniman Orisinal"
    },
    {
      id: "ach_10",
      title: "Garda Proteksi AI",
      description: "Dipercaya memegang hak peninjauan moderasi denda (Admin).",
      isUnlocked: !!wallet?.isAdmin,
      role: "Moderator Orisinalitas"
    },
    {
      id: "ach_11",
      title: "Pengumpul Royalti",
      description: "Berhasil mengumpulkan royalti murni yang siap dicairkan.",
      isUnlocked: wallet ? wallet.revenueExp > 0 : false,
      role: "Author Komersial"
    },
    {
      id: "ach_12",
      title: "Anti-Plagiat Squad",
      description: "Lolos pindaian sensor AI orisinalitas dengan tingkat keamanan 100%.",
      isUnlocked: myNovels.length > 0 && myNovels.every((n) => !n.isFlagged),
      role: "Pejuang Anti-Copas"
    },
    {
      id: "ach_13",
      title: "Dedikasi Menulis",
      description: "Memiliki draf novel orisinal yang berlanjut (status: Ongoing).",
      isUnlocked: myNovels.length > 0 && myNovels.some(n => n.status === "ongoing"),
      role: "Penerbit Sejati"
    },
    {
      id: "ach_14",
      title: "Finisher Ulung",
      description: "Berhasil menyelesaikan sebuah cerita novel fiksi (status: Tamat).",
      isUnlocked: myNovels.length > 0 && myNovels.some(n => n.status === "tamat"),
      role: "Legend Novelist"
    },
    {
      id: "ach_15",
      title: "Mitra Sejati Retro",
      description: "Telah mendaftarkan bio kustom orisinal pada profil Anda.",
      isUnlocked: bio !== "Pembaca setia di Portal Novelpedia Retro." && bio.trim().length > 5,
      role: "Pembuat Konten"
    }
  ];

  const unlockedCount = achievements.filter(a => a.isUnlocked).length;

  // New UI states
  const [currentTab, setCurrentTab] = useState("Karya Saya");
  const TABS = ["Karya Saya", "Library", "Misi Harian", "Pengaturan Akun"];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 font-sans min-h-screen text-slate-800 selection:bg-indigo-100">
      
      {successAnimation && (
        <div className="mb-8 p-4 bg-emerald-50/50 backdrop-blur-sm border border-emerald-100/50 text-emerald-700 rounded-2xl flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600"><CheckCircle2 size={16}/></div>
             <span className="text-sm border-0 font-medium">Pengaturan berhasil diperbarui</span>
          </div>
          <button onClick={() => setSuccessAnimation(false)}><X size={16} className="text-emerald-400 hover:text-emerald-600"/></button>
        </div>
      )}

      {/* HEADER: Clean Modern Style */}
      <div className="relative rounded-[2rem] overflow-hidden mb-12 bg-white border border-slate-200 shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-50/50 via-transparent to-rose-50/30 -z-10"></div>
        
        <div className="px-8 py-10 flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-8 relative z-10">
          <div className="relative shrink-0">
            <div className="w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden shadow-sm border-4 border-white relative bg-slate-50">
              {wallet?.avatarUrl ? (
                <img src={wallet?.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl font-light text-slate-400">
                  {(penName || "A").substring(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            {wallet?.isVerified && (
              <div className="absolute bottom-1 right-1 bg-white p-1.5 rounded-full shadow border border-slate-100 ring-2 ring-white">
                <ShieldCheck size={20} className="text-blue-500 fill-blue-50" />
              </div>
            )}
          </div>

          <div className="flex-1 mt-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2 text-slate-900 flex flex-col md:flex-row items-center gap-3 justify-center md:justify-start">
               {penName}
               {wallet?.isAdmin && (
                 <span className="flex items-center gap-1 text-[10px] uppercase tracking-widest font-bold bg-rose-50 text-rose-600 border border-rose-100 px-2.5 py-1 rounded-md">
                   <Crown size={12}/> ADMIN
                 </span>
               )}
            </h1>
            <p className="text-sm text-slate-500 font-normal max-w-xl leading-relaxed mb-6 mx-auto md:mx-0">
              {bio}
            </p>
            
            <div className="flex flex-wrap gap-3 justify-center md:justify-start items-center">
               <button onClick={async () => {
                  if (navigator.share) {
                    try {
                      await navigator.share({
                        title: penName,
                        text: `Lihat profil penulis ${penName} di Novelpedia!`,
                        url: window.location.href,
                      });
                    } catch (error) {
                      // ignore abort error
                    }
                  } else {
                    alert("Fitur bagikan (Share) profil ini tidak didukung di peramban Anda. Silakan salin tautan manual.");
                  }
               }} className="h-10 px-4 flex items-center justify-center gap-2 rounded-xl bg-white shadow-sm border border-slate-200 hover:bg-slate-50 hover:shadow transition-all text-slate-700 font-bold text-xs cursor-pointer">
                 <Share2 size={14} strokeWidth={1.5} /> Share Profil
               </button>

               <button
                 onClick={() => setCurrentTab("Pengaturan Akun")}
                 className="h-10 px-4 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all text-white font-bold text-xs cursor-pointer"
               >
                 <Settings size={14} />
                 <span>Pengaturan Akun</span>
               </button>
            </div>
          </div>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-14">
         <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col items-center sm:items-start transition-all hover:shadow-md">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100 shadow-sm mb-4 text-indigo-600">
              <Users2 size={20} strokeWidth={2}/>
            </div>
            <div className="text-3xl font-bold text-slate-900 tracking-tight mb-1">{(wallet?.followersCount || 0).toLocaleString()}</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Followers</div>
         </div>

         <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col items-center sm:items-start transition-all hover:shadow-md">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100 shadow-sm mb-4 text-emerald-600">
              <BookOpen size={20} strokeWidth={2}/>
            </div>
            <div className="text-3xl font-bold text-slate-900 tracking-tight mb-1">{myNovels.length}</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Total Karya</div>
         </div>

         <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col items-center sm:items-start transition-all hover:shadow-md">
            <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center border border-rose-100 shadow-sm mb-4 text-rose-600">
              <Star size={20} strokeWidth={2}/>
            </div>
            <div className="text-3xl font-bold text-slate-900 tracking-tight mb-1">
              {myNovels.length > 0 ? (myNovels.reduce((a, b) => a + (b.rating || 0), 0) / myNovels.length).toFixed(1) : "0.0"}
            </div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Global Rating</div>
         </div>
      </div>

      {/* MODERN TAB NAVIGATION */}
      <div className="relative mb-8 overflow-x-auto hide-scrollbar">
         <div className="flex items-center gap-8 border-b border-slate-200/50 min-w-max pb-2">
           {TABS.map(tab => (
             <button
               key={tab}
               onClick={() => setCurrentTab(tab)}
               className={`relative px-1 pb-4 text-sm font-medium transition-colors cursor-pointer ${currentTab === tab ? "text-indigo-600" : "text-slate-400 hover:text-slate-800"}`}
             >
               {tab}
               {currentTab === tab && (
                 <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full shadow-sm" style={{ transform: "translateY(1px)" }}></span>
               )}
             </button>
           ))}
         </div>
      </div>

      {/* TABS CONTENT */}
      <div className="min-h-[400px]">
        {currentTab === "Karya Saya" && (
           <div className="animate-in fade-in duration-500">
              {loadingNovels ? (
                 <div className="flex justify-center items-center py-20 text-slate-400">
                   <RefreshCw className="animate-spin text-slate-300 mr-2" size={24} />
                   Mengambil Data Karya...
                 </div>
              ) : myNovels.length === 0 ? (
                 <div className="py-20 text-center flex flex-col items-center">
                    <div className="w-20 h-20 mb-6 bg-slate-50 border border-slate-100 shadow-sm rounded-full flex items-center justify-center text-slate-300">
                      <BookOpen size={32} strokeWidth={1.5}/>
                    </div>
                    <h3 className="text-lg font-medium text-slate-800 mb-2">Belum Terdapat Karya</h3>
                    <p className="text-slate-500 font-light text-sm max-w-sm mb-6">Kanvas Anda masih kosong. Mulai jelajahi imajinasi dan ciptakan karya pertama Anda.</p>
                    <button className="px-6 py-3 bg-white border border-slate-200/80 shadow-sm rounded-xl text-sm font-medium text-slate-700 hover:text-indigo-600 hover:border-indigo-100 transition-all flex items-center gap-2 cursor-pointer">
                       <Plus size={16}/> Tulis Cerita Baru
                    </button>
                 </div>
              ) : (
                 <div className="grid grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3 md:gap-5">
                    {/* Visualisasi Karya: 3:4 Aspect Ratio and Grid */}
                    {myNovels.map(novel => (
                       <div key={novel.id} className="group relative transition-transform duration-500 hover:-translate-y-1.5 cursor-pointer block">
                          <div className="w-full aspect-[3/4] rounded-xl overflow-hidden bg-slate-100 shadow-sm group-hover:shadow-xl transition-all relative">
                             {novel.coverUrl ? (
                               <img src={novel.coverUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={novel.title} />
                             ) : (
                               <img 
                                 src={`https://picsum.photos/seed/${encodeURIComponent(novel.title)}/300/400`} 
                                 className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                 alt={novel.title} 
                               />
                             )}
                             <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-2.5">
                                <button className="w-full py-1.5 bg-white/30 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold rounded-lg hover:bg-white/40 transition">Lihat Setup</button>
                             </div>
                          </div>
                          <div className="mt-2.5 px-0.5">
                            <h4 className="text-[11px] font-extrabold text-slate-800 leading-tight mb-1 group-hover:text-indigo-600 transition-colors line-clamp-2">{novel.title}</h4>
                            <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 mt-1">
                               <span className="flex items-center gap-0.5 text-emerald-500"><Eye size={10} strokeWidth={2}/> {Math.floor((novel.rating || 5.0) * 1324 + novel.chaptersCount * 231).toLocaleString('id-ID')}</span>
                               <span className="flex items-center gap-0.5 text-amber-500"><Star size={10} strokeWidth={2} className="fill-amber-500"/> {novel.rating ? novel.rating.toFixed(1) : "0.0"}</span>
                            </div>
                          </div>
                       </div>
                    ))}
                    
                    <div className="w-full aspect-[3/4] rounded-xl border-2 border-dashed border-slate-200/60 bg-slate-50/30 flex flex-col items-center justify-center text-slate-400 hover:text-indigo-500 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all cursor-pointer">
                       <Plus size={24} strokeWidth={1.5} className="mb-2"/>
                       <span className="text-[10px] font-bold uppercase tracking-wider">Buat Baru</span>
                    </div>
                 </div>
              )}
           </div>
        )}

        {currentTab === "Library" && (
           <div className="animate-in fade-in duration-500 py-10 text-center text-slate-500 font-light">
               <div className="w-16 h-16 mx-auto mb-6 bg-slate-50 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-slate-300">
                 <Lock size={24} strokeWidth={1.5} />
               </div>
               Fitur koleksi perpustakaan pribadi masih dalam pengembangan.
           </div>
        )}

        {currentTab === "Misi Harian" && (
           <div className="animate-in fade-in duration-500 max-w-4xl mx-auto pb-10">
              <div className="bg-white/40 backdrop-blur-md border border-white/60 p-8 rounded-[2rem] shadow-sm mb-8 flex flex-col md:flex-row items-center gap-8 justify-between">
                <div>
                  <h3 className="text-xl font-black text-indigo-900 tracking-tight flex items-center gap-2 mb-2">
                    <Sparkles className="text-indigo-500" size={24} /> Misi Harian & Reward
                  </h3>
                  <p className="text-sm text-slate-600 font-medium">Selesaikan tugas harian untuk mendapatkan koin gratis yang bisa Anda gunakan untuk membuka bab terkunci atau memberikan dukungan pada penulis favorit Anda!</p>
                </div>
                <div className="shrink-0 bg-gradient-to-r from-amber-400 to-orange-400 p-4 rounded-2xl text-white text-center shadow-lg shadow-amber-500/20 w-40">
                  <div className="text-xs font-black uppercase tracking-widest opacity-80 mb-1">Saldo Koin</div>
                  <div className="text-3xl font-black">{wallet?.coins || 0}</div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col h-full shadow-sm">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
                    <CheckCircle2 size={24} />
                  </div>
                  <h4 className="font-bold text-slate-800 text-lg mb-1">Check-in Harian</h4>
                  <p className="text-xs text-slate-500 mb-6 flex-1">Masuk ke aplikasi setiap hari untuk mengklaim koin gratis. Kumpulkan koin lebih banyak setiap harinya berturut-turut!</p>
                  
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                    <span className="font-bold text-amber-500">+15 Koin</span>
                    <button 
                      onClick={async () => {
                        alert("Berhasil melakukan Check-in hari ini! +15 Koin ditambahkan.");
                        // For a real app, this should call an API. Here we simulate it simply via the existing modify user direct if admin, or just refresh locally in UI since it's a mockup.
                      }}
                      className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-xl cursor-pointer shadow-sm transition-all"
                    >
                      Klaim Koin
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col h-full shadow-sm">
                  <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
                    <BookOpen size={24} />
                  </div>
                  <h4 className="font-bold text-slate-800 text-lg mb-1">Membaca 3 Bab</h4>
                  <p className="text-xs text-slate-500 mb-6 flex-1">Baca minimal 3 bab baru dari novel apa saja hari ini.</p>
                  
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                    <span className="font-bold text-amber-500">+25 Koin</span>
                    <button className="bg-indigo-50 text-indigo-400 font-bold text-xs px-4 py-2 rounded-xl cursor-not-allowed">
                      0/3 Bab
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col h-full shadow-sm">
                  <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-4">
                    <MessageSquare size={24} />
                  </div>
                  <h4 className="font-bold text-slate-800 text-lg mb-1">Berikan Ulasan</h4>
                  <p className="text-xs text-slate-500 mb-6 flex-1">Tinggalkan setidaknya 1 komentar berkualitas di novel.</p>
                  
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                    <span className="font-bold text-amber-500">+10 Koin</span>
                    <button className="bg-indigo-50 text-indigo-400 font-bold text-xs px-4 py-2 rounded-xl cursor-not-allowed">
                      0/1 Komentar
                    </button>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl border border-indigo-800 p-6 flex flex-col h-full shadow-lg relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 opacity-10">
                    <Star size={120} />
                  </div>
                  <div className="w-12 h-12 bg-white/10 text-amber-400 rounded-2xl flex items-center justify-center mb-4 relative z-10">
                    <Crown size={24} />
                  </div>
                  <h4 className="font-bold text-white text-lg mb-1 relative z-10">VIP Bonus Mingguan</h4>
                  <p className="text-xs text-slate-300 mb-6 flex-1 relative z-10">Klaim bonus koin mingguan khusus untuk pelanggan Premium Sastrawan Emas.</p>
                  
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/10 relative z-10">
                    <span className="font-bold text-amber-400">+500 Koin</span>
                    {wallet?.isPremium ? (
                      <button className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-xs px-4 py-2 rounded-xl cursor-pointer shadow-sm">
                        Klaim VIP
                      </button>
                    ) : (
                      <button className="bg-white/10 text-white/50 font-bold text-xs px-4 py-2 rounded-xl cursor-not-allowed border border-white/5">
                        Kunci VIP
                      </button>
                    )}
                  </div>
                </div>
              </div>
           </div>
        )}

        {currentTab === "Pengaturan Akun" && (
           <div className="animate-in fade-in duration-500 max-w-5xl mx-auto pb-10">
              <AccountSettings
                 user={user}
                 wallet={wallet}
                 onRefreshWallet={onRefreshWallet}
                 onLogout={onLogout || (() => {})}
                 onLogin={onLogin}
                 embedded={true}
              />
           </div>
        )}

        {false && currentTab === "Pengaturan Akun" && (
           <div className="animate-in fade-in duration-500 max-w-2xl mx-auto pb-10 text-center">
              <div className="bg-white/40 backdrop-blur-md border border-white/60 p-10 rounded-[2.5rem] shadow-[0_4px_40px_rgba(0,0,0,0.02)]">
                <div className="w-16 h-16 mx-auto mb-6 bg-indigo-50 border border-indigo-150 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm animate-pulse">
                  <Settings size={28} strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-medium text-slate-800 mb-3">
                  Pengaturan Akun Sudah Terpisah
                </h3>
                 <p className="text-slate-500 font-light text-sm leading-relaxed mb-8 max-w-md mx-auto">
                     Demi kenyamanan dan kerapihan navigasi, seluruh pengaturan profil (kelola Pen Name & Bio), metode pembayaran, penarikan royalti koin, keamanan auth ganti password, hingga status premium kini dikelola sepenuhnya di menu **Pengaturan Akun** utama yang terpisah.
                 </p>

                 <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-8 text-left text-xs text-slate-600 font-light">
                    <div className="bg-white/60 p-3.5 rounded-2xl border border-white/80 shadow-xs">
                      <span className="font-bold text-indigo-600 flex items-center gap-1.5 mb-0.5"><Wallet size={12} /> Royalti & Dompet</span>
                      Ajukan pencairan saldo revenue dan kelola rekening.
                    </div>
                    <div className="bg-white/60 p-3.5 rounded-2xl border border-white/80 shadow-xs">
                      <span className="font-bold text-indigo-600 flex items-center gap-1.5 mb-0.5"><Lock size={12} /> Keamanan Sandi</span>
                      Modifikasi data sensitif kata sandi enkripsi Anda.
                    </div>
                    <div className="bg-white/60 p-3.5 rounded-2xl border border-white/80 shadow-xs">
                      <span className="font-bold text-indigo-600 flex items-center gap-1.5 mb-0.5"><Bell size={12} /> Notifikasi Sistem</span>
                      Atur notifikasi log perilisan karya terbaru.
                    </div>
                    <div className="bg-white/60 p-3.5 rounded-2xl border border-white/80 shadow-xs">
                      <span className="font-bold text-rose-500 flex items-center gap-1.5 mb-0.5"><Settings size={12} /> Biodata Portofolio</span>
                      Sunting lencana Pen Name, avatar, dan kustom bio.
                    </div>
                 </div>

                {setActiveTab ? (
                  <button 
                    onClick={() => setActiveTab("settings")}
                    className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg hover:shadow-indigo-600/20 active:translate-y-px transition-all cursor-pointer inline-flex items-center justify-center gap-2"
                  >
                    <Settings size={16} />
                    <span>Buka Pengaturan Akun Utama</span>
                  </button>
                ) : (
                  <p className="text-xs text-slate-400">Silakan gunakan menu navigasi untuk membuka Pengaturan Akun.</p>
                )}
              </div>
           </div>
        )}

        {false && currentTab === "Informasi Akun" && (
           <div className="animate-in fade-in duration-500 grid md:grid-cols-2 gap-8 lg:gap-12 pb-10">
              
              {/* Profile Config */}
              <div className="bg-white/40 backdrop-blur-md border border-white/60 p-8 rounded-[2rem] shadow-[0_4px_40px_rgba(0,0,0,0.02)]">
                <h3 className="text-lg font-medium text-slate-800 mb-6 flex items-center gap-3">
                  <User size={20} className="text-indigo-500" strokeWidth={1.5}/> Pengaturan Profil
                </h3>
                
                <form onSubmit={handleUpdateProfile} className="space-y-5">
                   <div>
                      <label className="block text-xs font-medium text-slate-400/80 uppercase tracking-widest mb-2 border-0">Pen Name</label>
                      <input 
                        type="text" 
                        value={penName} 
                        onChange={e => setPenName(e.target.value)} 
                        className="w-full bg-white/50 border border-slate-200/80 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/50 shadow-sm transition-all"
                      />
                   </div>
                   <div>
                      <label className="block text-xs font-medium text-slate-400/80 uppercase tracking-widest mb-2 border-0">Bio Singkat</label>
                      <textarea 
                        value={bio} 
                        onChange={e => setBio(e.target.value)} 
                        rows={3}
                        className="w-full bg-white/50 border border-slate-200/80 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/50 shadow-sm transition-all resize-none"
                      />
                   </div>
                   <button type="submit" disabled={submitting} className="w-full bg-slate-900 text-white rounded-xl py-3.5 text-sm font-medium hover:bg-slate-800 transition shadow-md disabled:opacity-50 mt-2 cursor-pointer">
                     {submitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                   </button>
                </form>
              </div>

              {/* Wallet & Auth Config */}
              <div className="space-y-8 lg:space-y-12">
                 
                 <div className="bg-white/40 backdrop-blur-md border border-white/60 p-8 rounded-[2rem] shadow-[0_4px_40px_rgba(0,0,0,0.02)]">
                   <h3 className="text-lg font-medium text-slate-800 mb-6 flex items-center gap-3">
                     <Wallet size={20} className="text-emerald-500" strokeWidth={1.5}/> Informasi Dompet & Penarikan
                   </h3>

                   <div className="flex items-center justify-between p-5 bg-gradient-to-r from-emerald-50/50 to-teal-50/50 border border-emerald-100/50 rounded-2xl mb-6 shadow-sm">
                      <div>
                         <p className="text-xs font-semibold text-emerald-600/70 uppercase tracking-widest mb-1 border-0">Saldo Revenue</p>
                         <p className="text-2xl font-light text-emerald-800">Rp {(wallet?.revenueExp || 0).toLocaleString('id-ID')}</p>
                      </div>
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-emerald-500 shadow-sm">
                         <CoinsIcon />
                      </div>
                   </div>

                   <button className="w-full py-3.5 bg-white border border-slate-200/80 rounded-xl text-slate-700 text-sm font-medium hover:shadow-sm hover:border-slate-300 transition-all cursor-pointer">
                     Ajukan Penarikan Dana
                   </button>
                 </div>

                 <div className="bg-white/40 backdrop-blur-md border border-white/60 p-8 rounded-[2rem] shadow-[0_4px_40px_rgba(0,0,0,0.02)]">
                   <h3 className="text-lg font-medium text-slate-800 mb-6 flex items-center gap-3 text-rose-600">
                     <LockKeyhole size={20} strokeWidth={1.5}/> Keamanan Auth
                   </h3>
                   <div className="space-y-4">
                      <button className="w-full flex items-center justify-between py-3.5 px-4 bg-white border border-slate-200/80 rounded-xl text-slate-700 text-sm font-medium hover:shadow-sm transition-all focus:outline-none cursor-pointer">
                        Ubah Kata Sandi <ChevronRight size={16} className="text-slate-400"/>
                      </button>
                      {onLogout && (
                        <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-rose-50/50 border border-rose-100 text-rose-600 hover:bg-rose-50 rounded-xl text-sm font-medium hover:shadow-sm transition-all focus:outline-none cursor-pointer">
                          <LogOut size={16}/> Keluar dari Akun
                        </button>
                      )}
                   </div>
                 </div>

              </div>
           </div>
        )}
      </div>

    </div>
  );
}

function CoinsIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="6"/>
      <path d="M18.09 10.37A6 6 0 1 1 10.34 18"/>
      <path d="M7 6h1v4"/>
      <path d="m16.71 13.88.7.71-2.82 2.82"/>
    </svg>
  );
}
