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
    const { error } = await supabase.from('user_books').update({ status: newStatus }).eq('id', id);
    if (!error) setMyBooks(myBooks.map(book => book.id === id ? { ...book, status: newStatus } : book));
  };

  const handleRatingChange = async (id: string, newRating: number) => {
    const { error } = await supabase.from('user_books').update({ rating: newRating }).eq('id', id);
    if (!error) setMyBooks(myBooks.map(book => book.id === id ? { ...book, rating: newRating } : book));
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm("Retirer cette œuvre de votre collection ?");
    if (!confirmDelete) return;

    const { error } = await supabase.from('user_books').delete().eq('id', id);
    if (!error) setMyBooks(myBooks.filter(book => book.id !== id));
  };

  const handleLocalNotesChange = (id: string, newNotes: string) => {
    setMyBooks(myBooks.map(book => book.id === id ? { ...book, notes: newNotes } : book));
  };

  const saveNotesToDB = async (id: string, currentNotes: string) => {
    await supabase.from('user_books').update({ notes: currentNotes }).eq('id', id);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <div className="w-6 h-6 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <main className="min-h-screen bg-zinc-50 pt-28 sm:pt-32 pb-20 px-4 sm:px-6 font-sans text-zinc-900 transition-colors duration-500">
      <div className="max-w-5xl mx-auto">
        
        <div className="flex flex-col items-start mb-10 sm:mb-16">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] text-zinc-400 mb-2">Collection Privée</span>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-zinc-900">
            Ma Bibliothèque.
          </h1>
        </div>

        {myBooks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 sm:py-32 bg-white rounded-[2rem] border border-zinc-100 shadow-sm px-4 text-center">
            <span className="text-xs sm:text-sm font-medium text-zinc-400 mb-6 sm:mb-8">Votre collection est vierge.</span>
            <Link href="/" className="relative overflow-hidden rounded-full bg-zinc-900 px-6 sm:px-8 py-3.5 sm:py-4 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-white transition-all duration-500 hover:bg-zinc-800 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] active:scale-95">
              Découvrir des œuvres
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {myBooks.map((book) => (
              <div 
                key={book.id} 
                className="group relative bg-white rounded-3xl sm:rounded-[2rem] p-5 sm:p-6 border border-zinc-100 transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] md:hover:-translate-y-1 flex flex-col"
              >
                
                {/* Bouton de suppression toujours visible sur mobile (opacity-100) */}
                <button 
                  onClick={() => handleDelete(book.id)}
                  className="absolute top-4 right-4 sm:top-6 sm:right-6 w-8 h-8 flex items-center justify-center rounded-full bg-zinc-50 text-zinc-400 opacity-100 md:opacity-0 md:group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 transition-all duration-300 z-10"
                  title="Retirer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>

                <div className="flex gap-4 sm:gap-6 mb-4 sm:mb-6">
                  {/* Couverture plus fine sur mobile */}
                  <div className="w-20 sm:w-28 flex-shrink-0">
                    {book.cover_url ? (
                      <img src={book.cover_url} alt={book.title} className="w-full rounded-lg sm:rounded-xl shadow-[0_8px_20px_rgb(0,0,0,0.08)] transition-transform duration-500 md:group-hover:scale-[1.02]" />
                    ) : (
                      <div className="w-full h-32 sm:h-40 bg-zinc-100 flex items-center justify-center rounded-lg sm:rounded-xl text-[8px] sm:text-[10px] font-bold uppercase tracking-wider text-zinc-300 text-center p-2">Sans Image</div>
                    )}
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-start pt-1 sm:pt-2 pr-6 sm:pr-8">
                    <h3 className="font-extrabold text-lg sm:text-xl leading-snug mb-1 sm:mb-2 text-zinc-900 line-clamp-2">{book.title}</h3>
                    <p className="text-xs sm:text-sm font-medium text-zinc-500 mb-4 sm:mb-6 line-clamp-1">{book.author}</p>
                    
                    {/* Le sélecteur prend toute la largeur sur mobile */}
                    <div className="mt-auto relative w-full sm:w-max">
                      <select 
                        value={book.status} 
                        onChange={(e) => handleStatusChange(book.id, e.target.value)}
                        className="w-full appearance-none bg-zinc-50 border border-zinc-200 text-zinc-900 text-[10px] sm:text-xs font-bold uppercase tracking-widest rounded-full px-4 sm:px-5 py-2.5 pr-10 outline-none focus:border-zinc-900 transition-colors cursor-pointer"
                      >
                        <option value="to_read">À LIRE</option>
                        <option value="reading">EN COURS</option>
                        <option value="read">TERMINÉ</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-900">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Étoiles */}
                <div className="mt-2 pt-4 sm:pt-5 border-t border-zinc-100 flex items-center justify-between">
                  <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-widest ${book.status === 'read' ? 'text-zinc-900' : 'text-zinc-300'}`}>
                    Évaluation
                  </span>
                  <div className="flex gap-1 sm:gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleRatingChange(book.id, star)}
                        disabled={book.status !== 'read'}
                        className={`text-lg sm:text-xl transition-all duration-300 ${book.status !== 'read' ? 'cursor-not-allowed opacity-20' : 'hover:scale-125'} ${
                          (book.rating || 0) >= star ? 'text-zinc-900' : 'text-zinc-200 hover:text-zinc-400'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                {/* Champ texte */}
                {book.status === 'read' && (
                  <div className="mt-4">
                    <textarea
                      placeholder="Vos impressions sur cette œuvre..."
                      value={book.notes || ''}
                      onChange={(e) => handleLocalNotesChange(book.id, e.target.value)}
                      onBlur={(e) => saveNotesToDB(book.id, e.target.value)}
                      className="w-full text-xs sm:text-sm font-medium p-3 sm:p-4 bg-zinc-50 rounded-xl sm:rounded-2xl border border-transparent focus:bg-white focus:border-zinc-200 focus:ring-4 focus:ring-zinc-100 outline-none resize-none h-20 sm:h-24 text-zinc-900 placeholder:text-zinc-400 transition-all duration-500"
                    />
                  </div>
                )}

              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}