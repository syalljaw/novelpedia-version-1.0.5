import React, { useState, useEffect } from "react";
import { ChevronLeft, ArrowRight, Settings, Sparkles, Volume2, Star, Send, Coins, Eye, BookOpen, VolumeX, Info, Lock } from "lucide-react";
import { SUPPORTED_LANGUAGES } from "@/lib/languages";

interface Novel {
  id: string;
  title: string;
  synopsis: string;
  author: string;
  authorUsername: string;
  genre: string;
  genres?: string[];
  status?: 'ongoing' | 'hiatus' | 'tamat';
  updateDays?: string[];
  coverUrl?: string;
  rating: number;
  bannerColor: string;
  priceCoins: number;
}

interface Chapter {
  id: string;
  novelId: string;
  title: string;
  content: string;
  order: number;
  isLocked: boolean;
}

interface Comment {
  id: string;
  username: string;
  email?: string;
  content: string;
  likes?: number;
  authorReply?: string;
  createdAt: string;
}

interface NovelReaderProps {
  user: { email: string; username: string };
  novel: Novel;
  wallet: { coins: number; isPremium?: boolean } | null;
  onRefreshWallet: () => void;
  onBack: () => void;
}

type ReaderTheme = "slate" | "amber" | "clean";

export default function NovelReader({
  user,
  novel,
  wallet,
  onRefreshWallet,
  onBack,
}: NovelReaderProps) {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [activeChapter, setActiveChapter] = useState<Chapter | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  
  // Display theme presets
  const [theme, setTheme] = useState<ReaderTheme>("clean");
  const [fontSize, setFontSize] = useState<"sm" | "base" | "lg" | "xl">("base");
  
  // AI translations state
  const [translationLang, setTranslationLang] = useState("English");
  const [translatedText, setTranslatedText] = useState("");
  const [translating, setTranslating] = useState(false);
  
  // TTS State
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingSpeed, setSpeakingSpeed] = useState(1.0);

  // Comments write state
  const [commentText, setCommentText] = useState("");
  const [replyText, setReplyText] = useState("");
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  
  const [unlockedChapters, setUnlockedChapters] = useState<string[]>([]);
  const [unlockingInProgress, setUnlockingInProgress] = useState(false);

  useEffect(() => {
    fetchChapters();
    fetchComments();
    recordView();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [novel.id]);

  const recordView = async () => {
    try {
      let deviceId = localStorage.getItem("novel_device_id");
      if (!deviceId) {
        deviceId = 'device_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem("novel_device_id", deviceId);
      }
      await fetch("/api/novels", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "record_view", novelId: novel.id, deviceId })
      });
    } catch (e) {}
  };

  const fetchChapters = async () => {
    try {
      const res = await fetch(`/api/chapters?novelId=${novel.id}`);
      const data = await res.json();
      if (data.success && data.chapters.length > 0) {
        setChapters(data.chapters);
        setActiveChapter(data.chapters[0]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/comments?novelId=${novel.id}`);
      const data = await res.json();
      if (data.success) {
        setComments(data.comments.reverse());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUnlockChapter = async (chapter: Chapter) => {
    if (unlockingInProgress) return;
    setUnlockingInProgress(true);

    try {
      const res = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "unlock_chapter",
          email: user.email,
          novelId: novel.id,
          chapterId: chapter.id
        })
      });
      const data = await res.json();
      if (data.success) {
        setUnlockedChapters([...unlockedChapters, chapter.id]);
        onRefreshWallet();
        alert("TRANSAKSI BERHASIL: Selamat! Bab premium berhasil dibuka secara permanen. Royalti langsung disalurkan ke dompet penulis.");
      } else {
        alert(data.error || "Gagal membuka bab.");
      }
    } catch (e) {
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setUnlockingInProgress(false);
    }
  };

  const handleTranslateText = async (originalText: string) => {
    if (!originalText) return;
    setTranslating(true);
    setTranslatedText("");

    try {
      const res = await fetch("/api/gemini/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: originalText,
          targetLang: translationLang
        })
      });
      const data = await res.json();
      if (data.success) {
        setTranslatedText(data.translated);
      }
    } catch (e) {
      alert("Gagal melakukan penerjemahan otomatis.");
    } finally {
      setTranslating(false);
    }
  };

  const handleSpeakText = (textToSpeak: string) => {
    if (typeof window === "undefined") return;
    
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    
    // Clean text of brackets formatting, tags
    const cleanText = textToSpeak.replace(/\[.*?\]/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    const voices = window.speechSynthesis.getVoices();
    const indVoice = voices.find(v => v.lang.startsWith("id") || v.name.toLowerCase().includes("indonesia"));
    if (indVoice) utterance.voice = indVoice;
    
    utterance.rate = speakingSpeed;
    
    utterance.onend = () => {
      setIsSpeaking(false);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined") {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          novelId: novel.id,
          username: user.username,
          email: user.email,
          content: commentText
        })
      });
      const data = await res.json();
      if (data.success) {
        setCommentText("");
        fetchComments();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    try {
      const res = await fetch("/api/comments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commentId,
          action: "like"
        })
      });
      const data = await res.json();
      if (data.success) {
        fetchComments();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleReplyComment = async (e: React.FormEvent, commentId: string) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    try {
      const res = await fetch("/api/comments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commentId,
          action: "reply",
          authorReply: replyText
        })
      });
      const data = await res.json();
      if (data.success) {
        setReplyText("");
        setActiveReplyId(null);
        fetchComments();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // High contrast reader visual styles mapping
  const themeClasses = {
    clean: "bg-white text-slate-800 border-slate-200 shadow-sm",
    amber: "bg-[#fefaf0] text-amber-950 border-amber-200/60 shadow-sm",
    slate: "bg-slate-900 text-slate-100 border-slate-850 shadow-sm"
  };

  const isBypassedOrOwner = novel.author.toLowerCase() === user.email.toLowerCase();

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 font-sans">
      
      {/* HEADER NAVIGATION CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4 mb-6 gap-3">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg flex items-center gap-1.5 self-start cursor-pointer transition-colors"
        >
          <ChevronLeft size={14} /> KEMBALI KE PERPUSTAKAAN
        </button>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50 px-3/5 py-1.5 rounded-lg border border-slate-250 self-start">
          Modus Penjelajah Membaca
        </div>
      </div>

      {/* NOVEL BANNER & SYNOPSIS HERO CARD */}
      <section className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Card: Book Cover & Specs */}
        <div className="relative rounded-2xl bg-slate-950 border border-slate-800 text-white overflow-hidden shadow-md flex flex-col justify-between aspect-[3/4] h-auto md:col-span-1">
          {novel.coverUrl ? (
            <img 
              src={novel.coverUrl} 
              alt={novel.title} 
              className="w-full h-full object-cover absolute inset-0 opacity-45 pointer-events-none"
              referrerPolicy="no-referrer"
            />
          ) : (
            <img 
              src={`https://picsum.photos/seed/${encodeURIComponent(novel.title)}/600/800`} 
              alt={novel.title} 
              className="w-full h-full object-cover absolute inset-0 opacity-45 pointer-events-none mix-blend-overlay"
              referrerPolicy="no-referrer"
            />
          )}
          {/* overlay linear gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

          <div className="relative z-10 p-5 flex flex-col justify-between h-full">
            <div>
              <div className="flex justify-between items-center gap-2">
                <span className="text-[9px] font-black bg-indigo-600 border border-indigo-500 text-white px-2 py-0.5 rounded uppercase max-w-[150px] truncate">
                  {novel.genres && novel.genres.length > 0 ? novel.genres.join(", ") : novel.genre}
                </span>

                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${
                  novel.status === "tamat" 
                    ? "bg-emerald-500 text-slate-950" 
                    : novel.status === "hiatus" 
                      ? "bg-orange-500 text-white" 
                      : "bg-indigo-400 text-white"
                }`}>
                  {novel.status || "Ongoing"}
                </span>
              </div>

              <h2 className="text-base md:text-lg font-black tracking-tight text-white mt-4 uppercase line-clamp-2 leading-tight">
                {novel.title}
              </h2>
            </div>

            <div className="mt-auto bg-black/60 backdrop-blur-xs p-3 rounded-xl border border-white/10 text-left">
              <p className="text-[10px] text-indigo-300 font-extrabold uppercase tracking-tight mb-1">Informasi Penerbitan:</p>
              <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10.5px] font-semibold text-slate-300 font-sans">
                <span>Pena: @{novel.authorUsername}</span>
                <span className="flex items-center gap-1">Rating: <Star size={12} className="inline fill-amber-400 text-amber-400" /> {novel.rating || "5.0"}</span>
                <span className="col-span-2 text-[9.5px] border-t border-white/5 pt-1 mt-1 text-slate-400 flex justify-between items-center">
                  <span>Jadwal: {novel.updateDays?.join(", ") || "Setiap Hari"} | Views: {novel.views || 0}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Card: Synopsis & Chapter Lists */}
        <div className="p-6 md:col-span-2 rounded-2xl bg-white border border-slate-200 flex flex-col justify-between shadow-sm text-left relative">
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <span className={`px-2.5 py-1 border text-[9px] font-black tracking-widest uppercase rounded-md ${
              novel.status?.toLowerCase() === 'tamat' 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-amber-50 border-amber-200 text-amber-700'
            }`}>
              {novel.status === "tamat" ? "SELESAI" : "ONGOING"}
            </span>
            <button
              onClick={async () => {
                if (navigator.share) {
                  try {
                    await navigator.share({
                      title: novel.title,
                      text: `Baca novel "${novel.title}" karya @${novel.authorUsername} di Novelpedia!`,
                      url: window.location.href,
                    });
                  } catch (error) {
                    // ignore abort error
                  }
                } else {
                  alert("Fitur bagikan (Share) novel ini tidak didukung di peramban Anda. Silakan salin tautan secara manual.");
                }
              }}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-md text-[9px] font-bold uppercase transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Bagikan Novel Ini"
            >
              <Sparkles size={10} /> Share
            </button>
          </div>
          
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5 flex items-center gap-2">Sinopsis Sastra Cerita</h3>
              <p className="text-xs text-slate-500 leading-relaxed max-h-20 overflow-y-auto pr-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100 italic">
                &quot;{novel.synopsis || "Penulis belum mencantumkan naskah sinopsis orisinal untuk cerita ini."}&quot;
              </p>
            </div>

            <div>
              <h3 className="text-xs font-black text-indigo-600 uppercase tracking-wider border-b border-slate-100 pb-2 mb-3 flex items-center gap-2">
                <BookOpen size={14} /> Daftar Bab Tersedia ({chapters.length})
              </h3>
              <div className="flex flex-wrap gap-2 overflow-y-auto max-h-32 pr-2">
                {chapters.length === 0 ? (
                  <span className="text-xs text-slate-400 font-bold py-2">Belum ada karya bab yang diposting oleh penulis novel ini.</span>
                ) : (
                  chapters.map((chap) => {
                    const isChapterLocked = chap.isLocked && !unlockedChapters.includes(chap.id) && !isBypassedOrOwner;
                    const isActive = activeChapter?.id === chap.id;
                    
                    return (
                      <button
                        key={chap.id}
                        onClick={() => {
                          setTranslatedText("");
                          setActiveChapter(chap);
                        }}
                        className={`px-3 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                          isActive 
                            ? "bg-indigo-600 text-white border-indigo-600" 
                            : isChapterLocked 
                              ? "bg-amber-50 text-amber-700 border-amber-200/50 hover:bg-amber-100/40" 
                              : "bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100"
                        }`}
                      >
                        {isChapterLocked && <Coins size={11} className="text-amber-500 shrink-0 inline-block mr-1" />}
                        <span>{chap.order}. {chap.title}</span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-105 mt-4 leading-normal">
            <Info size={14} className="inline-block mr-1 text-slate-400" /> Gerbang Pencairan Penulis: Setiap pembelian bab berbayar senilai koin tertentu langsung disalurkan ke neraca saldo komisi pembuat novel yang bersangkutan.
          </p>
        </div>
      </section>

      {/* CORE READING FIELD */}
      {activeChapter ? (
        <section className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          
          <div className="lg:col-span-3 flex flex-col gap-4">
            
            {/* Display Settings Toolbar controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 border border-slate-200 rounded-xl shadow-sm">
              
              {/* Display theme */}
              <div className="flex items-center gap-1.5 text-xs font-bold">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider mr-1">Display:</span>
                <button
                  onClick={() => setTheme("clean")}
                  className={`px-2.5 py-1 rounded-md border text-[11px] ${theme === "clean" ? "bg-indigo-600 text-white border-indigo-600" : "bg-slate-50 text-slate-650 border-slate-200"}`}
                >
                  Klasik Putih
                </button>
                <button
                  onClick={() => setTheme("amber")}
                  className={`px-2.5 py-1 rounded-md border text-[11px] ${theme === "amber" ? "bg-amber-600 text-white border-amber-600" : "bg-slate-50 text-slate-650 border-slate-200"}`}
                >
                  Sepia Hangat
                </button>
                <button
                  onClick={() => setTheme("slate")}
                  className={`px-2.5 py-1 rounded-md border text-[11px] ${theme === "slate" ? "bg-slate-900 text-white border-slate-900" : "bg-slate-50 text-slate-650 border-slate-200"}`}
                >
                  Malam Gelap
                </button>
              </div>

              {/* Font sizing */}
              <div className="flex items-center gap-1 text-xs font-bold">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider mr-1">Teks:</span>
                {(["sm", "base", "lg", "xl"] as const).map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setFontSize(sz)}
                    className={`px-2 py-0.5 rounded border text-[11px] ${fontSize === sz ? "bg-slate-800 text-white" : "bg-slate-50 text-slate-600"}`}
                  >
                    {sz.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* TTS Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSpeakText(activeChapter.content)}
                  className={`px-4 py-1.5 flex items-center gap-1.5 border rounded-lg text-xs font-bold transition-all ${
                    isSpeaking 
                      ? "border-rose-400 text-rose-600 bg-rose-50 animate-pulse" 
                      : "border-emerald-300 text-emerald-600 bg-emerald-50 hover:bg-emerald-100"
                  }`}
                >
                  {isSpeaking ? <VolumeX size={13} /> : <Volume2 size={13} />}
                  <span>{isSpeaking ? "Hentikan Suara" : "Dengarkan Bab (TTS)"}</span>
                </button>
                <select
                  aria-label="Atur kecepatan pembaca suara"
                  disabled={isSpeaking}
                  className="bg-slate-50 text-xs text-slate-600 border border-slate-200 rounded-lg p-1 outline-none font-bold"
                  value={speakingSpeed}
                  onChange={(e) => setSpeakingSpeed(Number(e.target.value))}
                >
                  <option value={0.85}>Lambat (0.85x)</option>
                  <option value={1.0}>Normal (1.0x)</option>
                  <option value={1.2}>Cepat (1.2x)</option>
                </select>
              </div>
            </div>

            {/* MAIN PROSE SHEET DISPLAY */}
            <div className={`p-6 sm:p-10 border rounded-2xl relative transition-all duration-200 leading-relaxed ${themeClasses[theme]}`}>
              
              <div className="absolute top-3 right-4 text-[9px] uppercase tracking-wider text-slate-400 font-bold">
                Membaca Novelpedia
              </div>

              <h2 className="text-base md:text-lg font-black uppercase tracking-wide border-b border-slate-200 pb-3 mb-5">
                {activeChapter.order}. {activeChapter.title}
              </h2>

              {/* COIN CODES PREMIUM LOCK CHECK */}
              {activeChapter.isLocked && !unlockedChapters.includes(activeChapter.id) && !isBypassedOrOwner ? (
                <div className="text-center py-10 flex flex-col items-center justify-center border border-dashed border-slate-350 bg-slate-50/70 p-6 rounded-xl my-4 text-slate-800">
                  <div className="h-12 w-12 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mb-3">
                    <Coins size={22} className="text-amber-500 animate-bounce" />
                  </div>
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-1 flex items-center justify-center gap-1.5">
                    <Lock size={16} className="text-slate-700" /> Bab Khusus Premium
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mb-4 leading-normal">
                    Hargai karya orisinal. Seri bab ini dikhususkan oleh pengarang untuk pembaca teruji. Buka bab permanen senilai <span className="font-extrabold text-amber-600">{wallet?.isPremium ? Math.max(1, Math.ceil((novel.priceCoins || 5) * 0.5)) : (novel.priceCoins || 5)} Koin Pixel</span>.
                    {wallet?.isPremium && <span className="block mt-1 text-emerald-600 font-bold">Diskon 50% Member VIP Diterapkan!</span>}
                  </p>
                  
                  <button
                    onClick={() => handleUnlockChapter(activeChapter)}
                    disabled={unlockingInProgress}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs shadow-md transition-all active:translate-y-px cursor-pointer"
                  >
                    {unlockingInProgress ? "Memproses Koin..." : `Buka Akses Bab Sekarang (${wallet?.isPremium ? Math.max(1, Math.ceil((novel.priceCoins || 5) * 0.5)) : (novel.priceCoins || 5)} Koin)`}
                  </button>
                </div>
              ) : (
                /* Unlocked formatted text */
                <div 
                  className={`whitespace-pre-wrap font-sans ${
                    fontSize === "sm" ? "text-xs" : fontSize === "base" ? "text-sm" : fontSize === "lg" ? "text-base" : "text-lg"
                  }`}
                >
                  {activeChapter.content}
                </div>
              )}

              {/* Translating section results placeholder */}
              {translatedText && (
                <div className="mt-8 pt-6 border-t border-dashed border-slate-200 text-slate-600 font-sans">
                  <div className="inline-block text-[10px] uppercase font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded px-2 py-0.5 mb-3">
                    🔮 Alih-Bahasa Literasi Gemini: Terjemahan {translationLang}
                  </div>
                  <div className={`whitespace-pre-wrap leading-relaxed ${
                    fontSize === "sm" ? "text-xs" : fontSize === "base" ? "text-sm" : fontSize === "lg" ? "text-base" : "text-lg"
                  }`}>
                    {translatedText}
                  </div>
                </div>
              )}
              
              {/* Ad Banner Interstitial Check */}
              {!wallet?.isPremium && (() => {
                let showAd = false;
                let provider = "Google AdSense";
                try {
                  const adsConfigStr = localStorage.getItem("novelpedia_ads_config");
                  if (adsConfigStr) {
                    const config = JSON.parse(adsConfigStr);
                    if (config.enabled) {
                      showAd = true;
                      if (config.provider) provider = config.provider;
                    }
                  } else {
                     showAd = true; // Default ON
                  }
                } catch(e) {}
                
                if (showAd) {
                  return (
                    <div className="mt-12 bg-slate-100/50 border border-slate-200 p-4 rounded-xl flex items-center justify-center text-center">
                      <div>
                        <span className="text-[10px] font-black uppercase text-slate-400 mb-1 block tracking-widest">Sponsor / {provider}</span>
                        <div className="w-full max-w-sm h-[100px] bg-slate-200 rounded animate-pulse mx-auto flex items-center justify-center border border-dashed border-slate-300">
                          <span className="text-xs font-bold text-slate-400">Area Penempatan Iklan Otomatis</span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-500 mt-2">Dapatkan <span className="text-indigo-600">Keanggotaan VIP Premium</span> untuk pengalaman bebas iklan selamanya.</p>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

            </div>

            {/* PREV/NEXT Chapter selector pagination bar */}
            <div className="flex items-center justify-between">
              <button
                disabled={activeChapter.order === 1}
                onClick={() => {
                  const prev = chapters.find(c => c.order === activeChapter.order - 1);
                  if (prev) {
                    setTranslatedText("");
                    setActiveChapter(prev);
                  }
                }}
                className={`px-4 py-2 border rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeChapter.order === 1
                    ? "bg-slate-50 border-slate-100 text-slate-350 cursor-not-allowed"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
                }`}
              >
                <ChevronLeft size={13} />
                <span>Bab Sebelumnya</span>
              </button>
              <button
                disabled={activeChapter.order === chapters.length}
                onClick={() => {
                  const next = chapters.find(c => c.order === activeChapter.order + 1);
                  if (next) {
                    setTranslatedText("");
                    setActiveChapter(next);
                  }
                }}
                className={`px-4 py-2 border rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeChapter.order === chapters.length
                    ? "bg-slate-50 border-slate-100 text-slate-350 cursor-not-allowed"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
                }`}
              >
                <span>Bab Berikutnya</span>
                <ArrowRight size={13} />
              </button>
            </div>

          </div>

          {/* Right reader controls card: Translation box */}
          <div className="flex flex-col gap-4 lg:col-span-1 text-slate-800">
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-3">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
                <Sparkles size={14} className="text-indigo-600 animate-pulse" /> Terjemahan Bahasa AI
              </h3>
              <p className="text-[11px] text-slate-500 leading-normal">
                Gunakan mesin super Gemini 3.5-Flash untuk menerjemahkan ulasan bab ini secara ekspres:
              </p>

              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Target Alih Bahasa</label>
                <select
                  aria-label="Atur Bahasa Target"
                  className="w-full bg-slate-50 text-xs font-bold text-slate-850 border border-slate-250 p-2 outline-none rounded-lg"
                  value={translationLang}
                  onChange={(e) => setTranslationLang(e.target.value)}
                >
                  <option value="English">🇬🇧 English</option>
                  <option value="Japanese">🇯🇵 Japanese</option>
                  <option value="French">🇫🇷 French</option>
                  {SUPPORTED_LANGUAGES.filter(lang => !["English", "Japanese", "French"].includes(lang)).map((lang) => (
                    <option key={lang} value={lang}>🌐 {lang}</option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => handleTranslateText(activeChapter.content)}
                disabled={translating || (activeChapter.isLocked && !unlockedChapters.includes(activeChapter.id) && !isBypassedOrOwner)}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs shadow-sm transition-colors cursor-pointer"
              >
                <span>{translating ? "Menerjemahkan..." : "Artikan Bab [A.I]"}</span>
              </button>

              {translatedText && (
                <button
                  onClick={() => setTranslatedText("")}
                  className="w-full py-1 text-center border border-slate-200 text-[10px] text-slate-400 hover:text-slate-600 uppercase font-black tracking-tight rounded"
                >
                  Tutup Hasil
                </button>
              )}
            </div>
          </div>

        </section>
      ) : (
        <div className="text-center py-16 text-slate-400 border border-slate-150 bg-slate-50/50 rounded-2xl font-bold animate-pulse">
          ⚡ Bab orisinal belum diunggah untuk novel ini... ⚡
        </div>
      )}

      {/* GIFT / DONATION BLOCK */}
      <section className="mt-10 border-t border-slate-200 pt-8 pb-4">
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-xl font-black text-amber-600 tracking-tight flex items-center justify-center md:justify-start gap-2 mb-2">
              <Coins size={24} className="text-amber-500" /> Dukung Karya Penulis!
            </h3>
            <p className="text-sm text-slate-600">
              Menyukai novel ini? Berikan hadiah koin untuk memotivasi <b>@{novel.author.split('@')[0]}</b> terus berkarya.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-3">
            {[10, 50, 100].map(amount => (
              <button
                key={amount}
                onClick={async () => {
                  if (!confirm(`Kirim hadiah ${amount} Koin kepada ${novel.author.split('@')[0]}?`)) return;
                  
                  try {
                    const res = await fetch("/api/payment", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        action: "give_gift",
                        email: user.email,
                        targetEmail: novel.author,
                        giftAmount: amount
                      }),
                    });
                    const data = await res.json();
                    if (data.success) {
                      alert(data.message);
                      onRefreshWallet(); // Refresh local wallet
                    } else {
                      alert("Gagal mengirim hadiah: " + data.error);
                    }
                  } catch (e) {
                    alert("Terjadi kesalahan jaringan.");
                  }
                }}
                className="bg-white hover:bg-amber-100 border-2 border-amber-300 text-amber-700 font-black px-6 py-3 rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-95 flex flex-col items-center gap-1 cursor-pointer"
              >
                <span className="text-xl">🎁</span>
                <span className="text-xs">{amount} Koin</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* COMMENTS BLOCK */}
      <section className="mt-8 border-t border-slate-200 pt-6">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 mb-4">
          <BookOpen size={16} className="text-indigo-500" /> Komentar Pembaca ({comments.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Write comment form */}
          <div className="md:col-span-1 p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col gap-4">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide">
              Buat Tanggapan
            </h4>
            
            <form onSubmit={handleAddComment} className="flex flex-col gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Komentar sebagai @{user.username}
                </label>
                <textarea
                  required
                  placeholder="Tuliskan petualangan membaca disini..."
                  className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-lg p-2.5 text-xs h-24 resize-none outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-slate-900 text-white font-extrabold text-xs tracking-wide rounded-lg cursor-pointer text-center shadow-sm"
              >
                Kirim Komentar Resmi
              </button>
            </form>
          </div>

          {/* List reviews */}
          <div className="md:col-span-2 flex flex-col gap-3 max-h-[450px] overflow-y-auto pr-1">
            {comments.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl bg-white text-slate-500 text-xs shadow-sm">
                Belum ada tanggapan ulasan untuk novel ini. Jadilah pembaca pertama yang meninggalkan catatan!
              </div>
            ) : (
              comments.map((comm) => (
                <div key={comm.id} className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                        {comm.username.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="text-xs font-black text-slate-800">@{comm.username}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold">
                      {comm.createdAt.split("T")[0] || comm.createdAt}
                    </span>
                  </div>

                  <p className="text-xs leading-relaxed text-slate-650 whitespace-pre-wrap font-sans">
                    {comm.content}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center gap-4 border-t border-slate-100 pt-3 text-[10px] font-bold text-slate-500 mt-1">
                    <button 
                      onClick={() => handleLikeComment(comm.id)}
                      className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors"
                    >
                      <Star size={12} className={comm.likes && comm.likes > 0 ? "fill-amber-400 text-amber-500" : ""} /> 
                      {comm.likes || 0} Suka
                    </button>
                    <button 
                      onClick={() => {
                         if(navigator.clipboard){
                            navigator.clipboard.writeText(`${window.location.origin}/#novel-${novel.id}`);
                            alert("Tautan novel berhasil disalin ke clipboard!");
                         }
                      }}
                      className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors"
                    >
                      <Sparkles size={12} /> Bagikan
                    </button>
                    {isBypassedOrOwner && !comm.authorReply && (
                      <button 
                        onClick={() => setActiveReplyId(activeReplyId === comm.id ? null : comm.id)}
                        className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors ml-auto text-indigo-500"
                      >
                        <Send size={12} /> Balas (Author)
                      </button>
                    )}
                  </div>

                  {/* Author Reply Form */}
                  {activeReplyId === comm.id && (
                    <form onSubmit={(e) => handleReplyComment(e, comm.id)} className="mt-2 flex gap-2">
                      <input 
                        type="text" 
                        required 
                        placeholder="Balasan author..." 
                        className="flex-1 bg-indigo-50/50 border border-indigo-100 text-xs p-2 rounded-lg outline-none"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                      />
                      <button type="submit" className="px-3 bg-indigo-600 text-white rounded-lg text-xs font-bold">Kirim</button>
                    </form>
                  )}

                  {/* Author Reply Rendering */}
                  {comm.authorReply && (
                    <div className="mt-1 bg-indigo-50 border border-indigo-100 rounded-lg p-3 ml-6 self-start relative before:content-[''] before:absolute before:-left-3 before:top-4 before:h-px before:w-3 before:bg-indigo-200">
                      <div className="text-[10px] font-black text-indigo-600 mb-1 flex items-center gap-1">
                        <Star size={10} className="fill-indigo-500" /> Balasan Author
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed font-medium">
                        {comm.authorReply}
                      </p>
                    </div>
                  )}

                </div>
              ))
            )}
          </div>

        </div>
      </section>

    </div>
  );
}
