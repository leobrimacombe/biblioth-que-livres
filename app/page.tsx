import SearchBar from "./components/SearchBar";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 text-center mb-4">
          La Bibliothèque de lou
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Cherche un livre pour l'ajouter à ta collection.
        </p>
        
        {/* On insère notre composant ici */}
        <SearchBar />
        
      </div>
    </main>
  );
}