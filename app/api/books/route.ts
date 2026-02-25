import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // 1. On récupère ce que l'utilisateur a tapé (ex: /api/books?q=harry+potter)
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  // Si la recherche est vide, on renvoie une erreur
  if (!query) {
    return NextResponse.json({ error: "Terme de recherche manquant" }, { status: 400 });
  }

  // 2. On récupère la clé SECRÈTE depuis le .env.local ou Vercel
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;

  try {
    // 3. C'est le serveur qui fait l'appel à Google de manière invisible
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${query}&key=${apiKey}`
    );
    const data = await response.json();

    // 4. On renvoie les résultats au frontend
    return NextResponse.json(data);
  } catch (error) {
    console.error("Erreur serveur API Google Books:", error);
    return NextResponse.json({ error: "Erreur lors de la récupération des livres" }, { status: 500 });
  }
}