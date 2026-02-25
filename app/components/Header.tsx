"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const pathname = usePathname();

  useEffect(() => {
    // Vérifie qui est connecté au chargement
    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    // Écoute les changements (connexion/déconnexion en temps réel)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Navigation Gauche */}
        <div className="flex items-center gap-6">
          <Link href="/" className="text-2xl font-bold text-blue-600 tracking-tight">
            BookApp📚
          </Link>
          <nav className="hidden md:flex gap-4">
            <Link href="/" className={`text-sm font-medium ${pathname === '/' ? 'text-blue-600' : 'text-gray-500 hover:text-black'}`}>Recherche</Link>
            <Link href="/discover" className={`text-sm font-medium ${pathname === '/discover' ? 'text-purple-600' : 'text-gray-500 hover:text-black'}`}>✨ IA</Link>
            <Link href="/community" className={`text-sm font-medium ${pathname === '/community' ? 'text-green-600' : 'text-gray-500 hover:text-black'}`}>🌍 Communauté</Link>
          </nav>
        </div>

        {/* Espace Utilisateur Droite */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-sm text-gray-500 hidden sm:block">{user.email}</span>
              <Link href="/library" className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-200 transition">
                Ma Bibliothèque
              </Link>
              <button 
                onClick={() => supabase.auth.signOut()} 
                className="text-sm text-gray-400 hover:text-red-500 transition"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <Link href="/" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700">
              Se connecter
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}