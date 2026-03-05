"use client";

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import InkButton from '../components/InkButton';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// --- GÉNÉRATEUR DE TRANCHES DE LIVRES ---
const getBookSpineStyle = (id: string) => {
  const charCode = id.charCodeAt(0) + id.charCodeAt(id.length - 1) + id.charCodeAt(id.length / 2);
  const heights = ['h-48', 'h-52', 'h-56', 'h-60'];
  const widths = ['w-10', 'w-12', 'w-14', 'w-16'];
  const colors = [
    'bg-red-900 text-red-100', 'bg-blue-900 text-blue-100', 'bg-emerald-900 text-emerald-100', 
    'bg-stone-900 text-stone-100', 'bg-amber-900 text-amber-100', 'bg-purple-900 text-purple-100',
    'bg-[#FAFAFA] text-stone-900 border-x-2 border-stone-900'
  ];

  return {
    height: heights[charCode % heights.length],
    width: widths[charCode % widths.length],
    color: colors[charCode % colors.length]
  };
};

// --- PALETTE DE COULEURS BRUTALISTES ---
const brutalistColors = [
    "#F4F3EE", "#1c1917", "#2e3e34", "#422828", "#343f55", "#e8dfd2", "#dbdbdb", "#ff4242", "#ffa01c", "#e2ff42"
];

export default function LibraryPage() {
  const [myBooks, setMyBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // États de l'animation de sortie du livre
  const [selectedBook, setSelectedBook] = useState<any | null>(null);
  const [bookState, setBookState] = useState<'idle' | 'flying' | 'open'>('idle');
  const [originTransform, setOriginTransform] = useState("translate(0px, 0px) scale(0.1)");
  
  // Customisation
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState({ shelf_style: 'minimalist', bg_color: '#F4F3EE', font_style: 'sans', title_color: '#1c1917' });
  const [userPseudo, setUserPseudo] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    setUserPseudo(user.user_metadata?.pseudo || 'Membre');

    const { data: books } = await supabase.from('user_books').select('*').eq('user_id', user.id).order('added_at', { ascending: false });
    const { data: userSettings } = await supabase.from('library_settings').select('*').eq('user_id', user.id).single();

    if (books) setMyBooks(books);
    if (userSettings) setSettings({ ...settings, ...userSettings });
    setLoading(false);
  };

  const saveSettings = async (newSettings: any) => {
    setSettings(newSettings);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        await supabase.from('library_settings').upsert({ user_id: user.id, ...newSettings });
    }
  };

  // --- LOGIQUE D'ANIMATION 3D (Calcule la position du clic !) ---
  const handleOpenBook = (e: React.MouseEvent, book: any) => {
    // 1. On calcule exactement où se trouve le livre sur l'écran
    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2 - window.innerWidth / 2;
    const y = rect.top + rect.height / 2 - window.innerHeight / 2;
    
    setOriginTransform(`translate(${x}px, ${y}px) scale(0.15)`);
    setSelectedBook(book);
    setBookState('idle'); // Le livre apparait sur l'étagère

    // 2. Il s'envole vers le centre
    setTimeout(() => {
      setBookState('flying');
      // 3. Il s'ouvre magiquement
      setTimeout(() => {
        setBookState('open');
      }, 500);
    }, 50);
  };

  const handleCloseBook = () => {
    setBookState('flying'); // Le livre se referme
    setTimeout(() => {
      setBookState('idle'); // Il retourne dans son trou sur l'étagère
      setTimeout(() => {
        setSelectedBook(null); // Il disparait pour laisser place au livre de l'étagère
      }, 500); 
    }, 500);
  };

  // --- ACTIONS SUR LE LIVRE ---
  const handleUpdateBook = async (id: string, updates: any) => {
    const { error } = await supabase.from('user_books').update(updates).eq('id', id);
    if (!error) {
      setMyBooks(myBooks.map(book => book.id === id ? { ...book, ...updates } : book));
      setSelectedBook({ ...selectedBook, ...updates });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Retirer ce livre de l'étagère ?")) return;
    const { error } = await supabase.from('user_books').delete().eq('id', id);
    if (!error) {
      setMyBooks(myBooks.filter(book => book.id !== id));
      handleCloseBook();
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#F4F3EE]"><div className="w-8 h-8 border-4 border-stone-900 border-t-transparent rounded-full animate-spin"></div></div>;

  const shelves = [];
  for (let i = 0; i < myBooks.length; i += 12) shelves.push(myBooks.slice(i, i + 12));

  const shelfCSS = settings.shelf_style === 'wood' ? 'border-b-[16px] border-[#8B5A2B] shadow-[0_12px_15px_-3px_rgba(0,0,0,0.3)]' : settings.shelf_style === 'metal' ? 'border-b-[12px] border-stone-400 shadow-[0_12px_15px_-3px_rgba(0,0,0,0.4)]' : 'border-b-[6px] border-stone-900 shadow-[0_8px_0px_0px_rgba(28,25,23,0.1)]';
  const fontCSS = settings.font_style === 'serif' ? 'font-serif' : settings.font_style === 'mono' ? 'font-mono' : 'font-sans';

  return (
    <main className="min-h-screen pt-32 pb-32 px-4 sm:px-6 transition-colors duration-500 selection:bg-stone-900 selection:text-white" style={{ backgroundColor: settings.bg_color }}>
      <div className="max-w-6xl mx-auto">
        
        {/* EN-TÊTE ET BOUTON DE CUSTOMISATION */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-6">
          <div className="flex flex-col items-start w-full md:w-auto text-center md:text-left">
            <h1 
              className={`text-4xl sm:text-5xl md:text-6xl font-black tracking-tight uppercase leading-none break-words w-full`}
              style={{ color: settings.title_color }}
            >
              Bibliothèque de {userPseudo}.
            </h1>
          </div>
          <button onClick={() => setIsSettingsOpen(!isSettingsOpen)} className={`paper-card paper-btn px-6 py-3 text-xs font-black uppercase tracking-widest flex items-center gap-2 ${settings.bg_color === '#1c1917' ? 'bg-[#F4F3EE] text-stone-900' : 'bg-stone-900 text-[#F4F3EE]'}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            Customisation
          </button>
        </div>

        {/* PANNEAU DE CUSTOMISATION */}
        {isSettingsOpen && (
          <div className="paper-card bg-[#FAFAFA] text-stone-900 p-6 md:p-8 mb-16 animate-in slide-in-from-top-4 relative z-20">
            <h2 className="text-sm font-black uppercase tracking-widest border-b-2 border-stone-900 pb-2 mb-6">Atelier de Décoration</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-stone-500 mb-3">Mur (Couleur de fond)</label>
                <div className="grid grid-cols-6 gap-3">
                  {brutalistColors.map(color => (
                    <button key={color} onClick={() => saveSettings({...settings, bg_color: color})} className={`w-8 h-8 md:w-10 md:h-10 paper-card rounded-none ${settings.bg_color === color ? 'ring-4 ring-offset-2 ring-stone-900' : ''}`} style={{ backgroundColor: color }}></button>
                  ))}
                  <input type="color" value={settings.bg_color} onChange={(e) => saveSettings({...settings, bg_color: e.target.value})} className="w-8 h-8 md:w-10 md:h-10 paper-card rounded-none cursor-pointer p-0 border-none outline-none appearance-none" title="Couleur sur-mesure" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-stone-500 mb-3">Couleur Titre</label>
                <div className="grid grid-cols-6 gap-3">
                  {brutalistColors.map(color => (
                    <button key={color} onClick={() => saveSettings({...settings, title_color: color})} className={`w-8 h-8 md:w-10 md:h-10 paper-card rounded-none ${settings.title_color === color ? 'ring-4 ring-offset-2 ring-stone-900' : ''}`} style={{ backgroundColor: color }}></button>
                  ))}
                  <input type="color" value={settings.title_color} onChange={(e) => saveSettings({...settings, title_color: e.target.value})} className="w-8 h-8 md:w-10 md:h-10 paper-card rounded-none cursor-pointer p-0 border-none outline-none appearance-none" title="Couleur sur-mesure" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-stone-500 mb-3">Matériau de l'Étagère</label>
                <select value={settings.shelf_style} onChange={(e) => saveSettings({...settings, shelf_style: e.target.value})} className="w-full bg-[#F4F3EE] border-2 border-stone-900 p-3 text-xs font-black uppercase tracking-widest outline-none cursor-pointer">
                  <option value="minimalist">Ligne Noire (Minimaliste)</option>
                  <option value="wood">Bois de Chêne massif</option>
                  <option value="metal">Acier Industriel</option>
                </select>
                <label className="block text-[10px] font-black uppercase tracking-widest text-stone-500 mt-4 mb-3">Typographie des Tranches</label>
                <select value={settings.font_style} onChange={(e) => saveSettings({...settings, font_style: e.target.value})} className="w-full bg-[#F4F3EE] border-2 border-stone-900 p-3 text-xs font-black uppercase tracking-widest outline-none cursor-pointer">
                  <option value="sans">Moderne (Sans-Serif)</option>
                  <option value="serif">Classique (Serif)</option>
                  <option value="mono">Machine à écrire (Mono)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* LA BIBLIOTHÈQUE */}
        {myBooks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 paper-card bg-[#FAFAFA] text-center p-6 border-dashed border-4 border-stone-300">
            <span className="text-sm font-bold text-stone-500 mb-8 uppercase tracking-widest">Vos étagères sont vides.</span>
            <InkButton href="/search" isDark={true} className="px-8 py-4 text-xs font-black uppercase tracking-widest">Feuilleter l'Index</InkButton>
          </div>
        ) : (
          <div className="flex flex-col gap-12 md:gap-24 mt-12">
            {shelves.map((shelf, shelfIndex) => (
              <div key={shelfIndex} className="relative w-full px-4 md:px-12">
                <div className={`absolute bottom-0 left-0 right-0 z-0 ${shelfCSS}`}></div>
                <div className={`absolute bottom-0 left-[-10px] w-2 h-12 bg-black/20 skew-y-[45deg] z-0 ${settings.shelf_style === 'minimalist' && 'hidden'}`}></div>
                <div className={`absolute bottom-0 right-[-10px] w-2 h-12 bg-black/20 skew-y-[-45deg] z-0 ${settings.shelf_style === 'minimalist' && 'hidden'}`}></div>

                <div className="relative z-10 flex items-end justify-center sm:justify-start gap-[2px] sm:gap-1 px-4 min-h-[16rem]">
                  {shelf.map((book) => {
                    const style = getBookSpineStyle(book.id);
                    // On rend le livre invisible sur l'étagère s'il est actuellement en train de voler
                    const isFlyingOut = selectedBook?.id === book.id && bookState !== 'idle';
                    
                    return (
                      <div 
                        key={book.id} 
                        onClick={(e) => handleOpenBook(e, book)} 
                        className={`${style.height} ${style.width} ${style.color} ${fontCSS} paper-card flex flex-col justify-between items-center py-4 cursor-pointer hover:-translate-y-4 transition-all duration-300 group ${isFlyingOut ? 'opacity-0' : 'opacity-100 hover:z-20'}`}
                        title={book.title}
                      >
                        <div className="w-full h-2 border-b-2 border-black/20 opacity-50 absolute top-2"></div>
                        <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-center writing-vertical-rl rotate-180 line-clamp-1 w-full px-1 overflow-hidden" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                          {book.title}
                        </span>
                        <span className="text-[8px] font-bold uppercase tracking-widest text-center writing-vertical-rl rotate-180 opacity-70 mb-2" style={{ writingMode: 'vertical-rl' }}>
                          {book.author?.split(' ').pop()}
                        </span>
                        {book.status === 'read' && <div className="absolute bottom-2 w-2 h-2 rounded-full bg-emerald-400 border border-black/50 shadow-sm"></div>}
                        {book.status === 'reading' && <div className="absolute bottom-2 w-2 h-2 rounded-full bg-amber-400 border border-black/50 shadow-sm animate-pulse"></div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- L'ANIMATION DU LIVRE (MODALE) --- */}
      {selectedBook && (
        <div className={`fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-stone-900/80 backdrop-blur-sm p-0 md:p-8 transition-opacity duration-500 ${bookState !== 'idle' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="absolute inset-0" onClick={handleCloseBook}></div>

          {/* 1. VERSION MOBILE RESPONSIVE (Glisse du bas, sans 3D complexe) */}
          <div className={`relative w-full h-[85dvh] max-w-md mx-auto paper-card bg-[#FAFAFA] flex flex-col overflow-hidden md:hidden transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${bookState === 'open' ? 'translate-y-0' : 'translate-y-full'}`}>
            <button onClick={handleCloseBook} className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center paper-card paper-btn bg-[#F4F3EE] text-stone-900 z-50">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            <div className="flex-1 overflow-y-auto flex flex-col p-6">
              <h2 className="text-2xl font-black text-stone-900 mb-2 uppercase pr-8 mt-4 leading-none">{selectedBook.title}</h2>
              <p className="text-xs font-bold text-stone-700 mb-6 border-b-2 border-stone-900 pb-4">{selectedBook.author}</p>
              
              {selectedBook.cover_url ? (
                <img src={selectedBook.cover_url} alt="Couverture" className="w-auto max-h-48 object-contain paper-card p-1 bg-white shadow-lg mb-8 mx-auto" />
              ) : (
                <div className="w-32 h-48 paper-card bg-stone-200 flex items-center justify-center text-xs font-black uppercase tracking-widest text-stone-600 mb-8 mx-auto">Sans Image</div>
              )}

              <select value={selectedBook.status} onChange={(e) => handleUpdateBook(selectedBook.id, { status: e.target.value })} className="mb-6 appearance-none paper-card bg-[#F4F3EE] text-stone-900 text-xs font-black uppercase tracking-widest px-4 py-3 outline-none cursor-pointer focus:translate-x-[2px] focus:translate-y-[2px] transition-all">
                <option value="to_read">À LIRE</option>
                <option value="reading">EN COURS</option>
                <option value="read">TERMINÉ</option>
              </select>

              <div className="mb-6 flex gap-2 text-2xl">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} onClick={() => handleUpdateBook(selectedBook.id, { rating: star })} className={`transition-transform duration-200 ${ (selectedBook.rating || 0) >= star ? 'text-stone-900' : 'text-stone-300' }`}>★</button>
                ))}
              </div>

              <textarea placeholder="Notes..." value={selectedBook.notes || ''} onChange={(e) => setSelectedBook({ ...selectedBook, notes: e.target.value })} onBlur={(e) => handleUpdateBook(selectedBook.id, { notes: selectedBook.notes })} className="flex-1 min-h-[120px] text-sm font-medium p-4 bg-[#F4F3EE] paper-card outline-none resize-none text-stone-900 font-serif italic mb-6 focus:translate-x-[2px] focus:translate-y-[2px] transition-all" />
              <button onClick={() => handleDelete(selectedBook.id)} className="paper-card paper-btn bg-red-50 text-red-700 px-6 py-3 text-[10px] font-black uppercase self-end">Déchirer la fiche</button>
            </div>
          </div>


          {/* 2. VERSION ORDINATEUR 3D (Vole depuis l'étagère puis s'ouvre) */}
          <div 
            className={`hidden md:flex relative w-full max-w-4xl h-[600px] perspective-[2000px] transition-transform duration-[500ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]`}
            style={{ transform: bookState === 'idle' ? originTransform : 'translate(0px, 0px) scale(1)' }}
          >
            
            <button onClick={handleCloseBook} className={`absolute -top-4 -right-4 w-12 h-12 flex items-center justify-center paper-card paper-btn bg-[#F4F3EE] text-stone-900 z-[110] transition-opacity duration-500 ${bookState === 'open' ? 'opacity-100 delay-300' : 'opacity-0'}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>

            {/* PAGE DE DROITE (Révélée quand ça s'ouvre) */}
            <div className={`w-1/2 ml-auto bg-[#FAFAFA] paper-card p-10 flex flex-col relative z-10 shadow-2xl overflow-y-auto transition-opacity duration-300 ${bookState === 'open' ? 'opacity-100' : 'opacity-0'}`}>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-500 mb-2">Fiche de Lecture</span>
                <h2 className="text-3xl font-black text-stone-900 mb-2 leading-none uppercase">{selectedBook.title}</h2>
                <p className="text-sm font-bold text-stone-700 mb-8 border-b-2 border-stone-900 pb-4">{selectedBook.author}</p>
                
                <div className="mb-6 flex flex-col gap-4">
                  <select value={selectedBook.status} onChange={(e) => handleUpdateBook(selectedBook.id, { status: e.target.value })} className="appearance-none paper-card bg-[#F4F3EE] text-stone-900 text-[10px] font-black uppercase tracking-widest px-4 py-3 outline-none cursor-pointer focus:shadow-[2px_2px_0px_0px_#1c1917] focus:translate-x-[2px] focus:translate-y-[2px] transition-all">
                    <option value="to_read">À LIRE</option>
                    <option value="reading">EN COURS</option>
                    <option value="read">TERMINÉ</option>
                  </select>
                  <div className="flex items-center justify-between border-t-2 border-stone-200 border-dashed pt-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-500">Note :</label>
                    <div className="flex gap-2 text-2xl">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} onClick={() => handleUpdateBook(selectedBook.id, { rating: star })} className={`transition-transform duration-200 hover:scale-125 ${ (selectedBook.rating || 0) >= star ? 'text-stone-900' : 'text-stone-300' }`}>★</button>
                      ))}
                    </div>
                  </div>
                </div>

                <textarea placeholder="Tapez vos impressions ici..." value={selectedBook.notes || ''} onChange={(e) => setSelectedBook({ ...selectedBook, notes: e.target.value })} onBlur={(e) => handleUpdateBook(selectedBook.id, { notes: selectedBook.notes })} className="flex-1 min-h-[120px] mb-4 text-sm font-medium p-4 bg-[#F4F3EE] paper-card outline-none resize-none text-stone-900 placeholder:text-stone-400 focus:translate-x-[2px] focus:translate-y-[2px] transition-all font-serif italic" />
                <button onClick={() => handleDelete(selectedBook.id)} className="paper-card paper-btn bg-red-50 text-red-700 border-red-900 px-6 py-3 text-[10px] font-black uppercase tracking-widest self-end">Déchirer la fiche</button>
            </div>

            {/* PAGE DE GAUCHE (La couverture du livre qui pivote 3D) */}
            <div
              className="absolute top-0 right-0 w-1/2 h-full z-20 origin-left transition-transform duration-[600ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]"
              style={{ transform: bookState === 'open' ? 'rotateY(-180deg)' : 'rotateY(0deg)', transformStyle: 'preserve-3d' }}
            >
              {/* Devant : La couverture qui vole vers toi */}
              <div 
                className="absolute inset-0 bg-[#F4F3EE] paper-card flex items-center justify-center p-8 cursor-pointer shadow-2xl" 
                style={{ backfaceVisibility: 'hidden' }}
                onClick={handleCloseBook}
              >
                 {selectedBook.cover_url ? (
                  <img src={selectedBook.cover_url} alt="Couverture" className="w-full h-full object-cover paper-card shadow-2xl" />
                ) : (
                  <div className="w-full h-full bg-stone-900 flex flex-col items-center justify-center p-8 text-center text-[#F4F3EE]">
                     <span className="text-3xl font-black uppercase tracking-widest mb-4">{selectedBook.title}</span>
                     <span className="text-sm font-bold uppercase tracking-widest opacity-70">{selectedBook.author}</span>
                  </div>
                )}
              </div>

              {/* Arrière : L'intérieur de la couverture (Visible une fois ouvert, affiche la couverture en grand style galerie) */}
              <div className="absolute inset-0 bg-[#FAFAFA] paper-card flex flex-col items-center justify-center p-8" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                {selectedBook.cover_url ? (
                  <img src={selectedBook.cover_url} alt="Couverture" className="w-auto max-h-[90%] object-contain paper-card p-2 bg-white shadow-2xl" />
                ) : (
                  <div className="w-32 h-48 md:w-56 md:h-80 paper-card bg-stone-200 flex items-center justify-center text-xs font-black uppercase tracking-widest text-stone-600">Sans Image</div>
                )}
                <span className="absolute bottom-4 right-4 text-[10px] font-black uppercase tracking-widest text-stone-400">Archivé sous le N° {selectedBook.id.slice(0,8)}</span>
              </div>
            </div>

          </div>
        </div>
      )}
    </main>
  );
}