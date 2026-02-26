"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function UserLibraryPage() {
  const params = useParams();
  const userId = params.id as string;
  
  const [books, setBooks] = useState<any[]>([]);
  const [username, setUsername] = useState("Un membre");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserLibrary();
  }, [userId]);

  const fetchUserLibrary = async () => {
    const { data: profileData } = await supabase.from('profiles').select('username').eq('id', userId).single();
    if (profileData?.username) setUsername(profileData.username);

    const { data: booksData } = await supabase.from('user_books').select('*').eq('user_id', userId).order('added_at', { ascending: false });
    if (booksData) setBooks(booksData);
    setLoading(false);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <div className="w-6 h-6 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <main className="min-h-screen bg-zinc-50 pt-32 pb-20 px-6 font-sans text-zinc-900 transition-colors duration-500">
      <div className="max-w-5xl mx-auto">
        
        {/* En-tête avec bouton retour minimaliste */}
        <div className="mb-16">
          <Link href="/community" className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors mb-8">
            <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Retour au réseau
          </Link>
          <div className="flex flex-col items-start">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-400 mb-2">Collection Publique</span>
            <h1 className="text-5xl font-black tracking-tight text-zinc-900">
              {username}.
            </h1>
          </div>
        </div>

        {books.length === 0 ? (
          <div className="py-20 bg-white rounded-[2rem] border border-zinc-100 text-center shadow-sm">
            <span className="text-sm font-medium text-zinc-400">Cette collection est actuellement vide.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {books.map((book) => (
              <div key={book.id} className="bg-white rounded-[2rem] p-6 border border-zinc-100 shadow-sm flex flex-col hover:shadow-md transition-shadow duration-500">
                
                <div className="flex gap-6 mb-6">
                  <div className="w-28 flex-shrink-0">
                    {book.cover_url ? (
                      <img src={book.cover_url} alt={book.title} className="w-full rounded-xl shadow-[0_8px_20px_rgb(0,0,0,0.08)]" />
                    ) : (
                      <div className="w-full h-40 bg-zinc-100 flex items-center justify-center rounded-xl text-[10px] font-bold uppercase tracking-wider text-zinc-300 text-center p-2">Sans<br/>Image</div>
                    )}
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-start pt-2 pr-2">
                    <h3 className="font-extrabold text-xl leading-snug mb-2 text-zinc-900">{book.title}</h3>
                    <p className="text-sm font-medium text-zinc-500 mb-6">{book.author}</p>
                    
                    {/* Badge de statut statique et chic */}
                    <div className="mt-auto">
                      <span className="inline-flex items-center gap-2 bg-zinc-50 border border-zinc-200 text-zinc-900 text-[10px] font-bold uppercase tracking-widest rounded-full px-4 py-2">
                        {book.status === 'read' && <span className="w-1.5 h-1.5 rounded-full bg-zinc-900"></span>}
                        {book.status === 'reading' && <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-pulse"></span>}
                        {book.status === 'to_read' && <span className="w-1.5 h-1.5 rounded-full border border-zinc-400"></span>}
                        {book.status === 'read' ? 'Terminé' : book.status === 'reading' ? 'En lecture' : 'À lire'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Évaluation en lecture seule */}
                {book.status === 'read' && (
                  <div className="mt-2 pt-5 border-t border-zinc-100 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-widest text-zinc-900">
                      Évaluation
                    </span>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className={`text-xl ${ (book.rating || 0) >= star ? 'text-zinc-900' : 'text-zinc-200' }`}>★</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Avis de l'utilisateur stylisé façon "Citation" */}
                {book.status === 'read' && book.notes && (
                  <div className="mt-6 pt-6 border-t border-zinc-100 relative">
                    <span className="absolute -top-3 left-4 bg-white px-2 text-[10px] font-bold uppercase tracking-widest text-zinc-300">Critique</span>
                    <p className="text-sm font-medium leading-relaxed text-zinc-600 italic px-2">
                      "{book.notes}"
                    </p>
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