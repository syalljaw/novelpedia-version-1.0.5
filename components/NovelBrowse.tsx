import React, { useState, useEffect } from "react";
import { Search, Star, BookOpen, AlertTriangle, ShieldAlert, Sparkles, User, TrendingUp, Compass, Eye, Gem } from "lucide-react";

interface Novel {
  id: string;
  title: string;
  synopsis: string;
  author: string;
  authorUsername: string;
  genre: string;
  rating: number;
  bannerColor: string;
  chaptersCount: number;
  isFlagged: boolean;
  isBypassed: boolean;
  priceCoins: number;
  createdAt: string;
  tags?: string[];
  coverUrl?: string;
  isTrending?: boolean;
  status?: string;
}

interface NovelBrowseProps {
  user: { email: string };
  onSelectNovel: (novel: Novel) => void;
}

export default function NovelBrowse({ user, onSelectNovel }: NovelBrowseProps) {
  const [novels, setNovels] = useState<Novel[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [loading, setLoading] = useState(true);
  const [searchFocused, setSearchFocused] = useState(false);

  const filterCategories = [
    "Semua", "Terbaru", "Terpopuler", "Selesai", "Pilihan Editor",
    "Action", "Romance", "Fantasy", "Mystery", "Slice of Life", "Sci-Fi", "Comedy"
  ];

  const trendingSearches = ["Sistem Leveling", "Reinkarnasi Iblis", "Cinta Kerajaan", "Dunia Lain", "Overpowered"];

  const fetchNovels = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/novels");
      const data = await res.json();
      if (data.success) {
        setNovels(data.novels);
      }
    } catch (e) {
      console.error(e);
    } finally {
      // simulate slight delay for skeleton aesthetic
      setTimeout(() => setLoading(false), 500);
    }
  };

  useEffect(() => {
    fetchNovels();
  }, [user]);

  const handleNovelClick = (novel: Novel) => {
    const isAuthor = novel.author.toLowerCase() === user.email.toLowerCase();
    const isAdmin = user.email.toLowerCase() === "irsyalfaiz97@gmail.com" || user.email.toLowerCase() === "yareyyaa0529@gmail.com";
    if (novel.isFlagged && !novel.isBypassed && !isAuthor && !isAdmin) {
      alert("AKSES DITOLAK: Novel dalam karantina Sensor AI Plagiarism (kemiripan >70%) dan sedang dievaluasi.");
      return;
    }
    onSelectNovel(novel);
  };

  const filteredNovels = novels.filter((novel) => {
    const query = searchQuery.toLowerCase();
    const titleMatch = (novel.title || "").toLowerCase().includes(query);
    const authorMatch = (novel.authorUsername || novel.author || "").toLowerCase().includes(query);
    const synopMatch = (novel.synopsis || "").toLowerCase().includes(query);
    const tagsMatch = novel.tags && novel.tags.some(t => t.toLowerCase().includes(query));
    
    const matchesSearch = titleMatch || authorMatch || synopMatch || tagsMatch;

    const isMatchCat = () => {
      const cat = selectedCategory.toLowerCase();
      switch(cat) {
        case "semua": return true;
        case "terbaru": return true;
        case "terpopuler": return (novel.rating >= 4.5 || novel.isTrending);
        case "selesai": return (novel.status?.toLowerCase() === "tamat");
        case "pilihan editor": return (novel.rating >= 4.8);
        default: 
           return (novel.genre || "").toLowerCase() === cat || (novel.tags && novel.tags.some(t => t.toLowerCase() === cat));
      }
    };

    return matchesSearch && isMatchCat();
  }).sort((a, b) => {
      if (selectedCategory === "Terbaru") {
         return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return 0; // fallback original API order
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 font-sans min-h-screen relative">
      
      {/* Subtle Aesthetic Background Patterns */}
      <div className="absolute top-20 left-0 -ml-40 w-96 h-96 rounded-full bg-indigo-100/40 blur-[100px] pointer-events-none -z-10" />
      <div className="absolute top-40 right-0 -mr-40 w-96 h-96 rounded-full bg-cyan-100/40 blur-[100px] pointer-events-none -z-10" />

      {/* 🚀 GLASMORPHISM SMART SEARCH BAR */}
      <div className="relative z-30 max-w-3xl mx-auto mb-10 group">
        <div className={`relative bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-2xl flex items-center p-2.5 transition-all duration-400 ${searchFocused ? 'ring-4 ring-indigo-500/20 shadow-[0_8px_40px_rgb(99,102,241,0.2)] scale-[1.01]' : ''}`}>
          <div className="pl-4 pr-3 text-indigo-500">
            <Search size={22} className={searchFocused ? "text-indigo-600" : "text-slate-400"} />
          </div>
          <input
            type="text"
            placeholder="Cari maha karya masa depan, judul sakti, atau tag magis..."
            className="w-full bg-transparent border-none text-sm md:text-base font-bold text-slate-800 placeholder:text-slate-400 outline-none px-2 py-2"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="px-4 text-slate-400 hover:text-slate-700">
              ✖
            </button>
          )}
        </div>
        
        {/* Trending Search Popover */}
        {searchFocused && !searchQuery && (
          <div className="absolute top-[80px] left-0 right-0 bg-white/95 backdrop-blur-2xl border border-white/50 shadow-2xl rounded-2xl p-5 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
             <p className="text-[10px] font-black uppercase text-indigo-500 mb-4 tracking-wider flex items-center gap-1.5"><TrendingUp size={14}/> Top Trending Pencarian</p>
             <div className="flex flex-wrap gap-2.5">
               {trendingSearches.map(term => (
                 <button 
                  key={term} 
                  onClick={(e) => { e.preventDefault(); setSearchQuery(term); }} 
                  className="px-4 py-2 bg-indigo-50/50 hover:bg-indigo-100 text-indigo-800 text-xs font-bold rounded-xl border border-indigo-100/50 transition-all cursor-pointer"
                 >
                   {term}
                 </button>
               ))}
             </div>
          </div>
        )}
      </div>

      {/* 🚀 ADVANCED FILTER CHIPS SCROLLABLE */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-4 scrollbar-hide snap-x pt-2 px-2 -mx-2">
        <div className="flex items-center gap-1.5 pr-4 shrink-0 border-r border-slate-200 mr-2 text-slate-400">
           <Compass size={18} />
           <span className="text-xs font-black uppercase tracking-wider">JELAJAHI</span>
        </div>
        
        {filterCategories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`snap-start whitespace-nowrap px-5 py-2.5 rounded-full text-[11px] font-black uppercase tracking-wider transition-all duration-300 border backdrop-blur-sm ${
              selectedCategory === cat
                ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/30 scale-105"
                : "bg-white/80 border-slate-200 text-slate-600 hover:bg-slate-50 hover:scale-105"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* NOVELS CATALOG GRID - 9:16 RATIO MODERN CARDS */}
      {loading ? (
        <div className="grid grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3 md:gap-5">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="relative aspect-[3/4] rounded-xl bg-slate-200 animate-pulse border border-slate-100 flex flex-col justify-end p-3">
               <div className="h-3 bg-slate-300/60 rounded w-3/4 mb-1.5"></div>
               <div className="h-2.5 bg-slate-300/60 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : filteredNovels.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center mt-10">
          <div className="text-7xl mb-6 opacity-80 select-none drop-shadow-xl animate-bounce">🪹</div>
          <h3 className="text-xl font-black text-slate-800 mb-2">Waduh, belum ketemu nih!</h3>
          <p className="text-sm font-medium text-slate-500 max-w-sm mb-6 leading-relaxed">
            Mungkin kata kunci magismu kurang tepat, atau karya maha dahsyat yang kamu cari belum ditulis oleh sang Author.
          </p>
          <button
            onClick={() => { setSearchQuery(""); setSelectedCategory("Semua"); }}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all hover:-translate-y-1"
          >
            Kembali Jelajahi Semua
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3 md:gap-5">
          {filteredNovels.map((novel) => {
            const isOwner = novel.author.toLowerCase() === user.email.toLowerCase();
            const isAdmin = user.email.toLowerCase() === "irsyalfaiz97@gmail.com" || user.email.toLowerCase() === "yareyyaa0529@gmail.com";
            
            return (
              <div
                key={novel.id}
                onClick={() => handleNovelClick(novel)}
                className={`group relative aspect-[3/4] rounded-xl bg-slate-900 border overflow-hidden shadow-sm cursor-pointer hover:-translate-y-1.5 transition-all duration-300 hover:shadow-xl ${
                  novel.isFlagged && !novel.isBypassed
                    ? "border-rose-400 ring-2 ring-rose-300"
                    : "border-slate-200/20"
                }`}
              >
                
                {/* Glossy overlay effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20 pointer-events-none" />

                {/* Cover Image Background */}
                {novel.coverUrl ? (
                  <img 
                    src={novel.coverUrl} 
                    alt={novel.title} 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <img 
                    src={`https://picsum.photos/seed/${encodeURIComponent(novel.title)}/300/400`} 
                    alt={novel.title} 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                )}
                
                {/* Gradient Overlay for Text Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent z-10 opacity-90 group-hover:opacity-100 transition-opacity" />
                
                {/* Top Badges (Genre & Status) */}
                <div className="absolute top-2 left-2 right-2 z-20 flex justify-between items-start">
                  <span className="backdrop-blur-md bg-black/50 border border-white/10 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider shadow-sm truncate max-w-[70px]">
                    {novel.genres && novel.genres.length > 0 ? novel.genres[0] : novel.genre}
                  </span>
                  
                  {novel.priceCoins > 0 ? (
                    <span className="backdrop-blur-md bg-amber-500/80 border border-amber-400/50 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-widest shadow-md flex items-center gap-0.5">
                      <Gem size={8} /> PREM
                    </span>
                  ) : (
                    <span className={`backdrop-blur-md border text-white text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-widest shadow-md ${novel.status === 'tamat' ? 'bg-emerald-600/80 border-emerald-400/50' : 'bg-indigo-600/80 border-indigo-400/50'}`}>
                      {novel.status === 'tamat' ? "TAMAT" : "ONGOING"}
                    </span>
                  )}
                </div>

                {/* Body Details Bottom Pinned */}
                <div className="absolute bottom-0 left-0 right-0 p-2.5 z-20 flex flex-col justify-end">
                  
                  {/* Plagiarism Karantina Overlay Badge */}
                  {novel.isFlagged && !novel.isBypassed && (
                    <div className="mb-1 bg-rose-600/90 backdrop-blur-md text-white text-[8px] font-black p-1 rounded-md flex items-center gap-1 shadow-lg border border-rose-400">
                      <ShieldAlert size={10} className="shrink-0" />
                      <span className="truncate">{isOwner || isAdmin ? "KARANTINA KONTEN" : "BLOKIR EVALUASI"}</span>
                    </div>
                  )}

                  <h3 className="text-white font-extrabold text-[11px] leading-tight mb-1 line-clamp-2 shadow-black drop-shadow-lg group-hover:text-amber-100 transition-colors">
                    {novel.title}
                  </h3>
                  
                  <div className="flex items-center justify-between text-[8px] text-slate-300 font-medium mb-1.5 drop-shadow-md">
                    <div className="flex items-center gap-1 truncate">
                      <User size={8} className="text-indigo-300 shrink-0" /> 
                      <span className="truncate">@{novel.authorUsername}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-[8px] font-black pt-1.5 border-t border-white/20">
                    <span className="text-slate-200 flex items-center gap-0.5"><BookOpen size={8} className="text-indigo-400"/> {novel.chaptersCount}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-200 flex items-center gap-0.5"><Eye size={8} className="text-emerald-400"/> {Math.floor((novel.rating || 5.0) * 1324 + novel.chaptersCount * 231).toLocaleString('id-ID')}</span>
                      <span className="text-amber-400 flex items-center gap-0.5"><Star size={8} className="fill-amber-400"/> {novel.rating ? novel.rating.toFixed(1) : "5.0"}</span>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}

