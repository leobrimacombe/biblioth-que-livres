"use server";

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

export async function generateBookRecommendations(prompt: string) {
  try {
    const geminiKey = process.env.GEMINI_API_KEY;
    const googleBooksKey = process.env.GOOGLE_BOOKS_API_KEY;
    // On récupère le modèle dynamiquement depuis ton .env.local (ou on force 2.5 par défaut)
    const geminiModelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";

    if (!geminiKey) throw new Error("Clé API Gemini introuvable sur le serveur.");

    const genAI = new GoogleGenerativeAI(geminiKey);
    
    const safetySettings = [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    ];

    // On utilise la variable ici !
    const model = genAI.getGenerativeModel({ 
      model: geminiModelName,
      generationConfig: { responseMimeType: "application/json" },
      safetySettings
    });

    const systemPrompt = `Tu es un expert littéraire. L'utilisateur cherche des recommandations de livres avec cette envie : "${prompt}". 
    Renvoie UNIQUEMENT un tableau JSON contenant 5 livres. 
    Format exact attendu : [{"title": "Titre", "author": "Auteur", "reason": "Pourquoi ce livre correspond en 1 phrase courte."}]`;

    const result = await model.generateContent(systemPrompt);
    let responseText = result.response.text().trim();
    
    const startIndex = responseText.indexOf('[');
    const endIndex = responseText.lastIndexOf(']');
    if (startIndex !== -1 && endIndex !== -1) {
      responseText = responseText.substring(startIndex, endIndex + 1);
    }

    const jsonResult = JSON.parse(responseText);
    
    const enrichedBooks = await Promise.all(jsonResult.map(async (book: any) => {
      try {
        const url = googleBooksKey 
          ? `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(book.title)}+inauthor:${encodeURIComponent(book.author)}&maxResults=1&key=${googleBooksKey}`
          : `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(book.title)}+inauthor:${encodeURIComponent(book.author)}&maxResults=1`;

        const gbRes = await fetch(url);
        const gbData = await gbRes.json();
        
        if (gbData.items && gbData.items.length > 0) {
          return { ...book, googleData: gbData.items[0] };
        }
        return book;
      } catch (e) {
        return book;
      }
    }));

    return enrichedBooks;

  } catch (error: any) {
    console.error("Erreur serveur lors de la génération:", error);
    throw new Error(error.message || "Impossible de contacter la bibliothèque mécanique.");
  }
}