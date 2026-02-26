"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function CommunityPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublicProfiles();
  }, []);

  const fetchPublicProfiles = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('is_public', true);

    if (!error && data) setProfiles(data);
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
        
        {/* En-tête */}
        <div className="flex flex-col items-center text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-400 mb-2">Le Réseau</span>
          <h1 className="text-5xl font-black tracking-tight text-zinc-900 mb-6">
            La Communauté.
          </h1>
          <p className="text-sm font-medium text-zinc-500 max-w-lg">
            Explorez les collections privées et les critiques littéraires des autres membres du réseau BookApp.
          </p>
        </div>

        {profiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border border-zinc-100 shadow-sm text-center">
            <span className="text-sm font-medium text-zinc-400">Aucune collection n'est publique pour le moment.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {profiles.map((profile) => (
              <Link 
                href={`/community/${profile.id}`} 
                key={profile.id}
                className="group bg-white rounded-[2rem] p-8 border border-zinc-100 transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] hover:-translate-y-1 flex flex-col items-center text-center relative overflow-hidden"
              >
                {/* Avatar Luxe */}
                <div className="w-20 h-20 bg-zinc-900 text-white rounded-full flex items-center justify-center font-black text-2xl mb-6 shadow-lg transition-transform duration-500 group-hover:scale-110">
                  {profile.username ? profile.username.charAt(0).toUpperCase() : "A"}
                </div>
                
                <h2 className="font-extrabold text-xl text-zinc-900 mb-2">{profile.username || "Anonyme"}</h2>
                
                {/* Ligne animée au survol */}
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 relative inline-block mt-4">
                  Voir la collection
                  <span className="absolute -bottom-1 left-0 w-full h-[1px] bg-zinc-900 origin-left scale-x-0 transition-transform duration-500 ease-out group-hover:scale-x-100"></span>
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}