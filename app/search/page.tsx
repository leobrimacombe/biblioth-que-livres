"use client";

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import InkButton from '../components/InkButton'; // <-- IMPORT DU BOUTON MAGIQUE

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [maxResults, setMaxResults] = useState(10);
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
        ? `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQuery)}&maxResults=${maxResults}&langRestrict=fr&key=${apiKey}`
        : `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQuery)}&maxResults=${maxResults}&langRestrict=fr`;

      const response = await fetch(url);
      const data = await response.json();
      
      if (data.error) console.error("Google Books API Error:", data.error.message);
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
      alert("Authentification requise. N'hésitez pas à vous connecter via le menu en haut !");
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
    <main className="min-h-screen bg-[#F4F3EE] pt-32 pb-20 px-4 sm:px-6 font-sans text-stone-900 selection:bg-stone-900 selection:text-[#F4F3EE]">
      <div className="max-w-5xl mx-auto">
        
        <div className="flex flex-col items-center text-center mb-12">
          <div className="paper-card px-4 py-2 mb-4 rotate-1 inline-block bg-[#FAFAFA]">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.4em] text-stone-900">Registre Global</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-stone-900 mb-4 uppercase">
            L'Index.
          </h1>
        </div>

        <div className="max-w-2xl mx-auto mb-16 px-2">
          <form onSubmit={handleSearch} className="relative w-full mb-6">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Titre, auteur, mot-clé..."
              className="w-full text-sm md:text-base font-bold px-6 py-5 pr-32 md:pr-40 bg-[#FAFAFA] paper-card outline-none placeholder:text-stone-500 focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[4px_4px_0px_0px_#1c1917] transition-all text-stone-900"
            />
            {/* BOUTON ENCRE - CHERCHER */}
            <InkButton
              type="submit"
              disabled={loading}
              isDark={true}
              className="absolute right-2 top-2 bottom-2 px-6 md:px-8 text-[10px] md:text-xs font-black uppercase tracking-widest flex items-center justify-center"
            >
              {loading ? <div className="w-4 h-4 border-2 border-[#F4F3EE] border-t-transparent rounded-full animate-spin"></div> : "Chercher"}
            </InkButton>
          </form>

          <div className="flex justify-end items-center gap-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-stone-700">Afficher :</label>
            <select 
              value={maxResults}
              onChange={(e) => setMaxResults(Number(e.target.value))}
              className="bg-[#FAFAFA] text-xs font-black text-stone-900 outline-none cursor-pointer paper-card px-3 py-1"
            >
              <option value={10}>10 fiches</option>
              <option value={20}>20 fiches</option>
              <option value={30}>30 fiches</option>
              <option value={40}>40 fiches (Max)</option>
            </select>
          </div>
        </div>

        {books.length > 0 && (
          <div className="w-full text-left animate-in fade-in slide-in-from-bottom-10 duration-500">
            <h2 className="text-[10px] md:text-xs font-black uppercase tracking-widest text-stone-900 mb-8 border-b-4 border-stone-900 pb-2">Résultats trouvés</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8">
              {books.map((book) => (
                <div key={book.id} onClick={() => setSelectedBook(book)} className="paper-card paper-hover bg-[#FAFAFA] p-3 cursor-pointer flex flex-col h-full group">
                  <div className="w-full aspect-[2/3] mb-4 bg-stone-100 border-2 border-stone-900 overflow-hidden relative">
                    {book.volumeInfo.imageLinks?.thumbnail ? (
                      <img src={book.volumeInfo.imageLinks.thumbnail} alt="Couverture" className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] font-black uppercase tracking-wider text-stone-600 text-center p-4">Sans Image</div>
                    )}
                  </div>
                  <h3 className="font-black text-xs md:text-sm text-stone-900 mb-1 line-clamp-2 uppercase">{book.volumeInfo.title}</h3>
                  <p className="text-[10px] md:text-xs font-bold text-stone-700 truncate mt-auto pt-2 border-t-2 border-stone-900 border-dashed">{book.volumeInfo.authors?.[0] || 'Auteur inconnu'}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedBook && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4 md:p-8 transition-all">
          <div className="absolute inset-0" onClick={() => setSelectedBook(null)}></div>
          
          <div className="relative w-full max-w-4xl paper-card bg-[#FAFAFA] flex flex-col overflow-hidden h-[85dvh] md:h-auto md:max-h-[90vh] animate-in zoom-in-95 duration-200">
            
            <button 
              onClick={() => setSelectedBook(null)}
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center paper-card paper-btn bg-[#F4F3EE] text-stone-900 z-50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>

            <div className="flex-1 overflow-y-auto flex flex-col md:flex-row min-h-0 relative">
              <div className="w-full md:w-2/5 bg-[#F4F3EE] p-6 md:p-10 flex items-center justify-center border-b-4 md:border-b-0 md:border-r-4 border-stone-900 shrink-0 relative">
                 <div className="absolute top-4 border-t-8 border-stone-300 w-16 opacity-50 z-10 rotate-3"></div>
                {selectedBook.volumeInfo.imageLinks?.thumbnail ? (
                  <img 
                    src={selectedBook.volumeInfo.imageLinks.thumbnail.replace('&edge=curl', '')} 
                    alt="Couverture" 
                    className="w-auto h-48 md:h-auto md:max-w-[220px] object-contain paper-card p-2 bg-white"
                  />
                ) : (
                   <div className="w-32 h-48 md:w-56 md:h-80 paper-card bg-stone-200 flex items-center justify-center text-xs font-black uppercase tracking-widest text-stone-600">Sans Image</div>
                )}
              </div>

              <div className="w-full md:w-3/5 p-6 md:p-10 flex flex-col bg-[#FAFAFA]">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-500 mb-2">Fiche n° {selectedBook.id.slice(0, 6)}</span>
                <h2 className="text-3xl md:text-4xl font-black text-stone-900 mb-2 leading-none uppercase pr-8">{selectedBook.volumeInfo.title}</h2>
                <p className="text-sm font-bold text-stone-700 mb-8 border-b-2 border-stone-900 pb-4">{selectedBook.volumeInfo.authors?.join(', ')}</p>
                
                <div className="text-sm leading-relaxed text-stone-800 pb-4 font-medium">
                  {selectedBook.volumeInfo.description 
                    ? selectedBook.volumeInfo.description 
                    : <span className="italic text-stone-500">Aucun synopsis archivé pour cette œuvre.</span>}
                </div>
              </div>
            </div>

            <div className="shrink-0 bg-[#F4F3EE] p-4 md:p-6 border-t-4 border-stone-900 flex flex-col sm:flex-row gap-4 z-10">
              {/* BOUTON ENCRE - AJOUTER */}
              <InkButton 
                onClick={() => handleSaveBook(selectedBook)}
                isDark={true}
                className="w-full sm:flex-1 px-4 py-4 md:py-4 text-xs font-black uppercase tracking-widest"
              >
                + Ajouter à l'Étui
              </InkButton>
              
              <a 
                href={`https://www.amazon.fr/s?k=${encodeURIComponent(selectedBook.volumeInfo.title + " livre " + (selectedBook.volumeInfo.authors?.[0] || ""))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:flex-1 paper-card paper-btn bg-[#FAFAFA] px-4 py-4 md:py-4 text-xs font-black uppercase tracking-widest text-stone-900 text-center flex items-center justify-center gap-2"
              >
                Consulter l'édition
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
              </a>
            </div>

          </div>
        </div>
      )}
    </main>
  );
}