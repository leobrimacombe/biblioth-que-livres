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
      if (event === 'SIGNED_IN') setIsAuthModalOpen(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // L'EFFET PAPIER DÉCOUPÉ (Fond ET Texte pivotent ensemble)
  const getNavLink = (path: string, label: string) => {
    const isActive = pathname === path;
    return (
      <Link href={path} className="group relative inline-block p-1">
        {/* C'est ce conteneur global qui se soulève et tourne */}
        <div className={`relative px-4 py-2 transition-all duration-300 origin-bottom-left ${
          isActive 
            ? '-rotate-2 -translate-y-1' 
            : 'group-hover:-rotate-3 group-hover:-translate-y-1'
        }`}>
          
          {/* Le fond de la feuille (l'opacité et l'ombre changent) */}
          <div className={`absolute inset-0 border-2 border-stone-900 bg-[#FAFAFA] transition-all duration-300 z-0 ${
            isActive 
              ? 'opacity-100 shadow-[2px_2px_0px_0px_#1c1917]' 
              : 'opacity-0 group-hover:opacity-100 group-hover:shadow-[4px_4px_0px_0px_#1c1917]'
          }`}></div>
          
          {/* Le texte posé sur la feuille */}
          <span className={`relative z-10 text-xs font-black uppercase tracking-widest transition-colors ${
            isActive ? 'text-stone-900' : 'text-stone-600 group-hover:text-stone-900'
          }`}>
            {label}
          </span>
          
        </div>
      </Link>
    );
  };

  return (
    <>
      <div className="fixed top-4 md:top-6 inset-x-0 z-40 flex flex-col items-center px-4 md:px-6 pointer-events-none">
        
        <header className="pointer-events-auto w-full max-w-6xl paper-card flex items-center justify-between px-6 md:px-8 py-4">
          
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-stone-900 text-stone-900 flex items-center justify-center font-black text-lg border-2 border-stone-900 transition-transform duration-300 group-hover:-rotate-6">
                B.
              </div>
              <span className="text-sm font-black tracking-[0.2em] uppercase text-stone-900 hidden sm:block">
                BookApp
              </span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            {getNavLink('/search', 'Index')}
            {getNavLink('/discover', 'Inspirations')}
            {getNavLink('/community', 'Le Club')}
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-6">
              {user ? (
                <>
                  <Link href="/profile" className="text-xs font-bold uppercase tracking-widest text-stone-800 hover:text-stone-900">
                    Profil
                  </Link>
                  <Link href="/library" className="paper-card paper-btn px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-stone-900 bg-[#F4F3EE]">
                    Mon Étui
                  </Link>
                  <button onClick={() => supabase.auth.signOut()} className="text-stone-700 hover:text-stone-900" title="Se déconnecter">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                  </button>
                </>
              ) : (
                <button onClick={() => setIsAuthModalOpen(true)} className="paper-card paper-btn bg-stone-900 text-stone-900 px-8 py-3 text-xs font-bold uppercase tracking-widest">
                  S'identifier
                </button>
              )}
            </div>

            <div className="flex md:hidden items-center gap-3">
              {!user && (
                <button onClick={() => setIsAuthModalOpen(true)} className="paper-card paper-btn bg-stone-900 text-stone-900 px-4 py-2 text-[10px] font-bold uppercase tracking-widest">
                  Login
                </button>
              )}
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="paper-card paper-btn p-2 text-stone-900 bg-[#F4F3EE]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}></path>
                </svg>
              </button>
            </div>
          </div>
        </header>

        {isMobileMenuOpen && (
          <div className="pointer-events-auto absolute top-full left-4 right-4 mt-4 paper-card p-4 flex flex-col gap-2 md:hidden animate-in slide-in-from-top-4 duration-300">
            <Link href="/search" className="p-4 font-bold uppercase tracking-widest text-xs border-b border-stone-200">Index</Link>
            <Link href="/discover" className="p-4 font-bold uppercase tracking-widest text-xs border-b border-stone-200">Inspirations</Link>
            <Link href="/community" className="p-4 font-bold uppercase tracking-widest text-xs border-b border-stone-200">Le Club</Link>
            {user && (
              <>
                <Link href="/library" className="p-4 font-bold uppercase tracking-widest text-xs border-b border-stone-200 bg-stone-100">Mon Étui</Link>
                <button onClick={() => supabase.auth.signOut()} className="p-4 font-bold uppercase tracking-widest text-xs text-left w-full hover:bg-stone-50">Se déconnecter</button>
              </>
            )}
          </div>
        )}
      </div>

      {isAuthModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/20 backdrop-blur-sm p-4">
          <div className="absolute inset-0" onClick={() => setIsAuthModalOpen(false)}></div>
          
          <div className="relative w-full max-w-md paper-card p-10 animate-in zoom-in-95 duration-200">
            <button onClick={() => setIsAuthModalOpen(false)} className="absolute top-0 right-0 w-12 h-12 flex items-center justify-center paper-card paper-btn bg-[#F4F3EE] -translate-y-4 translate-x-4">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>

            <div className="text-center mb-8 border-b-2 border-stone-900 pb-6">
              <h2 className="text-3xl font-black text-stone-900 tracking-tight uppercase">Registre</h2>
              <p className="text-xs font-bold uppercase tracking-widest text-stone-800 mt-2">Signez le registre pour entrer</p>
            </div>

            <div className="auth-container brutalist-auth">
              <Auth
                supabaseClient={supabase}
                appearance={{
                  theme: ThemeSupa,
                  variables: {
                    default: { colors: { brand: '#1c1917', brandAccent: '#292524' }, radii: { borderRadiusButton: '0px', buttonBorderRadius: '0px', inputBorderRadius: '0px' } },
                  },
                  className: {
                    button: 'uppercase tracking-widest text-xs font-bold border-2 border-stone-900 shadow-[4px_4px_0_0_#1c1917] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0_0_#1c1917] transition-all',
                    input: 'bg-transparent border-2 border-stone-900 focus:border-stone-900 focus:ring-0 rounded-none shadow-[4px_4px_0_0_rgba(28,25,23,0.1)]',
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