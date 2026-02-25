"use client";

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import SearchBar from './components/SearchBar';

// 1. Initialisation de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function Page() {
  // L'état qui va stocker la liste des livres trouvés
  const [books, setBooks] = useState<any[]>([]);

  // 2. La fonction pour sauvegarder un livre dans Supabase
  const handleSaveBook = async (book: any) => {
    // Vérifier si l'utilisateur est connecté
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert("Tu dois être connecté pour sauvegarder un livre !");
      return;
    }

    // Préparer les données pour la base de données
    const bookData = {
      user_id: user.id,
      google_books_id: book.id,
      title: book.volumeInfo.title,
      author: book.volumeInfo.authors ? book.volumeInfo.authors[0] : 'Inconnu',
      cover_url: book.volumeInfo.imageLinks?.thumbnail || null,
      status: 'to_read'
    };

    // Envoyer à Supabase
    const { error } = await supabase
      .from('user_books')
      .insert([bookData]);

    if (error) {
      console.error("❌ Erreur lors de l'ajout :", error.message);
      alert("Erreur lors de la sauvegarde : " + error.message);
    } else {
      alert("✅ Livre ajouté à ta bibliothèque !");
    }
  };

  return (
    <main className="p-8 max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-center">Trouver un livre</h1>
      
      {/* On passe la fonction setBooks à ta SearchBar pour qu'elle puisse 
        mettre à jour la page une fois la recherche Google terminée 
      */}
      <SearchBar setBooks={setBooks} />

      {/* Affichage des résultats en grille */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-12">
        {books.map((book) => (
          <div key={book.id} className="border rounded-lg p-4 shadow-sm flex flex-col">
            {/* Image de couverture */}
            {book.volumeInfo.imageLinks?.thumbnail ? (
              <img 
                src={book.volumeInfo.imageLinks.thumbnail} 
                alt={`Couverture de ${book.volumeInfo.title}`} 
                className="w-full h-48 object-contain mb-4"
              />
            ) : (
              <div className="w-full h-48 bg-gray-200 mb-4 flex items-center justify-center rounded">
                <span className="text-gray-500 text-sm">Pas d'image</span>
              </div>
            )}

            {/* Titre et Auteur */}
            <h3 className="font-bold text-lg line-clamp-2 mb-1">
              {book.volumeInfo.title}
            </h3>
            <p className="text-gray-600 text-sm mb-4 flex-grow">
              {book.volumeInfo.authors?.join(', ') || 'Auteur inconnu'}
            </p>
            
            {/* Bouton de sauvegarde */}
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