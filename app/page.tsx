"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import NovelBrowse from "@/components/NovelBrowse";
import NovelReader from "@/components/NovelReader";
import WriterDashboard from "@/components/WriterDashboard";
import AdminPanel from "@/components/AdminPanel";
import ProfileTab from "@/components/ProfileTab";
import AccountSettings from "@/components/AccountSettings";
import { auth, googleProvider, facebookProvider, signInWithPopup, signOut } from "@/lib/firebase";
import { Sparkles, Mail, Lock, User, Chrome, Facebook, AlertCircle, Home, BookOpen, Clock, Trash2, Flame, PenTool, Bell, Info, Crown, CheckSquare, Zap, Target, ShieldCheck, Coins, Cloud, Radar, Shield, ShieldAlert, ChevronLeft, ChevronRight, Twitter, Instagram, Github, Eye, Star } from "lucide-react";

interface Wallet {
  email: string;
  coins: number;
  revenueExp: number;
  isAdmin: boolean;
}

export default function Page() {
  // Primary client credential session (defaults to null for mandatory login)
  const [user, setUser] = useState<{ email: string; username: string } | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  
  // Navigation tabs - defaults to "beranda" Home setup as requested
  const [activeTab, setActiveTab] = useState("beranda");
  const [selectedNovel, setSelectedNovel] = useState<any | null>(null);
  const [appBooted, setAppBooted] = useState(false);

  // Reading History State
  const [readingHistory, setReadingHistory] = useState<any[]>([]);

  // Dynamic system-wide announcements
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [carouselIndex, setCarouselIndex] = useState(0);

  // Fallback news announcements for premium carousel design
  const fallbackNews = [
    {
      id: "news-1",
      title: "Peluncuran Program Akselerasi Penulis Premium VIP",
      content: "Ingin karya Anda dipromosikan langsung di halaman depan Novelpedia? Daftarkan ke program Akselerasi VIP dan nikmati skema pembagian pendapatan royalti otomatis sebesar 90% tanpa potongan tersembunyi.",
      type: "BARU",
      date: "23 Juni 2026"
    },
    {
      id: "news-2",
      title: "Sistem Sensor Plagiarisme Otomatis & Pemindaian Hak Cipta",
      content: "Tim pengembang Novelpedia telah mengintegrasikan mesin sensor plagiasi bertenaga AI. Sekarang setiap draf sub-bab novel Anda akan dipindai secara real-time terhadap penyalahgunaan hak cipta dan penyalinan liar.",
      type: "UPDATE",
      date: "22 Juni 2026"
    },
    {
      id: "news-3",
      title: "Kontrak Eksklusif Novelpedia & Pesta Hibah Sastra Merdeka 2026",
      content: "Kesempatan emas bagi seluruh kreator fiksi orisinal! Kirimkan novel terbaik Anda dari genre luar biasa ke tim kurator kami dan menangkan kontrak eksklusif senilai jutaan Rupiah tahun ini.",
      type: "BARU",
      date: "20 Juni 2026"
    }
  ];

  // Carousel auto-slide effect every 5 seconds
  useEffect(() => {
    if (activeTab !== "beranda") return;
    const interval = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeTab]);
  // Premium custom title request forms
  const [premiumTitleInput, setPremiumTitleInput] = useState("");
  const [buyPremiumLoading, setBuyPremiumLoading] = useState(false);

  // Append clicked novel to the reading history tracker
  const handleSelectNovel = (novel: any) => {
    setSelectedNovel(novel);
    if (!novel) return;

    try {
      const existingStr = localStorage.getItem("novelpedia_reading_history");
      let list = existingStr ? JSON.parse(existingStr) : [];
      // Remove previous duplicate entry
      list = list.filter((item: any) => item.id !== novel.id);
      // Prepend newest on top
      list.unshift({
        ...novel,
        readAt: new Date().toISOString()
      });
      // Limit to 15 items
      list = list.slice(0, 15);
      localStorage.setItem("novelpedia_reading_history", JSON.stringify(list));
      setReadingHistory(list);
    } catch (e) {
      console.warn("Gagal menyimpan riwayat membaca:", e);
    }
  };

  const handleClearHistory = () => {
    if (confirm("Apakah Anda yakin ingin menghapus seluruh log riwayat membaca Anda dari browser ini?")) {
      localStorage.setItem("novelpedia_reading_history", "[]");
      setReadingHistory([]);
    }
  };

  const loadHistoryLogs = () => {
    try {
      const existingStr = localStorage.getItem("novelpedia_reading_history");
      if (existingStr) {
        setReadingHistory(JSON.parse(existingStr));
      }
    } catch (e) {}
  };

  useEffect(() => {
    loadHistoryLogs();
    if (activeTab === "beranda") {
      fetch("/api/payment?action=get_announcements")
        .then(res => res.json())
        .then(data => {
          if (data.success && data.announcements) {
            setAnnouncements(data.announcements);
          }
        })
        .catch(err => console.warn("Failed loading home announcements:", err));
    }
  }, [activeTab]);

  // Authentication visual forms state
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [usernameInput, setUsernameInput] = useState("");
  const [authError, setAuthError] = useState("");

  // Social SSO Simulation loading state
  const [ssoLoading, setSsoLoading] = useState<string | null>(null);

  // Authoritative balance reader
  async function handleRefreshWallet() {
    if (!user) return;
    try {
      const res = await fetch(`/api/payment?action=get_balance&email=${encodeURIComponent(user.email)}`);
      const data = await res.json();
      if (data.success) {
        setWallet(data.wallet);
      }
    } catch (e) {
      console.warn("Wallet status load delay", e);
    }
  }

  // Handle active credentials login
  function handleLogin(email: string, username: string) {
    const session = { email, username };
    setUser(session);
    localStorage.setItem("novelpedia_user_session", JSON.stringify(session));
    setAuthError("");
    setSelectedNovel(null);
  }

  // Handle logout
  async function handleLogout() {
    try {
      await signOut(auth);
    } catch (e) {
      console.error("Firebase logout error", e);
    }
    setUser(null);
    setWallet(null);
    localStorage.removeItem("novelpedia_user_session");
    setSelectedNovel(null);
    setActiveTab("browse");
  }

  // Handle email registration or login
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    if (!emailInput || !passwordInput) {
      setAuthError("Email dan password harus diisi.");
      return;
    }

    if (authMode === "register") {
      if (!usernameInput) {
        setAuthError("Nama pengguna wajib diisi.");
        return;
      }
      // Register logic: Save account credentials in-memory database simulated using localStorage
      const registeredAccounts = JSON.parse(localStorage.getItem("novelpedia_fake_accounts") || "[]");
      const exists = registeredAccounts.some((acc: any) => acc.email.toLowerCase() === emailInput.toLowerCase());
      if (exists) {
        setAuthError("Email ini sudah digunakan. Silakan log-in.");
        return;
      }

      const newAccount = { email: emailInput, username: usernameInput, password: passwordInput };
      registeredAccounts.push(newAccount);
      localStorage.setItem("novelpedia_fake_accounts", JSON.stringify(registeredAccounts));
      
      // Auto-login
      handleLogin(emailInput, usernameInput);
    } else {
      // Login logic
      // Check default accounts or custom registered accounts
      const registeredAccounts = JSON.parse(localStorage.getItem("novelpedia_fake_accounts") || "[]");
      const matched = registeredAccounts.find(
        (acc: any) => acc.email.toLowerCase() === emailInput.toLowerCase() && acc.password === passwordInput
      );

      if (matched) {
        handleLogin(matched.email, matched.username);
      } else {
        setAuthError("Kredensial tidak cocok. Silakan daftar jika belum punya akun.");
      }
    }
  };

  // Use Real Firebase Auth for SSO
  const handleSocialSSO = async (platform: "Google" | "Facebook") => {
    setSsoLoading(platform);
    setAuthError("");
    try {
      const provider = platform === "Google" ? googleProvider : facebookProvider;
      const result = await signInWithPopup(auth, provider);
      const email = result.user.email;
      const username = result.user.displayName || (email ? email.split("@")[0] : `${platform}User`);
      if (email) {
        handleLogin(email, username);
      } else {
        setAuthError("Email tidak ditemukan dari provider SSO.");
      }
    } catch (error: any) {
      setAuthError(`Gagal masuk dengan ${platform}: ${error.message}`);
    } finally {
      setSsoLoading(null);
    }
  };

  // Check persistent session on mount
  useEffect(() => {
    const saved = localStorage.getItem("novelpedia_user_session");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.email) {
          setUser(parsed);
        }
      } catch (e) {
        console.warn("Failed parsing saved user session:", e);
      }
    }
    setAppBooted(true);
  }, []);

  // Fetch wallet for active user session
  useEffect(() => {
    if (user?.email) {
      handleRefreshWallet();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email]);

  if (!appBooted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent mx-auto"></div>
          <span className="text-xs font-medium text-slate-500 mt-3 block">Memuat Novelpedia...</span>
        </div>
      </div>
    );
  }

  // Wajib Login Chassis (Mandatory Authentication View)
  if (!user) {
    return (
      <div className="flex min-h-screen bg-slate-900 selection:bg-indigo-600 selection:text-white">
        
        {/* Dynamic platform loading overlay */}
        {ssoLoading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md animate-fade-in">
            <div className="bg-white p-6 rounded-2xl shadow-2xl flex flex-col items-center max-w-xs text-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent mb-4"></div>
              <h4 className="text-sm font-bold text-slate-900">Menghubungkan {ssoLoading}...</h4>
              <p className="text-xs text-slate-500 mt-1">Otentikasi aman via protokol SSL Novelpedia Gateway.</p>
            </div>
          </div>
        )}

        {/* Left Side - Image/Brand (Hidden on Mobile) */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-slate-950 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=1200" 
              className="w-full h-full object-cover opacity-40 mix-blend-overlay"
              alt="Background" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-indigo-950/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-slate-900/90" />
          </div>
          
          <div className="relative z-10 w-full h-full flex flex-col justify-end p-16">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center mb-6 p-2">
               <img src="https://files.catbox.moe/vbu1md.png" className="w-full h-full object-contain" alt="Logo" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight mb-4">
              Jelajahi Dunia<br/><span className="text-indigo-400">Tanpa Batas.</span>
            </h1>
            <p className="text-slate-300 text-lg max-w-md font-medium leading-relaxed">
              Portal penerbitan novel fiksi orisinal bertenaga AI Editor & Sistem Koin Pencairan Author Indie.
            </p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative bg-white overflow-hidden">
          
          {/* Subtle Aesthetic Background Patterns */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-indigo-50 blur-3xl opacity-60 pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-blue-50 blur-3xl opacity-60 pointer-events-none" />

          {/* Mobile Logo Only */}
          <div className="absolute top-8 left-8 lg:hidden flex items-center gap-3 z-10">
             <img src="https://files.catbox.moe/vbu1md.png" className="w-8 h-8 object-contain rounded drop-shadow-sm" alt="Logo" />
             <span className="text-slate-900 font-black tracking-wider uppercase text-sm">Novelpedia</span>
          </div>

          <div className="w-full max-w-[400px] relative z-10 jrpg-box-anim">
            <div className="mb-10 text-center lg:text-left mt-8 lg:mt-0">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
                {authMode === "login" ? "Selamat Datang" : "Mulai Perjalanan"}
              </h2>
              <p className="text-slate-500 text-sm">
                {authMode === "login" ? "Masuk untuk melanjutkan membaca karya favoritmu." : "Buat akun baru dan nikmati ribuan novel gratis."}
              </p>
            </div>

            {/* Tab mode selection form */}
            <div className="flex bg-slate-100/80 p-1.5 rounded-xl mb-8">
              <button
                onClick={() => { setAuthMode("login"); setAuthError(""); }}
                className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
                  authMode === "login" ? "bg-white text-indigo-600 shadow-sm border border-slate-200/50" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Masuk
              </button>
              <button
                onClick={() => { setAuthMode("register"); setAuthError(""); }}
                className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
                  authMode === "register" ? "bg-white text-indigo-600 shadow-sm border border-slate-200/50" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Daftar Baru
              </button>
            </div>

            {/* Form fields section */}
            <form onSubmit={handleAuthSubmit} className="flex flex-col gap-5">
              {authError && (
                <div className="bg-rose-50 text-rose-600 text-xs font-medium p-3.5 rounded-xl border border-rose-100 flex items-center gap-2.5">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {authMode === "register" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5" htmlFor="reg-user">Nama Pengguna</label>
                  <div className="relative group">
                    <User size={16} className="absolute left-3.5 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                      id="reg-user"
                      type="text"
                      required
                      placeholder="Contoh: SangPujangga"
                      className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5" htmlFor="auth-email">Alamat Email</label>
                <div className="relative group">
                  <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <input
                    id="auth-email"
                    type="email"
                    required
                    placeholder="anda@email.com"
                    className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5" htmlFor="auth-pass">Kata Sandi</label>
                <div className="relative group">
                  <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <input
                    id="auth-pass"
                    type="password"
                    required
                    placeholder="••••••••"
                    className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3.5 bg-slate-900 hover:bg-indigo-600 text-white font-bold rounded-xl text-sm transition-all shadow-lg hover:shadow-indigo-600/25 active:scale-[0.98]"
              >
                {authMode === "login" ? "Masuk Ke Akun" : "Buat Akun Sekarang"}
              </button>

              {/* Social login divider */}
              <div className="relative flex py-6 items-center">
                <div className="flex-grow border-t border-slate-100"></div>
                <span className="flex-shrink mx-4 text-[11px] text-slate-400 uppercase font-black tracking-wider">Atau Lanjutkan Dengan</span>
                <div className="flex-grow border-t border-slate-100"></div>
              </div>
            </form>

            {/* Google & Facebook buttons - Always visible for both login and register */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              <button
                type="button"
                onClick={() => handleSocialSSO("Google")}
                className="flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 active:scale-[0.98] transition-all shadow-sm"
              >
                <Chrome size={18} className="text-[#ea4335]" />
                <span>Google</span>
              </button>
              <button
                type="button"
                onClick={() => handleSocialSSO("Facebook")}
                className="flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 active:scale-[0.98] transition-all shadow-sm"
              >
                <Facebook size={18} className="text-[#1877f2]" />
                <span>Facebook</span>
              </button>
            </div>

          </div>
        </div>

      </div>
    );
  }

  // Active Authenticated Application Dashboard Interface
  return (
    <div className="flex min-h-screen flex-col bg-[#F1F5F9] font-sans selection:bg-indigo-600 selection:text-white pb-28">
      
      {/* GLOBAL HUD SYSTEM HEADER WITH HAMBURGER */}
      <Navbar
        user={user}
        wallet={wallet}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRefreshWallet={handleRefreshWallet}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />

      {/* VIEWPORT SELECTOR */}
      <main className="flex-1">
        {selectedNovel ? (
          <NovelReader
            user={user}
            novel={selectedNovel}
            wallet={wallet}
            onRefreshWallet={handleRefreshWallet}
            onBack={() => {
              setSelectedNovel(null);
              handleRefreshWallet();
            }}
          />
        ) : (
          <div className="jrpg-box-anim animate-fade-in">
            
            {/* 1. DYNAMIC HOME / BERANDA VIEW */}
            {activeTab === "beranda" && (
              <div className="mx-auto max-w-7xl px-4 md:px-10 py-6 text-left">
                
                {/* WELCOME HERO spotlight card */}
                <section className="relative overflow-hidden rounded-3xl mb-12 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-8 md:p-12 shadow-2xl shadow-indigo-950/15 flex flex-col lg:flex-row justify-between items-center gap-8">
                  {/* Glowing floating backdrop decorative accents */}
                  <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
                  <div className="absolute -bottom-20 right-10 w-80 h-80 bg-pink-500/5 rounded-full blur-3xl pointer-events-none"></div>
                  
                  <div className="relative z-10 max-w-2xl flex-1">
                    <div className="inline-flex items-center gap-1.5 text-[10px] font-black text-amber-400 bg-amber-500/10 border border-amber-400/30 px-3.5 py-1.5 rounded-full mb-6 uppercase tracking-widest select-none shadow-xs">
                      <Sparkles size={11} className="animate-spin text-amber-400" style={{ animationDuration: '6s' }} />
                      <span>Sorotan Utama Redaksi Novelpedia</span>
                    </div>
                    
                    <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-4 uppercase leading-tight drop-shadow-md">
                      Mulai Petualangan Membaca Fiksi Orisinal Indie
                    </h1>
                    <p className="text-sm md:text-lg text-[#94A3B8] font-light max-w-xl leading-relaxed mb-8">
                      Novelpedia menyediakan wadah khusus penerbitan fiksi bebas dengan sirkulasi royalti transparan, draf proofreader berbantuan AI, serta perlindungan orisinalitas otomatis.
                    </p>
                    
                    <div className="flex flex-wrap gap-4">
                      {/* White border-radius 50px line button */}
                      <button
                        onClick={() => { setActiveTab("browse"); }}
                        className="px-6 py-3 bg-white/10 hover:bg-white/15 border border-white/20 text-white hover:text-indigo-200 font-semibold text-sm rounded-full transition-all duration-250 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center gap-2 shadow-xs"
                      >
                        <BookOpen size={14} strokeWidth={2.5} />
                        <span>Jelajahi Katalog</span>
                      </button>
                      {/* Gold gradient button */}
                      <button
                        onClick={() => { setActiveTab("write"); }}
                        className="px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-450 text-slate-950 font-black text-sm rounded-full transition-all duration-250 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center gap-2 shadow-sm"
                      >
                        <PenTool size={14} strokeWidth={2.5} />
                        <span>Terbitkan Novel Saya</span>
                      </button>
                    </div>
                  </div>

                  {/* PREMIUM CUSTOM SVG DECORATIVE VECTOR GRAPHIC */}
                  <div className="hidden lg:flex flex-1 items-center justify-center relative min-h-[300px] animate-fade-in pointer-events-none select-none">
                    <div className="relative w-80 h-80">
                      <div className="absolute inset-x-0 bottom-0 top-1/4 bg-indigo-500/5 rounded-full blur-3xl animate-pulse"></div>
                      
                      {/* Floating book cover 1 */}
                      <div className="absolute left-6 top-6 w-48 h-64 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl shadow-xl transform rotate-[-8deg] hover:rotate-[0deg] transition-all duration-500 flex flex-col justify-between p-5">
                        <div className="flex justify-between items-center">
                          <Crown size={18} className="text-amber-400" />
                          <div className="w-12 h-2 bg-white/20 rounded-full"></div>
                        </div>
                        <div className="space-y-2">
                          <div className="w-full h-3 bg-white/25 rounded"></div>
                          <div className="w-4/5 h-2.5 bg-white/15 rounded"></div>
                          <div className="w-2/3 h-2 bg-white/15 rounded"></div>
                        </div>
                        <div className="flex justify-between items-center text-[9px] font-mono font-bold text-amber-300 tracking-wider">
                          <span>VIP ONLY</span>
                          <span>★ 4.9</span>
                        </div>
                      </div>

                      {/* Floating book cover 2 */}
                      <div className="absolute left-20 top-20 w-48 h-64 bg-gradient-to-br from-indigo-950/40 to-indigo-900/60 backdrop-blur-sm border border-white/15 rounded-2xl shadow-2xl transform rotate-[6deg] hover:rotate-[0deg] transition-all duration-500 flex flex-col justify-between p-5">
                        <div className="flex justify-between items-center">
                          <Sparkles size={16} className="text-amber-300 animate-pulse" />
                          <span className="text-[8px] font-mono text-slate-400 tracking-widest">NOVELPEDIA</span>
                        </div>
                        <div className="space-y-2">
                          <div className="w-full h-1 bg-white/10 rounded"></div>
                          <div className="w-full h-1 bg-white/10 rounded"></div>
                          <div className="w-full h-1 bg-white/10 rounded"></div>
                          <div className="w-3/4 h-1 bg-white/10 rounded"></div>
                        </div>
                        <div className="p-2 py-1.5 bg-indigo-650/40 rounded-lg text-center text-[9px] font-extrabold text-white tracking-widest border border-indigo-500/20">
                          90% PAYOUT
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* BERITA & PENGUMUMAN CAROUSEL */}
                <section className="mb-12">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-black tracking-tight text-[#0F172A] uppercase">Berita & Pengumuman Terbaru</h2>
                      <p className="text-sm text-[#475569] font-light mt-1">Simak pembaruan sistem dan rilis sirkuit fitur Novelpedia secara aktual.</p>
                    </div>
                    <button 
                      onClick={() => {
                        alert("Seluruh info rilis sistem Novelpedia disiarkan di bawah ini secara real-time.");
                      }}
                      className="px-4 py-2 text-xs font-black text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded-full transition-all cursor-pointer flex items-center gap-1 shadow-xs border border-indigo-100/30"
                    >
                      <span>Lihat Semua</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>

                  {/* Carousel Container */}
                  <div className="relative group">
                    <div className="overflow-hidden rounded-2xl bg-white border border-slate-200/50 shadow-sm min-h-[160px] flex items-center">
                      {fallbackNews.map((news, idx) => (
                        <div 
                          key={news.id}
                          className={`p-6 md:p-8 w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all duration-300 ease-out ${
                            carouselIndex === idx ? "block animate-fade-in" : "hidden"
                          }`}
                        >
                          <div className="flex-1 max-w-3xl text-left">
                            <span className={`inline-flex items-center gap-1 text-[10px] uppercase font-black px-3 py-1 rounded-full mb-3 shadow-xs border ${
                              news.type === "BARU" 
                                ? "bg-amber-100/50 border-amber-200 text-amber-700" 
                                : "bg-indigo-50 border-indigo-100 text-indigo-700"
                            }`}>
                              {news.type}
                            </span>
                            <h3 className="text-base md:text-lg font-black text-[#1E293B] hover:text-indigo-650 transition-colors">{news.title}</h3>
                            <p className="text-xs md:text-sm text-[#64748B] mt-2 leading-relaxed font-light">{news.content}</p>
                          </div>
                          
                          <div className="text-right shrink-0 flex md:flex-col items-center md:items-end justify-between w-full md:w-auto border-t md:border-t-0 border-slate-100/80 pt-3 md:pt-0 mt-1 md:mt-0">
                            <span className="text-xs font-mono text-[#94A3B8]">{news.date}</span>
                            <button 
                              onClick={() => alert(`Detail Berita:\n\n[${news.type}] ${news.title}\n\nWaktu rilis: ${news.date}\n\n${news.content}`)}
                              className="md:mt-2 text-xs font-black text-indigo-600 hover:underline cursor-pointer"
                            >
                              Baca Selengkapnya
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Manual Navigation Arrows */}
                    <div className="absolute top-1/2 -translate-y-1/2 -left-4 sm:-left-5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => setCarouselIndex((prev) => (prev - 1 + 3) % 3)}
                        className="w-10 h-10 rounded-full bg-white/95 border border-slate-200 shadow-md flex items-center justify-center text-slate-700 hover:text-indigo-600 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                      >
                        <ChevronLeft size={18} strokeWidth={2.5} />
                      </button>
                    </div>
                    <div className="absolute top-1/2 -translate-y-1/2 -right-4 sm:-right-5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => setCarouselIndex((prev) => (prev + 1) % 3)}
                        className="w-10 h-10 rounded-full bg-white/95 border border-slate-200 shadow-md flex items-center justify-center text-slate-700 hover:text-indigo-600 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                      >
                        <ChevronRight size={18} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>

                  {/* Dots Indicator */}
                  <div className="flex justify-center items-center gap-2 mt-4">
                    {[0, 1, 2].map((idx) => (
                      <button 
                        key={idx}
                        onClick={() => setCarouselIndex(idx)}
                        className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                          carouselIndex === idx ? "w-6 bg-indigo-600" : "w-2 bg-slate-200 hover:bg-slate-300"
                        }`}
                        aria-label={`Lihat slaid berita ${idx + 1}`}
                      />
                    ))}
                  </div>
                </section>

                {/* METRIK UTAMA 4 KOTAK STATISTIK */}
                <section className="mb-12">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Stat 1: Proteksi */}
                    <div className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:-translate-y-1 hover:scale-[1.02] flex flex-col items-center sm:items-start text-center sm:text-left transition-all duration-250 ease-out border border-white">
                      <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-4 shadow-xs border border-emerald-100/50">
                        <ShieldCheck size={24} strokeWidth={2} />
                      </div>
                      <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">Metrik Proteksi</span>
                      <p className="text-2xl font-black text-[#0F172A] mt-1">100% Anti Plagiat</p>
                      <p className="text-xs text-[#475569] mt-1 font-light">Pemindaian orisinalitas ketat</p>
                    </div>

                    {/* Stat 2: Royalti */}
                    <div className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:-translate-y-1 hover:scale-[1.02] flex flex-col items-center sm:items-start text-center sm:text-left transition-all duration-250 ease-out border border-white">
                      <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 mb-4 shadow-xs border border-amber-100/50">
                        <Coins size={24} strokeWidth={2} />
                      </div>
                      <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">Royalti Author</span>
                      <p className="text-2xl font-black text-[#0F172A] mt-1">90% Pembagian</p>
                      <p className="text-xs text-[#475569] mt-1 font-light">Pendapatan bersih sirkulasi koin</p>
                    </div>

                    {/* Stat 3: VIP */}
                    <div className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:-translate-y-1 hover:scale-[1.02] flex flex-col items-center sm:items-start text-center sm:text-left transition-all duration-250 ease-out border border-white">
                      <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-4 shadow-xs border border-indigo-100/50">
                        <Crown size={24} strokeWidth={2} />
                      </div>
                      <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">Keanggotaan VIP</span>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-2xl font-black text-[#0F172A]">VIP Premium</p>
                        <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[9px] h-5 px-2.5 rounded-full border border-emerald-100 font-extrabold select-none shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span>Aktif & Sinkron</span>
                        </div>
                      </div>
                      <p className="text-xs text-[#475569] mt-1 font-light">Dukungan status pembaca terdaftar</p>
                    </div>

                    {/* Stat 4: Cloud Engine */}
                    <div className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:-translate-y-1 hover:scale-[1.02] flex flex-col items-center sm:items-start text-center sm:text-left transition-all duration-250 ease-out border border-white">
                      <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-4 shadow-xs border border-blue-100/50">
                        <Cloud size={24} strokeWidth={2} />
                      </div>
                      <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">Infrastruktur</span>
                      <p className="text-2xl font-black text-[#0F172A] mt-1">Cloud Engine</p>
                      <p className="text-xs text-[#475569] mt-1 font-light">Status jaringan server stabil</p>
                    </div>
                  </div>
                </section>

                {/* FITUR PENULISAN & SENSOR (2 KOLOM PARALEL) */}
                <section className="mb-12">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Feature Card: Proofread AI */}
                    <div className="bg-gradient-to-br from-slate-50 via-slate-50 to-indigo-50/20 p-8 rounded-2xl border border-slate-200/60 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between text-left transition-all hover:shadow-[0_10px_30px_rgba(79,70,229,0.05)]">
                      <div>
                        <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-6 border border-indigo-100/50">
                          <Sparkles size={22} strokeWidth={2} />
                        </div>
                        <h3 className="text-lg font-black text-[#1E293B] mb-2 uppercase tracking-wide">Dukungan Penulisan Bahasa Sastra Halus</h3>
                        <p className="text-sm text-[#475569] leading-relaxed font-light mb-8">
                          Author Novelpedia dapat menggunakan asisten pintar AI kami untuk meresolusi diksi sastra terbaik, merapikan struktur ejaan, serta mendapatkan saran majas kiasan tanpa merubah substansi penulisan cerita orisinal.
                        </p>
                      </div>
                      <button 
                        onClick={() => setActiveTab("write")}
                        className="py-2.5 px-6 self-start text-xs font-bold text-indigo-600 hover:text-white border border-indigo-550 hover:bg-indigo-650 rounded-full transition-all duration-250 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer shadow-xs"
                      >
                        Coba Sekarang
                      </button>
                    </div>

                    {/* Right Feature Card: Sensor Otomatis */}
                    <div className="bg-gradient-to-br from-slate-50 via-slate-50 to-rose-50/20 p-8 rounded-2xl border border-slate-200/60 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between text-left transition-all hover:shadow-[0_10px_30px_rgba(244,63,94,0.05)]">
                      <div>
                        <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600 mb-6 border border-rose-100/50">
                          <Radar size={22} strokeWidth={2} />
                        </div>
                        <h3 className="text-lg font-black text-[#1E293B] mb-2 uppercase tracking-wide">Saringan Plagiarisme Real-Time</h3>
                        <p className="text-sm text-[#475569] leading-relaxed font-light mb-8">
                          Setiap publikasi sub-bab novel di Novelpedia dipindai secara berlapis menggunakan kecerdasan buatan terhadap kemiripan konten internet. Hal ini menjamin perlindungan lisensi hak cipta karya seluruh penulis orisinal.
                        </p>
                      </div>
                      <button 
                        onClick={() => alert("Sistem Keamanan Orisinalitas & Perlindungan Lisensi Hak Cipta Novelpedia berjalan secara aktif.")}
                        className="py-2.5 px-6 self-start text-xs font-bold text-slate-500 hover:text-slate-800 border border-slate-300 hover:bg-slate-100 rounded-full transition-all duration-250 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer shadow-xs"
                      >
                        Pelajari
                      </button>
                    </div>
                  </div>
                </section>

                {/* PREMIUM SUBSCRIPTION CONSOLE DECK */}
                <section className="mb-12">
                  <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800 text-white relative overflow-hidden shadow-2xl flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="absolute top-0 right-0 p-4 opacity-5 select-none text-9xl font-black font-sans -mr-16 -mt-16 pointer-events-none">
                      VIP
                    </div>
                    
                    <div className="flex-1 text-left relative z-10">
                      <div className="flex flex-wrap items-center gap-3 border-b border-slate-900 pb-4 mb-4">
                        <span className="text-[10px] bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black px-3.5 py-1 rounded-full uppercase select-none tracking-widest flex items-center gap-1 shadow-sm">
                          <Crown size={12} className="inline-block" /> PREMIUM MEMBER
                        </span>
                        <span className="text-sm font-mono text-amber-300 font-bold">Hanya Rp 5.000 / Bulan</span>
                      </div>
                      
                      <p className="text-sm text-slate-300 leading-relaxed font-light mb-4">
                        Dukung perkembangan fiksi orisinal indie! Dapatkan verifikasi unik berlogo ceklis biru eksklusif di profil Anda, request gelar pena custom sesuka hati, serta diskon tebus bab premium berbayar sebesar 50%!
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-light text-slate-400">
                        <div className="space-y-1">
                          <p className="text-[10px] font-extrabold text-amber-400 uppercase tracking-widest">UNTUK PEMBACA</p>
                          <ul className="list-disc pl-4 space-y-0.5 leading-relaxed">
                            <li>Lencana Verifikasi <strong>Ceklis Biru</strong> di profil.</li>
                            <li>Bebas request kustom <strong>Gelar Pena Khusus</strong>.</li>
                            <li><strong>Diskon 50%</strong> untuk akses bab premium berbayar.</li>
                          </ul>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest">UNTUK PENULIS AUTHOR</p>
                          <ul className="list-disc pl-4 space-y-0.5 leading-relaxed">
                            <li>Promosikan draf kustom Anda ke jajaran <strong>Top Trending</strong>.</li>
                            <li>Akses prioritas rilis draf bypass karantina sensor.</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <form 
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (!user) {
                          alert("Silakan login terlebih dahulu untuk berlangganan premium VIP.");
                          return;
                        }
                        if (buyPremiumLoading) return;
                        
                        setBuyPremiumLoading(true);
                        try {
                          const res = await fetch("/api/payment", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              action: "buy_premium",
                              email: user.email,
                              customTitle: premiumTitleInput.trim() || undefined
                            })
                          });
                          const data = await res.json();
                          if (data.success) {
                            alert(`SUKSES BERLANGGANAN! Selamat, Anda kini adalah anggota Premium VIP Novelpedia.`);
                            setPremiumTitleInput("");
                            handleRefreshWallet();
                            window.location.reload();
                          } else {
                            alert(data.error || "Gagal mengaktifkan premium.");
                          }
                        } catch (err) {
                          alert("Koneksi bermasalah.");
                        } finally {
                          setBuyPremiumLoading(false);
                        }
                      }}
                      className="w-full md:w-80 bg-slate-900/80 backdrop-blur-md p-6 rounded-xl border border-white/5 relative z-10 flex flex-col justify-between shadow-lg"
                    >
                      <div className="mb-4 text-left">
                        <label className="block text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1.5" htmlFor="custom-pembaca-title-premium-vip">Gelar Kustom (Opsional)</label>
                        <input
                          id="custom-pembaca-title-premium-vip"
                          type="text"
                          placeholder="Sastrawan Agung, Ksatria Fiksi..."
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white font-medium outline-none focus:ring-1 focus:ring-amber-400 focus:border-amber-400"
                          value={premiumTitleInput}
                          onChange={(e) => setPremiumTitleInput(e.target.value)}
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={buyPremiumLoading || wallet?.isPremium}
                        className={`w-full py-3 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-350 hover:to-yellow-450 hover:shadow-lg hover:shadow-amber-450/35 text-slate-950 font-black rounded-full text-xs transition-all duration-250 active:translate-y-px cursor-pointer flex items-center justify-center gap-1 ${
                          wallet?.isPremium ? "opacity-75 pointer-events-none" : ""
                        }`}
                      >
                        {wallet?.isPremium ? (
                          <><Crown className="inline-block" size={13} /> VIP PREMIUM AKTIF</>
                        ) : buyPremiumLoading ? (
                          <>Memproses Aktivasi...</>
                        ) : (
                          <>BELI VIP (Rp 5.000 / Bulan)</>
                        )}
                      </button>
                    </form>
                  </div>
                </section>

              </div>
            )}

            {/* 2. CATALOG / ALL NOVEL TAB DIRECTORY */}
            {activeTab === "browse" && (
              <NovelBrowse 
                user={user} 
                onSelectNovel={handleSelectNovel} 
              />
            )}
            
            {/* 3. READING HISTORY LIST COMPONENT */}
            {activeTab === "history" && (
              <div className="mx-auto max-w-4xl px-4 py-8 text-left">
                
                <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-6 gap-3">
                  <div>
                    <h3 className="text-md font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
                      <Clock size={18} className="text-indigo-600" /> Riwayat Konten Berhasil Dibaca (History)
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">Daftar judul novel orisinal yang Anda kunjungi di cache browser ini.</p>
                  </div>

                  {readingHistory.length > 0 && (
                    <button
                      onClick={handleClearHistory}
                      className="px-3 py-1.5 border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 size={13} />
                      <span>Bersihkan Log</span>
                    </button>
                  )}
                </div>

                {readingHistory.length === 0 ? (
                  <div className="text-center py-16 border border-dashed border-slate-200 rounded-2xl bg-white p-6">
                    <Clock size={36} className="mx-auto text-slate-300 mb-3 animate-pulse" />
                    <p className="text-xs text-slate-550 font-bold uppercase tracking-wide">Belum Ada Riwayat Membaca Terdeteksi</p>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">Masuklah ke menu All Novel untuk menjelajah dan mulai membaca karya perdana Anda!</p>
                    <button
                      onClick={() => setActiveTab("browse")}
                      className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg cursor-pointer shadow-xs transition-colors"
                    >
                      Buka Katalog All Novel
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3 md:gap-5">
                    {readingHistory.map((item, index) => {
                      const isOwner = user && item.author?.toLowerCase() === user.email.toLowerCase();
                      const isAdmin = user && (user.email.toLowerCase() === "irsyalfaiz97@gmail.com" || user.email.toLowerCase() === "yareyyaa0529@gmail.com");
                      
                      return (
                        <div
                          key={`${item.id}-${index}`}
                          onClick={() => handleSelectNovel(item)}
                          className={`group relative aspect-[3/4] rounded-xl bg-slate-900 border overflow-hidden shadow-sm cursor-pointer hover:-translate-y-1.5 transition-all duration-300 hover:shadow-xl ${
                            item.isFlagged && !item.isBypassed
                              ? "border-rose-400 ring-2 ring-rose-300"
                              : "border-slate-200/20"
                          }`}
                        >
                          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20 pointer-events-none" />

                          {item.coverUrl ? (
                            <img 
                              src={item.coverUrl} 
                              alt={item.title} 
                              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <img 
                              src={`https://picsum.photos/seed/${encodeURIComponent(item.title)}/300/400`} 
                              alt={item.title} 
                              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                              referrerPolicy="no-referrer"
                            />
                          )}
                          
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent z-10 opacity-90 group-hover:opacity-100 transition-opacity" />
                          
                          <div className="absolute top-2 left-2 right-2 z-20 flex justify-between items-start">
                            <span className="backdrop-blur-md bg-black/50 border border-white/10 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider shadow-sm truncate max-w-[70px]">
                              {item.genres && item.genres.length > 0 ? item.genres[0] : item.genre}
                            </span>
                            
                            <span className="backdrop-blur-md bg-indigo-600/80 border border-indigo-400/30 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shadow-md">
                              HISTORI
                            </span>
                          </div>

                          <div className="absolute bottom-0 left-0 right-0 p-2.5 z-20 flex flex-col justify-end">
                            {item.isFlagged && !item.isBypassed && (
                              <div className="mb-1 bg-rose-600/90 backdrop-blur-md text-white text-[8px] font-black p-1 rounded-md flex items-center gap-1 shadow-lg border border-rose-400">
                                <ShieldAlert size={10} className="shrink-0" />
                                <span className="truncate">{isOwner || isAdmin ? "KARANTINA" : "BLOKIR"}</span>
                              </div>
                            )}

                            <h3 className="text-white font-extrabold text-[11px] leading-tight mb-1 line-clamp-2 shadow-black drop-shadow-lg group-hover:text-amber-100 transition-colors">
                              {item.title}
                            </h3>
                            
                            <div className="flex items-center gap-1 text-[8px] text-slate-300 font-medium mb-1.5 drop-shadow-md">
                              <div className="flex items-center gap-1 truncate">
                                <User size={8} className="text-indigo-300 shrink-0" /> 
                                <span className="truncate">@{item.authorUsername}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between text-[8px] font-black pt-1.5 border-t border-white/20">
                              <span className="text-slate-200 flex items-center gap-0.5"><BookOpen size={8} className="text-indigo-400"/> {item.chaptersCount}</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-slate-200 flex items-center gap-0.5"><Eye size={8} className="text-emerald-400"/> {Math.floor((item.rating || 5.0) * 1324 + item.chaptersCount * 231).toLocaleString('id-ID')}</span>
                                <span className="text-amber-400 flex items-center gap-0.5"><Star size={8} className="fill-amber-400"/> {item.rating ? item.rating.toFixed(1) : "5.0"}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-1 mt-1.5 pt-1.5 border-t border-white/10">
                              <span className="text-white/70 text-[8px] font-medium flex items-center gap-1 w-full justify-center">
                                <Clock size={8} />
                                Jam: {new Date(item.readAt).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

              </div>
            )}
            
            {activeTab === "write" && (
              <WriterDashboard 
                user={user}
                onRefreshWallet={handleRefreshWallet}
              />
            )}
            
            {activeTab === "admin" && (
              <AdminPanel 
                user={user}
                onRefreshWallet={handleRefreshWallet}
              />
            )}
            
            {activeTab === "profile" && (
              <ProfileTab 
                user={user}
                wallet={wallet}
                onRefreshWallet={handleRefreshWallet}
                onLogin={handleLogin}
                onLogout={handleLogout}
                setActiveTab={setActiveTab}
              />
            )}

            {activeTab === "settings" && (
              <AccountSettings 
                user={user}
                wallet={wallet}
                onRefreshWallet={handleRefreshWallet}
                onLogout={handleLogout}
              />
            )}
          </div>
        )}
      </main>

      {/* SLATE MODERN FOOTER COMPONENT */}
      <footer className="mt-16 border-t border-slate-200/50 py-8 px-10 max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6 text-[#94A3B8] text-xs">
        <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-1">
          <p className="font-extrabold uppercase text-[#0F172A] tracking-wider text-[11px] select-none">NOVELPEDIA</p>
          <p className="text-[10px] font-light max-w-sm text-[#475569]">Semesta Karyasastra Indie & Portal Koin Royalti Penulisan Sastra Digital Orisinal.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <a href="#" onClick={(e) => { e.preventDefault(); alert("Media Sosial Twitter/X Novelpedia"); }} className="w-8 h-8 rounded-full bg-white border border-slate-200 shadow-xs flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:scale-110 active:scale-95 transition-all" title="Twitter">
            <Twitter size={14} strokeWidth={2} />
          </a>
          <a href="#" onClick={(e) => { e.preventDefault(); alert("Media Sosial Instagram Novelpedia"); }} className="w-8 h-8 rounded-full bg-white border border-slate-200 shadow-xs flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:scale-110 active:scale-95 transition-all" title="Instagram">
            <Instagram size={14} strokeWidth={2} />
          </a>
          <a href="#" onClick={(e) => { e.preventDefault(); alert("Repositori GitHub Novelpedia"); }} className="w-8 h-8 rounded-full bg-white border border-slate-200 shadow-xs flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:scale-110 active:scale-95 transition-all" title="GitHub">
            <Github size={14} strokeWidth={2} />
          </a>
        </div>
        
        <div className="text-center sm:text-right text-[10px] font-mono tracking-widest uppercase text-slate-400">
          © {new Date().getFullYear()} NOVELPEDIA ● ALL RIGHTS RESERVED
        </div>
      </footer>

      {/* SOLID / FLOATING INTERACTIVE BOTTOM NAVIGATION MENU DECK */}
      <div className="fixed bottom-0 left-0 right-0 z-45 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-[0_-4px_25px_rgba(0,0,0,0.05)] pb-safe max-w-[430px] mx-auto rounded-t-3xl border-x">
        <div className="mx-auto max-w-lg px-6 py-2 flex justify-between items-center h-14">
          
          {/* BERANDA TAB BUTTON */}
          <button
            onClick={() => { setSelectedNovel(null); setActiveTab("beranda"); }}
            className={`flex flex-col items-center justify-center gap-1 transition-all outline-none cursor-pointer w-16 ${
              activeTab === "beranda" ? "text-indigo-600 scale-105 font-bold" : "text-slate-450 hover:text-slate-600"
            }`}
          >
            <Home size={18} className={activeTab === "beranda" ? "text-indigo-600" : "text-slate-400"} />
            <span className="text-[9px] font-bold uppercase tracking-wider block mt-0.5">Beranda</span>
          </button>

          {/* ALL NOVEL CATALOG BUTTON */}
          <button
            onClick={() => { setSelectedNovel(null); setActiveTab("browse"); }}
            className={`flex flex-col items-center justify-center gap-1 transition-all outline-none cursor-pointer w-16 ${
              activeTab === "browse" ? "text-indigo-600 scale-105 font-bold" : "text-slate-450 hover:text-slate-600"
            }`}
          >
            <BookOpen size={18} className={activeTab === "browse" ? "text-indigo-600" : "text-slate-400"} />
            <span className="text-[9px] font-bold uppercase tracking-wider block mt-0.5">All Novel</span>
          </button>

          {/* HISTORY READ TRAIL BUTTON */}
          <button
            onClick={() => { setSelectedNovel(null); setActiveTab("history"); }}
            className={`flex flex-col items-center justify-center gap-1 transition-all outline-none cursor-pointer w-16 ${
              activeTab === "history" ? "text-indigo-600 scale-105 font-bold" : "text-slate-450 hover:text-slate-600"
            }`}
          >
            <Clock size={18} className={activeTab === "history" ? "text-indigo-600 animate-pulse" : "text-slate-400"} />
            <span className="text-[9px] font-bold uppercase tracking-wider block mt-0.5">History</span>
          </button>

          {/* PROFILE CARD DIRECT BUTTON */}
          <button
            onClick={() => { setSelectedNovel(null); setActiveTab("profile"); }}
            className={`flex flex-col items-center justify-center gap-1 transition-all outline-none cursor-pointer w-16 ${
              activeTab === "profile" ? "text-indigo-600 scale-105 font-bold" : "text-slate-450 hover:text-slate-600"
            }`}
          >
            <User size={18} className={activeTab === "profile" ? "text-indigo-600" : "text-slate-400"} />
            <span className="text-[9px] font-bold uppercase tracking-wider block mt-0.5">Profil</span>
          </button>
          
        </div>
      </div>

    </div>
  );
}
