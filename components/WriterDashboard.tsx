import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  CheckCircle2, 
  ShieldAlert, 
  Calendar, 
  ArrowUpRight, 
  Plus, 
  Terminal, 
  Send, 
  Book, 
  FileText, 
  Check, 
  Trash2, 
  ShieldCheck, 
  HelpCircle, 
  Lock, 
  Scale,
  FileImage,
  Info,
  AlertCircle
} from "lucide-react";

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
  chaptersCount: number;
  isFlagged: boolean;
  isBypassed: boolean;
  priceCoins: number;
}

interface WriterDashboardProps {
  user: { email: string; username: string };
  onRefreshWallet: () => void;
}

export default function WriterDashboard({ user, onRefreshWallet }: WriterDashboardProps) {
  // Collection States
  const [myNovels, setMyNovels] = useState<Novel[]>([]);
  const [selectedNovel, setSelectedNovel] = useState<Novel | null>(null);
  const [showCreateNovel, setShowCreateNovel] = useState(false);
  const [loading, setLoading] = useState(true);

  // New Novel Form
  const [newTitle, setNewTitle] = useState("");
  const [newSynopsis, setNewSynopsis] = useState("");
  const [newGenres, setNewGenres] = useState<string[]>(["Fantasy"]);
  const [newPrice, setNewPrice] = useState(0);
  const [newStatus, setNewStatus] = useState<'ongoing' | 'hiatus' | 'tamat'>("ongoing");
  const [newUpdateDays, setNewUpdateDays] = useState<string[]>(["Setiap Hari"]);
  const [newCoverUrl, setNewCoverUrl] = useState("");

  // New Chapter Form
  const [chapTitle, setChapTitle] = useState("");
  const [chapContent, setChapContent] = useState("");
  const [isChapLocked, setIsChapLocked] = useState(false);
  const [publishDate, setPublishDate] = useState("");

  // AI Scanner & Proofread Status States
  const [publishing, setPublishing] = useState(false);
  const [scanResult, setScanResult] = useState<{ score: number; reason: string } | null>(null);
  const [aiSuspicionResult, setAiSuspicionResult] = useState<{ score: number; reason: string } | null>(null);
  
  // AI Proofreader states
  const [proofreading, setProofreading] = useState(false);
  const [showProofreadSuggest, setShowProofreadSuggest] = useState(false);
  const [suggestedText, setSuggestedText] = useState("");
  const [aiExplanation, setAiExplanation] = useState("");

  const staticGenres = [
    "Romance", "Fantasy", "Sci-Fi", "Action", "Adventure",
    "Mystery", "Thriller", "Horror", "Isekai", "JRPG",
    "LitRPG", "Wuxia", "Cultivation", "Slice of Life", "Comedy",
    "Drama", "Historical", "Supernatural", "Mecha", "Cyberpunk",
    "Steampunk", "Magic Academy"
  ];
  const weekdays = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu", "Setiap Hari"];

  const fetchMyNovels = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/novels?authorEmail=${encodeURIComponent(user.email)}`);
      const data = await res.json();
      if (data.success) {
        setMyNovels(data.novels);
        if (data.novels.length > 0 && !selectedNovel) {
          setSelectedNovel(data.novels[0]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyNovels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleToggleGenre = (g: string) => {
    if (newGenres.includes(g)) {
      setNewGenres(newGenres.filter(item => item !== g));
    } else {
      setNewGenres([...newGenres, g]);
    }
  };

  const handleToggleUpdateDay = (day: string) => {
    if (day === "Setiap Hari") {
      setNewUpdateDays(["Setiap Hari"]);
      return;
    }
    
    // Clear "Setiap Hari" if adding specific days
    let filtered = newUpdateDays.filter(item => item !== "Setiap Hari");
    if (filtered.includes(day)) {
      filtered = filtered.filter(item => item !== day);
      if (filtered.length === 0) filtered = ["Setiap Hari"];
      setNewUpdateDays(filtered);
    } else {
      setNewUpdateDays([...filtered, day]);
    }
  };

  const handleCreateNovel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newSynopsis.trim()) return;
    if (newGenres.length === 0) {
      alert("PERINGATAN: Atur minimal 1 kategori genre untuk novel orisinal Anda!");
      return;
    }

    try {
      const res = await fetch("/api/novels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          synopsis: newSynopsis,
          genre: newGenres[0], // backward compatibility
          genres: newGenres,
          author: user.email,
          authorUsername: user.username,
          priceCoins: Number(newPrice),
          status: newStatus,
          updateDays: newUpdateDays,
          coverUrl: newCoverUrl || undefined
        })
      });
      const data = await res.json();
      if (data.success) {
        setNewTitle("");
        setNewSynopsis("");
        setNewPrice(0);
        setNewCoverUrl("");
        setNewGenres(["Fantasy"]);
        setNewStatus("ongoing");
        setNewUpdateDays(["Setiap Hari"]);
        setShowCreateNovel(false);
        fetchMyNovels();
        alert(`Novel Sastra Baru '${data.novel.title}' telah berhasil didaftarkan di server Novelpedia!`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Run proofreader via server-side Gemini
  const handleAIProofread = async () => {
    if (!chapContent.trim()) {
      alert("Silakan ketik draf naskah bab terlebih dahulu sebelum memanggil asisten AI!");
      return;
    }
    
    setProofreading(true);
    setShowProofreadSuggest(false);
    setSuggestedText("");

    try {
      const res = await fetch("/api/proofreads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          novelId: selectedNovel?.id || "novel_temp",
          chapterId: "chapter_temp",
          novelTitle: selectedNovel?.title || "Draft Novel",
          chapterTitle: chapTitle || "Bab Tanpa Judul",
          authorEmail: user.email,
          originalText: chapContent
        })
      });
      const data = await res.json();
      if (data.success && data.proofread) {
        setSuggestedText(data.proofread.suggestedText);
        setAiExplanation(data.proofread.aiExplanation);
        setShowProofreadSuggest(true);
      }
    } catch (e) {
      alert("Kesalahan memicu AI proofreader.");
    } finally {
      setProofreading(false);
    }
  };

  const handleAcceptRevision = () => {
    setChapContent(suggestedText);
    setShowProofreadSuggest(false);
  };

  const handlePublishChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNovel) return;
    if (!chapTitle.trim() || !chapContent.trim()) {
      alert("Draf naskah dan Judul Bab harus terisi!");
      return;
    }

    const wordCount = chapContent.trim().split(/\s+/).filter(Boolean).length;
    if (wordCount < 200) {
      alert(`Sistem Menolak: Jumlah kata terlalu sedikit! Tiap bab minimal harus berisi 200 kata. Naskah Anda saat ini hanya memiliki ${wordCount} kata.`);
      return;
    }

    setPublishing(true);
    setScanResult(null);
    setAiSuspicionResult(null);

    try {
      const res = await fetch("/api/chapters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          novelId: selectedNovel.id,
          title: chapTitle,
          content: chapContent,
          isLocked: isChapLocked,
          publishDate: publishDate || undefined,
          authorUsername: user.username
        })
      });
      const data = await res.json();
      if (data.success) {
        setScanResult(data.scanReport);
        if (data.aiSuspicion) {
          setAiSuspicionResult(data.aiSuspicion);
        }
        setChapTitle("");
        setChapContent("");
        setIsChapLocked(false);
        setPublishDate("");
        onRefreshWallet();
        fetchMyNovels();
        
        // Refresh active novel parameter
        const refreshedNovelList = await (await fetch("/api/novels")).json();
        if (refreshedNovelList.success) {
          const current = refreshedNovelList.novels.find((n: Novel) => n.id === selectedNovel.id);
          if (current) setSelectedNovel(current);
        }
      } else {
        alert(data.error || "Gagal mengunggah bab baru.");
      }
    } catch (e) {
      alert("Gagal memublikasikan bab.");
    } finally {
      setPublishing(false);
    }
  };

  // Visual text helper for live word count
  const currentChapWordCount = chapContent.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 font-sans">
      
      {/* WRITER LANDSCAPE HUD */}
      <h3 className="text-lg font-black text-slate-900 tracking-wide uppercase mb-6 flex items-center gap-2">
        <Terminal size={18} className="text-indigo-600" /> Dashboard Penulisan Karya Orisinal
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* SIDEBAR: My Books Controls list */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Daftar Judul Buku Anda
              </h4>
              <button
                onClick={() => setShowCreateNovel(true)}
                className="p-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-150 transition-colors uppercase font-bold text-xs rounded-lg flex items-center justify-center cursor-pointer"
                title="Daftarkan Novel Baru"
              >
                <Plus size={15} />
              </button>
            </div>

            {loading ? (
              <div className="h-10 flex items-center justify-center">
                <span className="text-xs text-slate-400 font-medium animate-pulse">Memuat draf buku...</span>
              </div>
            ) : myNovels.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500 leading-relaxed">
                Anda belum menulis karya orisinal apapun sekarang. <br />
                <button
                  onClick={() => setShowCreateNovel(true)}
                  className="text-indigo-600 hover:underline font-bold mt-3 block mx-auto cursor-pointer"
                >
                  Mulai Buat Karya Baru
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {myNovels.map((nov) => (
                  <button
                    key={nov.id}
                    onClick={() => { setScanResult(null); setAiSuspicionResult(null); setSelectedNovel(nov); setShowCreateNovel(false); }}
                    className={`p-3 rounded-xl border text-left text-xs transition-all flex flex-col gap-1 w-full cursor-pointer ${
                      selectedNovel?.id === nov.id && !showCreateNovel
                        ? "border-indigo-500 bg-indigo-50/15 text-indigo-950 font-bold"
                        : "border-slate-200 bg-white text-slate-650 hover:bg-slate-50"
                    }`}
                  >
                    <span className="font-extrabold truncate w-full uppercase text-[11px]">{nov.title}</span>
                    <div className="flex items-center justify-between w-full mt-1">
                      <span className="text-[10px] text-slate-400 font-semibold">
                        {nov.genres ? nov.genres.join(", ") : nov.genre}
                      </span>
                      <span className="text-[9px] bg-slate-100 text-slate-600 px-1 py-0.5 rounded font-black uppercase">
                        {nov.status || "Ongoing"}
                      </span>
                    </div>
                    
                    {nov.isFlagged && !nov.isBypassed && (
                      <span className="text-[9px] bg-rose-50 border border-rose-100 text-rose-600 px-1.5 py-1 rounded-md mt-1 font-bold inline-flex items-center gap-1 self-start leading-none uppercase">
                        <ShieldAlert size={10} />
                        <span>Karantina Sensor AI</span>
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-[11px] leading-relaxed text-slate-500 text-left">
            <Info size={14} className="inline-block mr-1 text-amber-500" /> Untuk menguji coba pemindai otomatis plagiarism AI pada bab baru, cobalah menulis kalimat tiruan atau plagiat pada draf untuk memicu skor sensor kemiripan!
          </div>
        </div>

        {/* MAIN PANEL CONTENT */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          
          {/* CREATE NOVEL FORM */}
          {showCreateNovel ? (
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm text-left jrpg-box-anim animate-fade-in">
              <h4 className="text-sm font-black text-emerald-600 uppercase tracking-wide border-b border-slate-100 pb-2 mb-4 flex items-center gap-1.5">
                <Book size={14} className="text-emerald-600" /> Daftarkan Novel Orisinal Baru Anda
              </h4>
              <form onSubmit={handleCreateNovel} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="novel-title-input">Judul Novel Baru</label>
                    <input
                      id="novel-title-input"
                      type="text"
                      required
                      placeholder="Contoh: Takdir Pemeras di Kerajaan Sihir"
                      className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-lg p-2.5 text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                    />
                  </div>
                  
                  {/* COVER PHOTO URL */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1" htmlFor="novel-cover-input">
                      <FileImage size={13} className="text-indigo-600" /> Sampul Cover (URL Foto atau Kosongkan untuk Auto AI Generator)
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="novel-cover-input"
                        type="url"
                        placeholder="https://images.unsplash.com/... atau kosongkan"
                        className="flex-1 bg-slate-50 text-slate-900 border border-slate-200 rounded-lg p-2.5 text-xs font-semibold outline-none"
                        value={newCoverUrl}
                        onChange={(e) => setNewCoverUrl(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setNewCoverUrl(`https://picsum.photos/seed/${newTitle || "cover_" + Date.now()}/450/800`)}
                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 font-bold text-[10.5px] uppercase rounded-lg cursor-pointer"
                        title="Acak Gambar Cover Sastra"
                      >
                        Acak AI Cover
                      </button>
                    </div>
                  </div>
                </div>

                {/* MULTIPLE GENRE CHOICE CHIPS */}
                <div>
                  <label className="block text-xs font-bold text-slate-750 mb-1.5">Kategori Semesta Genre (Bisa Pilih Lebih Dari 1 Kategori)</label>
                  <div className="flex flex-wrap gap-2">
                    {staticGenres.map((g) => {
                      const isSelected = newGenres.includes(g);
                      return (
                        <button
                          key={g}
                          type="button"
                          onClick={() => handleToggleGenre(g)}
                          className={`px-3 py-1.5 border rounded-lg text-xs font-bold transition-all uppercase cursor-pointer ${
                            isSelected 
                              ? "bg-indigo-600 border-indigo-700 text-white shadow-xs" 
                              : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          {isSelected && <span className="mr-1">✓</span>}
                          {g}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* STATUS & UPDATE FREQUENCY SCHEDULES */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-50 pt-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-750 mb-1.5">Status Penulisan Novel</label>
                    <div className="grid grid-cols-3 gap-2">
                      {["ongoing", "hiatus", "tamat"].map((st) => {
                        const isSelected = newStatus === st;
                        return (
                          <button
                            key={st}
                            type="button"
                            onClick={() => setNewStatus(st as any)}
                            className={`py-2 border rounded-lg text-xs font-black transition-all uppercase cursor-pointer text-center ${
                              isSelected 
                                ? "bg-indigo-600 border-indigo-700 text-white" 
                                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                            }`}
                          >
                            {st}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-750 mb-1.5">Jadwal Update Buku (Update Setiap Hari Apa)</label>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-slate-50 border border-slate-205 rounded-xl">
                      {weekdays.map((day) => {
                        const isSelected = newUpdateDays.includes(day);
                        return (
                          <button
                            key={day}
                            type="button; button"
                            onClick={() => handleToggleUpdateDay(day)}
                            className={`px-2 py-1 border text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                              isSelected 
                                ? "bg-indigo-600 border-indigo-600 text-white" 
                                : "bg-white border-slate-200 text-slate-500 hover:bg-slate-100"
                            }`}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="novel-synopsis-input">Sinopsis Lengkap Novel</label>
                  <textarea
                    id="novel-synopsis-input"
                    required
                    placeholder="Tulis ringkasan singkat yang memikat calon pembaca Anda..."
                    className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-lg p-2.5 text-xs h-24 resize-none outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white font-semibold"
                    value={newSynopsis}
                    onChange={(e) => setNewSynopsis(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-lg text-left">
                    <p className="text-[11.5px] font-black text-emerald-800 uppercase flex items-center gap-1">
                      <Sparkles size={11} className="text-amber-500 animate-pulse" /> Status: Bebas Baca Terbuka (Gratis)
                    </p>
                    <p className="text-[10px] text-emerald-600 mt-1 leading-normal">
                      Seluruh bab yang Anda terbitkan akan dirilis secara gratis. Sistem koin kini digantikan oleh pendanaan keanggotaan Premium!
                    </p>
                  </div>
                  <div className="flex items-end justify-end gap-2 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setShowCreateNovel(false)}
                      className="px-4 py-2 border border-slate-200 rounded-lg text-slate-650 hover:bg-slate-50 cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg cursor-pointer shadow-sm"
                    >
                      Daftarkan Buku Baru
                    </button>
                  </div>
                </div>
              </form>
            </div>
          ) : selectedNovel ? (
            
            /* WRITE CHAPTER CORNER */
            <div className={`p-6 bg-white rounded-2xl border shadow-sm text-left ${selectedNovel.isFlagged && !selectedNovel.isBypassed ? 'border-rose-300 shadow-rose-200/5' : 'border-slate-200'} animate-fade-in`}>
              
              <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-3 mb-4 gap-3">
                <div>
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                    Tulis & Publikasi Bab Baru: {selectedNovel.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-black uppercase">
                      Status: {selectedNovel.status || "Ongoing"}
                    </span>
                    <span className="text-[10px] bg-slate-100 border border-slate-200 text-slate-600 px-1.5 py-0.5  rounded font-bold">
                      Genre: {selectedNovel.genres ? selectedNovel.genres.join(", ") : selectedNovel.genre}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Update: {selectedNovel.updateDays?.join(", ") || "Setiap Hari"}
                    </span>
                  </div>
                </div>

                {selectedNovel.isFlagged && !selectedNovel.isBypassed && (
                  <span className="bg-rose-50 border border-rose-100 text-rose-600 text-xs font-black p-2 px-3.5 rounded-lg flex items-center gap-1.5 animate-pulse uppercase leading-none">
                    <ShieldAlert size={12} className="text-rose-600" />
                    <span>SENSOR PLAGIAT AKTIF</span>
                  </span>
                )}
              </div>

              {/* POST CHAPTER WORKSPACE */}
              <form onSubmit={handlePublishChapter} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="chapter-title-input">Judul Bab Baru</label>
                    <input
                      id="chapter-title-input"
                      type="text"
                      required
                      placeholder="Contoh: Bab 4: Pertemuan di Balik Hutan Sihir"
                      className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-lg p-2.5 text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                      value={chapTitle}
                      onChange={(e) => setChapTitle(e.target.value)}
                    />
                  </div>

                  {/* Scheduled Release */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1" htmlFor="chapter-date-input">
                      <Calendar size={13} className="text-indigo-600" /> Atur Tanggal Penjadwalan Rilis (Google Calendar Sync)
                    </label>
                    <input
                      id="chapter-date-input"
                      type="date"
                      className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-lg p-2 text-xs font-semibold outline-none"
                      value={publishDate}
                      onChange={(e) => setPublishDate(e.target.value)}
                    />
                  </div>
                </div>

                {/* Main Content draft */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <label className="block text-xs font-bold text-slate-750" htmlFor="chapter-draft-input">Isi Konten Bab Sastra</label>
                      
                      {/* LIVE WORD COUNT REQUIREMENT BADGE */}
                      {currentChapWordCount < 200 ? (
                        <span className="text-[9.5px] bg-rose-50 border border-rose-100 text-rose-600 p-0.5 px-2 rounded-md font-black animate-pulse flex items-center gap-1">
                          <AlertCircle size={9} />
                          <span>Minimal 200 Kata ({currentChapWordCount} kata saat ini)</span>
                        </span>
                      ) : (
                        <span className="text-[9.5px] bg-emerald-50 border border-emerald-100 text-emerald-600 p-0.5 px-2 rounded-md font-black flex items-center gap-1 animate-pulse">
                          <Check size={9} />
                          <span>Batas Utama Terpenuhi ({currentChapWordCount} kata!)</span>
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleAIProofread}
                      disabled={proofreading}
                      className="text-[11px] text-indigo-600 border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles size={11} className="text-indigo-600" /> 
                      <span>{proofreading ? "Menganalisis..." : "Gunakan Korektor AI Proofread"}</span>
                    </button>
                  </div>
                  <textarea
                    id="chapter-draft-input"
                    required
                    placeholder="Ketikan naskah tulisan bab orisinal Anda di sini (minimal 200 kata)... [Misal: Tulis petualangan yang panjang dan mendetail]"
                    className="w-full bg-slate-50 text-slate-950 border border-slate-200 rounded-lg p-3 text-xs h-44 resize-none font-semibold outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                    value={chapContent}
                    onChange={(e) => setChapContent(e.target.value)}
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Sistem menyukai draf penulisan orisinal manusia. Kepatuhan hukum orisinalitas dianalisis otomatis.</p>
                </div>

                {/* AI SUGGESTION POP INTERACTION */}
                {showProofreadSuggest && (
                  <div className="p-4 bg-indigo-50/10 border border-indigo-150 rounded-xl flex flex-col gap-3">
                    <div className="flex items-center justify-between border-b border-indigo-50 pb-2">
                      <span className="text-[11px] font-black text-indigo-600 uppercase tracking-wide flex items-center gap-1">
                        🔮 Rekomendasi Pilihan Diksi AI Novelpedia (Padu Padan Sastra)
                      </span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setShowProofreadSuggest(false)}
                          className="px-2 py-1 text-[10px] text-slate-500 border border-slate-200 hover:bg-slate-50 rounded select-none cursor-pointer"
                        >
                          Abaikan
                        </button>
                        <button
                          type="button"
                          onClick={handleAcceptRevision}
                          className="px-2.5 py-1 text-[10px] text-white bg-indigo-600 hover:bg-indigo-750 font-bold rounded flex items-center gap-1 select-none cursor-pointer"
                        >
                          <Check size={10} /> Terapkan Saran AI
                        </button>
                      </div>
                    </div>

                    <div className="text-xs font-semibold bg-white p-3 border border-slate-200 rounded-lg max-h-24 overflow-y-auto leading-relaxed whitespace-pre-wrap text-slate-800">
                      {suggestedText}
                    </div>

                    <div className="text-[11px] leading-relaxed text-slate-550 border-t border-indigo-50 pt-2 text-left">
                      <p className="font-extrabold text-indigo-600">Alasan Pilihan Kata:</p>
                      <p className="whitespace-pre-line mt-1">{aiExplanation}</p>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold bg-emerald-50 rounded-lg p-2.5 px-3 border border-emerald-100">
                    <CheckCircle2 size={13} className="text-emerald-500" />
                    <span>Rilis Bab Terbuka Bebas (Gratis secara default)</span>
                  </div>

                  <button
                    type="submit"
                    disabled={publishing || (selectedNovel.isFlagged && !selectedNovel.isBypassed) || currentChapWordCount < 200}
                    className={`px-5 py-2.5 font-bold rounded-lg text-xs shadow-md flex items-center gap-1.5 transition-all text-white ${
                      currentChapWordCount < 200 
                        ? "bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed shadow-none" 
                        : "bg-indigo-600 hover:bg-indigo-700 cursor-pointer shadow-indigo-600/10"
                    }`}
                  >
                    <Send size={12} /> 
                    <span>{publishing ? "Memindai Kemurnian Sastra..." : "Terbitkan & Publikasi Bab Baru"}</span>
                  </button>
                </div>

              </form>

              {/* REAL-TIME AI SCANNER REPORT PANEL WITH DUAL DETECTOR */}
              {(scanResult || aiSuspicionResultZone(aiSuspicionResult)) && (
                <div className="mt-6 p-5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col gap-5 text-left">
                  
                  {/* Plagiarism Meter */}
                  {scanResult && (
                    <div className="flex flex-col gap-2">
                      <h4 className="text-xs font-black text-slate-800 tracking-wide flex items-center gap-1.5 uppercase">
                        <Scale size={13} className="text-slate-600" />
                        <span>1. Analisis Pengamanan Pembajakan & Orisinalitas AI</span>
                      </h4>

                      <div>
                        <div className="flex justify-between text-[11px] text-slate-500 mb-1 font-bold">
                          <span>Skor Sensor Indeks Kemiripan (Plagiarism):</span>
                          <span className={scanResult.score >= 50 ? "text-rose-600 font-extrabold" : "text-emerald-600"}>
                            {scanResult.score}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full relative overflow-hidden border border-slate-250">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              scanResult.score >= 70 
                                ? "bg-rose-500" 
                                : scanResult.score >= 30 
                                  ? "bg-amber-400" 
                                  : "bg-emerald-500"
                            }`}
                            style={{ width: `${scanResult.score}%` }}
                          />
                        </div>
                      </div>

                      <div className="text-xs leading-relaxed text-slate-650 bg-white p-3 border border-slate-200 rounded-xl mt-1">
                        <p className="font-extrabold text-indigo-600 uppercase text-[9px] mb-0.5">Analisis Orisinalitas Sastra:</p>
                        <p>{scanResult.reason}</p>
                        
                        {scanResult.score >= 70 && (
                          <p className="text-rose-600 font-black uppercase text-[10px] mt-2 flex items-center gap-1">
                            <ShieldAlert size={12} className="shrink-0 animate-bounce" /> Novel Anda telah otomatis dikunci ke ruang evaluasi karena dinilai plagiat.
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* AI Writing Suspicion Meter */}
                  {aiSuspicionResult && (
                    <div className="flex flex-col gap-2 border-t border-slate-200 pt-4">
                      <h4 className="text-xs font-black text-rose-700 tracking-wide flex items-center gap-1.5 uppercase">
                        <ShieldAlert size={13} className="text-rose-600" />
                        <span>2. Indeks Kecurigaan Teks AI (Upload Harian Intensif)</span>
                      </h4>

                      <div>
                        <div className="flex justify-between text-[11px] text-slate-500 mb-1 font-bold">
                          <span>Tingkat Kecurigaan Output Generator AI:</span>
                          <span className={aiSuspicionResult.score >= 50 ? "text-rose-650 font-extrabold" : "text-slate-600"}>
                            {aiSuspicionResult.score}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full relative overflow-hidden border border-slate-250">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              aiSuspicionResult.score >= 70 
                                ? "bg-rose-600 animate-pulse" 
                                : aiSuspicionResult.score >= 30 
                                  ? "bg-amber-400" 
                                  : "bg-emerald-500"
                            }`}
                            style={{ width: `${aiSuspicionResult.score}%` }}
                          />
                        </div>
                      </div>

                      <div className="text-xs leading-relaxed text-slate-650 bg-white p-3 border border-slate-200 rounded-xl mt-1">
                        <p className="font-extrabold text-rose-600 uppercase text-[9px] mb-0.5">Hasil Analisis Kecepatan Tulis:</p>
                        <p>{aiSuspicionResult.reason}</p>
                        {aiSuspicionResult.score >= 70 && (
                          <p className="text-rose-600 font-bold uppercase text-[9.5px] mt-2 flex items-center gap-1.5 leading-tight">
                            <Info size={11} className="shrink-0 text-rose-600" />
                            <span>Saran: Agar terhindar kuncian sensor plagiat, batasi aktivitas unggah bab dengan jumlah kata ekstrem dalam waktu berdekatan.</span>
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              )}

            </div>
          ) : (
            <div className="text-center py-16 border border-dashed border-slate-200 rounded-2xl bg-white p-6 shadow-sm">
              <Book size={32} className="mx-auto text-slate-350 mb-3" />
              <p className="text-xs text-slate-550 mb-4 uppercase font-bold">Silakan beralih ke daftar judul buku di samping atau buat novel perdana Anda untuk mulai mengarang bab.</p>
              <button
                onClick={() => setShowCreateNovel(true)}
                className="px-4 py-2 bg-indigo-50 hover:bg-yellow-50 border border-indigo-150 hover:border-yellow-250 text-indigo-600 hover:text-yellow-700 text-xs font-bold rounded-lg cursor-pointer transition-all"
              >
                Buat Judul Cerita Baru
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}

function aiSuspicionResultZone(res: any) {
  return res && res.score > 0;
}
