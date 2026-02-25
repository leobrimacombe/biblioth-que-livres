import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: Request) {
  try {
    // 1. On récupère la demande de ta sœur (ex: "romance enemies to lovers")
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: "Il manque l'ambiance recherchée !" }, { status: 400 });
    }

    // 2. On réveille l'IA Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    // 3. On lui donne des ordres TRÈS stricts pour qu'elle réponde comme un robot
    const systemPrompt = `Tu es un libraire expert. L'utilisateur cherche des livres avec cette ambiance : "${prompt}". 
    Renvoie-moi un tableau JSON contenant exactement 3 recommandations de livres. 
    Format attendu : [{"title": "Titre du livre", "author": "Nom de l'auteur"}]. 
    Ne renvoie RIEN D'AUTRE que le JSON brut, pas de markdown, pas de texte avant ou après.`;

    const result = await model.generateContent(systemPrompt);
    const text = result.response.text();
    
    // Petite sécurité : on nettoie la réponse au cas où l'IA rajoute des trucs autour du JSON
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const aiBooks = JSON.parse(cleanJson);

    // 4. On a les titres ! Maintenant on va chercher les vraies infos sur Google Books
    const googleBooksApiKey = process.env.GOOGLE_BOOKS_API_KEY;
    const finalBooks = [];

    // On fait une boucle sur les 3 livres trouvés par l'IA
    for (const book of aiBooks) {
      // On cherche précisément "Titre + Auteur" sur Google Books
      const searchQuery = `intitle:${book.title} inauthor:${book.author}`;
      const gBooksResponse = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQuery)}&maxResults=1&key=${googleBooksApiKey}`
      );
      const gBooksData = await gBooksResponse.json();

      // Si Google trouve bien le livre, on l'ajoute à notre liste finale
      if (gBooksData.items && gBooksData.items.length > 0) {
        finalBooks.push(gBooksData.items[0]);
      }
    }

    // 5. On renvoie les vrais livres de Google Books au site !
    return NextResponse.json({ items: finalBooks });

  } catch (error) {
    console.error("❌ Erreur de l'IA :", error);
    return NextResponse.json({ error: "L'IA a eu un petit coup de fatigue." }, { status: 500 });
  }
}