"use client";

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function DiscoverPage() {
  const [prompt, setPrompt] = useState("");
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedBook, setSelectedBook] = useState<any | null>(null);

  const handleDiscover = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setError("");
    setBooks([]);

    try {
      const response = await fetch('/api/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();

      if (data.error) setError(data.error);
      else if (data.items) setBooks(data.items);
    } catch (err) {
      setError("Le réseau neuronal est momentanément indisponible.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBook = async (book: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("Authentification requise pour cette action.");
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
      setSelectedBook(null); // On ferme la modale avec fluidité
    }
  };

  return (
    <main className="min-h-screen bg-zinc-50 pt-32 pb-20 px-6 font-sans text-zinc-900 transition-colors duration-500">
      <div className="max-w-5xl mx-auto">
        
        {/* En-tête Éditorial */}
        <div className="flex flex-col items-center text-center mb-16">
          <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.3em] text-zinc-400 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 animate-pulse"></span>
            Intelligence Artificielle
          </span>
          <h1 className="text-5xl font-black tracking-tight text-zinc-900 mb-6">
            Découverte.
          </h1>
          <p className="text-sm font-medium text-zinc-500 max-w-xl">
            Décrivez une atmosphère, une époque ou une émotion. Notre modèle linguistique se charge de trouver les œuvres qui résonneront avec votre demande.
          </p>
        </div>

        {/* Barre de recherche "Floating Search" */}
        <form onSubmit={handleDiscover} className="relative max-w-2xl mx-auto mb-16 group">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ex: Un huis clos psychologique en pleine tempête de neige..."
            className="w-full text-sm font-medium px-8 py-5 pr-40 bg-white rounded-full border border-zinc-200 focus:border-zinc-900 focus:ring-4 focus:ring-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] outline-none transition-all duration-500 placeholder:text-zinc-400"
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-2 top-2 bottom-2 rounded-full bg-zinc-900 px-8 text-xs font-bold uppercase tracking-widest text-white transition-all duration-500 hover:bg-zinc-800 hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : "Explorer"}
          </button>
        </form>

        {error && <p className="text-center text-red-500 text-sm font-medium mb-8">{error}</p>}

        {/* Grille de résultats style "Galerie d'Art" */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {books.map((book) => (
            <div 
              key={book.id} 
              onClick={() => setSelectedBook(book)}
              className="group relative flex flex-col cursor-pointer"
            >
              <div className="w-full aspect-[2/3] mb-4 bg-zinc-100 rounded-2xl overflow-hidden shadow-[0_8px_20px_rgb(0,0,0,0.04)] transition-all duration-500 group-hover:shadow-[0_20px_40px_rgb(0,0,0,0.12)] group-hover:-translate-y-2 border border-zinc-100">
                {book.volumeInfo.imageLinks?.thumbnail ? (
                  <img src={book.volumeInfo.imageLinks.thumbnail} alt="Couverture" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] font-bold uppercase tracking-wider text-zinc-300 text-center p-4">Sans Image</div>
                )}
              </div>
              <h3 className="font-extrabold text-sm leading-tight text-zinc-900 mb-1 line-clamp-2 group-hover:text-zinc-600 transition-colors">{book.volumeInfo.title}</h3>
              <p className="text-xs font-medium text-zinc-400 truncate">{book.volumeInfo.authors?.[0] || 'Auteur inconnu'}</p>
            </div>
          ))}
        </div>

      </div>

      {/* LA MODALE (Architecture Anti-Casse Mobile) */}
      {selectedBook && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-zinc-900/60 backdrop-blur-sm p-4 transition-all">
          <div className="absolute inset-0" onClick={() => setSelectedBook(null)}></div>
          
          {/* Le conteneur principal : Hauteur stricte sur mobile (h-[85dvh]) pour forcer le footer à rester visible */}
          <div className="relative w-full max-w-3xl bg-white rounded-3xl md:rounded-[2rem] shadow-2xl flex flex-col overflow-hidden h-[85dvh] md:h-auto md:max-h-[85vh] animate-in zoom-in-95 duration-300">
            
            {/* Bouton Fermer (flottant au-dessus de tout) */}
            <button 
              onClick={() => setSelectedBook(null)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-md text-zinc-900 shadow-md hover:bg-zinc-100 z-50 transition-colors border border-zinc-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>

            {/* ZONE 1 : LE CONTENU DÉFILABLE (Image + Texte) */}
            <div className="flex-1 overflow-y-auto flex flex-col md:flex-row min-h-0 relative">
              
              {/* Image : Défile avec le texte sur mobile, mais reste fixe à gauche sur PC */}
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

              {/* Texte : La longue description de One-Punch Man passera sans problème ici */}
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

            {/* ZONE 2 : LE FOOTER FIXE (Toujours visible en bas) */}
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