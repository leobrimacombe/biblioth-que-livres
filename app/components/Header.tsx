"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      if (event === 'SIGNED_IN') {
        setIsAuthModalOpen(false);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // Fermer le menu mobile quand on change de page
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Design des liens pour la version Bureau
  const getNavLink = (path: string, label: string) => {
    const isActive = pathname === path;
    return (
      <Link href={path} className="group relative px-2 py-1">
        <span className={`relative z-10 text-xs font-bold uppercase tracking-widest transition-colors duration-500 ease-out ${
          isActive ? 'text-zinc-900' : 'text-zinc-500 group-hover:text-zinc-900'
        }`}>
          {label}
        </span>
        <span className={`absolute bottom-0 left-0 h-[2px] w-full bg-zinc-900 origin-center transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] ${
          isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
        }`}></span>
      </Link>
    );
  };

  // Design des liens pour le Menu Mobile
  const getMobileNavLink = (path: string, label: string) => {
    const isActive = pathname === path;
    return (
      <Link 
        href={path} 
        className={`block px-5 py-4 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all ${
          isActive ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <>
      <div className="fixed top-4 md:top-6 inset-x-0 z-40 flex flex-col items-center px-4 pointer-events-none">
        
        {/* LA BARRE PRINCIPALE */}
        <header className="relative pointer-events-auto w-full max-w-5xl bg-white/60 backdrop-blur-3xl border border-zinc-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-full flex items-center justify-between px-5 md:px-6 py-3 transition-all duration-700 hover:bg-white/80 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
          
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-8 h-8 bg-zinc-900 text-white rounded-full flex items-center justify-center font-bold text-sm transition-transform duration-500 group-hover:rotate-90 ease-[cubic-bezier(0.19,1,0.22,1)]">
                B.
              </div>
              <span className="text-sm font-black tracking-[0.2em] uppercase text-zinc-900 hidden sm:block">
                BookApp
              </span>
            </Link>
          </div>

          {/* Navigation Bureau */}
          <nav className="hidden md:flex items-center gap-8">
            {getNavLink('/', 'Explorateur')}
            {getNavLink('/discover', 'Découverte')}
            {getNavLink('/community', 'Réseau')}
          </nav>

          {/* Boutons (Droite) */}
          <div className="flex items-center gap-2 md:gap-4">
            
            {/* Navigation Bureau (Utilisateur) */}
            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <>
                  <Link href="/profile" className="text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-900 transition-colors duration-500">
                    Profil
                  </Link>
                  <Link href="/library" className="relative overflow-hidden rounded-full border border-zinc-200 bg-white px-5 py-2 text-xs font-bold uppercase tracking-widest text-zinc-900 transition-all duration-500 hover:border-zinc-900 hover:bg-zinc-50 active:scale-95">
                    Bibliothèque
                  </Link>
                  <button onClick={() => supabase.auth.signOut()} className="text-zinc-400 hover:text-red-500 transition-colors duration-500" title="Se déconnecter">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                  </button>
                </>
              ) : (
                <button onClick={() => setIsAuthModalOpen(true)} className="relative overflow-hidden rounded-full bg-zinc-900 px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-white transition-all duration-500 hover:bg-zinc-800 active:scale-95">
                  Connexion
                </button>
              )}
            </div>

            {/* Navigation Mobile (Bouton Connexion + Burger) */}
            <div className="flex md:hidden items-center gap-2">
              {!user && (
                <button onClick={() => setIsAuthModalOpen(true)} className="rounded-full bg-zinc-900 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white transition-all active:scale-95">
                  Connexion
                </button>
              )}
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-zinc-900 bg-zinc-100 rounded-full hover:bg-zinc-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}></path>
                </svg>
              </button>
            </div>

          </div>
        </header>

        {/* LE MENU MOBILE (Déroulant) */}
        {isMobileMenuOpen && (
          <div className="pointer-events-auto absolute top-full left-4 right-4 mt-2 bg-white/95 backdrop-blur-3xl border border-zinc-200 shadow-2xl rounded-[2rem] p-3 flex flex-col gap-1 md:hidden animate-in slide-in-from-top-4 fade-in duration-300">
            {getMobileNavLink('/', 'Explorateur')}
            {getMobileNavLink('/discover', 'Découverte')}
            {getMobileNavLink('/community', 'Réseau')}
            
            {user && (
              <>
                <div className="h-[1px] w-full bg-zinc-100 my-2"></div>
                {getMobileNavLink('/library', 'Ma Bibliothèque')}
                {getMobileNavLink('/profile', 'Mon Profil')}
                <button 
                  onClick={() => { supabase.auth.signOut(); setIsMobileMenuOpen(false); }} 
                  className="block w-full text-left px-5 py-4 rounded-2xl text-xs font-bold uppercase tracking-widest text-red-500 hover:bg-red-50 transition-colors"
                >
                  Se déconnecter
                </button>
              </>
            )}
          </div>
        )}

      </div>

      {/* MODALE DE CONNEXION LUXE */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-900/40 backdrop-blur-md p-4 transition-all animate-in fade-in duration-300">
          <div className="absolute inset-0" onClick={() => setIsAuthModalOpen(false)}></div>
          
          <div className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl p-8 sm:p-10 animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-zinc-50 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>

            <div className="text-center mb-8">
              <div className="w-12 h-12 bg-zinc-900 text-white rounded-full flex items-center justify-center font-black text-xl mx-auto mb-4">B.</div>
              <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Accès Membre</h2>
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mt-2">Rejoignez la collection</p>
            </div>

            <div className="auth-container">
              <Auth
                supabaseClient={supabase}
                appearance={{
                  theme: ThemeSupa,
                  variables: {
                    default: {
                      colors: {
                        brand: '#18181b',
                        brandAccent: '#27272a',
                      },
                      radii: {
                        borderRadiusButton: '9999px',
                        buttonBorderRadius: '9999px',
                        inputBorderRadius: '1rem',
                      },
                    },
                  },
                  className: {
                    button: 'uppercase tracking-widest text-xs font-bold',
                    input: 'bg-zinc-50 border-transparent focus:border-zinc-200 focus:ring-4 focus:ring-zinc-100',
                  }
                }}
                providers={[]}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}