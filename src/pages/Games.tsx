import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Games = () => {
  const games = [
    { id: "wordle", name: "FDT Wordle", description: "Guess the 5-letter word in 6 tries", available: true },
    { id: "connections", name: "FDT Connections", description: "Group 16 words into 4 categories", available: true },
    { id: "mini-crossword", name: "FDT Mini", description: "A quick 5x5 crossword", available: true },
    { id: "crossword", name: "FDT Crossword", description: "The classic crossword puzzle", available: true },
    { id: "spelling-bee", name: "FDT Spelling Bee", description: "Make words using 7 letters", available: true },
  ];

  return (
    <div className="min-h-screen bg-paper">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link to="/" className="inline-flex items-center gap-2 text-ink-light hover:text-ink mb-6 font-body">
          <ArrowLeft className="w-4 h-4" />
          Back to Tribune
        </Link>
        
        <h1 className="font-headline text-4xl font-bold text-headline mb-2 text-center">FDT Games</h1>
        <p className="font-body text-ink-light text-center mb-8">Daily puzzles from the Flynn-Decktor Tribune</p>
        
        <div className="grid gap-4">
          {games.map((game) => (
            <Link
              key={game.id}
              to={game.available ? `/games/${game.id}` : "#"}
              className={`block p-6 border-2 border-rule rounded-lg transition-all ${
                game.available 
                  ? "hover:border-headline hover:shadow-lg cursor-pointer" 
                  : "opacity-50 cursor-not-allowed"
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="font-headline text-xl font-bold text-headline">{game.name}</h2>
                  <p className="font-body text-ink-light text-sm">{game.description}</p>
                </div>
                {!game.available && (
                  <span className="text-xs font-body bg-rule px-2 py-1 rounded">Coming Soon</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Games;