"use client";

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Fonction pour s'inscrire
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) setMessage(`❌ Erreur : ${error.message}`);
    else setMessage('✅ Inscription réussie !');
    setLoading(false);
  };

  // Fonction pour se connecter
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) setMessage(`❌ Erreur : ${error.message}`);
    else {
      setMessage('✅ Connexion réussie !');
      // On rafraîchit la page pour mettre à jour l'état de l'utilisateur
      window.location.reload(); 
    }
    setLoading(false);
  };

  // Fonction pour se déconnecter
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <div className="w-full max-w-sm mx-auto p-6 bg-white border rounded-lg shadow-sm mb-8">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Connexion</h2>
      
      {message && <p className="mb-4 text-sm font-medium text-blue-600">{message}</p>}

      <form className="flex flex-col gap-3">
        <input
          type="email"
          placeholder="Ton email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="px-4 py-2 border rounded text-black"
          required
        />
        <input
          type="password"
          placeholder="Ton mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="px-4 py-2 border rounded text-black"
          required
        />
        
        <div className="flex gap-2 mt-2">
          <button
            onClick={handleLogin}
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Se connecter
          </button>
          <button
            onClick={handleSignUp}
            disabled={loading}
            className="flex-1 bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            S'inscrire
          </button>
        </div>
      </form>
      
      <button 
        onClick={handleLogout}
        className="w-full mt-4 text-sm text-red-500 hover:underline"
      >
        Se déconnecter
      </button>
    </div>
  );
}