"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import InkButton from '../components/InkButton';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function CommunityPage() {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCommunityBooks();
  }, []);

  const fetchCommunityBooks = async () => {
    // MAGIE ICI : On demande les livres ET on fait le lien avec la table 'profiles' pour avoir le pseudo
    const { data, error } = await supabase
      .from('user_books')
      .select('*, profiles(pseudo)')
      .order('added_at', { ascending: false })
      .limit(50);

    if (!error && data) {
      setBooks(data);
    }
    setLoading(false);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F3EE]">
      <div className="w-8 h-8 border-4 border-stone-900 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#F4F3EE] pt-32 pb-20 px-4 sm:px-6 font-sans text-stone-900 selection:bg-stone-900 selection:text-[#F4F3EE]">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col items-center text-center mb-16">
          <div className="paper-card px-4 py-2 mb-4 -rotate-2 inline-block bg-stone-900 text-[#F4F3EE]">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.4em]">Réseau Public</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-stone-900 mb-6 uppercase">
            Le Club.
          </h1>
          <p className="text-sm font-bold text-stone-700 max-w-lg mx-auto">
            Découvrez les dernières archives et fiches de lecture des membres du cercle.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {books.map((book) => (
            <div key={book.id} className="paper-card bg-[#FAFAFA] p-6 flex flex-col justify-between hover:-translate-y-2 transition-transform duration-300">
              <div>
                <div className="flex items-start justify-between mb-4 border-b-2 border-stone-900 pb-4 border-dashed">
                  <div className="w-20 shrink-0 paper-card bg-white p-1 border-2 border-stone-900 mr-4">
                    {book.cover_url ? (
                      <img src={book.cover_url} alt="Couverture" className="w-full h-auto" />
                    ) : (
                      <div className="w-full h-28 bg-stone-200 flex items-center justify-center text-[8px] font-black uppercase text-stone-600 text-center">Sans Image</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-black text-lg text-stone-900 mb-1 leading-tight uppercase line-clamp-2">{book.title}</h3>
                    <p className="text-[10px] font-bold text-stone-500">{book.author}</p>
                    <div className="mt-2 paper-card inline-block bg-[#F4F3EE] px-2 py-1 text-[8px] font-black uppercase tracking-widest">
                      {book.status === 'read' ? 'TERMINÉ' : book.status === 'reading' ? 'EN COURS' : 'À LIRE'}
                    </div>
                  </div>
                </div>

                {book.notes && (
                  <div className="bg-[#F4F3EE] p-4 paper-card mb-4">
                    <p className="text-xs font-serif italic text-stone-800 line-clamp-3">"{book.notes}"</p>
                  </div>
                )}
                {book.rating > 0 && (
                  <div className="flex gap-1 text-stone-900 text-sm mb-4">
                    {[...Array(book.rating)].map((_, i) => <span key={i}>★</span>)}
                    {[...Array(5 - book.rating)].map((_, i) => <span key={i} className="text-stone-300">★</span>)}
                  </div>
                )}
              </div>

              <div>
                {/* On affiche ENFIN le pseudo du membre ! */}
                <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-stone-400 mt-6 border-t-2 border-stone-100 pt-4 mb-4 flex items-center gap-2">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                  Ajouté par {book.profiles?.pseudo || 'Membre Anonyme'}
                </p>
                <InkButton href={`/community/${book.user_id}`} isDark={true} className="w-full py-3 text-[10px] font-black uppercase tracking-widest text-center">
                  Voir sa Bibliothèque
                </InkButton>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}