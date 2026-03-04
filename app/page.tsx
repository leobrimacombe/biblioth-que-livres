"use client";

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

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
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY;
      const url = apiKey 
        ? `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQuery)}&maxResults=10&langRestrict=fr&key=${apiKey}`
        : `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQuery)}&maxResults=10&langRestrict=fr`;

      const response = await fetch(url);
      const data = await response.json();
      
      if (data.error) {
        console.error("Google Books API Error:", data.error.message);
      }

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
      alert("Authentification requise. Veuillez vous connecter via le menu.");
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
    else setSelectedBook(null);
  };

  return (
    <main className="min-h-screen bg-zinc-50 pt-32 pb-20 px-6 font-sans text-zinc-900 transition-colors duration-500 overflow-x-hidden relative">
      
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-zinc-200/50 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[40%] bg-zinc-200/30 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-5xl mx-auto relative z-10 flex flex-col items-center text-center mt-6 md:mt-24">
        
        <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.4em] text-zinc-400 mb-6 border border-zinc-200 px-4 py-2 rounded-full bg-white/50 backdrop-blur-sm shadow-sm">
          L'Élégance Littéraire
        </span>
        
        <h1 className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tighter text-zinc-900 mb-6 md:mb-8 leading-[1.1] md:leading-[0.9]">
          Votre collection. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-900 to-zinc-400 italic font-serif pr-2 md:pr-4">
            Sublimée.
          </span>
        </h1>
        
        <p className="text-sm md:text-lg font-medium text-zinc-500 max-w-2xl mb-10 md:mb-12 leading-relaxed px-4">
          Recherchez, organisez et partagez vos œuvres littéraires dans un espace conçu pour les puristes.
        </p>

        <form onSubmit={handleSearch} className="relative w-full max-w-2xl mx-auto mb-16 md:mb-24 group">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Titre, auteur..."
            className="w-full text-sm md:text-base font-medium px-6 md:px-8 py-4 md:py-5 pr-32 md:pr-40 bg-white rounded-full border border-zinc-200 focus:border-zinc-900 focus:ring-4 focus:ring-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.06)] outline-none transition-all duration-500 placeholder:text-zinc-400"
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-2 top-2 bottom-2 rounded-full bg-zinc-900 px-6 md:px-8 text-[10px] md:text-xs font-bold uppercase tracking-widest text-white transition-all duration-500 hover:bg-zinc-800 active:scale-95 flex items-center justify-center"
          >
            {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : "Chercher"}
          </button>
        </form>

        {books.length > 0 && (
          <div className="w-full text-left animate-in fade-in slide-in-from-bottom-10 duration-700">
            <h2 className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-zinc-400 mb-6 md:mb-8 border-b border-zinc-200 pb-4">Résultats de la recherche</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {books.map((book) => (
                <div key={book.id} onClick={() => setSelectedBook(book)} className="group flex flex-col cursor-pointer">
                  <div className="w-full aspect-[2/3] mb-3 md:mb-4 bg-zinc-100 rounded-xl md:rounded-2xl overflow-hidden shadow-sm transition-all duration-500 md:group-hover:shadow-xl md:group-hover:-translate-y-2 border border-zinc-100">
                    {book.volumeInfo.imageLinks?.thumbnail ? (
                      <img src={book.volumeInfo.imageLinks.thumbnail} alt="Couverture" className="w-full h-full object-cover transition-transform duration-700 md:group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] font-bold uppercase tracking-wider text-zinc-300 text-center p-4">Sans Image</div>
                    )}
                  </div>
                  <h3 className="font-extrabold text-xs md:text-sm text-zinc-900 mb-1 line-clamp-2 md:group-hover:text-zinc-600 transition-colors">{book.volumeInfo.title}</h3>
                  <p className="text-[10px] md:text-xs font-medium text-zinc-400 truncate">{book.volumeInfo.authors?.[0] || 'Auteur inconnu'}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedBook && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-zinc-900/60 backdrop-blur-sm p-4 transition-all">
          <div className="absolute inset-0" onClick={() => setSelectedBook(null)}></div>
          
          <div className="relative w-full max-w-3xl bg-white rounded-3xl md:rounded-[2rem] shadow-2xl flex flex-col overflow-hidden h-[85dvh] md:h-auto md:max-h-[85vh] animate-in zoom-in-95 duration-300">
            
            <button 
              onClick={() => setSelectedBook(null)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-md text-zinc-900 shadow-md hover:bg-zinc-100 z-50 transition-colors border border-zinc-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>

            <div className="flex-1 overflow-y-auto flex flex-col md:flex-row min-h-0 relative">
              
              <div className="w-full md:w-2/5 bg-zinc-50 p-6 md:p-8 flex items-center justify-center border-b md:border-b-0 md:border-r border-zinc-100 shrink-0">
                {selectedBook.volumeInfo.imageLinks?.thumbnail ? (
                  <img 
                    src={selectedBook.volumeInfo.imageLinks.thumbnail.replace('&edge=curl', '')} 
                    alt="Couverture" 
                    className="w-auto h-48 md:h-auto md:max-w-[200px] object-contain rounded-xl shadow-[0_20px_40px_rgb(0,0,0,0.15)]"
                  />
                ) : (
                   <div className="w-32 h-48 md:w-48 md:h-72 bg-zinc-200 rounded-xl shadow-lg flex items-center justify-center text-[10px] font-bold uppercase tracking-widest text-zinc-400">Sans Image</div>
                )}
              </div>

              <div className="w-full md:w-3/5 p-6 md:p-8 flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-2">Aperçu de l'œuvre</span>
                <h2 className="text-2xl md:text-3xl font-black text-zinc-900 mb-2 leading-tight pr-6">{selectedBook.volumeInfo.title}</h2>
                <p className="text-xs font-medium text-zinc-500 mb-6">{selectedBook.volumeInfo.authors?.join(', ')}</p>
                
                <div className="text-sm leading-relaxed text-zinc-600 pb-4">
                  {selectedBook.volumeInfo.description 
                    ? selectedBook.volumeInfo.description 
                    : <span className="italic text-zinc-400">Aucun synopsis n'a été fourni pour cette édition.</span>}
                </div>
              </div>

            </div>

            <div className="shrink-0 bg-white p-4 md:p-6 border-t border-zinc-100 flex flex-col sm:flex-row gap-3 z-10 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
              <button 
                onClick={() => handleSaveBook(selectedBook)}
                className="w-full sm:flex-1 rounded-full bg-zinc-900 px-4 py-4 md:py-3.5 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-zinc-800 active:scale-95"
              >
                Ajouter à la collection
              </button>
              
              <a 
                href={`https://www.amazon.fr/s?k=${encodeURIComponent(selectedBook.volumeInfo.title + " livre " + (selectedBook.volumeInfo.authors?.[0] || ""))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:flex-1 rounded-full border border-zinc-200 bg-white px-4 py-4 md:py-3.5 text-xs font-bold uppercase tracking-widest text-zinc-900 transition-all hover:bg-zinc-50 active:scale-95 text-center flex items-center justify-center"
              >
                Voir l'édition
              </a>
            </div>

          </div>
        </div>
      )}
    </main>
  );
}