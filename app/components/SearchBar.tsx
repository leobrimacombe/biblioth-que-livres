"use client";

import { useState } from "react";

// On garde ton interface !
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

// ⚠️ IMPORTANT : On ajoute { setBooks } ici pour communiquer avec page.tsx
export default function SearchBar({ setBooks }: { setBooks: (books: Book[]) => void }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);

    try {
      // On appelle ta route API sécurisée
      const response = await fetch(`/api/books?q=${query}`);
      const data = await response.json();
      
      if (data.error) {
        console.error("❌ Détail de l'erreur Google :", data.error);
      }

      if (data.items) {
        // Au lieu de stocker les résultats ici, on les envoie à page.tsx !
        setBooks(data.items);
      } else {
        setBooks([]);
      }
      
    } catch (error) {
      console.error("❌ Erreur lors de la recherche :", error);
    } finally {
      setLoading(false);
    }
  };

  // On ne retourne QUE le formulaire, plus l'affichage des livres !
  return (
    <div className="w-full max-w-2xl mx-auto mt-8">
      <form onSubmit={handleSearch} className="flex gap-2 mb-8">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un livre, un auteur..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
        >
          {loading ? "Recherche..." : "Chercher"}
        </button>
      </form>
    </div>
  );
}