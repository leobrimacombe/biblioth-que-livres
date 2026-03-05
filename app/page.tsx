import Link from 'next/link';

export default function HomePage() {
  return (
    // La sélection de texte devient noire sur fond papier
    <main className="min-h-screen pt-32 pb-20 px-6 font-sans text-stone-900 overflow-x-hidden relative selection:bg-stone-900 selection:text-stone-900">
      
      <div className="max-w-5xl mx-auto relative z-10 flex flex-col items-center text-center mt-6 md:mt-16">
        
        {/* Étiquette "Coup de tampon" inclinée */}
        <div className="paper-card px-4 py-2 mb-8 -rotate-2 inline-block">
          <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-stone-900">
            N° 1 — Édition Numérique
          </span>
        </div>
        
        {/* Titre avec le mot "Pépite" encadré de noir et décalé */}
        <h1 className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tighter text-stone-900 mb-8 leading-[1.1] md:leading-[0.9]">
          Trouvez votre <br className="hidden md:block" />
          prochaine <span className="inline-block paper-card bg-stone-900 text-[#000000] px-4 py-0 md:py-2 rotate-2 translate-y-2 md:translate-y-4 shadow-[6px_6px_0px_0px_#d6d3d1]">Pépite.</span>
        </h1>
        
        <p className="text-sm md:text-lg font-bold text-stone-600 max-w-2xl mb-12 leading-relaxed px-4 mt-4">
          Un carnet de lecture numérique pour les puristes. 
          Rangez vos œuvres, notez vos impressions et explorez les archives du club.
        </p>

        {/* Boutons d'action bruts */}
        <div className="flex flex-col sm:flex-row gap-6 mb-24 w-full sm:w-auto px-4">
          <Link href="/search" className="paper-card paper-btn bg-stone-900 text-stone-900 px-8 py-4 text-xs font-black uppercase tracking-widest text-center">
            Rechercher une œuvre
          </Link>
          <Link href="/library" className="paper-card paper-btn bg-[#FAFAFA] text-stone-900 px-8 py-4 text-xs font-black uppercase tracking-widest text-center">
            Ouvrir mon étui
          </Link>
        </div>

        {/* Fiches Cartonnées (Posées de travers sur le bureau) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full text-left pt-12 border-t-2 border-stone-900/10">
          
          <Link href="/search" className="paper-card paper-hover bg-[#FAFAFA] p-8 flex flex-col h-full -rotate-1 hover:rotate-0 hover:z-10 relative">
            <div className="w-12 h-12 paper-card bg-stone-900 text-stone-900 rounded-none flex items-center justify-center mb-6">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
            </div>
            <h3 className="text-xl font-black text-stone-900 mb-3 uppercase tracking-wider border-b-2 border-stone-900 pb-2">Index</h3>
            <p className="text-sm text-stone-600 font-bold leading-relaxed mt-2">Feuilletez nos archives mondiales. Retrouvez des millions d'éditions et leurs synopsis originaux.</p>
          </Link>

          {/* Fiche centrale surélevée et tournée dans l'autre sens */}
          <Link href="/library" className="paper-card paper-hover bg-[#FAFAFA] p-8 flex flex-col h-full rotate-2 hover:rotate-0 hover:z-10 relative mt-0 md:mt-8">
            <div className="w-12 h-12 paper-card bg-stone-900 text-stone-900 rounded-none flex items-center justify-center mb-6">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.75V16.5L12 14.25 7.5 16.5V3.75m9 0H18A2.25 2.25 0 0120.25 6v12A2.25 2.25 0 0118 20.25H6A2.25 2.25 0 013.75 18V6A2.25 2.25 0 016 3.75h1.5m9 0h-9" /></svg>
            </div>
            <h3 className="text-xl font-black text-stone-900 mb-3 uppercase tracking-wider border-b-2 border-stone-900 pb-2">L'Étui</h3>
            <p className="text-sm text-stone-600 font-bold leading-relaxed mt-2">Votre collection privée. Annotez vos lectures, cornez les pages et classez vos ouvrages par catégorie.</p>
          </Link>

          <Link href="/community" className="paper-card paper-hover bg-[#FAFAFA] p-8 flex flex-col h-full -rotate-2 hover:rotate-0 hover:z-10 relative">
            <div className="w-12 h-12 paper-card bg-stone-900 text-stone-900 rounded-none flex items-center justify-center mb-6">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" /></svg>
            </div>
            <h3 className="text-xl font-black text-stone-900 mb-3 uppercase tracking-wider border-b-2 border-stone-900 pb-2">Le Club</h3>
            <p className="text-sm text-stone-600 font-bold leading-relaxed mt-2">Affichez vos fiches de lecture au mur public du club et découvrez les trouvailles des autres membres.</p>
          </Link>

        </div>

      </div>
    </main>
  );
}