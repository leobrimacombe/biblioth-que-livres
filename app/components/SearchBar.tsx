"use client"; // Indispensable pour utiliser useState dans Next.js App Router

import { useState } from "react";

// On définit le type des données que Google Books nous renvoie (juste ce dont on a besoin)
export interface Book {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    imageLinks?: {
      thumbnail: string;
    };
  };
}

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    console.log("1. Recherche lancée pour :", query); // On vérifie que le bouton marche

    try {
        // On récupère la clé depuis les variables d'environnement
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY;

        const res = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
            query
        )}&maxResults=5&key=${apiKey}`
        );
      
      const data = await res.json();
      console.log("2. Réponse de Google Books :", data); // On regarde ce que Google renvoie

      if (data.items) {
        setResults(data.items);
        console.log("3. Livres trouvés :", data.items.length);
      } else {
        setResults([]);
        console.log("3. Aucun livre trouvé dans data.items");
      }
      
    } catch (error) {
      console.error("❌ Erreur lors de la recherche :", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-8">
      {/* Le formulaire de recherche */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-8">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un livre, un auteur..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
        >
          {loading ? "Recherche..." : "Chercher"}
        </button>
      </form>

      {/* L'affichage brut des résultats */}
      <div className="grid gap-4">
        {results.map((book) => (
          <div key={book.id} className="p-4 border border-gray-200 rounded-lg flex gap-4 bg-white">
            {book.volumeInfo.imageLinks?.thumbnail ? (
              <img 
                src={book.volumeInfo.imageLinks.thumbnail} 
                alt={`Couverture de ${book.volumeInfo.title}`} 
                className="w-16 h-24 object-cover rounded shadow"
              />
            ) : (
              <div className="w-16 h-24 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500 text-center">
                Pas d'image
              </div>
            )}
            
            <div>
              <h3 className="font-bold text-lg text-gray-800">{book.volumeInfo.title}</h3>
              <p className="text-gray-600">
                {book.volumeInfo.authors ? book.volumeInfo.authors.join(", ") : "Auteur inconnu"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}