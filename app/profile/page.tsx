"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [username, setUsername] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserEmail(user.email || "");
      const { data } = await supabase.from('profiles').select('username, is_public').eq('id', user.id).single();
      if (data) {
        setUsername(data.username || "");
        setIsPublic(data.is_public || false);
      }
    }
    setLoading(false);
  };

  const saveProfile = async () => {
    setSaving(true);
    setSaveMessage("");
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { error } = await supabase
        .from('profiles')
        .update({ username, is_public: isPublic })
        .eq('id', user.id);

      if (error) {
        setSaveMessage("Erreur lors de la sauvegarde.");
      } else {
        setSaveMessage("Modifications enregistrées avec succès.");
        // Efface le message après 3 secondes
        setTimeout(() => setSaveMessage(""), 3000);
      }
    }
    setSaving(false);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <div className="w-6 h-6 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <main className="min-h-screen bg-zinc-50 pt-32 pb-20 px-6 font-sans text-zinc-900 transition-colors duration-500">
      <div className="max-w-2xl mx-auto">
        
        {/* En-tête de la page */}
        <div className="flex flex-col items-start mb-12">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-400 mb-2">Paramètres du compte</span>
          <h1 className="text-5xl font-black tracking-tight text-zinc-900">
            Mon Profil.
          </h1>
        </div>

        {/* Conteneur principal façon carte de luxe */}
        <div className="bg-white rounded-[2rem] p-8 sm:p-12 border border-zinc-100 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] flex flex-col gap-10 relative overflow-hidden">
          
          {/* Notification de sauvegarde flottante */}
          {saveMessage && (
            <div className="absolute top-0 left-0 right-0 bg-zinc-900 text-white text-xs font-bold uppercase tracking-widest text-center py-3 animate-in slide-in-from-top duration-300">
              {saveMessage}
            </div>
          )}

          {/* Section Identité */}
          <div className="flex flex-col gap-6 pt-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-3">Adresse Email (Privée)</label>
              <input 
                type="text" 
                disabled 
                value={userEmail} 
                className="w-full text-sm font-medium px-6 py-4 bg-zinc-50 rounded-2xl border border-transparent text-zinc-400 cursor-not-allowed" 
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-3">Pseudonyme Public</label>
              <input 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                placeholder="Ex: LeLecteurAnonyme"
                className="w-full text-sm font-medium px-6 py-4 bg-zinc-50 rounded-2xl border border-transparent focus:bg-white focus:border-zinc-200 focus:ring-4 focus:ring-zinc-100 outline-none text-zinc-900 transition-all duration-500" 
              />
              <p className="text-xs text-zinc-400 mt-3 font-medium">Ce nom sera visible par les autres membres du réseau.</p>
            </div>
          </div>

          <hr className="border-zinc-100" />

          {/* Section Confidentialité avec Switch iOS Noir & Blanc */}
          <div className="flex items-center justify-between group cursor-pointer" onClick={() => setIsPublic(!isPublic)}>
            <div className="pr-8">
              <h3 className="text-sm font-bold text-zinc-900 mb-1">Rendre ma collection publique</h3>
              <p className="text-xs text-zinc-500 font-medium leading-relaxed">
                Autorise la communauté à consulter votre bibliothèque et vos évaluations.
              </p>
            </div>
            
            {/* Le Switch Custom */}
            <div className="relative inline-flex items-center flex-shrink-0">
              <div className={`w-14 h-8 rounded-full transition-colors duration-300 ease-in-out ${isPublic ? 'bg-zinc-900' : 'bg-zinc-200'}`}></div>
              <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.19,1,0.22,1)] ${isPublic ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </div>
          </div>

          {/* Bouton de sauvegarde */}
          <button 
            onClick={saveProfile}
            disabled={saving}
            className="w-full rounded-full bg-zinc-900 px-8 py-5 text-xs font-bold uppercase tracking-widest text-white transition-all duration-500 hover:bg-zinc-800 hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center mt-2"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : "Enregistrer les modifications"}
          </button>

        </div>
      </div>
    </main>
  );
}