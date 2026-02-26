"use client";

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// On initialise Supabase pour pouvoir sauvegarder le livre depuis l'accueil
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBook, setSelectedBook] = useState<any | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQuery)}&maxResults=10&langRestrict=fr`);
      const data = await response.json();
      setBooks(data.items || []);
    } catch (error) {
      console.error("Erreur de recherche:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBook = async (book: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("Authentification requise. Veuillez vous connecter via le bouton en haut à droite.");
      return;
    }

    const bookData = {
      user_id: user.id,
      google_books_id: book.id,
      title: book.volumeInfo.title,
      author: book.volumeInfo.authors ? book.volumeInfo.authors[0] : 'Inconnu',
      cover_url: book.volumeInfo.imageLinks?.thumbnail || null,
      status: 'to_read'
    };

    const { error } = await supabase.from('user_books').insert([bookData]);
    if (error) alert("Erreur : " + error.message);
    else {
      setSelectedBook(null); // Ferme la modale avec fluidité
    }
  };

  return (
    <main className="min-h-screen bg-zinc-50 pt-32 pb-20 px-6 font-sans text-zinc-900 transition-colors duration-500 overflow-hidden relative">
      
      {/* Éléments de décoration en arrière-plan */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-zinc-200/50 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[40%] bg-zinc-200/30 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-5xl mx-auto relative z-10 flex flex-col items-center text-center mt-12 md:mt-24">
        
        <span className="text-xs font-bold uppercase tracking-[0.4em] text-zinc-400 mb-6 border border-zinc-200 px-4 py-2 rounded-full bg-white/50 backdrop-blur-sm shadow-sm">
          L'Élégance Littéraire
        </span>
        
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-zinc-900 mb-8 leading-[0.9]">
          Votre collection. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-900 to-zinc-400 italic font-serif pr-4">
            Sublimée.
          </span>
        </h1>
        
        <p className="text-base md:text-lg font-medium text-zinc-500 max-w-2xl mb-12 leading-relaxed">
          Recherchez, organisez et partagez vos œuvres littéraires dans un espace conçu pour les puristes. L'expérience de lecture commence avant même d'ouvrir le livre.
        </p>

        <form onSubmit={handleSearch} className="relative w-full max-w-2xl mx-auto mb-24 group">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un titre, un auteur..."
            className="w-full text-base font-medium px-8 py-5 pr-40 bg-white rounded-full border border-zinc-200 focus:border-zinc-900 focus:ring-4 focus:ring-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.06)] outline-none transition-all duration-500 placeholder:text-zinc-400"
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-2 top-2 bottom-2 rounded-full bg-zinc-900 px-8 text-xs font-bold uppercase tracking-widest text-white transition-all duration-500 hover:bg-zinc-800 hover:shadow-lg active:scale-95 flex items-center justify-center"
          >
            {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : "Chercher"}
          </button>
        </form>

        {books.length > 0 && (
          <div className="w-full text-left animate-in fade-in slide-in-from-bottom-10 duration-700">
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-8 border-b border-zinc-200 pb-4">Résultats de la recherche</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {books.map((book) => (
                // On remplace le <Link> par une <div> cliquable qui ouvre la modale
                <div 
                  key={book.id} 
                  onClick={() => setSelectedBook(book)}
                  className="group flex flex-col cursor-pointer"
                >
                  <div className="w-full aspect-[2/3] mb-4 bg-zinc-100 rounded-2xl overflow-hidden shadow-sm transition-all duration-500 group-hover:shadow-xl group-hover:-translate-y-2 border border-zinc-100">
                    {book.volumeInfo.imageLinks?.thumbnail ? (
                      <img src={book.volumeInfo.imageLinks.thumbnail} alt="Couverture" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] font-bold uppercase tracking-wider text-zinc-300 text-center p-4">Sans Image</div>
                    )}
                  </div>
                  <h3 className="font-extrabold text-sm text-zinc-900 mb-1 line-clamp-2 group-hover:text-zinc-600 transition-colors">{book.volumeInfo.title}</h3>
                  <p className="text-xs font-medium text-zinc-400 truncate">{book.volumeInfo.authors?.[0] || 'Auteur inconnu'}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* LA MODALE (identique à la page Discover) */}
      {selectedBook && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-zinc-900/40 backdrop-blur-md p-4 sm:p-6 transition-all">
          <div className="absolute inset-0" onClick={() => setSelectedBook(null)}></div>
          
          <div className="relative w-full max-w-3xl bg-white rounded-[2rem] shadow-2xl flex flex-col md:flex-row overflow-hidden max-h-[90vh] animate-in fade-in zoom-in-95 duration-300">
            
            <button 
              onClick={() => setSelectedBook(null)}
              className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-zinc-100 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-900 transition-colors z-10"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>

            <div className="w-full md:w-2/5 bg-zinc-50 p-8 flex items-center justify-center border-r border-zinc-100">
              {selectedBook.volumeInfo.imageLinks?.thumbnail ? (
                <img 
                  src={selectedBook.volumeInfo.imageLinks.thumbnail.replace('&edge=curl', '')} 
                  alt="Couverture" 
                  className="w-full max-w-[200px] rounded-xl shadow-[0_20px_40px_rgb(0,0,0,0.15)]"
                />
              ) : (
                 <div className="w-48 h-72 bg-zinc-200 rounded-xl shadow-lg flex items-center justify-center text-xs font-bold uppercase tracking-widest text-zinc-400">Sans Image</div>
              )}
            </div>

            <div className="w-full md:w-3/5 p-8 flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-2">Aperçu de l'œuvre</span>
              <h2 className="text-3xl font-black text-zinc-900 mb-2 leading-tight">{selectedBook.volumeInfo.title}</h2>
              <p className="text-sm font-medium text-zinc-500 mb-6">{selectedBook.volumeInfo.authors?.join(', ')}</p>
              
              <div className="text-sm leading-relaxed text-zinc-600 mb-8 overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-zinc-200">
                {selectedBook.volumeInfo.description 
                  ? selectedBook.volumeInfo.description 
                  : <span className="italic text-zinc-400">Aucun synopsis n'a été fourni pour cette édition.</span>}
              </div>

              <div className="mt-auto flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={() => handleSaveBook(selectedBook)}
                  className="flex-1 rounded-full bg-zinc-900 px-6 py-3.5 text-xs font-bold uppercase tracking-widest text-white transition-all duration-500 hover:bg-zinc-800 hover:shadow-lg active:scale-95"
                >
                  Ajouter à la collection
                </button>
                
                <a 
                  href={`https://www.amazon.fr/s?k=${encodeURIComponent(selectedBook.volumeInfo.title + " livre " + (selectedBook.volumeInfo.authors?.[0] || ""))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 rounded-full border border-zinc-200 bg-white px-6 py-3.5 text-xs font-bold uppercase tracking-widest text-zinc-900 transition-all duration-500 hover:border-zinc-900 hover:bg-zinc-50 active:scale-95 text-center flex items-center justify-center gap-2"
                >
                  Voir l'édition
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                </a>
              </div>
            </div>

          </div>
        </div>
      )}
    </main>
  );
}