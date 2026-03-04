import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-zinc-50 pt-32 pb-20 px-6 font-sans text-zinc-900 transition-colors duration-500 overflow-x-hidden relative">
      
      {/* Décors flous chaleureux */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-zinc-200/50 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[40%] bg-zinc-200/30 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-5xl mx-auto relative z-10 flex flex-col items-center text-center mt-6 md:mt-16">
        
        <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.4em] text-zinc-400 mb-6 border border-zinc-200 px-4 py-2 rounded-full bg-white/50 backdrop-blur-sm shadow-sm">
          Bienvenue dans votre coin lecture
        </span>
        
        <h1 className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tighter text-zinc-900 mb-6 md:mb-8 leading-[1.1] md:leading-[0.9]">
          Trouvez votre prochaine <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-900 to-zinc-400 italic font-serif pr-2 md:pr-4">
            Pépite.
          </span>
        </h1>
        
        <p className="text-sm md:text-lg font-medium text-zinc-500 max-w-2xl mb-12 leading-relaxed px-4">
          BookApp est une bibliothèque numérique simple et chaleureuse. Rangez vos livres préférés, gardez une trace de vos lectures et découvrez ce que vos amis ont aimé.
        </p>

        {/* Boutons d'Action Principaux */}
        <div className="flex flex-col sm:flex-row gap-4 mb-24 w-full sm:w-auto px-4">
          <Link href="/search" className="rounded-full bg-zinc-900 px-8 py-4 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-zinc-800 active:scale-95 shadow-lg">
            Rechercher un livre
          </Link>
          {/* Bouton "Ma Bibliothèque" - Effet Couverture de Livre 3D */}
          <div style={{ perspective: '1000px' }} className="w-full sm:w-auto group z-20">
            <Link 
              href="/library" 
              className="relative block w-full bg-white px-8 py-4 text-xs font-bold uppercase tracking-widest text-zinc-900 transition-all duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-95 text-center origin-left border border-zinc-200 rounded-r-2xl rounded-l-sm group-hover:[transform:rotateY(-20deg)] group-hover:shadow-[25px_15px_25px_-5px_rgba(0,0,0,0.08)] group-hover:border-zinc-300"
            >
              {/* Petite ligne subtile simulant la pliure de la couverture à gauche */}
              <div className="absolute left-2 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-zinc-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <span className="relative z-10 inline-block transition-transform duration-500 group-hover:translate-x-1">
                Ma Bibliothèque
              </span>

              {/* Reflet de lumière sur le papier courbé au survol */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-zinc-100/80 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-r-2xl"></div>
            </Link>
          </div>
        </div>

        {/* Les 3 Cartes Cliquables (Thème "Livre") */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full text-left pt-12 border-t border-zinc-200/50">
          
          {/* Carte 1 : Explorez -> Mène vers la Recherche */}
          <Link href="/search" className="group bg-white p-8 rounded-3xl shadow-sm border border-zinc-100 transition-all duration-700 hover:shadow-xl hover:-translate-y-2 hover:border-zinc-300 relative overflow-hidden flex flex-col h-full">
            {/* Effet "Page Cornée" en haut à droite */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-zinc-100 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-bl-[4rem]"></div>
            
            {/* Icône Livre Ouvert */}
            <div className="w-12 h-12 bg-zinc-50 border border-zinc-100 rounded-full flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3 relative z-10 text-zinc-900">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            </div>
            
            <h3 className="text-xl font-bold text-zinc-900 mb-3 flex items-center gap-2 relative z-10">
              Explorez
              {/* Flèche style sens de lecture */}
              <svg className="w-4 h-4 opacity-0 -translate-x-4 transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:opacity-100 group-hover:translate-x-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
            </h3>
            <p className="text-sm text-zinc-500 font-medium leading-relaxed relative z-10 mt-auto">Recherchez parmi des millions d'œuvres, consultez les résumés et trouvez exactement ce que vous voulez lire.</p>
          </Link>

          {/* Carte 2 : Organisez -> Mène vers la Bibliothèque */}
          <Link href="/library" className="group bg-white p-8 rounded-3xl shadow-sm border border-zinc-100 transition-all duration-700 hover:shadow-xl hover:-translate-y-2 hover:border-zinc-300 relative overflow-hidden flex flex-col h-full">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-zinc-100 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-bl-[4rem]"></div>
            
            {/* Icône Marque-page / Livres empilés */}
            <div className="w-12 h-12 bg-zinc-50 border border-zinc-100 rounded-full flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3 relative z-10 text-zinc-900">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.75V16.5L12 14.25 7.5 16.5V3.75m9 0H18A2.25 2.25 0 0120.25 6v12A2.25 2.25 0 0118 20.25H6A2.25 2.25 0 013.75 18V6A2.25 2.25 0 016 3.75h1.5m9 0h-9" /></svg>
            </div>
            
            <h3 className="text-xl font-bold text-zinc-900 mb-3 flex items-center gap-2 relative z-10">
              Organisez
              <svg className="w-4 h-4 opacity-0 -translate-x-4 transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:opacity-100 group-hover:translate-x-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
            </h3>
            <p className="text-sm text-zinc-500 font-medium leading-relaxed relative z-10 mt-auto">Ajoutez des œuvres à votre collection privée. Classez-les par statut et gardez une trace de votre progression.</p>
          </Link>

          {/* Carte 3 : Partagez -> Mène vers le Réseau (Communauté) */}
          <Link href="/community" className="group bg-white p-8 rounded-3xl shadow-sm border border-zinc-100 transition-all duration-700 hover:shadow-xl hover:-translate-y-2 hover:border-zinc-300 relative overflow-hidden flex flex-col h-full">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-zinc-100 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-bl-[4rem]"></div>
            
            {/* Icône Réseau / Partage */}
            <div className="w-12 h-12 bg-zinc-50 border border-zinc-100 rounded-full flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3 relative z-10 text-zinc-900">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" /></svg>
            </div>
            
            <h3 className="text-xl font-bold text-zinc-900 mb-3 flex items-center gap-2 relative z-10">
              Partagez
              <svg className="w-4 h-4 opacity-0 -translate-x-4 transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:opacity-100 group-hover:translate-x-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
            </h3>
            <p className="text-sm text-zinc-500 font-medium leading-relaxed relative z-10 mt-auto">Rendez votre profil public pour permettre aux autres membres du réseau de découvrir vos coups de cœur.</p>
          </Link>

        </div>

      </div>
    </main>
  );
}