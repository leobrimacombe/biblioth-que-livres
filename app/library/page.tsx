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
    // On ajoute un padding-top (pt-32) pour laisser la place au Header flottant
    <main className="min-h-screen bg-zinc-50 pt-32 pb-20 px-6 font-sans text-zinc-900 selection:bg-zinc-900 selection:text-white transition-colors duration-500">
      <div className="max-w-5xl mx-auto">
        
        {/* En-tête de la page ultra minimaliste */}
        <div className="flex flex-col items-start mb-16">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-400 mb-2">Collection Privée</span>
          <h1 className="text-5xl font-black tracking-tight text-zinc-900">
            Ma Bibliothèque.
          </h1>
        </div>

        {myBooks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-zinc-100 shadow-sm">
            <span className="text-sm font-medium text-zinc-400 mb-8">Votre collection est vierge.</span>
            <Link href="/discover" className="relative overflow-hidden rounded-full bg-zinc-900 px-8 py-4 text-xs font-bold uppercase tracking-widest text-white transition-all duration-500 hover:bg-zinc-800 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] active:scale-95">
              Découvrir des œuvres
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {myBooks.map((book) => (
              <div 
                key={book.id} 
                className="group relative bg-white rounded-[2rem] p-6 border border-zinc-100 transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] hover:-translate-y-1 flex flex-col"
              >
                
                {/* Bouton supprimer minimaliste (apparaît au survol) */}
                <button 
                  onClick={() => handleDelete(book.id)}
                  className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-zinc-50 text-zinc-400 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 transition-all duration-300 z-10"
                  title="Retirer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>

                <div className="flex gap-6 mb-6">
                  {/* Couverture avec ombre douce */}
                  <div className="w-28 flex-shrink-0">
                    {book.cover_url ? (
                      <img src={book.cover_url} alt={book.title} className="w-full rounded-xl shadow-[0_8px_20px_rgb(0,0,0,0.08)] transition-transform duration-500 group-hover:scale-[1.02]" />
                    ) : (
                      <div className="w-full h-40 bg-zinc-100 flex items-center justify-center rounded-xl text-[10px] font-bold uppercase tracking-wider text-zinc-300 text-center p-2">Sans<br/>Image</div>
                    )}
                  </div>
                  
                  {/* Infos du livre */}
                  <div className="flex-1 flex flex-col justify-start pt-2 pr-8">
                    <h3 className="font-extrabold text-xl leading-snug mb-2 text-zinc-900">{book.title}</h3>
                    <p className="text-sm font-medium text-zinc-500 mb-6">{book.author}</p>
                    
                    {/* Menu déroulant style "Pilule luxe" */}
                    <div className="mt-auto relative inline-block w-max">
                      <select 
                        value={book.status} 
                        onChange={(e) => handleStatusChange(book.id, e.target.value)}
                        className="appearance-none bg-zinc-50 border border-zinc-200 text-zinc-900 text-xs font-bold uppercase tracking-widest rounded-full px-5 py-2.5 pr-10 outline-none focus:border-zinc-900 transition-colors cursor-pointer"
                      >
                        <option value="to_read">À LIR E</option>
                        <option value="reading">EN COURS</option>
                        <option value="read">TERMINÉ</option>
                      </select>
                      {/* Petite flèche custom pour le select */}
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-900">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Zone de notation (Minimaliste) */}
                <div className="mt-2 pt-5 border-t border-zinc-100 flex items-center justify-between">
                  <span className={`text-xs font-bold uppercase tracking-widest ${book.status === 'read' ? 'text-zinc-900' : 'text-zinc-300'}`}>
                    Évaluation
                  </span>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleRatingChange(book.id, star)}
                        disabled={book.status !== 'read'}
                        className={`text-xl transition-all duration-300 ${book.status !== 'read' ? 'cursor-not-allowed opacity-20' : 'hover:scale-125'} ${
                          (book.rating || 0) >= star ? 'text-zinc-900' : 'text-zinc-200 hover:text-zinc-400'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                {/* Zone d'avis (Sleek Textarea) */}
                {book.status === 'read' && (
                  <div className="mt-4">
                    <textarea
                      placeholder="Vos impressions sur cette œuvre..."
                      value={book.notes || ''}
                      onChange={(e) => handleLocalNotesChange(book.id, e.target.value)}
                      onBlur={(e) => saveNotesToDB(book.id, e.target.value)}
                      className="w-full text-sm font-medium p-4 bg-zinc-50 rounded-2xl border border-transparent focus:bg-white focus:border-zinc-200 focus:ring-4 focus:ring-zinc-100 outline-none resize-none h-24 text-zinc-900 placeholder:text-zinc-400 transition-all duration-500"
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