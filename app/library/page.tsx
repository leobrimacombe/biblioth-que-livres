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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from('user_books')
      .select('*')
      .order('added_at', { ascending: false });

    if (!error && data) setMyBooks(data);
    setLoading(false);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from('user_books')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) alert("Erreur lors de la mise à jour !");
    else {
      setMyBooks(myBooks.map(book => book.id === id ? { ...book, status: newStatus } : book));
    }
  };

  const handleRatingChange = async (id: string, newRating: number) => {
    const { error } = await supabase
      .from('user_books')
      .update({ rating: newRating })
      .eq('id', id);

    if (error) alert("Erreur lors de la notation !");
    else {
      setMyBooks(myBooks.map(book => book.id === id ? { ...book, rating: newRating } : book));
    }
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm("Veux-tu vraiment supprimer ce livre de ta liste ?");
    if (!confirmDelete) return;

    const { error } = await supabase
      .from('user_books')
      .delete()
      .eq('id', id);

    if (error) alert("Erreur lors de la suppression !");
    else {
      setMyBooks(myBooks.filter(book => book.id !== id));
    }
  };

  // Met à jour le texte à l'écran quand on tape
  const handleLocalNotesChange = (id: string, newNotes: string) => {
    setMyBooks(myBooks.map(book => book.id === id ? { ...book, notes: newNotes } : book));
  };

  // Sauvegarde dans la base de données uniquement quand on a fini de taper
  const saveNotesToDB = async (id: string, currentNotes: string) => {
    const { error } = await supabase
      .from('user_books')
      .update({ notes: currentNotes })
      .eq('id', id);
      
    if (error) console.error("Erreur lors de la sauvegarde de l'avis :", error);
  };

  if (loading) return <p className="p-8 text-center text-xl">Chargement de ta bibliothèque...</p>;

  return (
    <main className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Ma Bibliothèque 📚
        </h1>
        {/* On a enlevé le bouton retour à l'accueil d'ici vu qu'il est maintenant dans le Header ! */}
      </div>

      {myBooks.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-500 mb-6 text-lg">Ta bibliothèque est vide pour le moment.</p>
          <Link href="/discover" className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 font-bold shadow-lg transition-transform hover:scale-105 inline-block">
            ✨ Découvrir des livres avec l'IA
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {myBooks.map((book) => (
            <div key={book.id} className="border border-gray-200 rounded-xl p-5 shadow-sm bg-white flex flex-col relative group hover:shadow-md transition-shadow">
              
              <button 
                onClick={() => handleDelete(book.id)}
                className="absolute top-3 right-3 text-gray-300 hover:text-red-500 transition-colors bg-white rounded-full p-1 z-10"
                title="Supprimer ce livre"
              >
                ✕
              </button>

              <div className="flex gap-4 mb-4">
                <div className="w-24 flex-shrink-0">
                  {book.cover_url ? (
                    <img src={book.cover_url} alt={book.title} className="w-full rounded shadow-sm" />
                  ) : (
                    <div className="w-full h-36 bg-gray-100 flex items-center justify-center rounded text-xs text-gray-400 text-center p-1">Pas d'image</div>
                  )}
                </div>
                
                <div className="flex-1 flex flex-col pt-1">
                  <h3 className="font-bold text-lg leading-tight mb-1 pr-6">{book.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{book.author}</p>
                  
                  <select 
                    value={book.status} 
                    onChange={(e) => handleStatusChange(book.id, e.target.value)}
                    className="mt-auto text-sm border-2 bg-gray-50 rounded-lg p-2 outline-none focus:border-blue-500 text-black font-medium cursor-pointer transition-colors"
                  >
                    <option value="to_read">📌 À lire</option>
                    <option value="reading">📖 En cours</option>
                    <option value="read">✅ Terminé</option>
                  </select>
                </div>
              </div>

              {/* Zone des étoiles */}
              <div className="mt-2 pt-4 border-t flex items-center justify-between">
                <span className={`text-sm font-medium ${book.status === 'read' ? 'text-gray-700' : 'text-gray-400'}`}>
                  {book.status === 'read' ? 'Ta note :' : 'Termine-le pour noter'}
                </span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRatingChange(book.id, star)}
                      disabled={book.status !== 'read'}
                      className={`text-2xl transition-all ${book.status !== 'read' ? 'cursor-not-allowed opacity-30' : 'hover:scale-110'} ${
                        (book.rating || 0) >= star ? 'text-yellow-400' : 'text-gray-200 hover:text-yellow-300'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              {/* Zone d'avis écrit (Uniquement si Terminé) */}
              {book.status === 'read' && (
                <div className="mt-4 pt-4 border-t border-dashed">
                  <textarea
                    placeholder="Qu'as-tu pensé de ce livre ? (Ton avis sera public si ton profil l'est)"
                    value={book.notes || ''}
                    onChange={(e) => handleLocalNotesChange(book.id, e.target.value)}
                    onBlur={(e) => saveNotesToDB(book.id, e.target.value)}
                    className="w-full text-sm p-3 border rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none resize-none h-24 text-black"
                  />
                </div>
              )}

            </div>
          ))}
        </div>
      )}
    </main>
  );
}