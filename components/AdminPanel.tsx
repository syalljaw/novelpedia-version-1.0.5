import React, { useState, useEffect } from "react";
import { 
  Shield, 
  Sparkles, 
  RefreshCw, 
  AlertCircle, 
  Check, 
  ShieldAlert, 
  Ban, 
  XCircle, 
  Terminal, 
  ShieldCheck, 
  Search, 
  UserMinus, 
  CheckCircle2, 
  Info,
  CreditCard,
  User,
  ArrowDownCircle,
  AlertTriangle,
  UserCheck,
  Trash2,
  Coins,
  Bell,
  Settings,
  Crown,
  Send,
  Book,
  TrendingUp,
  Megaphone
} from "lucide-react";

interface Novel {
  id: string;
  title: string;
  synopsis: string;
  isFlagged: boolean;
  isBypassed: boolean;
  authorUsername: string;
  author: string;
  isTrending?: boolean;
}

interface Proofread {
  id: string;
  novelTitle: string;
  chapterTitle: string;
  authorEmail: string;
  originalText: string;
  suggestedText: string;
  aiExplanation: string;
  status: 'pending' | 'applied' | 'rejected';
}

interface WithdrawalRequest {
  id: string;
  email: string;
  bankName: string;
  bankAccount: string;
  accountHolder: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

interface UserWallet {
  email: string;
  coins: number;
  revenueExp: number;
  isAdmin: boolean;
  username?: string;
  isPremium?: boolean;
  isVerified?: boolean;
  isBanned?: boolean;
  followersCount?: number;
  customTitle?: string;
}

interface SystemAnnouncement {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  type: 'info' | 'update' | 'warning';
}

interface AdminPanelProps {
  user: { email: string };
  onRefreshWallet: () => void;
}

export default function AdminPanel({ user, onRefreshWallet }: AdminPanelProps) {
  const [stats, setStats] = useState({
    coinsCirculating: 0,
    withdrawnIDR: 0,
    outstandingDenda: 0,
  });

  const [flaggedNovels, setFlaggedNovels] = useState<Novel[]>([]);
  const [allNovels, setAllNovels] = useState<Novel[]>([]);
  const [proofreadsList, setProofreadsList] = useState<Proofread[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [wallets, setWallets] = useState<UserWallet[]>([]);
  const [announcements, setAnnouncements] = useState<SystemAnnouncement[]>([]);
  const [systemLogs, setSystemLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Tabs expanded
  const [adminTab, setAdminTab] = useState<"karantina" | "pencairan" | "users" | "announcements" | "novels" | "iklan">("iklan");

  // User search/edit state
  const [searchEmail, setSearchEmail] = useState("");
  const [searchNovel, setSearchNovel] = useState("");
  const [actionLoadingEmail, setActionLoadingEmail] = useState<string | null>(null);
  
  // Quick user inputs
  const [coinInput, setCoinInput] = useState<{ [email: string]: string }>({});
  const [titleInput, setTitleInput] = useState<{ [email: string]: string }>({});

  // New announcement form state
  const [annTitle, setAnnTitle] = useState("");
  const [annContent, setAnnContent] = useState("");
  const [annType, setAnnType] = useState<'info' | 'update' | 'warning'>("info");

  // Ads settings state
  const [adsEnabled, setAdsEnabled] = useState(true);
  const [adsProvider, setAdsProvider] = useState("Google AdSense (Default)");
  const [adsFrequency, setAdsFrequency] = useState("Tiap 1 Bab Selesai Dibaca");

  // Load ads config from localStorage on mount
  useEffect(() => {
    try {
      const adsConfigStr = localStorage.getItem("novelpedia_ads_config");
      if (adsConfigStr) {
        const config = JSON.parse(adsConfigStr);
        setAdsEnabled(config.enabled !== undefined ? config.enabled : true);
        if (config.provider) setAdsProvider(config.provider);
        if (config.frequency) setAdsFrequency(config.frequency);
      }
    } catch(e) {}
  }, []);

  async function fetchAllAdminData() {
    setLoading(true);
    try {
      const res = await fetch(`/api/payment?action=admin_get_data&adminEmail=${encodeURIComponent(user.email)}`);
      const data = await res.json();
      if (data.success) {
        const activeWallets = data.wallets || [];
        const activeWithdraws = data.withdrawals || [];
        
        const totalCoins = activeWallets.reduce((acc: number, w: UserWallet) => acc + w.coins, 0);
        const totalPayoutsApproved = activeWithdraws
          .filter((w: WithdrawalRequest) => w.status === "approved")
          .reduce((acc: number, w: WithdrawalRequest) => acc + w.amount, 0);

        setStats({
          coinsCirculating: totalCoins,
          withdrawnIDR: totalPayoutsApproved,
          outstandingDenda: data.flaggedCount || 0
        });

        setWithdrawals(activeWithdraws);
        setWallets(activeWallets);
        if (data.systemLogs) {
          setSystemLogs(data.systemLogs);
        }
        if (data.announcements) {
          setAnnouncements(data.announcements);
        }
        setAllNovels(data.novels || []);
        setFlaggedNovels((data.novels || []).filter((n: Novel) => n.isFlagged && !n.isBypassed));
      }
    } catch (e) {
      console.warn("Failed fetching admin details:", e);
    } finally {
      setLoading(false);
    }
  }

  const handleDeleteNovel = async (novelId: string, title: string) => {
    if(!confirm(`PERINGATAN: Apakah Anda yakin ingin menghapus novel "${title}" secara permanen? TINDAKAN INI TIDAK BISA DIBATALKAN.`)) return;
    try {
      const res = await fetch(`/api/novels?novelId=${novelId}`, { method: "DELETE" });
      const data = await res.json();
      if(data.success) {
        alert(`Novel "${title}" berhasil dihapus.`);
        fetchAllAdminData();
      } else {
        alert("Gagal menghapus novel.");
      }
    } catch(e) {
      alert("Terjadi masalah jaringan.");
    }
  };

  useEffect(() => {
    fetchAllAdminData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleBypassAiBlock = async (novelId: string, title: string, authorUsername: string) => {
    const confirmation = confirm(`Sertifikasi Override: Apakah Anda yakin ingin memulihkan novel '${title}' karangan penulis @${authorUsername} dari status sensor karantina?`);
    if (!confirmation) return;

    try {
      const res = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "override_flag",
          email: user.email,
          novelId
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(`SUKSES OVERRIDE! Blokir untuk novel '${title}' telah dipulihkan secara manual.`);
        fetchAllAdminData();
        onRefreshWallet();
      } else {
        alert(data.error || "Gagal melakukan bypass.");
      }
    } catch (e) {
      alert("Gagal menghubungi server.");
    }
  };

  const handleUpdateWithdrawalStatus = async (withdrawalId: string, newStatus: "approved" | "rejected") => {
    const actionLabel = newStatus === "approved" ? "MENYETUJUI & MENTRANSFER DANA" : "MENOLAK";
    const confirmation = confirm(`Konfirmasi Admin: Apakah Anda sangat yakin ingin menjalankan keputusan ${actionLabel} pada pencairan royalti terlampir?`);
    if (!confirmation) return;

    try {
      const res = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "admin_update_withdrawal",
          email: user.email,
          withdrawalId,
          status: newStatus
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(`Status penarikan royalti penulis berhasil diperbarui dan direkam!`);
        fetchAllAdminData();
        onRefreshWallet();
      } else {
        alert(data.error || "Gagal memperbarui status transfer.");
      }
    } catch (e) {
      alert("Kesalahan jaringan.");
    }
  };

  // Modern unified direct user editing action
  const handleModifyUserDirect = async (targetEmail: string, params: { setCoins?: number; isBanned?: boolean; isVerified?: boolean; isPremium?: boolean; customTitle?: string }) => {
    setActionLoadingEmail(targetEmail);
    try {
      const res = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "admin_modify_user_direct",
          email: user.email,
          targetEmail,
          ...params
        })
      });
      const data = await res.json();
      if (data.success) {
        fetchAllAdminData();
        onRefreshWallet();
      } else {
        alert(data.error || "Gagal memperbarui pengguna.");
      }
    } catch (e) {
      alert("Terjadi masalah koneksi.");
    } finally {
      setActionLoadingEmail(null);
    }
  };

  // Broadcast announcement
  const handlePublishAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) {
      alert("Harap isi judul dan konten pengumuman info!");
      return;
    }

    try {
      const res = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "admin_add_announcement",
          email: user.email,
          title: annTitle,
          content: annContent,
          type: annType
        })
      });
      const data = await res.json();
      if (data.success) {
        alert("Pengumuman berhasil disebarluaskan!");
        setAnnTitle("");
        setAnnContent("");
        fetchAllAdminData();
      } else {
        alert(data.error || "Gagal memposting pengumuman.");
      }
    } catch (e) {
      alert("Masalah jaringan.");
    }
  };

  // Delete/Archive announcement
  const handleDeleteAnnouncement = async (announcementId: string) => {
    if (!confirm("Arsip Pengumuman: Hapus info update terbaru ini dari sistem?")) return;
    try {
      const res = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "admin_delete_announcement",
          email: user.email,
          announcementId
        })
      });
      const data = await res.json();
      if (data.success) {
        fetchAllAdminData();
      } else {
        alert(data.error || "Gagal menghapus.");
      }
    } catch (e) {
      alert("Masalah koneksi.");
    }
  };

  const filteredWallets = searchEmail.trim()
    ? wallets.filter(w => 
        w.email.toLowerCase().includes(searchEmail.toLowerCase()) || 
        (w.username && w.username.toLowerCase().includes(searchEmail.toLowerCase()))
      )
    : wallets;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 font-sans text-slate-800" id="admin-panel-container">
      
      {/* HEADER SECTION WITH MODERN TABS */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4 mb-6 gap-3">
        <div className="flex items-center gap-2">
          <Shield size={24} className="text-rose-600 shrink-0" />
          <div className="text-left">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
              Konsol Administrator Pusat Novelpedia
              <span className="text-[10px] bg-rose-600 text-white px-2 py-0.5 rounded font-black font-mono">SYS-OP</span>
            </h2>
            <p className="text-xs text-slate-500">Kendalikan koin, pemblokiran akun, karantina plagiarisme AI, dan info pengumuman sistem.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={fetchAllAdminData}
            className="px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} /> Aktualisasi Data
          </button>
        </div>
      </div>

      {/* SYSTEM METRICS */}
      <section className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-white border border-slate-200 text-left shadow-xs">
          <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Koin Sirkulasi</span>
          <p className="text-lg font-black text-indigo-600 mt-1 font-mono">{stats.coinsCirculating} Pixel</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Agregat koin terdistribusi</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 text-left shadow-xs">
          <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Royalti Sukses Cair</span>
          <p className="text-lg font-black text-emerald-600 mt-1 font-mono">Rp {stats.withdrawnIDR.toLocaleString("id-ID")}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Insentif terbayar lancar</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 text-left shadow-xs">
          <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Karantina Plagiat</span>
          <p className="text-lg font-black text-rose-600 mt-1 font-mono">{flaggedNovels.length} Judul</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Status embargo sensor AI</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 text-left shadow-xs">
          <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Total Anggota</span>
          <p className="text-lg font-black text-slate-900 mt-1 font-mono">{wallets.length} Akun</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Pembaca & Penulis terdaftar</p>
        </div>
      </section>

      {/* ADMINISTRATION CHANNELS */}
      <div className="flex flex-wrap gap-2 mb-6 bg-slate-100/50 p-1.5 rounded-xl border border-slate-200">
        <button
          onClick={() => setAdminTab("users")}
          className={`flex-1 min-w-[120px] px-4 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer ${
            adminTab === "users" 
              ? "bg-white text-indigo-600 shadow-sm border border-slate-200/50" 
              : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
          }`}
        >
          <Settings size={14} />
          Kelola Pengguna ({wallets.length})
        </button>

        <button
          onClick={() => setAdminTab("novels")}
          className={`flex-1 min-w-[120px] px-4 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer ${
            adminTab === "novels" 
              ? "bg-white text-emerald-600 shadow-sm border border-slate-200/50" 
              : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
          }`}
        >
          <Book size={14} />
          Semua Novel
        </button>

        <button
          onClick={() => setAdminTab("announcements")}
          className={`flex-1 min-w-[120px] px-4 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer ${
            adminTab === "announcements" 
              ? "bg-white text-indigo-600 shadow-sm border border-slate-200/50" 
              : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
          }`}
        >
          <Bell size={14} />
          Broadcast Info ({announcements.length})
        </button>

        <button
          onClick={() => setAdminTab("karantina")}
          className={`flex-1 min-w-[120px] px-4 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer ${
            adminTab === "karantina" 
              ? "bg-white text-rose-600 shadow-sm border border-slate-200/50" 
              : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
          }`}
        >
          <ShieldAlert size={14} />
          Sensor Karantina ({flaggedNovels.length})
        </button>

        <button
          onClick={() => setAdminTab("pencairan")}
          className={`flex-1 min-w-[120px] px-4 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer ${
            adminTab === "pencairan" 
              ? "bg-white text-emerald-600 shadow-sm border border-slate-200/50" 
              : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
          }`}
        >
          <CreditCard size={14} />
          Pencairan Dana ({withdrawals.filter(w => w.status === 'pending').length})
        </button>

        <button
          onClick={() => setAdminTab("iklan")}
          className={`flex-1 min-w-[120px] px-4 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer ${
            adminTab === "iklan" 
              ? "bg-white text-amber-600 shadow-sm border border-slate-200/50" 
              : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
          }`}
        >
          <Megaphone size={14} />
          Manajemen Iklan
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* VIEW COLUMN FOR THE SELECTED SUBMODULE */}
        <div className="lg:col-span-2">
          
          {/* TAB 1: KELOLA PENGGUNA (Coins, Bans, Verification, custom title) */}
          {adminTab === "users" && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 text-left flex flex-col gap-5">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Settings size={16} className="text-slate-700" /> Kendali Otoritas Pengguna & Koin
                </h3>
                <p className="text-xs text-slate-500 mt-1">Sesuaikan saldo dompet penjelajah, ubah gelar resmi pena, cabut akses/blokir akun penipu secara langsung.</p>
              </div>

              {/* SEARCH INPUT BAR */}
              <div className="relative">
                <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Ketik email atau username pengguna..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold outline-none focus:ring-2 focus:ring-slate-900"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                />
              </div>

              {/* USER SECTIONS LIST */}
              <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-1">
                {filteredWallets.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">Pengguna tidak ditemukan dalam indeks sementara.</div>
                ) : (
                  filteredWallets.map((wl) => {
                    const localCoins = coinInput[wl.email] ?? "";
                    const localTitle = titleInput[wl.email] ?? "";

                    return (
                      <div 
                        key={wl.email} 
                        className={`p-4 border rounded-xl flex flex-col gap-3 transition-colors ${
                          wl.isBanned 
                            ? "bg-rose-50/20 border-rose-200" 
                            : wl.isPremium 
                              ? "bg-amber-50/10 border-amber-200" 
                              : "bg-white border-slate-200"
                        }`}
                      >
                        {/* Summary line */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-mono text-xs font-black text-slate-900 truncate">@{wl.username || wl.email.split("@")[0]}</span>
                            <span className="text-[10.5px] text-slate-400 font-semibold">({wl.email})</span>
                            
                            {wl.isAdmin && (
                              <span className="text-[9px] bg-indigo-100 text-indigo-750 px-2 py-0.5 rounded font-black font-mono">ADMIN</span>
                            )}
                            {wl.isPremium && (
                              <span className="text-[9px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-black font-mono">PREMIUM</span>
                            )}
                            {wl.isVerified && (
                              <span className="text-[9px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-black font-sans flex items-center gap-0.5">
                                ✓ Verified
                              </span>
                            )}
                            {wl.isBanned && (
                              <span className="text-[9px] bg-rose-600 text-white px-2 py-0.5 rounded font-black font-mono flex items-center gap-0.5">
                                🚫 BANNED
                              </span>
                            )}
                          </div>
                          
                          {wl.customTitle && (
                            <span className="text-[10px] bg-slate-100 border border-slate-200 text-slate-655 font-bold px-2 py-0.5 rounded">
                              &ldquo;{wl.customTitle}&rdquo;
                            </span>
                          )}
                        </div>

                        {/* Balance and controls */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Info Column */}
                          <div className="text-xs leading-normal space-y-1">
                            <p className="text-slate-500">Saldo Koin Saat Ini: <b className="text-indigo-600 font-mono text-[13px]">{wl.coins} Koin</b></p>
                            <p className="text-slate-500">Akrual Pendapatan: <b className="text-emerald-600">Rp {wl.revenueExp.toLocaleString("id-ID")}</b></p>
                            <p className="text-slate-500">Pengikut: <b className="text-slate-700">{wl.followersCount ?? 0} pembaca</b></p>
                          </div>

                          {/* Quick Adjustments Box */}
                          <div className="space-y-2">
                            {/* Coins modify form */}
                            <div className="flex gap-1.5">
                              <input 
                                type="number"
                                placeholder="Ganti koin user..."
                                title="Masukkan total koin pengguna yang baru"
                                className="bg-slate-50 border border-slate-200 rounded p-1.5 text-xs font-semibold focus:ring-1 focus:ring-slate-900 w-full"
                                value={localCoins}
                                onChange={(e) => setCoinInput(prev => ({ ...prev, [wl.email]: e.target.value }))}
                              />
                              <button
                                onClick={() => {
                                  if (localCoins === "") return;
                                  handleModifyUserDirect(wl.email, { setCoins: Number(localCoins) });
                                  setCoinInput(prev => ({ ...prev, [wl.email]: "" }));
                                }}
                                disabled={actionLoadingEmail !== null}
                                className="bg-indigo-600 hover:bg-indigo-755 text-white text-[11px] font-bold px-2 py-1.5 rounded transition-all shrink-0 cursor-pointer"
                              >
                                Atur Koin
                              </button>
                            </div>

                            {/* Title custom modify form */}
                            <div className="flex gap-1.5">
                              <input 
                                type="text"
                                placeholder="Ubah gelar pena..."
                                className="bg-slate-50 border border-slate-200 rounded p-1.5 text-xs font-semibold focus:ring-1 focus:ring-slate-900 w-full"
                                value={localTitle}
                                onChange={(e) => setTitleInput(prev => ({ ...prev, [wl.email]: e.target.value }))}
                              />
                              <button
                                onClick={() => {
                                  if (localTitle === "") return;
                                  handleModifyUserDirect(wl.email, { customTitle: localTitle });
                                  setTitleInput(prev => ({ ...prev, [wl.email]: "" }));
                                }}
                                disabled={actionLoadingEmail !== null}
                                className="bg-slate-750 hover:bg-slate-900 text-white text-[11px] font-bold px-2.5 py-1.5 rounded transition-all shrink-0 cursor-pointer"
                              >
                                Simpan Gelar
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Interactive toggle actions buttons bar */}
                        <div className="flex flex-wrap gap-2 justify-end border-t border-slate-50 pt-2 bg-slate-50/50 p-2 rounded-lg">
                          <button
                            onClick={() => handleModifyUserDirect(wl.email, { isPremium: !wl.isPremium })}
                            disabled={wl.isAdmin || actionLoadingEmail !== null}
                            className={`px-3 py-1 text-[11px] font-bold rounded cursor-pointer transition-colors ${
                              wl.isPremium 
                                ? "bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-300"
                                : "bg-white hover:bg-amber-50 text-slate-650 border border-slate-200 hover:text-amber-700 hover:border-amber-200"
                            }`}
                          >
                            <Crown size={12} className="inline mr-1" /> {wl.isPremium ? "Hapus Premium" : "Beri Premium"}
                          </button>

                          <button
                            onClick={() => handleModifyUserDirect(wl.email, { isVerified: !wl.isVerified })}
                            disabled={wl.isAdmin || actionLoadingEmail !== null}
                            className={`px-3 py-1 text-[11px] font-bold rounded cursor-pointer transition-colors ${
                              wl.isVerified 
                                ? "bg-blue-100 hover:bg-blue-200 text-blue-700 border border-blue-300"
                                : "bg-white hover:bg-blue-50 text-slate-655 border border-slate-200 hover:text-blue-700"
                            }`}
                          >
                            ✓ {wl.isVerified ? "Cabut Ceklis" : "Pasang Ceklis"}
                          </button>

                          <button
                            onClick={() => handleModifyUserDirect(wl.email, { isBanned: !wl.isBanned })}
                            disabled={wl.isAdmin || actionLoadingEmail !== null}
                            className={`px-3 py-1 text-[11px] font-bold rounded cursor-pointer transition-all flex items-center gap-1 ${
                              wl.isBanned 
                                ? "bg-rose-600 text-white hover:bg-rose-700" 
                                : "bg-red-50 hover:bg-red-100 text-rose-650 border border-red-200 hover:text-rose-700"
                            }`}
                          >
                            <Ban size={11} />
                            {wl.isBanned ? "PULIHKAN AKSES (Unban)" : "BLOKIR AKUN USER (Ban)"}
                          </button>
                        </div>

                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB: SEMUA NOVEL */}
          {adminTab === "novels" && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 text-left flex flex-col gap-5">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Book size={16} className="text-slate-700" /> Katalog Seluruh Karya Indeks
                </h3>
                <p className="text-xs text-slate-500 mt-1">Administrator dapat melihat semua novel dari setiap penulis, mengelola, atau menghapus karya yang melanggar ketentuan tanpa peringatan.</p>
              </div>

              {/* SEARCH INPUT BAR */}
              <div className="relative">
                <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Ketik judul novel atau pemilih nama pena (author)..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold outline-none focus:ring-2 focus:ring-slate-900"
                  value={searchNovel}
                  onChange={(e) => setSearchNovel(e.target.value)}
                />
              </div>

              {/* ALL NOVELS LIST */}
              <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-1">
                {allNovels.filter(n => (n.title || "").toLowerCase().includes((searchNovel || "").toLowerCase()) || (n.author || "").toLowerCase().includes((searchNovel || "").toLowerCase())).length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">Pustaka tidak ditemukan atau belum ada yang terdaftar.</div>
                ) : (
                  allNovels.filter(n => (n.title || "").toLowerCase().includes((searchNovel || "").toLowerCase()) || (n.author || "").toLowerCase().includes((searchNovel || "").toLowerCase())).map((nvl) => (
                    <div 
                      key={nvl.id} 
                      className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col lg:flex-row gap-4 transition-all hover:bg-slate-50"
                    >
                      <div className={`h-24 w-16 shrink-0 rounded-lg shadow-sm bg-gradient-to-tr ${nvl.bannerColor} relative overflow-hidden flex items-end justify-center pb-2`}>
                        {nvl.coverUrl ? (
                           <img src={nvl.coverUrl} alt="Cover" className="absolute inset-0 w-full h-full object-cover opacity-80" />
                        ) : null}
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                             <h4 className="text-sm font-black text-slate-900 leading-tight">
                               {nvl.title}
                             </h4>
                             <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 rounded uppercase border border-slate-200">
                               ID: {nvl.id}
                             </span>
                          </div>
                          
                          <p className="text-[11px] text-slate-500 font-bold mt-1">Oleh <span className="text-indigo-600">@{nvl.authorUsername}</span> ({nvl.author})</p>
                          
                          <div className="flex gap-2 mt-2">
                            <span className="text-[9px] bg-slate-100 border border-slate-200 text-slate-655 font-bold px-2 py-0.5 rounded uppercase">
                              Genre: {nvl.genre}
                            </span>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase border ${nvl.status === 'tamat' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
                              {nvl.status}
                            </span>
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-3 mt-3 border-t border-slate-100">
                           <button
                             onClick={async () => {
                               const res = await fetch("/api/payment", {
                                 method: "POST",
                                 headers: { "Content-Type": "application/json" },
                                 body: JSON.stringify({ action: "toggle_trending", email: user.email, novelId: nvl.id })
                               });
                               const data = await res.json();
                               if(data.success) {
                                  alert(data.message);
                                  fetchAllAdminData();
                               } else alert(data.error);
                             }}
                             className={`text-[11px] font-bold px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors cursor-pointer border ${nvl.isTrending ? "bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100" : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"}`}
                           >
                             <TrendingUp size={12} /> {nvl.isTrending ? "HAPUS TRENDING" : "JADIKAN TRENDING"}
                           </button>
                           <button
                             onClick={() => handleDeleteNovel(nvl.id, nvl.title)}
                             className="text-[11px] font-bold bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors cursor-pointer border border-rose-200"
                           >
                             <Trash2 size={12} /> HAPUS PERMANEN
                           </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 2: BROADCAST & ANNOUNCEMENTS CONTROL */}
          {adminTab === "announcements" && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 text-left flex flex-col gap-6" id="broadcast-channels">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Bell size={16} className="text-amber-500 animate-swing" /> Siarkan Pengumuman & Info Update Terbaru
                </h3>
                <p className="text-xs text-slate-500 mt-1">Publikasikan pemutakhiran, rilis fitur teknik, atau peringatan resmi yang akan langsung dimuat di beranda seluruh pembaca.</p>
              </div>

              {/* PUBLISH NEW ANNOUNCEMENT FORM */}
              <form onSubmit={handlePublishAnnouncement} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                <p className="text-xs font-black text-slate-800 uppercase flex items-center gap-1">
                  <Sparkles size={12} className="text-indigo-650" /> Formulir Rilis Berita Sistem
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] text-slate-400 font-extrabold uppercase mb-1">Judul Pengumuman</label>
                    <input 
                      type="text" 
                      placeholder="Contoh: [PENTING] Rilis Fitur Mengikuti Penulis & Upgrade Profil Terkini..."
                      required
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold outline-none focus:ring-1 focus:ring-slate-950"
                      value={annTitle}
                      onChange={(e) => setAnnTitle(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 font-extrabold uppercase mb-1">Tipe Prioritas</label>
                    <select
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold outline-none focus:ring-1 focus:ring-slate-950"
                      value={annType}
                      onChange={(e) => setAnnType(e.target.value as any)}
                    >
                      <option value="info">Info Umum (Biru)</option>
                      <option value="update">Update Fitur (Hijau)</option>
                      <option value="warning">Peringatan Penting (Merah)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-extrabold uppercase mb-1 font-sans">Deskripsi Narasi Pengumuman</label>
                  <textarea 
                    rows={3}
                    placeholder="Sebutkan ringkasan modul pembaruan ataupun rilis sanksi platform secara transparan di sini agar dibaca komunitas sastra..."
                    required
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-medium outline-none focus:ring-1 focus:ring-slate-950"
                    value={annContent}
                    onChange={(e) => setAnnContent(e.target.value)}
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-lg text-xs cursor-pointer shadow-sm transition-colors flex items-center gap-1.5"
                  >
                    <Send size={14} className="inline mr-1" /> Siarkan Kabar Update
                  </button>
                </div>
              </form>

              {/* MANAGING OLD PUBLISHED ANNOUNCEMENTS */}
              <div className="space-y-3">
                <span className="text-[10px] text-slate-450 font-black uppercase tracking-wider block">Daftar Pengumuman Aktif di Beranda</span>

                {announcements.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-4 text-center">Belum ada pengumuman yang disiarkan di beranda sementara ini.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {announcements.map((ann) => (
                      <div 
                        key={ann.id} 
                        className={`p-3.5 border rounded-xl flex items-start justify-between gap-3 text-xs ${
                          ann.type === "warning" 
                            ? "bg-rose-50/10 border-rose-220" 
                            : ann.type === "update" 
                              ? "bg-emerald-50/10 border-emerald-210" 
                              : "bg-slate-50/20 border-slate-200"
                        }`}
                      >
                        <div className="space-y-1 text-left min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`text-[9px] px-1.5 font-mono font-extrabold rounded uppercase ${
                              ann.type === "warning" 
                                ? "bg-rose-100 text-rose-800"
                                : ann.type === "update" 
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-blue-105 text-blue-800"
                            }`}>
                              {ann.type}
                            </span>
                            <span className="text-[10px] text-slate-400">{new Date(ann.createdAt).toLocaleDateString("id-ID")} WIB</span>
                          </div>
                          <p className="font-extrabold text-slate-950 uppercase text-[11px]">{ann.title}</p>
                          <p className="text-slate-500 text-[11px] leading-relaxed break-words">{ann.content}</p>
                        </div>

                        <button
                          onClick={() => handleDeleteAnnouncement(ann.id)}
                          className="p-1.5 bg-white border border-slate-200 hover:bg-slate-100 hover:text-rose-600 rounded cursor-pointer transition-colors shrink-0"
                          title="Hapus / Tarik Pengumuman"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 3: PLAGIARISM REVIEWS */}
          {adminTab === "karantina" && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 text-left flex flex-col gap-6">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
                  <ShieldAlert size={15} className="text-rose-600 shrink-0" /> Evaluasi Plagiarisme AI
                </h3>
                <p className="text-xs text-slate-500 mt-1">Draf bab yang terdeteksi menjiplak naskah dari internet di atas batas aman 70%.</p>
              </div>

              {flaggedNovels.length === 0 ? (
                <div className="py-12 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50 flex flex-col items-center justify-center p-6">
                  <CheckCircle2 size={32} className="text-emerald-500 mb-2" />
                  <span className="text-xs text-slate-500 font-bold uppercase">Suhu Kerja Kondusif</span>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-xs leading-relaxed text-center">Seluruh novel yang dipublikasikan memenuhi batas aman sensor plagiat orisinalitas.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {flaggedNovels.map((novel) => (
                    <div key={novel.id} className="p-4 bg-slate-50 border border-slate-150 rounded-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="text-left">
                        <p className="font-extrabold text-slate-900 uppercase text-xs tracking-tight">{novel.title}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Disusun Oleh: @{novel.authorUsername} | {novel.author}</p>
                        <p className="text-[11px] inline-flex items-center gap-1 text-rose-600 font-extrabold mt-1.5 uppercase leading-none bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded">
                          <XCircle size={10} /> Penangguhan Plagiat Tertahan (&gt; 70%)
                        </p>
                      </div>

                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => handleBypassAiBlock(novel.id, novel.title, novel.authorUsername)}
                          className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs cursor-pointer transition-colors"
                        >
                          Loloskan
                        </button>
                        <button
                          onClick={() => handleModifyUserDirect(novel.author, { isBanned: true })}
                          className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-605 font-bold border border-rose-200 rounded-lg text-xs cursor-pointer transition-colors"
                        >
                          Sanksi Ban User
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: REAL-TIME PENCAIRAN QUEUE */}
          {adminTab === "pencairan" && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 text-left flex flex-col gap-6">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
                  <CreditCard size={15} className="text-indigo-600" /> Antrean Pencairan Royalti Buku Sastrawan
                </h3>
                <p className="text-xs text-slate-500 mt-1">Daftar permintaan cashout resmi dari para pengarang orisinal di Novelpedia.</p>
              </div>

              {withdrawals.length === 0 ? (
                <div className="py-12 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50 text-xs">
                  Tidak ada pengajuan transfer dana penarikan tersimpan di sirkulasi log saat ini.
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {withdrawals.map((withdraw) => (
                    <div 
                      key={withdraw.id} 
                      className={`p-4 border rounded-xl flex flex-col gap-3 transition-colors ${
                        withdraw.status === "pending" 
                          ? "border-amber-200 bg-amber-50/10" 
                          : withdraw.status === "approved" 
                            ? "border-emerald-110 bg-emerald-50/5" 
                            : "border-slate-200 bg-slate-50/40"
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-slate-400">ID: {withdraw.id}</span>
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                            withdraw.status === "pending" 
                              ? "bg-amber-100 text-amber-800" 
                              : withdraw.status === "approved" 
                                ? "bg-emerald-100 text-emerald-800" 
                                : "bg-slate-200 text-slate-600"
                          }`}>
                            {withdraw.status}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500">
                          {new Date(withdraw.createdAt).toLocaleDateString("id-ID")} {new Date(withdraw.createdAt).toLocaleTimeString("id-ID")} WIB
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                        <div className="text-xs leading-normal">
                          <p className="text-slate-400 uppercase font-bold text-[9px]">Penerima Dana Sastrawan</p>
                          <p className="font-extrabold text-slate-900 mt-0.5">{withdraw.email}</p>
                          
                          <div className="mt-2.5 bg-white p-2.5 border border-slate-150 rounded-lg">
                            <span className="text-[9px] uppercase font-bold text-slate-400 block">Akun Bank Rekening Rekaman</span>
                            <p className="text-[11px] font-bold text-slate-800 mt-0.5">{withdraw.bankName}</p>
                            <p className="text-[11px] font-mono font-black text-indigo-600">{withdraw.bankAccount}</p>
                            <p className="text-[11px] uppercase font-bold text-slate-600 mt-0.5">A/N: {withdraw.accountHolder}</p>
                          </div>
                        </div>

                        <div className="flex flex-col justify-between items-end gap-3">
                          <div className="text-right">
                            <span className="text-[9px] uppercase font-bold text-slate-400">Jumlah Pencairan Bersih</span>
                            <p className="text-xl font-extrabold text-indigo-650">Rp {withdraw.amount.toLocaleString("id-ID")}</p>
                          </div>

                          {withdraw.status === "pending" && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleUpdateWithdrawalStatus(withdraw.id, "rejected")}
                                className="px-3 py-1.5 text-rose-600 bg-rose-50 hover:bg-rose-100 hover:text-rose-700 text-xs font-bold rounded-lg cursor-pointer transition-colors border border-rose-200"
                              >
                                Tolak Transfer
                              </button>
                              <button
                                onClick={() => handleUpdateWithdrawalStatus(withdraw.id, "approved")}
                                className="px-3.5 py-1.5 text-white bg-slate-900 hover:bg-slate-800 text-xs font-bold rounded-lg cursor-pointer shadow-xs transition-colors"
                              >
                                Selesaikan Transfer &gt;
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {adminTab === "iklan" && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 text-left flex flex-col gap-5 animate-in fade-in duration-300">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Megaphone size={16} className="text-amber-600" /> Manajemen Iklan (Ads)
                </h3>
                <p className="text-xs text-slate-500 mt-1">Konfigurasikan pengaturan iklan yang tampil untuk pembaca Reguler. Akun Premium akan selalu terbebas dari iklan ini.</p>
              </div>

              <div className="bg-amber-50 border border-amber-100 p-5 rounded-xl flex flex-col gap-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="pr-4">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Aktifkan Iklan Global</h4>
                    <p className="text-[10px] text-slate-600 mt-1 leading-relaxed">Tampilkan iklan di halaman daftar novel dan di antar bab bacaan untuk non-premium.</p>
                  </div>
                  <div className="flex bg-slate-200 p-1 rounded-lg shrink-0">
                    <button 
                      onClick={() => setAdsEnabled(true)}
                      className={`px-4 py-2 text-[10px] font-black uppercase rounded-md shadow-sm transition-all ${adsEnabled ? 'bg-amber-500 text-slate-950' : 'text-slate-500 hover:text-slate-700 cursor-pointer'}`}
                    >
                      ON
                    </button>
                    <button 
                      onClick={() => setAdsEnabled(false)}
                      className={`px-4 py-2 text-[10px] font-black uppercase rounded-md shadow-sm transition-all ${!adsEnabled ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-700 cursor-pointer'}`}
                    >
                      OFF
                    </button>
                  </div>
                </div>

                <div className="border-t border-amber-200/60 pt-4">
                   <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-2">Penyedia Jaringan Iklan</h4>
                   <select 
                     value={adsProvider}
                     onChange={(e) => setAdsProvider(e.target.value)}
                     className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-bold outline-none text-slate-700 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all shadow-sm"
                   >
                     <option>Google AdSense (Default)</option>
                     <option>Meta Audience Network</option>
                     <option>Custom Banners (Iklan Internal)</option>
                   </select>
                </div>
                
                <div className="border-t border-amber-200/60 pt-4">
                   <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-2">Frekuensi Muncul Iklan (Interstisial)</h4>
                   <select 
                     value={adsFrequency}
                     onChange={(e) => setAdsFrequency(e.target.value)}
                     className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-bold outline-none text-slate-700 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all shadow-sm"
                   >
                     <option>Tiap 1 Bab Selesai Dibaca</option>
                     <option>Tiap 3 Bab Selesai Dibaca</option>
                     <option>Tiap 5 Bab Selesai Dibaca</option>
                     <option>Hanya di Beranda / Dashboard</option>
                   </select>
                </div>

                <button 
                  className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase rounded-xl tracking-wider shadow-md shadow-slate-900/10 mt-3 transition-all flex justify-center items-center gap-2 cursor-pointer" 
                  onClick={() => {
                    localStorage.setItem("novelpedia_ads_config", JSON.stringify({
                      enabled: adsEnabled,
                      provider: adsProvider,
                      frequency: adsFrequency
                    }));
                    alert("Pengaturan Iklan berhasil disimpan ke dalam sistem!");
                  }}
                >
                  <Check size={16} className="text-amber-400" /> Simpan Pengaturan Iklan
                </button>
              </div>

              <div className="text-[11px] text-slate-500 leading-normal bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-start gap-3 mt-2">
                <Info size={16} className="text-amber-500 shrink-0" />
                <span>
                  <b>Informasi Pendapatan:</b> Seluruh metrik impresi dan CPC/CPM akan ditangani oleh dasbor provider iklan masing-masing. Sistem ini hanya mengatur visibilitas slot iklan pada tampilan antar muka klien Web.
                </span>
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Terminal System Logs & Audit Trails */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex-1 flex flex-col">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 mb-3 flex items-center gap-1.5 text-left">
              <Terminal size={14} className="text-rose-600 animate-pulse" /> Live Telemetri & Log Audit Operator
            </h3>

            <div className="bg-slate-950 font-mono text-[9px] rounded-xl p-4 h-96 border border-slate-800 flex flex-col gap-1.5 overflow-y-auto mb-3 text-slate-100 leading-normal text-left">
              <p className="text-rose-400 font-bold">BOOT ENGINE SEQ INIT ● COMPLETE</p>
              <p className="text-emerald-400">[DATABASE] Konsistensi data in-memory solid.</p>
              <p className="text-slate-400">[INFO] Server Chapter sync aktif pada port 3000.</p>
              <p className="text-rose-500 font-bold">[MODIFIED_V2] Modul bab premium ditiadakan.</p>
              
              {systemLogs.map((log, index) => (
                <p key={index} className="text-slate-300 break-words leading-relaxed select-text">
                  {log}
                </p>
              ))}
              
              <p className="text-rose-500 animate-pulse font-bold mt-1">● Menanti integrasi telemetri siber...</p>
            </div>

            <div className="text-[11px] text-slate-500 leading-normal bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-left flex items-start gap-2">
              <Info size={14} className="text-rose-600 shrink-0 mt-0.5" />
              <span>
                Setiap tindakan penalti koin, penyesuaian koin, penutupan/banned akun, dan siaran berita terintegrasi ke audit trail server backend dengan aman.
              </span>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
