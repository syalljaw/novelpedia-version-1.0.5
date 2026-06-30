const fs = require('fs');
const topLogic = fs.readFileSync('/tmp/profileTop.tsx', 'utf-8');

const newUI = `  // New UI states
  const [currentTab, setCurrentTab] = useState("Karya Saya");
  const TABS = ["Karya Saya", "Library", "Informasi Akun"];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 font-sans min-h-screen text-slate-800 selection:bg-indigo-100">
      
      {successAnimation && (
        <div className="mb-8 p-4 bg-emerald-50/50 backdrop-blur-sm border border-emerald-100/50 text-emerald-700 rounded-2xl flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600"><CheckCircle2 size={16}/></div>
             <span className="text-sm">Action completed successfully</span>
          </div>
          <button onClick={() => setSuccessAnimation(false)}><X size={16} className="text-emerald-400 hover:text-emerald-600"/></button>
        </div>
      )}

      {/* HEADER: Immersive Frosted Glass */}
      <div className="relative rounded-[2.5rem] overflow-hidden mb-12 bg-white/40 border border-white/60 shadow-[0_4px_40px_rgba(0,0,0,0.03)] backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-100/30 via-slate-50/20 to-rose-50/30 -z-10 blur-3xl"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 mix-blend-multiply"></div>
        
        <div className="px-8 py-12 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-8">
          <div className="relativeshrink-0">
            <div className="w-32 h-32 rounded-full overflow-hidden shadow-sm border-[4px] border-white/80 relative bg-slate-50/50">
              {wallet?.avatarUrl ? (
                <img src={wallet?.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl font-light text-slate-400">
                  {penName.substring(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            {wallet?.isVerified && (
              <div className="absolute bottom-1 right-1 bg-white p-1.5 rounded-full shadow border border-slate-100/50">
                <ShieldCheck size={20} className="text-blue-500" />
              </div>
            )}
          </div>

          <div className="flex-1 mt-2">
            <h1 className="text-3xl font-medium tracking-tight mb-2 text-slate-900 flex items-center gap-3 justify-center sm:justify-start">
               {penName}
               {wallet?.isPremium && (
                 <span className="flex items-center gap-1 text-[10px] uppercase tracking-widest font-bold bg-gradient-to-r from-amber-100 to-amber-50 text-amber-600 px-2.5 py-1 rounded-full border border-amber-200/50 shadow-sm">
                   <Crown size={12}/> VIP
                 </span>
               )}
            </h1>
            <p className="text-[15px] text-slate-500 font-light max-w-lg leading-relaxed mb-6">
              {bio}
            </p>
            
            <div className="flex gap-3 justify-center sm:justify-start">
               {/* Social Icons */}
               <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-white/70 shadow-sm border border-white/80 hover:bg-white hover:shadow transition-all text-slate-500 hover:text-indigo-600">
                 <MessageSquare size={18} strokeWidth={1.5} />
               </a>
               <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-white/70 shadow-sm border border-white/80 hover:bg-white hover:shadow transition-all text-slate-500 hover:text-indigo-600">
                 <Share2 size={18} strokeWidth={1.5} />
               </a>
               <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-white/70 shadow-sm border border-white/80 hover:bg-white hover:shadow transition-all text-slate-500 hover:text-indigo-600">
                 <Mail size={18} strokeWidth={1.5} />
               </a>
            </div>
          </div>
        </div>
      </div>

      {/* STAT CARDS: Highlight */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-14">
         <div className="bg-white/40 backdrop-blur-md rounded-[2rem] p-8 border border-white/60 shadow-[0_4px_40px_rgba(0,0,0,0.02)] flex flex-col items-center sm:items-start transition-transform hover:-translate-y-1">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-slate-100 shadow-sm mb-6 text-indigo-500">
              <Users2 size={24} strokeWidth={1.5}/>
            </div>
            <div className="text-4xl font-light text-slate-800 tracking-tight mb-2">{(wallet?.followersCount || 1204).toLocaleString()}</div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Followers</div>
         </div>

         <div className="bg-white/40 backdrop-blur-md rounded-[2rem] p-8 border border-white/60 shadow-[0_4px_40px_rgba(0,0,0,0.02)] flex flex-col items-center sm:items-start transition-transform hover:-translate-y-1">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-slate-100 shadow-sm mb-6 text-amber-500">
              <BookOpen size={24} strokeWidth={1.5}/>
            </div>
            <div className="text-4xl font-light text-slate-800 tracking-tight mb-2">{myNovels.length}</div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Total Karya</div>
         </div>

         <div className="bg-white/40 backdrop-blur-md rounded-[2rem] p-8 border border-white/60 shadow-[0_4px_40px_rgba(0,0,0,0.02)] flex flex-col items-center sm:items-start transition-transform hover:-translate-y-1">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-slate-100 shadow-sm mb-6 text-rose-500">
              <Star size={24} strokeWidth={1.5}/>
            </div>
            <div className="text-4xl font-light text-slate-800 tracking-tight mb-2">
              {myNovels.length > 0 ? (myNovels.reduce((a, b) => a + (b.rating || 0), 0) / myNovels.length).toFixed(1) : "0.0"}
            </div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Global Rating</div>
         </div>
      </div>

      {/* MODERN TAB NAVIGATION (Underline dynamic) */}
      <div className="relative mb-8 overflow-x-auto hide-scrollbar">
         <div className="flex items-center gap-8 border-b border-slate-200/50 min-w-max pb-2">
           {TABS.map(tab => (
             <button
               key={tab}
               onClick={() => setCurrentTab(tab)}
               className={\`relative px-1 pb-4 text-sm font-medium transition-colors \${currentTab === tab ? "text-indigo-600" : "text-slate-500 hover:text-slate-800"}\`}
             >
               {tab}
               {currentTab === tab && (
                 <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full shadow-sm"></span>
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
                    <div className="w-20 h-20 mb-6 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                      <BookOpen size={32} strokeWidth={1.5}/>
                    </div>
                    <h3 className="text-lg font-medium text-slate-800 mb-2">Belum Terdapat Karya</h3>
                    <p className="text-slate-500 font-light text-sm max-w-sm mb-6">Kanvas Anda masih kosong. Mulai jelajahi imajinasi dan ciptakan karya pertama Anda.</p>
                    <button className="px-6 py-3 bg-white border border-slate-200/80 shadow-sm rounded-xl text-sm font-medium text-slate-700 hover:text-indigo-600 hover:border-indigo-100 transition-all flex items-center gap-2">
                       <Plus size={16}/> Tulis Cerita Baru
                    </button>
                 </div>
              ) : (
                 <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {/* Visualisasi Karya: 9:16 Aspect Ratio and Grid */}
                    {myNovels.map(novel => (
                       <div key={novel.id} className="group relative transition-transform duration-500 hover:-translate-y-2 cursor-pointer">
                          <div className="w-full aspect-[9/16] rounded-2xl overflow-hidden bg-slate-100 shadow-sm group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all relative">
                             {novel.coverUrl ? (
                               <img src={novel.coverUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={novel.title} />
                             ) : (
                               <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-50/50 to-slate-100 text-slate-400 font-light px-4 text-center">
                                 {novel.title}
                               </div>
                             )}
                             <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                                <button className="w-full py-2 bg-white/20 backdrop-blur top-button text-white text-xs font-medium rounded-lg mb-2 hover:bg-white/30 transition">Edit Karya</button>
                             </div>
                             {/* AI Checked or Status Badge */}
                             <div className="absolute top-3 right-3">
                                <span className="flex items-center gap-1 px-2.5 py-1 bg-white/80 backdrop-blur-md rounded-full shadow-sm text-[9px] uppercase tracking-widest font-bold text-slate-700">
                                  <Check size={10} className="text-emerald-500"/> Ok
                                </span>
                             </div>
                          </div>
                          <div className="mt-4 px-1">
                            <h4 className="text-[15px] font-medium text-slate-800 leading-tight mb-1 group-hover:text-indigo-600 transition-colors line-clamp-2">{novel.title}</h4>
                            <div className="flex items-center gap-3 text-xs text-slate-400 font-light mt-2">
                               <span className="flex items-center gap-1.5"><Eye size={14} strokeWidth={1.5}/> {(novel.views || 0).toLocaleString()}</span>
                               <span className="flex items-center gap-1.5"><Star size={14} strokeWidth={1.5}/> {novel.rating || "N/A"}</span>
                            </div>
                          </div>
                       </div>
                    ))}
                    
                    {/* Add new card */}
                    <div className="w-full aspect-[9/16] rounded-2xl border-2 border-dashed border-slate-200/60 bg-slate-50/30 flex flex-col items-center justify-center text-slate-400 hover:text-indigo-500 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all cursor-pointer">
                       <Plus size={32} strokeWidth={1} className="mb-3"/>
                       <span className="text-sm font-medium">Buat Baru</span>
                    </div>
                 </div>
              )}
           </div>
        )}

        {currentTab === "Library" && (
           <div className="animate-in fade-in duration-500 py-10 text-center text-slate-500 font-light">
               <div className="w-16 h-16 mx-auto mb-6 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300">
                 <Lock size={24} strokeWidth={1.5} />
               </div>
               Fitur koleksi perpustakaan pribadi masih dalam pengembangan.
           </div>
        )}

        {currentTab === "Informasi Akun" && (
           <div className="animate-in fade-in duration-500 grid md:grid-cols-2 gap-8 lg:gap-12 pb-10">
              
              {/* Profile Config */}
              <div className="bg-white/40 backdrop-blur-md border border-white/60 p-8 rounded-[2rem] shadow-[0_4px_40px_rgba(0,0,0,0.02)]">
                <h3 className="text-lg font-medium text-slate-800 mb-6 flex items-center gap-3">
                  <User size={20} className="text-indigo-500" strokeWidth={1.5}/> Pengaturan Profil
                </h3>
                
                <form onSubmit={handleUpdateProfile} className="space-y-5">
                   <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Pen Name</label>
                      <input 
                        type="text" 
                        value={penName} 
                        onChange={e => setPenName(e.target.value)} 
                        className="w-full bg-white/50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/50 shadow-sm transition-all"
                      />
                   </div>
                   <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Bio Singkat</label>
                      <textarea 
                        value={bio} 
                        onChange={e => setBio(e.target.value)} 
                        rows={3}
                        className="w-full bg-white/50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/50 shadow-sm transition-all resize-none"
                      />
                   </div>
                   <button type="submit" disabled={submitting} className="w-full bg-slate-900 text-white rounded-xl py-3.5 text-sm font-medium hover:bg-slate-800 transition shadow-md disabled:opacity-50">
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

                   <div className="flex items-center justify-between p-5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100/50 rounded-2xl mb-6">
                      <div>
                         <p className="text-xs font-semibold text-emerald-600/70 uppercase tracking-widest mb-1">Saldo Revenue</p>
                         <p className="text-2xl font-light text-emerald-800">Rp {(wallet?.revenueExp || 0).toLocaleString('id-ID')}</p>
                      </div>
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-emerald-500 shadow-sm">
                         <CoinsIcon />
                      </div>
                   </div>

                   <button className="w-full py-3.5 bg-white border border-slate-200 rounded-xl text-slate-700 text-sm font-medium hover:shadow-sm hover:border-slate-300 transition-all">
                     Ajukan Penarikan Dana
                   </button>
                 </div>

                 <div className="bg-white/40 backdrop-blur-md border border-white/60 p-8 rounded-[2rem] shadow-[0_4px_40px_rgba(0,0,0,0.02)]">
                   <h3 className="text-lg font-medium text-slate-800 mb-6 flex items-center gap-3 text-rose-600">
                     <LockKeyhole size={20} strokeWidth={1.5}/> Keamanan Auth
                   </h3>
                   <div className="space-y-4">
                      <button className="w-full flex items-center justify-between py-3.5 px-4 bg-white border border-slate-200 rounded-xl text-slate-700 text-sm font-medium hover:shadow-sm transition-all">
                        Ubah Kata Sandi <ChevronRight size={16} className="text-slate-400"/>
                      </button>
                      {onLogout && (
                        <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-rose-50/50 border border-rose-100 text-rose-600 hover:bg-rose-50 rounded-xl text-sm font-medium hover:shadow-sm transition-all">
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
`;

fs.writeFileSync('./components/ProfileTab.tsx', topLogic + newUI);
