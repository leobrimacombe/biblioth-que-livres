"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function CommunityPage() {
  const [recentBooks, setRecentBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCommunityBooks();
  }, []);

  const fetchCommunityBooks = async () => {
    // On récupère les 20 derniers livres ajoutés par tout le monde
    const { data, error } = await supabase
      .from('user_books')
      .select('*')
      .order('added_at', { ascending: false })
      .limit(20);

    if (!error && data) {
      setRecentBooks(data);
    }
    setLoading(false);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F3EE]">
      <div className="w-8 h-8 border-4 border-stone-900 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#F4F3EE] pt-28 sm:pt-32 pb-20 px-4 sm:px-6 font-sans text-stone-900 selection:bg-stone-900 selection:text-stone-900">
      <div className="max-w-5xl mx-auto">
        
        {/* En-tête style Journal */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="paper-card px-4 py-2 mb-4 -rotate-2 inline-block bg-stone-900 text-stone-900">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.4em]">
              Mur Public
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-stone-900 mb-6 uppercase">
            Le Club.
          </h1>
          <p className="text-sm font-bold text-stone-600 max-w-xl mx-auto border-t-2 border-b-2 border-stone-900 py-4 border-dashed">
            Les dernières trouvailles, lectures en cours et critiques laissées par les autres lecteurs. Prenez de l'inspiration.
          </p>
        </div>

        {recentBooks.length === 0 ? (
          <div className="paper-card bg-[#FAFAFA] p-12 text-center border-dashed border-4 border-stone-300">
            <span className="text-sm font-bold text-stone-800 uppercase tracking-widest">Le tableau d'affichage est vide aujourd'hui.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {recentBooks.map((book) => (
              // Fiche de lecture type "Polaroïd / Carte Postale"
              <div key={book.id} className="paper-card paper-hover bg-[#FAFAFA] p-4 flex flex-col relative group">
                
                {/* Petit scotch en haut */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-6 bg-stone-200/80 border border-stone-300/50 rotate-2 z-10 backdrop-blur-sm"></div>

                <div className="w-full aspect-square mb-4 paper-card bg-stone-100 overflow-hidden relative border-2 border-stone-900">
                  {book.cover_url ? (
                    <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-stone-700">Sans Image</div>
                  )}
                  
                  {/* Badge de statut superposé */}
                  <div className="absolute bottom-2 right-2 paper-card bg-[#F4F3EE] px-2 py-1 border-2 border-stone-900">
                    <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-stone-900">
                      {book.status === 'read' ? 'Terminé' : book.status === 'reading' ? 'En cours' : 'À lire'}
                    </span>
                  </div>
                </div>

                <div className="flex-1 flex flex-col">
                  <h3 className="font-black text-sm sm:text-base text-stone-900 mb-1 uppercase leading-tight line-clamp-2">{book.title}</h3>
                  <p className="text-[10px] sm:text-xs font-bold text-stone-800 mb-4">{book.author}</p>
                  
                  {book.status === 'read' && book.notes && (
                    <div className="mt-auto bg-[#F4F3EE] p-3 border-l-4 border-stone-900 relative">
                      <span className="absolute -top-2 -left-2 text-2xl text-stone-700 font-serif leading-none">"</span>
                      <p className="text-xs font-serif italic text-stone-700 line-clamp-3 relative z-10">{book.notes}</p>
                      
                      {book.rating > 0 && (
                        <div className="mt-2 text-stone-900 text-sm tracking-widest">
                          {'★'.repeat(book.rating)}{'☆'.repeat(5 - book.rating)}
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="mt-4 pt-3 border-t-2 border-stone-200 border-dashed flex justify-between items-center">
                     <span className="text-[8px] font-bold uppercase tracking-widest text-stone-700">Ajouté par le membre</span>
                     <Link href={`/community/${book.user_id}`} className="paper-card paper-btn bg-stone-900 text-stone-900 px-3 py-1 text-[8px] font-black uppercase tracking-widest">
                       Voir son étui
                     </Link>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}