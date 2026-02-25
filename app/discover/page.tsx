"use client";

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

// Initialisation de Supabase pour pouvoir sauvegarder les trouvailles
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function DiscoverPage() {
  const [prompt, setPrompt] = useState("");
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 1. Fonction qui demande à l'IA
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

      if (data.error) {
        setError(data.error);
      } else if (data.items) {
        setBooks(data.items);
      }
    } catch (err) {
      setError("Erreur lors de la communication avec l'IA.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Fonction pour sauvegarder (la même que sur l'accueil !)
  const handleSaveBook = async (book: any) => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert("Tu dois être connecté pour sauvegarder un livre !");
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
    else alert("✅ Livre IA ajouté à ta bibliothèque !");
  };

  return (
    <main className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
          Découverte Magique ✨
        </h1>
        <Link href="/" className="text-blue-600 hover:underline">
          &larr; Retour à l'accueil
        </Link>
      </div>

      <div className="bg-purple-50 p-6 rounded-lg mb-8 border border-purple-100 text-black">
        <p className="mb-4 text-purple-900 font-medium">
          Décris l'ambiance, le genre ou le style littéraire que tu recherches (ex: "Romance enemies to lovers avec des vampires", "Thriller psychologique en huis clos"). L'IA te trouvera 3 pépites !
        </p>
        <form onSubmit={handleDiscover} className="flex gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ton envie de lecture..."
            className="flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 disabled:bg-purple-300 transition-colors"
          >
            {loading ? "L'IA réfléchit... 🪄" : "Trouver des livres"}
          </button>
        </form>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>

      {/* Affichage des résultats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {books.map((book) => (
          <div key={book.id} className="border rounded-lg p-4 shadow-sm flex flex-col bg-white">
            {book.volumeInfo.imageLinks?.thumbnail ? (
              <img src={book.volumeInfo.imageLinks.thumbnail} alt={book.volumeInfo.title} className="w-full h-48 object-contain mb-4" />
            ) : (
              <div className="w-full h-48 bg-gray-200 mb-4 flex items-center justify-center rounded text-gray-500 text-sm">Pas d'image</div>
            )}
            <h3 className="font-bold text-lg line-clamp-2 mb-1">{book.volumeInfo.title}</h3>
            <p className="text-gray-600 text-sm mb-4 flex-grow">{book.volumeInfo.authors?.join(', ') || 'Auteur inconnu'}</p>
            <button 
              onClick={() => handleSaveBook(book)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
            >
              Ajouter à ma liste
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}