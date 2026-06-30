import React, { useState, useEffect } from "react";
import { 
  Coins, 
  User, 
  Volume2, 
  VolumeX, 
  Bell, 
  LogIn, 
  ChevronRight, 
  Layout, 
  Terminal, 
  LogOut, 
  CheckCircle2, 
  Menu, 
  X, 
  BookOpen, 
  ShieldAlert, 
  Sparkles, 
  SlidersHorizontal,
  Home,
  Clock,
  PenTool,
  Plus,
  Star,
  Flame,
  Shield,
  Info,
  Settings
} from "lucide-react";
import { retroAudio } from "@/lib/retro-audio";

interface NavbarProps {
  user: { email: string; username: string };
  wallet: { coins: number; isAdmin: boolean; revenueExp: number } | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onRefreshWallet: () => void;
  onLogin: (email: string, username: string) => void;
  onLogout: () => void;
}

export default function Navbar({
  user,
  wallet,
  activeTab,
  setActiveTab,
  onRefreshWallet,
  onLogin,
  onLogout,
}: NavbarProps) {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);
  const [isOpenHamburg, setIsOpenHamburg] = useState(false); // Left Sidebar drawer trigger
  const [soundOn, setSoundOn] = useState(false); // default off to match modern quiet aesthetics
  const [loginEmail, setLoginEmail] = useState("");
  const [loginUser, setLoginUser] = useState("");
  const [tickerLog, setTickerLog] = useState("Sistem Novelpedia modern berhasil dimuat...");

  // Mock Notifications (removed emojis inside list strings)
  const [notifications, setNotifications] = useState([
    { id: "n_1", text: "Selamat Datang di Portal Karyasastra Novelpedia!", read: false },
    { id: "n_2", text: "TIPS: Coba ketik novel dengan kata-kata pemicu 'cheat/plagiat' untuk mencoba pendeteksian AI Scanner!", read: false },
    { id: "n_3", text: "Dashboard Moderator aktif secara otomatis untuk akun Admin.", read: false }
  ]);

  // Sync balances and scrolling news feed on startup
  useEffect(() => {
    fetchLogs();
    const interval = setInterval(() => {
      fetchLogs();
    }, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchLogs = async () => {
    if (!user?.email) return;
    try {
      const res = await fetch("/api/payment?action=get_balance&email=" + encodeURIComponent(user.email));
      const dat = await res.json();
      if (dat.success) {
        onRefreshWallet();
      }
      
      const newsGlimpses = [
        "SISTEM: Sensor Keaslian Gemini 3.5-Flash siap mendaftarkan bab baru...",
        "FINANCE: Platform komisi 10% dipotong otomatis saat penarikan dana eksklusif...",
        "WORKER: Sinkronisasi Google Calendar dan Google Sheets sukses...",
        "SECURITY: Enkripsi akun ganda Novelpedia terhubung kokoh...",
        "INFO: Pembaca dapat mendukung author orisinal dengan donasi koin premium..."
      ];
      setTickerLog(newsGlimpses[Math.floor(Math.random() * newsGlimpses.length)]);
    } catch (e) {}
  };

  const handleToggleSound = () => {
    const newVal = !soundOn;
    setSoundOn(newVal);
    retroAudio.toggleSound(newVal);
    if (newVal) {
      retroAudio.playSelect();
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail) return;
    const computedUser = loginUser.trim() || loginEmail.split("@")[0];
    onLogin(loginEmail, computedUser);
    setShowLoginModal(false);
  };

  const handlePresetLogin = (email: string, username: string) => {
    onLogin(email, username);
    setShowLoginModal(false);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setIsOpenHamburg(false);
  };

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white p-3 md:py-3.5 md:px-6 shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        
        {/* HAMBURGER & LOGO AREA */}
        <div className="flex items-center gap-3">
          {/* Hamburger button left side */}
          <button
            onClick={() => setIsOpenHamburg(true)}
            className="p-1 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-indigo-600 cursor-pointer flex items-center justify-center transition-all shadow-xs"
            title="Buka Menu Samping"
            id="hamburger-menu-toggle"
          >
            <Menu size={18} />
          </button>

          {/* User requested primary navbar logo image: 1:1 URL ratio */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => handleTabChange("beranda")}>
            <img 
              src="https://files.catbox.moe/vbu1md.png" 
              className="h-9 w-9 object-contain rounded-lg border border-slate-100 shadow-sm"
              alt="Novelpedia Main Logo" 
            />
            
            <div className="hidden sm:block text-left">
              <h1 className="text-base font-black tracking-wider text-indigo-600 leading-none">
                NOVELPEDIA
              </h1>
              <span className="text-[9px] font-bold tracking-tight text-slate-500 mt-0.5 block whitespace-nowrap">
                PORTAL JELAJAH SASTRA INDIE
              </span>
            </div>
          </div>
        </div>

        {/* LOG SCROLLING NEWS TICKER */}
        <div className="hidden lg:flex flex-1 mx-6 max-w-xs xl:max-w-md rounded-lg bg-slate-50 border border-slate-200 p-1.5 px-3 items-center gap-2 overflow-hidden">
          <div className="inline-block text-[9px] font-black text-indigo-600 uppercase border border-indigo-200 bg-indigo-50/55 px-1.5 py-0.5 rounded shrink-0 leading-none">
            FEED
          </div>
          <div className="text-[10px] text-slate-600 font-medium truncate">
            {tickerLog}
          </div>
        </div>

        {/* REVENUE/COINS WALLET HUD */}
        <div className="flex items-center gap-3">
          
          {/* WALLET AND SESSION PORTRAIT */}
          <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-1 px-3 border border-slate-200">
            
            {/* Wallet coins indicator */}
            <div 
              className="flex items-center gap-1.5 select-none py-1"
              title="Total Koin"
            >
              <Coins size={13} className="text-amber-500" />
              <span className="text-xs font-black text-slate-850">{wallet?.coins ?? 0} Koin</span>
            </div>

            <div className="h-4 w-px bg-slate-200 hidden sm:block" />

            {/* Persona Switcher label */}
            <div 
              onClick={() => handleTabChange("profile")}
              className="hidden sm:flex items-center gap-2 cursor-pointer hover:text-indigo-600 group py-1"
              title="Informasi Sesi Akun & Ganti Akun"
            >
              <User size={13} className="text-slate-400 group-hover:text-indigo-600" />
              <div className="text-left leading-none">
                <div className="text-[10px] font-black text-slate-800 truncate max-w-[80px]">
                  @{user.username}
                </div>
                <div className={`text-[8px] font-extrabold uppercase tracking-tight mt-0.5 ${wallet?.isAdmin ? 'bg-red-600 text-white px-1.5 py-0.5 rounded inline-flex items-center justify-center leading-none' : 'text-slate-400'}`}>
                  {wallet?.isAdmin ? "ADMIN" : "AUTHOR"}
                </div>
              </div>
            </div>

            {/* Notification triggers */}
            <div className="hidden sm:flex items-center gap-1.5 pl-2 border-l border-slate-200 py-1">
              <button 
                onClick={() => setShowNotifDrawer(true)}
                className={`p-1 relative hover:text-indigo-600 transition-all ${unreadCount > 0 ? 'text-indigo-600' : 'text-slate-400'}`}
                title="Pemberitahuan masuk"
              >
                <Bell size={13} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-indigo-600" />
                )}
              </button>
            </div>
          </div>

          {/* QUICK NOTIFICATIONS TRIGGER FOR MOBILE (Visible only if sm screen is not matching) */}
          <div className="sm:hidden flex items-center">
            <button 
              onClick={() => setShowNotifDrawer(!showNotifDrawer)}
              className="p-2 border border-slate-200 bg-slate-50 hover:bg-slate-100 rounded-lg relative text-slate-500 hover:text-indigo-600 transition-colors"
            >
              <Bell size={14} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-indigo-600" />
              )}
            </button>
          </div>

        </div>

      </div>

      {/* SLIDE-OUT LEFT SIDEBAR DRAWER (HAMBURGER CONTAINER) */}
      {isOpenHamburg && (
        <div className="fixed inset-0 z-50 flex animate-fade-in">
          {/* Backdrop lock */}
          <div 
            onClick={() => setIsOpenHamburg(false)}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer sheet body */}
          <div className="relative w-72 max-w-full bg-white h-full flex flex-col border-r border-slate-200 shadow-2xl p-5 z-10 animate-slide-right">
            
            {/* Drawer top close banner */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={14} className="text-indigo-600" />
                <span className="text-[11px] font-black text-slate-900 tracking-wider uppercase">Menu Utama Novelpedia</span>
              </div>
              <button 
                onClick={() => setIsOpenHamburg(false)}
                className="p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-900 rounded-lg cursor-pointer transition-colors"
                title="Tutup Menu"
              >
                <X size={16} />
              </button>
            </div>

            {/* Author Portrait Banner */}
            <div className="bg-gradient-to-br from-indigo-50 to-slate-50 border border-indigo-100/50 p-4 rounded-xl mb-4 text-left">
              <span className="text-[9px] bg-indigo-100 border border-indigo-200 text-indigo-700 px-1.5 py-0.5 rounded-md font-bold uppercase select-none leading-none inline-block mb-2">
                Sesi Identitas
              </span>
              <p className="text-xs font-black text-slate-900 truncate">@{user.username}</p>
              <p className="text-[10px] text-slate-500 truncate mt-0.5">{user.email}</p>
            </div>

            {/* Hamburger Nav Links Group */}
            <div className="flex-1 flex flex-col gap-2 overflow-y-auto">
              
              <button
                onClick={() => handleTabChange("beranda")}
                className={`py-2.5 px-3.5 text-xs text-left font-bold rounded-xl flex items-center gap-2.5 transition-all cursor-pointer ${
                  activeTab === "beranda" ? "bg-indigo-50 text-indigo-700" : "text-slate-650 hover:bg-slate-50"
                }`}
              >
                <Home size={14} className="text-slate-500 shrink-0" />
                <span>Beranda Utama</span>
              </button>

              <button
                onClick={() => handleTabChange("browse")}
                className={`py-2.5 px-3.5 text-xs text-left font-bold rounded-xl flex items-center gap-2.5 transition-all cursor-pointer ${
                  activeTab === "browse" ? "bg-indigo-50 text-indigo-700" : "text-slate-650 hover:bg-slate-50"
                }`}
              >
                <BookOpen size={14} className="text-slate-500 shrink-0" />
                <span>Pustaka All Novel</span>
              </button>

              <button
                onClick={() => handleTabChange("history")}
                className={`py-2.5 px-3.5 text-xs text-left font-bold rounded-xl flex items-center gap-2.5 transition-all cursor-pointer ${
                  activeTab === "history" ? "bg-indigo-50 text-indigo-700" : "text-slate-650 hover:bg-slate-50"
                }`}
              >
                <Clock size={14} className="text-slate-500 shrink-0" />
                <span>Riwayat History Baca</span>
              </button>

              <button
                onClick={() => handleTabChange("profile")}
                className={`py-2.5 px-3.5 text-xs text-left font-bold rounded-xl flex items-center gap-2.5 transition-all cursor-pointer ${
                  activeTab === "profile" ? "bg-indigo-50 text-indigo-700" : "text-slate-650 hover:bg-slate-50"
                }`}
              >
                <User size={14} className="text-slate-500 shrink-0" />
                <span>Profil Kreator</span>
              </button>

              <div className="h-px bg-slate-100 my-2" />

              <span className="block px-3 text-[9px] font-black text-slate-400 text-left uppercase tracking-widest mb-1">
                Kreator & Moderator
              </span>

              {/* WRITE CORNER TRIGGER */}
              <button
                onClick={() => handleTabChange("write")}
                className={`py-2.5 px-3.5 text-xs text-left font-bold rounded-xl flex items-center gap-2.5 transition-all cursor-pointer ${
                  activeTab === "write" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-650 hover:bg-slate-50 hover:text-indigo-600"
                }`}
              >
                <PenTool size={14} className="shrink-0" />
                <span>Tulis & Terbitkan Karya</span>
              </button>

              {/* ADMIN CONTROLS MODERATION */}
              {wallet?.isAdmin && (
                <button
                  onClick={() => handleTabChange("admin")}
                  className={`py-2.5 px-3.5 text-xs text-left font-bold rounded-xl flex items-center gap-2.5 transition-all cursor-pointer ${
                    activeTab === "admin" ? "bg-rose-600 text-white shadow-sm" : "text-indigo-600 hover:bg-rose-50"
                  }`}
                >
                  <Shield size={14} className="shrink-0" />
                  <span>Panel Pengawasan AI</span>
                </button>
              )}

              <div className="h-px bg-slate-100 my-2" />

              <span className="block px-3 text-[9px] font-black text-slate-400 text-left uppercase tracking-widest mb-1">
                Aksi Tambahan
              </span>

              {/* Sound on/off soundfx */}
              <button
                type="button"
                onClick={handleToggleSound}
                className="py-2 px-3.5 text-xs text-left font-bold rounded-xl text-slate-650 hover:bg-slate-50 flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  {soundOn ? <Volume2 size={14} className="text-slate-500" /> : <VolumeX size={14} className="text-slate-400" />}
                  <span>Efek Suara (Audio)</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase ${soundOn ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
                  {soundOn ? "ON" : "OFF"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => { setIsOpenHamburg(false); setShowNotifDrawer(true); }}
                className="py-2.5 px-3.5 text-xs text-left font-bold rounded-xl text-slate-650 hover:bg-slate-50 flex items-center gap-2.5 transition-all cursor-pointer"
              >
                <Bell size={14} className="text-slate-500 shrink-0" />
                <span>Notifikasi Masuk ({unreadCount})</span>
              </button>

            </div>

            {/* Logout drawer terminal footer */}
            <div className="border-t border-slate-100 pt-4 flex flex-col gap-2 mt-auto">
              <button
                onClick={() => { setIsOpenHamburg(false); onLogout(); }}
                className="w-full flex items-center justify-center gap-2 py-2.5 border border-rose-200 bg-rose-50/40 text-rose-650 rounded-xl font-bold text-xs hover:bg-rose-100 transition-colors cursor-pointer"
              >
                <LogOut size={13} />
                <span>Keluar dari Sesi</span>
              </button>
              <span className="text-[8px] text-center font-mono text-slate-400 uppercase">
                NOVELPEDIA ENGINE V3.5-RETRO
              </span>
            </div>

          </div>
        </div>
      )}

      {/* COMPACT NOTIFICATIONS ALERTS DRAWER */}
      {showNotifDrawer && (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm border-l border-slate-200 bg-white p-4 shadow-xl flex flex-col jrpg-box-anim animate-fade-in text-left">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3 shrink-0">
            <h3 className="text-sm font-black text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
              <Bell size={15} /> Pemberitahuan
            </h3>
            <button 
              onClick={() => setShowNotifDrawer(false)}
              className="text-slate-400 hover:text-slate-600 font-bold text-xs"
            >
              Tutup [X]
            </button>
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col gap-2">
            {notifications.map((notif) => (
              <div 
                key={notif.id}
                className={`p-3.5 border rounded-xl text-xs leading-relaxed transition-all ${
                  notif.read ? "border-slate-100 text-slate-500 bg-slate-50/50" : "border-indigo-100 text-slate-800 bg-indigo-50/15"
                }`}
              >
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={13} className="text-indigo-600 mt-0.5 shrink-0" />
                  <p className="font-semibold">{notif.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 mt-3 shrink-0">
            <button
              onClick={markAllRead}
              className="px-2 py-2 border border-slate-200 rounded-lg text-center text-xs font-bold text-indigo-600 hover:bg-slate-50 cursor-pointer"
            >
              Tandai Semua Dibaca
            </button>
            <button
              onClick={() => setNotifications([])}
              className="px-2 py-2 border border-slate-200 rounded-lg text-center text-xs font-bold text-rose-600 hover:bg-rose-50 cursor-pointer"
            >
              Bersihkan Semua
            </button>
          </div>
        </div>
      )}

    </header>
  );
}
