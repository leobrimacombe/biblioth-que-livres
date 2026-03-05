"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useParams } from 'next/navigation';
import InkButton from '../../components/InkButton'; // <-- IMPORT (attention au double '../')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function PublicLibraryPage() {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const userId = params.id as string;

  useEffect(() => {
    fetchUserBooks();
  }, [userId]);

  const fetchUserBooks = async () => {
    if (!userId) return;
    
    const { data, error } = await supabase
      .from('user_books')
      .select('*')
      .eq('user_id', userId)
      .order('added_at', { ascending: false });

    if (!error && data) setBooks(data);
    setLoading(false);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F3EE]">
      <div className="w-8 h-8 border-4 border-stone-900 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#F4F3EE] pt-28 sm:pt-32 pb-20 px-4 sm:px-6 font-sans text-stone-900 selection:bg-stone-900 selection:text-[#F4F3EE]">
      <div className="max-w-5xl mx-auto">
        
        <div className="flex flex-col items-start mb-10 sm:mb-16">
          {/* BOUTON ENCRE - RETOUR */}
          <InkButton href="/community" isDark={false} className="px-4 py-2 mb-8 text-[10px] font-black uppercase tracking-[0.2em]">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Retour au Club
          </InkButton>
          
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-stone-900 uppercase leading-none">
            Archives Publiques.
          </h1>
          <p className="text-xs font-bold text-stone-700 uppercase tracking-widest mt-4">
            Membre N° {userId.slice(0, 8)}
          </p>
        </div>

        {books.length === 0 ? (
          <div className="paper-card bg-[#FAFAFA] p-12 text-center border-dashed border-4 border-stone-300">
            <span className="text-sm font-bold text-stone-700 uppercase tracking-widest">Ce membre n'a pas encore de fiches archivées.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10">
            {books.map((book) => (
              <div key={book.id} className="paper-card paper-hover bg-[#FAFAFA] p-5 sm:p-6 flex flex-col relative group">
                
                <div className="flex gap-4 sm:gap-6 mb-4 sm:mb-6">
                  <div className="w-24 sm:w-32 flex-shrink-0">
                    {book.cover_url ? (
                      <img src={book.cover_url} alt={book.title} className="w-full paper-card p-1 bg-white grayscale-[10%] group-hover:grayscale-0 transition-all duration-300" />
                    ) : (
                      <div className="w-full h-36 sm:h-48 paper-card bg-stone-200 flex items-center justify-center text-[10px] font-black uppercase tracking-wider text-stone-500 text-center p-2">Sans Image</div>
                    )}
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-start pt-1 pr-2">
                    <h3 className="font-black text-lg sm:text-xl leading-snug mb-2 text-stone-900 uppercase border-b-2 border-stone-900 pb-2">{book.title}</h3>
                    <p className="text-xs sm:text-sm font-bold text-stone-700 mb-6">{book.author}</p>
                    
                    <div className="mt-auto inline-block paper-card bg-[#F4F3EE] px-4 py-2 self-start border-2 border-stone-900">
                      <span className="text-[10px] font-black uppercase tracking-widest text-stone-900">
                        {book.status === 'read' ? 'Terminé' : book.status === 'reading' ? 'En cours' : 'À lire'}
                      </span>
                    </div>
                  </div>
                </div>

                {book.status === 'read' && (
                  <div className="mt-2 pt-4 sm:pt-5 border-t-2 border-stone-900 border-dashed flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-stone-900">Note attribuée</span>
                      <div className="text-lg text-stone-900 tracking-widest">
                         {book.rating > 0 ? '★'.repeat(book.rating) + '☆'.repeat(5 - book.rating) : 'Non noté'}
                      </div>
                    </div>

                    {book.notes && (
                      <div className="bg-[#F4F3EE] p-4 paper-card border-l-4 border-stone-900 relative mt-2">
                        <span className="absolute -top-2 -left-2 text-2xl text-stone-400 font-serif leading-none">"</span>
                        <p className="text-sm font-serif italic text-stone-800 relative z-10 leading-relaxed">{book.notes}</p>
                      </div>
                    )}
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