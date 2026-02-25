"use client";

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function DiscoverPage() {
  const [prompt, setPrompt] = useState("");
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Le nouvel état pour la modale
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
      setError("Erreur avec l'IA.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBook = async (book: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("Tu dois être connecté !");
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
      alert("✅ Ajouté à ta liste !");
      setSelectedBook(null); // On ferme la modale après l'ajout
    }
  };

  return (
    <main className="p-8 max-w-5xl mx-auto relative">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
          Découverte Magique ✨
        </h1>
        <Link href="/" className="text-blue-600 hover:underline">
          &larr; Retour à l'accueil
        </Link>
      </div>

      <div className="bg-purple-50 p-6 rounded-lg mb-8 border border-purple-100 text-black">
        <form onSubmit={handleDiscover} className="flex gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ex: Romance enemies to lovers..."
            className="flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? "Recherche de 10 pépites..." : "Trouver des livres"}
          </button>
        </form>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>

      {/* Grille de résultats (cliquable) */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {books.map((book) => (
          <div 
            key={book.id} 
            onClick={() => setSelectedBook(book)}
            className="border rounded-lg p-3 shadow-sm flex flex-col bg-white cursor-pointer hover:shadow-md hover:border-purple-300 transition-all"
          >
            {book.volumeInfo.imageLinks?.thumbnail ? (
              <img src={book.volumeInfo.imageLinks.thumbnail} alt="Couverture" className="w-full h-40 object-contain mb-2" />
            ) : (
              <div className="w-full h-40 bg-gray-100 mb-2 flex items-center justify-center rounded text-xs text-gray-400">Pas d'image</div>
            )}
            <h3 className="font-bold text-sm line-clamp-2">{book.volumeInfo.title}</h3>
            <p className="text-gray-500 text-xs">{book.volumeInfo.authors?.[0] || 'Inconnu'}</p>
          </div>
        ))}
      </div>

      {/* LA MODALE (s'affiche uniquement si un livre est sélectionné) */}
      {selectedBook && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 relative flex flex-col md:flex-row gap-6">
            
            {/* Bouton fermer */}
            <button 
              onClick={() => setSelectedBook(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-black font-bold text-xl"
            >
              ✕
            </button>

            {/* Colonne Image */}
            <div className="w-full md:w-1/3 flex-shrink-0">
              {selectedBook.volumeInfo.imageLinks?.thumbnail && (
                <img 
                  src={selectedBook.volumeInfo.imageLinks.thumbnail} 
                  alt="Couverture" 
                  className="w-full rounded shadow-md"
                />
              )}
            </div>

            {/* Colonne Infos */}
            <div className="w-full md:w-2/3 flex flex-col">
              <h2 className="text-2xl font-bold mb-2">{selectedBook.volumeInfo.title}</h2>
              <p className="text-lg text-gray-600 mb-4">{selectedBook.volumeInfo.authors?.join(', ')}</p>
              
              <div className="text-sm text-gray-700 mb-6 bg-gray-50 p-4 rounded border h-48 overflow-y-auto">
                {selectedBook.volumeInfo.description 
                  ? selectedBook.volumeInfo.description 
                  : "Aucun résumé disponible pour ce livre."}
              </div>

              {/* Boutons d'action */}
              <div className="mt-auto flex gap-3">
                <button 
                  onClick={() => handleSaveBook(selectedBook)}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-bold"
                >
                  + Ajouter à ma liste
                </button>
                
                {/* Lien Amazon généré automatiquement */}
                <a 
                  href={`https://www.amazon.fr/s?k=${encodeURIComponent(selectedBook.volumeInfo.title + " livre " + (selectedBook.volumeInfo.authors?.[0] || ""))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-yellow-400 text-gray-900 py-3 rounded-lg hover:bg-yellow-500 font-bold text-center flex items-center justify-center"
                >
                  🛒 Voir sur Amazon
                </a>
              </div>
            </div>

          </div>
        </div>
      )}
    </main>
  );
}