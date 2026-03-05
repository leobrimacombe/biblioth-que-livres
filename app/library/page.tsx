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
      .eq('user_id', user.id)
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
    const confirmDelete = window.confirm("Déchirer cette fiche et la retirer de votre étui ?");
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
    <div className="min-h-screen flex items-center justify-center bg-[#F4F3EE]">
      <div className="w-8 h-8 border-4 border-stone-900 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#F4F3EE] pt-28 sm:pt-32 pb-20 px-4 sm:px-6 font-sans text-stone-900 selection:bg-stone-900 selection:text-stone-900">
      <div className="max-w-5xl mx-auto">
        
        {/* En-tête de la page */}
        <div className="flex flex-col items-start mb-10 sm:mb-16">
          <div className="paper-card px-4 py-2 mb-4 -rotate-1 inline-block bg-[#FAFAFA]">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-stone-900">
              Collection Privée
            </span>
          </div>
          <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-stone-900 uppercase">
            Mon Étui.
          </h1>
        </div>

        {myBooks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 sm:py-32 paper-card bg-[#FAFAFA] text-center p-6 border-dashed border-4 border-stone-300">
            <span className="text-sm font-bold text-stone-800 mb-8 uppercase tracking-widest">Votre étui est vide.</span>
            <Link href="/search" className="paper-card paper-btn bg-stone-900 text-stone-900 px-8 py-4 text-xs font-black uppercase tracking-widest">
              Feuilleter l'Index
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10">
            {myBooks.map((book) => (
              <div key={book.id} className="paper-card bg-[#FAFAFA] p-5 sm:p-6 flex flex-col relative group">
                
                {/* Bouton Supprimer façon rature */}
                <button 
                  onClick={() => handleDelete(book.id)}
                  className="absolute top-4 right-4 sm:top-6 sm:right-6 w-8 h-8 flex items-center justify-center paper-card paper-btn bg-red-50 text-red-600 border-red-900 z-10 transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100"
                  title="Retirer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>

                <div className="flex gap-4 sm:gap-6 mb-4 sm:mb-6">
                  {/* Couverture du livre */}
                  <div className="w-24 sm:w-32 flex-shrink-0">
                    {book.cover_url ? (
                      <img src={book.cover_url} alt={book.title} className="w-full paper-card p-1 bg-white" />
                    ) : (
                      <div className="w-full h-36 sm:h-48 paper-card bg-stone-200 flex items-center justify-center text-[10px] font-black uppercase tracking-wider text-stone-800 text-center p-2">Sans Image</div>
                    )}
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-start pt-1 pr-6 sm:pr-8">
                    <h3 className="font-black text-lg sm:text-xl leading-snug mb-2 text-stone-900 uppercase border-b-2 border-stone-900 pb-2">{book.title}</h3>
                    <p className="text-xs sm:text-sm font-bold text-stone-600 mb-6">{book.author}</p>
                    
                    {/* Sélecteur de statut Brutaliste */}
                    <div className="mt-auto relative w-full sm:w-max">
                      <select 
                        value={book.status} 
                        onChange={(e) => handleStatusChange(book.id, e.target.value)}
                        className="w-full appearance-none paper-card bg-[#F4F3EE] text-stone-900 text-[10px] sm:text-xs font-black uppercase tracking-widest px-4 sm:px-5 py-3 pr-10 outline-none cursor-pointer focus:shadow-[2px_2px_0px_0px_#1c1917] focus:translate-x-[2px] focus:translate-y-[2px] transition-all"
                      >
                        <option value="to_read">À LIRE</option>
                        <option value="reading">EN COURS</option>
                        <option value="read">TERMINÉ</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-stone-900">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section Évaluation */}
                <div className="mt-2 pt-4 sm:pt-5 border-t-2 border-stone-900 border-dashed flex items-center justify-between">
                  <span className={`text-[10px] sm:text-xs font-black uppercase tracking-widest ${book.status === 'read' ? 'text-stone-900' : 'text-stone-700'}`}>
                    Évaluation
                  </span>
                  <div className="flex gap-1 sm:gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleRatingChange(book.id, star)}
                        disabled={book.status !== 'read'}
                        className={`text-xl sm:text-2xl transition-transform duration-200 ${book.status !== 'read' ? 'cursor-not-allowed opacity-20' : 'hover:scale-125'} ${
                          (book.rating || 0) >= star ? 'text-stone-900' : 'text-stone-300'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                {/* Champ de notes "Machine à écrire" */}
                {book.status === 'read' && (
                  <div className="mt-6">
                    <textarea
                      placeholder="Tapez vos impressions ici..."
                      value={book.notes || ''}
                      onChange={(e) => handleLocalNotesChange(book.id, e.target.value)}
                      onBlur={(e) => saveNotesToDB(book.id, e.target.value)}
                      className="w-full text-xs sm:text-sm font-medium p-4 bg-[#F4F3EE] paper-card outline-none resize-none h-24 text-stone-900 placeholder:text-stone-700 focus:shadow-[2px_2px_0px_0px_#1c1917] focus:translate-x-[2px] focus:translate-y-[2px] transition-all font-serif italic"
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