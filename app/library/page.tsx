"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function LibraryPage() {
  const [myBooks, setMyBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyBooks();
  }, []);

  const fetchMyBooks = async () => {
    // 1. On vérifie qui est connecté
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return; // Si pas connecté, on s'arrête là
    }

    // 2. On va chercher SES livres dans la base de données
    const { data, error } = await supabase
      .from('user_books')
      .select('*')
      .order('added_at', { ascending: false }); // Du plus récent au plus ancien

    if (error) {
      console.error("Erreur lors de la récupération :", error);
    } else {
      setMyBooks(data || []);
    }
    
    setLoading(false);
  };

  if (loading) return <p className="p-8 text-center">Chargement de ta bibliothèque...</p>;

  return (
    <main className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Ma Bibliothèque</h1>
        <Link href="/" className="text-blue-600 hover:underline">
          &larr; Retour à la recherche
        </Link>
      </div>

      {myBooks.length === 0 ? (
        <p className="text-gray-500 text-center py-12">
          Ta bibliothèque est vide pour le moment. Va vite chercher des livres !
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {myBooks.map((book) => (
            <div key={book.id} className="border rounded-lg p-4 shadow-sm flex flex-col bg-white">
              {book.cover_url ? (
                <img 
                  src={book.cover_url} 
                  alt={book.title} 
                  className="w-full h-48 object-contain mb-4"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 mb-4 flex items-center justify-center rounded">
                  <span className="text-gray-500 text-sm">Pas d'image</span>
                </div>
              )}
              <h3 className="font-bold text-lg line-clamp-2 mb-1">{book.title}</h3>
              <p className="text-gray-600 text-sm mb-2">{book.author}</p>
              
              {/* Affichage du statut */}
              <div className="mt-auto pt-4 border-t">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  {book.status === 'to_read' ? 'À lire' : book.status === 'reading' ? 'En cours' : 'Lu'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}