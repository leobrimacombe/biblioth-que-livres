"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import InkButton from '../components/InkButton';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

type EditMode = 'none' | 'menu' | 'pseudo' | 'email' | 'password';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, read: 0, reading: 0, toRead: 0 });
  
  // États pour l'édition du profil
  const [editMode, setEditMode] = useState<EditMode>('none');
  const [pseudo, setPseudo] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      setUser(user);
      setPseudo(user.user_metadata?.pseudo || '');
      setEmail(user.email || '');
      
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

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const updates: any = {};

    if (editMode === 'pseudo') updates.data = { pseudo: pseudo.trim() };
    if (editMode === 'email') updates.email = email.trim();
    if (editMode === 'password') updates.password = password.trim();

    const { data, error } = await supabase.auth.updateUser(updates);

    if (error) {
      alert("Erreur lors de la mise à jour : " + error.message);
    } else {
      setUser(data.user);
      setEditMode('none');
      setPassword(''); 
      
      if (editMode === 'email') {
        alert("Dossier mis à jour ! Note : Un lien de confirmation a été envoyé pour valider la nouvelle adresse courriel.");
      }
    }
    setSaving(false);
  };

  const cancelEditing = () => {
    setEditMode('none');
    setPseudo(user?.user_metadata?.pseudo || '');
    setEmail(user?.email || '');
    setPassword('');
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
          
          <div className="flex items-center justify-between mb-8 border-b-4 border-stone-900 pb-2">
            <h2 className="text-sm font-black uppercase tracking-widest text-stone-700">Identité du membre</h2>
            {editMode === 'none' && (
              <button onClick={() => setEditMode('menu')} className="text-[10px] font-black uppercase tracking-widest text-stone-500 hover:text-stone-900 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                Modifier
              </button>
            )}
          </div>
          
          {/* MENU DE SÉLECTION DE MODIFICATION */}
          {editMode === 'menu' && (
            <div className="bg-[#F4F3EE] p-6 paper-card mb-12 flex flex-col gap-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-stone-500 mb-2">Que souhaitez-vous modifier ?</span>
              <InkButton onClick={() => setEditMode('pseudo')} isDark={false} className="w-full py-4 text-xs font-black uppercase tracking-widest">
                Pseudonyme Public
              </InkButton>
              <InkButton onClick={() => setEditMode('email')} isDark={false} className="w-full py-4 text-xs font-black uppercase tracking-widest">
                Adresse Courriel
              </InkButton>
              <InkButton onClick={() => setEditMode('password')} isDark={false} className="w-full py-4 text-xs font-black uppercase tracking-widest">
                Mot de Passe
              </InkButton>
              <button onClick={cancelEditing} className="mt-4 text-[10px] font-black uppercase tracking-widest text-stone-500 hover:text-stone-900 self-end">
                Annuler
              </button>
            </div>
          )}

          {/* FORMULAIRES DE MODIFICATION */}
          {(editMode === 'pseudo' || editMode === 'email' || editMode === 'password') && (
            <form onSubmit={handleSaveProfile} className="space-y-6 mb-12 bg-[#F4F3EE] p-6 paper-card">
              
              {editMode === 'pseudo' && (
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-stone-700 mb-2">Nouveau Pseudonyme</label>
                  <input
                    type="text"
                    value={pseudo}
                    onChange={(e) => setPseudo(e.target.value)}
                    placeholder="Ex: LeRatDeBibliothèque"
                    className="w-full text-base font-serif italic px-4 py-3 bg-[#FAFAFA] paper-card outline-none text-stone-900 placeholder:text-stone-400 focus:shadow-[4px_4px_0px_0px_#1c1917] focus:translate-x-[2px] focus:translate-y-[2px] transition-all"
                    maxLength={25}
                    required
                  />
                </div>
              )}

              {editMode === 'email' && (
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-stone-700 mb-2">Nouvelle Adresse Courriel</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jean.dupont@email.com"
                    className="w-full text-base font-serif italic px-4 py-3 bg-[#FAFAFA] paper-card outline-none text-stone-900 placeholder:text-stone-400 focus:shadow-[4px_4px_0px_0px_#1c1917] focus:translate-x-[2px] focus:translate-y-[2px] transition-all"
                    required
                  />
                </div>
              )}

              {editMode === 'password' && (
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-stone-700 mb-2">Nouveau Mot de Passe</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Tapez le nouveau mot de passe"
                    className="w-full text-base font-serif italic px-4 py-3 bg-[#FAFAFA] paper-card outline-none text-stone-900 placeholder:text-stone-400 focus:shadow-[4px_4px_0px_0px_#1c1917] focus:translate-x-[2px] focus:translate-y-[2px] transition-all"
                    required
                    minLength={6}
                  />
                </div>
              )}

              <div className="flex gap-4 pt-4 border-t-2 border-stone-900 border-dashed">
                <InkButton type="submit" disabled={saving} isDark={true} className="flex-1 py-3 text-xs font-black uppercase tracking-widest">
                  {saving ? 'Signature...' : 'Enregistrer'}
                </InkButton>
                {/* BOUTON ENCRE - ANNULER */}
                <InkButton type="button" onClick={cancelEditing} isDark={false} className="flex-1 py-3 text-xs font-black uppercase tracking-widest">
                  Annuler
                </InkButton>
              </div>
            </form>
          )}

          {/* MODE LECTURE DU PROFIL */}
          {editMode === 'none' && (
            <div className="space-y-6 mb-12">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-stone-700 mb-1">Pseudonyme</label>
                <div className="font-serif italic text-stone-900 bg-[#F4F3EE] p-3 paper-card text-sm md:text-base">
                  {user.user_metadata?.pseudo ? user.user_metadata.pseudo : <span className="text-stone-400">Non renseigné (Lecteur Anonyme)</span>}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-stone-700 mb-1">Courriel Enregistré (Privé)</label>
                <div className="font-serif italic text-stone-900 bg-[#F4F3EE] p-3 paper-card text-sm md:text-base">
                  {user.email}
                </div>
              </div>
            </div>
          )}

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