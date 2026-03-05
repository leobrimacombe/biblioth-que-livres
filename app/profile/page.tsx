"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import InkButton from '../components/InkButton'; // <-- IMPORT

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, read: 0, reading: 0, toRead: 0 });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      setUser(user);
      const { data, error } = await supabase.from('user_books').select('status').eq('user_id', user.id);
      
      if (!error && data) {
        setStats({
          total: data.length,
          read: data.filter(b => b.status === 'read').length,
          reading: data.filter(b => b.status === 'reading').length,
          toRead: data.filter(b => b.status === 'to_read').length,
        });
      }
    }
    setLoading(false);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F3EE]">
      <div className="w-8 h-8 border-4 border-stone-900 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!user) return (
    <div className="min-h-screen bg-[#F4F3EE] pt-32 px-6 flex flex-col items-center text-center font-sans">
      <h1 className="text-4xl font-black text-stone-900 uppercase mb-6">Accès Refusé</h1>
      <p className="text-stone-700 font-bold mb-8">Vous devez signer le registre pour voir votre dossier.</p>
      <InkButton href="/" isDark={true} className="px-8 py-4 font-black uppercase tracking-widest text-xs">
        Retour à l'accueil
      </InkButton>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#F4F3EE] pt-28 sm:pt-32 pb-20 px-4 sm:px-6 font-sans text-stone-900 selection:bg-stone-900 selection:text-[#F4F3EE]">
      <div className="max-w-3xl mx-auto">
        
        <div className="flex flex-col items-center text-center mb-12">
          <div className="paper-card px-4 py-2 mb-4 -rotate-2 inline-block bg-[#FAFAFA]">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.4em] text-stone-900">Dossier Confidentiel</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-stone-900 mb-4 uppercase">
            Mon Profil.
          </h1>
        </div>

        <div className="paper-card bg-[#FAFAFA] p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-8 right-8 w-24 h-24 border-4 border-stone-900/20 rounded-full flex items-center justify-center -rotate-12 pointer-events-none">
            <span className="text-stone-900/20 font-black uppercase tracking-widest text-xs text-center leading-none">Membre<br/>Actif</span>
          </div>

          <h2 className="text-sm font-black uppercase tracking-widest text-stone-700 mb-8 border-b-4 border-stone-900 pb-2">Informations du membre</h2>
          
          <div className="space-y-6 mb-12">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-stone-700 mb-1">Identifiant Unique (ID)</label>
              <div className="font-serif italic text-stone-900 bg-[#F4F3EE] p-3 paper-card text-sm md:text-base break-all">
                {user.id}
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-stone-700 mb-1">Courriel Enregistré</label>
              <div className="font-serif italic text-stone-900 bg-[#F4F3EE] p-3 paper-card text-sm md:text-base">
                {user.email}
              </div>
            </div>
          </div>

          <h2 className="text-sm font-black uppercase tracking-widest text-stone-700 mb-8 border-b-4 border-stone-900 pb-2">Bilan de Lecture</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#F4F3EE] paper-card p-4 text-center">
              <span className="block text-3xl font-black text-stone-900 mb-1">{stats.total}</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-stone-700">Total Fiches</span>
            </div>
            <div className="bg-[#F4F3EE] paper-card p-4 text-center">
              <span className="block text-3xl font-black text-stone-900 mb-1">{stats.read}</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-stone-700">Terminés</span>
            </div>
            <div className="bg-[#F4F3EE] paper-card p-4 text-center">
              <span className="block text-3xl font-black text-stone-900 mb-1">{stats.reading}</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-stone-700">En Cours</span>
            </div>
            <div className="bg-[#F4F3EE] paper-card p-4 text-center">
              <span className="block text-3xl font-black text-stone-900 mb-1">{stats.toRead}</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-stone-700">À Lire</span>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t-2 border-stone-900 border-dashed flex justify-center">
            {/* BOUTON ENCRE - DECONNEXION */}
            <InkButton 
              onClick={() => supabase.auth.signOut()} 
              isDark={true}
              className="px-8 py-3 text-xs font-black uppercase tracking-widest"
            >
              Fermer le dossier (Déconnexion)
            </InkButton>
          </div>
        </div>

      </div>
    </main>
  );
}