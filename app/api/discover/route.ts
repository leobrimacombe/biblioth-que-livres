import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();
    if (!prompt) return NextResponse.json({ error: "Il manque l'ambiance !" }, { status: 400 });

    const modelName = process.env.GEMINI_MODEL || "gemini-3-flash-preview";
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: modelName });

    // 1. On demande 10 livres à l'IA
    const systemPrompt = `Tu es un libraire expert. L'utilisateur cherche l'ambiance : "${prompt}". 
    Renvoie un tableau JSON contenant exactement 10 recommandations de livres. 
    Format attendu : [{"title": "Titre", "author": "Auteur"}]. 
    Ne renvoie RIEN D'AUTRE que le JSON brut.`;

    const result = await model.generateContent(systemPrompt);
    const text = result.response.text();
    
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const aiBooks = JSON.parse(cleanJson);

    const googleBooksApiKey = process.env.GOOGLE_BOOKS_API_KEY;

    // 2. On cherche les 10 livres sur Google en SIMULTANÉ pour gagner du temps !
    const fetchPromises = aiBooks.map(async (book: any) => {
      const searchQuery = `intitle:${book.title} inauthor:${book.author}`;
      const gBooksResponse = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQuery)}&maxResults=1&key=${googleBooksApiKey}`
      );
      const gBooksData = await gBooksResponse.json();
      return gBooksData.items ? gBooksData.items[0] : null;
    });

    const results = await Promise.all(fetchPromises);
    
    // 3. On filtre pour enlever ceux que Google n'a pas trouvés
    const finalBooks = results.filter((book) => book !== null);

    return NextResponse.json({ items: finalBooks });

  } catch (error) {
    console.error("❌ Erreur :", error);
    return NextResponse.json({ error: "L'IA a eu un petit coup de fatigue." }, { status: 500 });
  }
}