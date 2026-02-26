import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();
    if (!prompt) return NextResponse.json({ error: "Il manque l'ambiance !" }, { status: 400 });

    const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: modelName });

    // MODIF 1 : On insiste sur le français dans le prompt
    const systemPrompt = `Tu es un libraire expert francophone. L'utilisateur cherche l'ambiance : "${prompt}". 
    Renvoie un tableau JSON contenant exactement 10 recommandations de livres DISPONIBLES EN FRANÇAIS. 
    Format attendu : [{"title": "Titre en français", "author": "Auteur"}]. 
    Ne renvoie RIEN D'AUTRE que le JSON brut.`;

    const result = await model.generateContent(systemPrompt);
    const text = result.response.text();
    
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const aiBooks = JSON.parse(cleanJson);

    const googleBooksApiKey = process.env.GOOGLE_BOOKS_API_KEY;

    const fetchPromises = aiBooks.map(async (book: any) => {
      const searchQuery = `intitle:${book.title} inauthor:${book.author}`;
      // MODIF 2 : On ajoute &langRestrict=fr à la fin de l'URL Google Books
      const gBooksResponse = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQuery)}&maxResults=1&langRestrict=fr&key=${googleBooksApiKey}`
      );
      const gBooksData = await gBooksResponse.json();
      return gBooksData.items ? gBooksData.items[0] : null;
    });

    const results = await Promise.all(fetchPromises);
    const finalBooks = results.filter((book) => book !== null);

    return NextResponse.json({ items: finalBooks });

  } catch (error) {
    console.error("❌ Erreur :", error);
    return NextResponse.json({ error: "L'IA a eu un petit coup de fatigue." }, { status: 500 });
  }
}