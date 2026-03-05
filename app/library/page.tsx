"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import InkButton from '../components/InkButton';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// --- GÉNÉRATEUR DE TRANCHES ---
const getBookSpineStyle = (id: string, title: string) => {
  const charCode = id.charCodeAt(0) + id.charCodeAt(id.length - 1) + id.charCodeAt(id.length / 2);
  const heights = ['h-48', 'h-52', 'h-54', 'h-56', 'h-60'];
  
  // Épaisseur dynamique selon la longueur du TITRE
  const titleLen = title ? title.length : 0;
  let widthClass = 'w-10';
  if (titleLen > 15 && titleLen < 35) widthClass = 'w-12';
  else if (titleLen >= 35 && titleLen < 50) widthClass = 'w-14';
  else if (titleLen >= 50) widthClass = 'w-16';

  const tilts = ['-rotate-2', '-rotate-1', 'rotate-0', 'rotate-0', 'rotate-0', 'rotate-1', 'rotate-2'];
  const tiltClass = tilts[charCode % tilts.length];

  const textures = [
    'bg-gradient-to-r from-red-900 via-red-800 to-red-950 text-red-100 border-x border-red-950/50 shadow-[inset_2px_0_4px_rgba(255,255,255,0.1)]', 
    'bg-gradient-to-r from-blue-900 via-blue-800 to-blue-950 text-blue-100 border-x border-blue-950/50 shadow-[inset_2px_0_4px_rgba(255,255,255,0.1)]', 
    'bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-950 text-emerald-100 border-x border-emerald-950/50 shadow-[inset_2px_0_4px_rgba(255,255,255,0.1)]', 
    'bg-gradient-to-r from-stone-900 via-stone-800 to-stone-950 text-stone-100 border-x border-stone-950/50 shadow-[inset_2px_0_4px_rgba(255,255,255,0.1)]', 
    'bg-gradient-to-r from-amber-900 via-amber-800 to-amber-950 text-amber-100 border-x border-amber-950/50 shadow-[inset_2px_0_4px_rgba(255,255,255,0.1)]', 
    'bg-gradient-to-r from-purple-900 via-purple-800 to-purple-950 text-purple-100 border-x border-purple-950/50 shadow-[inset_2px_0_4px_rgba(255,255,255,0.1)]', 
    'bg-gradient-to-r from-[#FAFAFA] via-[#F4F3EE] to-[#E8E6E1] text-stone-900 border-x border-stone-300 shadow-[inset_2px_0_4px_rgba(255,255,255,0.6)]' 
  ];

  return { height: heights[charCode % heights.length], width: widthClass, color: textures[charCode % textures.length], tilt: tiltClass };
};

const brutalistColors = ["#F4F3EE", "#1c1917", "#2e3e34", "#422828", "#343f55", "#e8dfd2", "#dbdbdb", "#ff4242", "#ffa01c", "#e2ff42"];

const getWallTextureCSS = (texture: string) => {
  if (texture === 'grid') return { backgroundImage: 'linear-gradient(rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.06) 1px, transparent 1px)', backgroundSize: '30px 30px' };
  if (texture === 'wood') return { backgroundImage: 'repeating-linear-gradient(90deg, rgba(0,0,0,0.04) 0px, rgba(0,0,0,0.04) 2px, transparent 2px, transparent 60px)' };
  return {};
};

const shelfDecorations = ['🪴', '🕯️', '💀', '☕', '🕰️', '🏺', '📜', '🖋️'];

export default function LibraryPage() {
  const [myBooks, setMyBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  const [selectedBook, setSelectedBook] = useState<any | null>(null);
  const [bookState, setBookState] = useState<'idle' | 'flying' | 'open'>('idle');
  const [originTransform, setOriginTransform] = useState("translate(0px, 0px) scale(0.1)");
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState({ 
    shelf_style: 'minimalist', bg_color: '#F4F3EE', font_style: 'sans', title_color: '#1c1917', 
    wall_texture: 'none', lighting: 'normal', magic_dust: false, decorations: true 
  });
  const [userPseudo, setUserPseudo] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    setCurrentUser(user);

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
    if (user) await supabase.from('library_settings').upsert({ user_id: user.id, ...newSettings });
  };

  const handleOpenBook = (e: React.MouseEvent, book: any) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2 - window.innerWidth / 2;
    const y = rect.top + rect.height / 2 - window.innerHeight / 2;
    setOriginTransform(`translate(${x}px, ${y}px) scale(0.15)`);
    setSelectedBook(book);
    setBookState('idle'); 
    setTimeout(() => {
      setBookState('flying');
      setTimeout(() => { setBookState('open'); }, 500);
    }, 50);
  };

  const handleCloseBook = () => {
    setBookState('flying');
    setTimeout(() => {
      setBookState('idle'); 
      setTimeout(() => { setSelectedBook(null); }, 500); 
    }, 500);
  };

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

  if (!currentUser) return (
    <div className="min-h-screen bg-[#F4F3EE] flex flex-col items-center justify-center text-center px-4 sm:px-6 font-sans selection:bg-stone-900 selection:text-[#F4F3EE]">
      <div className="paper-card px-4 py-2 mb-6 -rotate-2 inline-block bg-stone-900 text-[#F4F3EE]">
        <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.4em]">Zone Privée</span>
      </div>
      <h1 className="text-5xl md:text-7xl font-black tracking-tight text-stone-900 mb-6 uppercase">
        Accès Refusé.
      </h1>
      <p className="text-sm font-bold text-stone-700 max-w-md mx-auto mb-8">
        La porte de la bibliothèque est verrouillée. Vous devez vous connecter pour y entrer.
      </p>
      <InkButton href="/" isDark={true} className="px-8 py-4 text-xs font-black uppercase tracking-widest">
        Retourner à l'accueil
      </InkButton>
    </div>
  );

  const shelves = [];
  for (let i = 0; i < myBooks.length; i += 12) shelves.push(myBooks.slice(i, i + 12));

  const shelfCSS = settings.shelf_style === 'wood' ? 'border-b-[16px] border-[#8B5A2B] shadow-[0_12px_15px_-3px_rgba(0,0,0,0.3)]' : settings.shelf_style === 'metal' ? 'border-b-[12px] border-stone-400 shadow-[0_12px_15px_-3px_rgba(0,0,0,0.4)]' : 'border-b-[6px] border-stone-900 shadow-[0_8px_0px_0px_rgba(28,25,23,0.1)]';
  const fontCSS = settings.font_style === 'serif' ? 'font-serif' : settings.font_style === 'mono' ? 'font-mono' : 'font-sans';

  return (
    <main className="min-h-screen pt-32 pb-32 px-4 sm:px-6 transition-colors duration-700 selection:bg-stone-900 selection:text-white relative overflow-hidden" style={{ backgroundColor: settings.bg_color }}>
      
      <div className="absolute inset-0 z-0 pointer-events-none opacity-60 transition-opacity duration-700" style={getWallTextureCSS(settings.wall_texture)}></div>
      
      {settings.lighting === 'dramatic' && (
        <div className="absolute inset-0 z-0 pointer-events-none transition-opacity duration-1000 bg-[radial-gradient(circle_at_50%_15%,_transparent_10%,_rgba(0,0,0,0.7)_100%)] mix-blend-multiply"></div>
      )}

      {settings.magic_dust && (
        <>
          <style dangerouslySetInnerHTML={{__html: `@keyframes floatDust { 0% { background-position: 0px 0px; } 100% { background-position: 100px -400px; } } .magic-dust { background-image: radial-gradient(circle, rgba(200, 200, 200, 0.25) 2px, transparent 2.5px), radial-gradient(circle, rgba(200, 200, 200, 0.15) 1px, transparent 1.5px); background-size: 100px 100px, 60px 60px; background-position: 0 0, 30px 30px; animation: floatDust 15s linear infinite; pointer-events: none; mix-blend-mode: screen; }`}} />
          <div className="absolute inset-0 z-[5] magic-dust opacity-60"></div>
        </>
      )}

      <div className="max-w-6xl mx-auto relative z-10">
        
        <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-6">
          <div className="flex flex-col items-start w-full md:w-auto text-center md:text-left">
            <h1 className={`text-4xl sm:text-5xl md:text-6xl font-black tracking-tight uppercase leading-none break-words w-full transition-colors duration-500`} style={{ color: settings.title_color }}>
              Bibliothèque de {userPseudo}.
            </h1>
          </div>
          <button onClick={() => setIsSettingsOpen(!isSettingsOpen)} className={`paper-card paper-btn px-6 py-3 text-xs font-black uppercase tracking-widest flex items-center gap-2 ${settings.bg_color === '#1c1917' ? 'bg-[#F4F3EE] text-stone-900' : 'bg-stone-900 text-[#F4F3EE]'}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path></svg>
            Customisation
          </button>
        </div>

        {isSettingsOpen && (
          <div className="paper-card bg-[#FAFAFA] text-stone-900 p-6 md:p-8 mb-16 animate-in slide-in-from-top-4 relative z-50 shadow-2xl">
            <h2 className="text-sm font-black uppercase tracking-widest border-b-2 border-stone-900 pb-2 mb-6">Atelier de Décoration</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-stone-500 mb-3">Couleur du Mur</label>
                  <div className="flex flex-wrap gap-2">
                    {brutalistColors.slice(0, 5).map(color => (
                      <button key={color} onClick={() => saveSettings({...settings, bg_color: color})} className={`w-8 h-8 paper-card rounded-none ${settings.bg_color === color ? 'ring-4 ring-offset-2 ring-stone-900' : ''}`} style={{ backgroundColor: color }}></button>
                    ))}
                    <input type="color" value={settings.bg_color} onChange={(e) => saveSettings({...settings, bg_color: e.target.value})} className="w-8 h-8 paper-card rounded-none cursor-pointer p-0 border-none outline-none appearance-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-stone-500 mb-3">Couleur du Titre</label>
                  <div className="flex flex-wrap gap-2">
                    {brutalistColors.slice(0, 5).map(color => (
                      <button key={color} onClick={() => saveSettings({...settings, title_color: color})} className={`w-8 h-8 paper-card rounded-none ${settings.title_color === color ? 'ring-4 ring-offset-2 ring-stone-900' : ''}`} style={{ backgroundColor: color }}></button>
                    ))}
                    <input type="color" value={settings.title_color} onChange={(e) => saveSettings({...settings, title_color: e.target.value})} className="w-8 h-8 paper-card rounded-none cursor-pointer p-0 border-none outline-none appearance-none" />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-stone-500 mb-3">Revêtement Mural</label>
                  <select value={settings.wall_texture} onChange={(e) => saveSettings({...settings, wall_texture: e.target.value})} className="w-full bg-[#F4F3EE] border-2 border-stone-900 p-3 text-xs font-black uppercase tracking-widest outline-none cursor-pointer">
                    <option value="none">Peinture Lisse</option>
                    <option value="grid">Cahier Quadrillé</option>
                    <option value="wood">Lambris Bois</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-stone-500 mb-3">Matériau de l'Étagère</label>
                  <select value={settings.shelf_style} onChange={(e) => saveSettings({...settings, shelf_style: e.target.value})} className="w-full bg-[#F4F3EE] border-2 border-stone-900 p-3 text-xs font-black uppercase tracking-widest outline-none cursor-pointer">
                    <option value="minimalist">Ligne Noire (Minimaliste)</option>
                    <option value="wood">Bois de Chêne massif</option>
                    <option value="metal">Acier Industriel</option>
                  </select>
                </div>
              </div>

              <div className="space-y-6">
                 <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-stone-500 mb-3">Effets Visuels & Accessoires</label>
                  <div className="flex flex-col gap-2">
                    <button onClick={() => saveSettings({...settings, lighting: settings.lighting === 'normal' ? 'dramatic' : 'normal'})} className={`w-full border-2 border-stone-900 p-2 text-[10px] font-black uppercase tracking-widest transition-colors ${settings.lighting === 'dramatic' ? 'bg-stone-900 text-[#F4F3EE]' : 'bg-[#F4F3EE] text-stone-900'}`}>
                      {settings.lighting === 'dramatic' ? 'Spotlight ON 🔦' : 'Spotlight OFF'}
                    </button>
                    <button onClick={() => saveSettings({...settings, magic_dust: !settings.magic_dust})} className={`w-full border-2 border-stone-900 p-2 text-[10px] font-black uppercase tracking-widest transition-colors ${settings.magic_dust ? 'bg-stone-900 text-[#F4F3EE]' : 'bg-[#F4F3EE] text-stone-900'}`}>
                      {settings.magic_dust ? 'Poussière ON ✨' : 'Poussière OFF'}
                    </button>
                    <button onClick={() => saveSettings({...settings, decorations: !settings.decorations})} className={`w-full border-2 border-stone-900 p-2 text-[10px] font-black uppercase tracking-widest transition-colors ${settings.decorations ? 'bg-stone-900 text-[#F4F3EE]' : 'bg-[#F4F3EE] text-stone-900'}`}>
                      {settings.decorations ? 'Décorations ON 🪴' : 'Décorations OFF'}
                    </button>
                  </div>
                </div>
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
          <div className="flex flex-col gap-12 md:gap-24 mt-12 relative z-10">
            {shelves.map((shelf, shelfIndex) => {
              const decorationItem = shelfDecorations[shelfIndex % shelfDecorations.length];

              return (
                <div key={shelfIndex} className="relative w-full px-4 md:px-12">
                  <div className={`absolute bottom-0 left-0 right-0 z-0 ${shelfCSS}`}></div>
                  <div className={`absolute bottom-0 left-[-10px] w-2 h-12 bg-black/20 skew-y-[45deg] z-0 ${settings.shelf_style === 'minimalist' && 'hidden'}`}></div>
                  <div className={`absolute bottom-0 right-[-10px] w-2 h-12 bg-black/20 skew-y-[-45deg] z-0 ${settings.shelf_style === 'minimalist' && 'hidden'}`}></div>

                  <div className="relative z-10 flex items-end justify-center sm:justify-start gap-[2px] sm:gap-1 px-4 min-h-[18rem] pt-6">
                    {shelf.map((book, bookIndex) => {
                      const style = getBookSpineStyle(book.id, book.title); // Basé sur le titre
                      const isFlyingOut = selectedBook?.id === book.id && bookState !== 'idle';
                      
                      return (
                        <div key={`container-${book.id}`} className="flex items-end gap-[2px] sm:gap-1">
                          
                          {settings.decorations && bookIndex === 3 && (
                            <div className="text-3xl md:text-5xl self-end mb-1 mx-2 md:mx-4 opacity-90 drop-shadow-xl cursor-default hover:scale-110 transition-transform origin-bottom" title="Objet Décoratif">
                              {decorationItem}
                            </div>
                          )}

                          <div 
                            onClick={(e) => handleOpenBook(e, book)} 
                            className={`${style.height} ${style.width} ${style.color} ${style.tilt} ${fontCSS} flex flex-col justify-between items-center py-4 cursor-pointer hover:-translate-y-4 transition-all duration-300 group relative ${isFlyingOut ? 'opacity-0' : 'opacity-100 hover:z-20'}`}
                          >
                             {/* ÉTIQUETTE FLOTTANTE AU HOVER POUR LES TITRES */}
                             <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-stone-900 text-[#F4F3EE] text-[10px] font-sans font-bold px-3 py-1.5 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-[60] shadow-xl rounded-sm">
                              {book.title}
                            </div>

                            <div className="w-full h-2 border-b-2 border-black/20 opacity-40 absolute top-2"></div>
                            
                            {book.status === 'reading' && (
                              <div className="absolute -top-3 right-2 w-2 md:w-3 h-8 md:h-10 bg-amber-500 shadow-sm z-10" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)' }}></div>
                            )}

                            <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-center writing-vertical-rl rotate-180 line-clamp-1 w-full px-1 overflow-hidden" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                              {book.title}
                            </span>
                            
                            <span className="text-[8px] font-bold uppercase tracking-widest text-center writing-vertical-rl rotate-180 opacity-70 mb-2" style={{ writingMode: 'vertical-rl' }}>
                              {book.author?.split(' ').pop()}
                            </span>

                            {book.status === 'read' && <div className="absolute bottom-2 w-1.5 h-1.5 rounded-full bg-stone-900/50"></div>}
                          </div>

                        </div>
                      );
                    })}

                    {settings.decorations && shelf.length <= 3 && (
                      <div className="text-3xl md:text-5xl self-end mb-1 mx-2 md:mx-4 opacity-90 drop-shadow-xl cursor-default hover:scale-110 transition-transform origin-bottom">
                        {decorationItem}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* --- L'ANIMATION DU LIVRE 3D UNIVERSELLE --- */}
      {selectedBook && (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/80 backdrop-blur-sm p-2 md:p-8 transition-opacity duration-500 ${bookState !== 'idle' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="absolute inset-0" onClick={handleCloseBook}></div>

          <div 
            className={`flex relative w-[95vw] md:w-full max-w-4xl h-[70dvh] md:h-[600px] perspective-[2000px] transition-transform duration-[500ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]`}
            style={{ transform: bookState === 'idle' ? originTransform : 'translate(0px, 0px) scale(1)' }}
          >
            
            <button onClick={handleCloseBook} className={`absolute -top-3 -right-3 md:-top-4 md:-right-4 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center paper-card paper-btn bg-[#F4F3EE] text-stone-900 z-[110] transition-opacity duration-500 ${bookState === 'open' ? 'opacity-100 delay-300' : 'opacity-0'}`}>
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>

            {/* PAGE DE DROITE (Notes) */}
            <div className={`w-1/2 ml-auto bg-[#FAFAFA] paper-card p-4 md:p-10 flex flex-col relative z-10 shadow-2xl overflow-y-auto transition-opacity duration-300 ${bookState === 'open' ? 'opacity-100' : 'opacity-0'}`}>
                <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-stone-500 mb-1 md:mb-2 line-clamp-1">Fiche de Lecture</span>
                <h2 className="text-lg md:text-3xl font-black text-stone-900 mb-1 md:mb-2 leading-none uppercase line-clamp-3">{selectedBook.title}</h2>
                <p className="text-[10px] md:text-sm font-bold text-stone-700 mb-3 md:mb-8 border-b-2 border-stone-900 pb-2 md:pb-4 line-clamp-1">{selectedBook.author}</p>
                
                <div className="mb-3 md:mb-6 flex flex-col gap-2 md:gap-4">
                  <select value={selectedBook.status} onChange={(e) => handleUpdateBook(selectedBook.id, { status: e.target.value })} className="appearance-none paper-card bg-[#F4F3EE] text-stone-900 text-[8px] md:text-[10px] font-black uppercase tracking-widest px-2 py-2 md:px-4 md:py-3 outline-none cursor-pointer focus:shadow-[2px_2px_0px_0px_#1c1917] focus:translate-x-[2px] focus:translate-y-[2px] transition-all">
                    <option value="to_read">À LIRE</option>
                    <option value="reading">EN COURS</option>
                    <option value="read">TERMINÉ</option>
                  </select>
                  <div className="flex flex-col md:flex-row md:items-center justify-between border-t-2 border-stone-200 border-dashed pt-2 md:pt-4">
                    <label className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-stone-500 mb-1 md:mb-0">Note :</label>
                    <div className="flex gap-1 md:gap-2 text-lg md:text-2xl">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} onClick={() => handleUpdateBook(selectedBook.id, { rating: star })} className={`transition-transform duration-200 hover:scale-125 ${ (selectedBook.rating || 0) >= star ? 'text-stone-900' : 'text-stone-300' }`}>★</button>
                      ))}
                    </div>
                  </div>
                </div>

                <textarea placeholder="Impressions..." value={selectedBook.notes || ''} onChange={(e) => setSelectedBook({ ...selectedBook, notes: e.target.value })} onBlur={(e) => handleUpdateBook(selectedBook.id, { notes: selectedBook.notes })} className="flex-1 min-h-[80px] md:min-h-[120px] mb-3 md:mb-4 text-xs md:text-sm font-medium p-2 md:p-4 bg-[#F4F3EE] paper-card outline-none resize-none text-stone-900 placeholder:text-stone-400 focus:translate-x-[2px] focus:translate-y-[2px] transition-all font-serif italic" />
                <button onClick={() => handleDelete(selectedBook.id)} className="paper-card paper-btn bg-red-50 text-red-700 border-red-900 px-3 py-2 md:px-6 md:py-3 text-[8px] md:text-[10px] font-black uppercase tracking-widest self-end">Déchirer</button>
            </div>

            {/* PAGE DE GAUCHE (La couverture du livre qui pivote 3D) */}
            <div
              className="absolute top-0 right-0 w-1/2 h-full z-20 origin-left transition-transform duration-[600ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]"
              style={{ transform: bookState === 'open' ? 'rotateY(-180deg)' : 'rotateY(0deg)', transformStyle: 'preserve-3d' }}
            >
              {/* Le bug de transparence réglé ici : opacity-0 quand ouvert */}
              <div 
                className={`absolute inset-0 bg-[#F4F3EE] flex flex-col items-center justify-between cursor-pointer transition-opacity duration-300 ${bookState === 'open' ? 'opacity-0' : 'opacity-100'}`} 
                style={{ backfaceVisibility: 'hidden' }}
                onClick={handleCloseBook}
              >
                  <div className="w-12 md:w-20 h-full bg-stone-900 paper-card text-[#F4F3EE] flex flex-col items-center py-4 md:py-6 shadow-xl mx-auto border-x border-stone-800">
                      <div className="w-full h-2 border-b-2 border-white/20 opacity-50 absolute top-2"></div>
                      <span className="text-sm md:text-xl font-black uppercase tracking-widest text-center writing-vertical-rl rotate-180 line-clamp-1 w-full px-1 overflow-hidden" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                          {selectedBook.title}
                      </span>
                  </div>
              </div>

              <div className="absolute inset-0 bg-[#FAFAFA] paper-card flex flex-col items-center justify-center p-4 md:p-8" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                {selectedBook.cover_url ? (
                  <img src={selectedBook.cover_url} alt="Couverture" className="w-auto max-w-[90%] max-h-[80%] md:max-h-[90%] object-contain paper-card p-1 md:p-2 bg-white shadow-xl" />
                ) : (
                  <div className="w-full h-full border-4 border-stone-900/20 flex flex-col items-center justify-center p-6 relative bg-[#E8E6E1]">
                    <span className="text-2xl md:text-4xl font-black text-stone-900/20 uppercase -rotate-12 text-center">Sans Image</span>
                  </div>
                )}
                <span className="absolute bottom-2 md:bottom-4 right-2 md:right-4 text-[6px] md:text-[10px] font-black uppercase tracking-widest text-stone-400">N° {selectedBook.id.slice(0,8)}</span>
              </div>
            </div>

          </div>
        </div>
      )}
    </main>
  );
}