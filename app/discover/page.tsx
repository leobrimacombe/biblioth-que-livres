"use client";

import { useState } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from '@supabase/supabase-js';
import InkButton from '../components/InkButton'; // <-- IMPORT

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function DiscoverPage() {
  const [prompt, setPrompt] = useState('');
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBook, setSelectedBook] = useState<any | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) throw new Error("Clé API Gemini introuvable.");

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const systemPrompt = `Tu es un expert littéraire. L'utilisateur cherche des recommandations de livres avec cette envie : "${prompt}". 
      Renvoie UNIQUEMENT un tableau JSON strict (sans markdown, sans texte avant ou après) contenant 5 livres. 
      Format exact attendu : [{"title": "Titre", "author": "Auteur", "reason": "Pourquoi ce livre correspond en 1 phrase courte."}]`;

      const result = await model.generateContent(systemPrompt);
      let responseText = result.response.text().trim();
      
      if (responseText.startsWith("```json")) responseText = responseText.replace(/```json/g, "");
      if (responseText.startsWith("```")) responseText = responseText.replace(/```/g, "");
      responseText = responseText.trim();

      const jsonResult = JSON.parse(responseText);
      
      const enrichedBooks = await Promise.all(jsonResult.map(async (book: any) => {
        try {
          const gbRes = await fetch(`https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(book.title)}+inauthor:${encodeURIComponent(book.author)}&maxResults=1`);
          const gbData = await gbRes.json();
          if (gbData.items && gbData.items.length > 0) {
            return { ...book, googleData: gbData.items[0] };
          }
          return book;
        } catch (e) {
          return book;
        }
      }));

      setRecommendations(enrichedBooks);
    } catch (error) {
      console.error("Erreur de génération:", error);
      alert("La machine a eu un hoquet. Veuillez reformuler votre demande.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBook = async (book: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("Veuillez vous identifier pour archiver cette œuvre.");
      return;
    }

    const bookData = {
      user_id: user.id,
      google_books_id: book.googleData?.id || 'ia_generated',
      title: book.title,
      author: book.author,
      cover_url: book.googleData?.volumeInfo?.imageLinks?.thumbnail || null,
      status: 'to_read'
    };

    const { error } = await supabase.from('user_books').insert([bookData]);
    if (error) alert("Erreur : " + error.message);
    else setSelectedBook(null);
  };

  return (
    <main className="min-h-screen bg-[#F4F3EE] pt-32 pb-20 px-4 sm:px-6 font-sans text-stone-900 selection:bg-stone-900 selection:text-[#F4F3EE] overflow-x-hidden">
      <div className="max-w-4xl mx-auto">
        
        <div className="flex flex-col items-center text-center mb-16">
          <div className="paper-card px-4 py-2 mb-4 rotate-2 inline-block bg-stone-900 text-[#F4F3EE]">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.4em]">Service Automatisé</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-stone-900 mb-6 uppercase">
            Inspirations.
          </h1>
          <p className="text-sm font-bold text-stone-700 max-w-lg mx-auto">
            Confiez vos envies à notre bibliothécaire mécanique. Décrivez l'atmosphère, le genre ou le thème que vous recherchez.
          </p>
        </div>

        <form onSubmit={handleGenerate} className="paper-card bg-[#FAFAFA] p-6 md:p-10 mb-16 relative">
          <div className="absolute top-0 left-8 w-8 h-4 bg-[#F4F3EE] border-b-2 border-r-2 border-stone-900 -translate-y-[2px]"></div>
          <div className="absolute top-0 right-8 w-8 h-4 bg-[#F4F3EE] border-b-2 border-l-2 border-stone-900 -translate-y-[2px]"></div>
          
          <label className="block text-xs font-black uppercase tracking-widest text-stone-700 mb-4 border-b-2 border-stone-900 border-dashed pb-2">
            Votre requête (Sujet, Ambiance, Style) :
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ex: Un roman policier sombre qui se déroule dans les années 20 à Paris..."
            className="w-full text-base sm:text-lg font-serif italic bg-transparent outline-none resize-none h-32 text-stone-900 placeholder:text-stone-500 mb-6 focus:bg-stone-50 transition-colors p-2"
          />
          <div className="flex justify-end border-t-2 border-stone-900 pt-6">
            {/* BOUTON ENCRE - IA */}
            <InkButton
              type="submit"
              disabled={loading}
              isDark={true}
              className="px-8 py-4 text-xs font-black uppercase tracking-widest flex items-center gap-3"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#F4F3EE] border-t-transparent rounded-full animate-spin"></div>
                  Recherche...
                </>
              ) : "Lancer la recherche"}
            </InkButton>
          </div>
        </form>

        {recommendations.length > 0 && (
          <div className="w-full animate-in fade-in slide-in-from-bottom-10 duration-500">
            <h2 className="text-[10px] md:text-xs font-black uppercase tracking-widest text-stone-900 mb-8 border-b-4 border-stone-900 pb-2">Sélection suggérée</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {recommendations.map((book, index) => (
                <div key={index} className="paper-card paper-hover bg-[#FAFAFA] p-6 flex gap-6 cursor-pointer group" onClick={() => setSelectedBook(book)}>
                  <div className="w-24 shrink-0 paper-card bg-white p-1 border-2 border-stone-900">
                    {book.googleData?.volumeInfo?.imageLinks?.thumbnail ? (
                      <img src={book.googleData.volumeInfo.imageLinks.thumbnail} alt="Couverture" className="w-full h-auto grayscale-[30%] group-hover:grayscale-0 transition-all duration-300" />
                    ) : (
                      <div className="w-full h-36 bg-stone-200 flex items-center justify-center text-[10px] font-black uppercase text-stone-600 text-center">Sans Image</div>
                    )}
                  </div>
                  <div className="flex flex-col flex-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-stone-500 mb-1">Recommandation {index + 1}</span>
                    <h3 className="font-black text-lg text-stone-900 mb-1 leading-tight uppercase">{book.title}</h3>
                    <p className="text-xs font-bold text-stone-700 mb-4 border-b-2 border-stone-900 border-dashed pb-2">{book.author}</p>
                    <p className="text-sm font-serif italic text-stone-800 leading-relaxed line-clamp-3">
                      "{book.reason}"
                    </p>
                    <div className="mt-auto pt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-stone-900 group-hover:underline">
                      Inspecter la fiche 
                      <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedBook && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4 md:p-8 transition-all">
          <div className="absolute inset-0" onClick={() => setSelectedBook(null)}></div>
          
          <div className="relative w-full max-w-4xl paper-card bg-[#FAFAFA] flex flex-col overflow-hidden h-[85dvh] md:h-auto md:max-h-[90vh] animate-in zoom-in-95 duration-200">
            
            <button 
              onClick={() => setSelectedBook(null)}
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center paper-card paper-btn bg-[#F4F3EE] text-stone-900 z-50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>

            <div className="flex-1 overflow-y-auto flex flex-col md:flex-row min-h-0 relative">
              <div className="w-full md:w-2/5 bg-[#F4F3EE] p-6 md:p-10 flex items-center justify-center border-b-4 md:border-b-0 md:border-r-4 border-stone-900 shrink-0 relative">
                 <div className="absolute top-4 border-t-8 border-stone-300 w-16 opacity-50 z-10 rotate-3"></div>
                {selectedBook.googleData?.volumeInfo?.imageLinks?.thumbnail ? (
                  <img 
                    src={selectedBook.googleData.volumeInfo.imageLinks.thumbnail.replace('&edge=curl', '')} 
                    alt="Couverture" 
                    className="w-auto h-48 md:h-auto md:max-w-[220px] object-contain paper-card p-2 bg-white"
                  />
                ) : (
                   <div className="w-32 h-48 md:w-56 md:h-80 paper-card bg-stone-200 flex items-center justify-center text-xs font-black uppercase tracking-widest text-stone-600">Sans Image</div>
                )}
              </div>

              <div className="w-full md:w-3/5 p-6 md:p-10 flex flex-col bg-[#FAFAFA]">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-500 mb-2">Recommandation IA</span>
                <h2 className="text-3xl md:text-4xl font-black text-stone-900 mb-2 leading-none uppercase pr-8">{selectedBook.title}</h2>
                <p className="text-sm font-bold text-stone-700 mb-6 border-b-2 border-stone-900 pb-4">{selectedBook.author}</p>
                
                <div className="bg-[#F4F3EE] p-4 paper-card mb-6 border-l-4 border-stone-900">
                  <p className="text-sm font-serif italic text-stone-800">"{selectedBook.reason}"</p>
                </div>

                <div className="text-sm leading-relaxed text-stone-800 pb-4 font-medium">
                  {selectedBook.googleData?.volumeInfo?.description 
                    ? selectedBook.googleData.volumeInfo.description 
                    : <span className="italic text-stone-500">Aucun synopsis archivé pour cette édition.</span>}
                </div>
              </div>
            </div>

            <div className="shrink-0 bg-[#F4F3EE] p-4 md:p-6 border-t-4 border-stone-900 flex flex-col sm:flex-row gap-4 z-10">
              {/* BOUTON ENCRE - AJOUTER */}
              <InkButton 
                onClick={() => handleSaveBook(selectedBook)}
                isDark={true}
                className="w-full sm:flex-1 px-4 py-4 md:py-4 text-xs font-black uppercase tracking-widest"
              >
                + Ajouter à l'Étui
              </InkButton>
              
              <a 
                href={`https://www.amazon.fr/s?k=${encodeURIComponent(selectedBook.title + " livre " + selectedBook.author)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:flex-1 paper-card paper-btn bg-[#FAFAFA] px-4 py-4 md:py-4 text-xs font-black uppercase tracking-widest text-stone-900 text-center flex items-center justify-center gap-2"
              >
                Consulter l'édition
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
              </a>
            </div>

          </div>
        </div>
      )}
    </main>
  );
}