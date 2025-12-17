import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Category {
  name: string;
  words: string[];
  difficulty: number;
}

interface ConnectionsPuzzle {
  categories: Category[];
}

const DIFFICULTY_COLORS = [
  "bg-yellow-300 text-yellow-900",
  "bg-green-400 text-green-900", 
  "bg-blue-400 text-blue-900",
  "bg-purple-400 text-purple-900"
];

const DIFFICULTY_EMOJIS = ["🟨", "🟩", "🟦", "🟪"];

const Connections = () => {
  const { toast } = useToast();
  const [puzzle, setPuzzle] = useState<ConnectionsPuzzle | null>(null);
  const [words, setWords] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [solved, setSolved] = useState<Category[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [guessHistory, setGuessHistory] = useState<number[][]>([]);
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPuzzle();
  }, []);

  const fetchPuzzle = async () => {
    try {
      const { data: edition } = await supabase
        .from('newspaper_editions')
        .select('id')
        .order('publish_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (edition) {
        const { data: puzzleData } = await supabase
          .from('game_puzzles')
          .select('puzzle_data')
          .eq('edition_id', edition.id)
          .eq('game_type', 'connections')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (puzzleData?.puzzle_data) {
          const p = puzzleData.puzzle_data as unknown as ConnectionsPuzzle;
          setPuzzle(p);
          const allWords = p.categories.flatMap(c => c.words);
          setWords(shuffleArray(allWords));
        }
      }
    } catch (error) {
      console.error('Error fetching puzzle:', error);
    }
    setLoading(false);
  };

  const shuffleArray = (array: string[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const toggleWord = (word: string) => {
    if (gameOver || solved.some(c => c.words.includes(word))) return;
    
    if (selected.includes(word)) {
      setSelected(selected.filter(w => w !== word));
    } else if (selected.length < 4) {
      setSelected([...selected, word]);
    }
  };

  const submitGuess = useCallback(() => {
    if (selected.length !== 4 || !puzzle) return;

    const matchingCategory = puzzle.categories.find(category =>
      category.words.every(word => selected.includes(word))
    );

    if (matchingCategory) {
      setSolved([...solved, matchingCategory]);
      setWords(words.filter(w => !matchingCategory.words.includes(w)));
      setSelected([]);
      setGuessHistory([...guessHistory, [matchingCategory.difficulty]]);

      if (solved.length + 1 === puzzle.categories.length) {
        setWon(true);
        setGameOver(true);
        toast({ title: "Congratulations!", description: "You solved all connections!" });
      }
    } else {
      setMistakes(mistakes + 1);
      setShake(true);
      setTimeout(() => setShake(false), 500);

      // Check for "one away"
      const closeCategory = puzzle.categories.find(category =>
        category.words.filter(word => selected.includes(word)).length === 3 &&
        !solved.includes(category)
      );

      if (closeCategory) {
        toast({ title: "One away!", description: "You're close to a category." });
      }

      if (mistakes + 1 >= 4) {
        setGameOver(true);
        toast({ title: "Game Over", description: "Better luck next time!" });
      }
    }
  }, [selected, puzzle, solved, words, mistakes, guessHistory, toast]);

  const shareResults = () => {
    const date = new Date().toLocaleDateString();
    let result = `FDT Connections ${date}\n\n`;
    
    guessHistory.forEach(guess => {
      result += guess.map(d => DIFFICULTY_EMOJIS[d]).join("");
      result += "\n";
    });

    navigator.clipboard.writeText(result);
    toast({ title: "Copied!", description: "Results copied to clipboard" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <p className="font-body text-ink">Loading puzzle...</p>
      </div>
    );
  }

  if (!puzzle) {
    return (
      <div className="min-h-screen bg-paper">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <Link to="/games" className="inline-flex items-center gap-2 text-ink-light hover:text-ink mb-6 font-body">
            <ArrowLeft className="w-4 h-4" />
            Back to Games
          </Link>
          <h1 className="font-headline text-4xl font-bold text-headline mb-4 text-center">FDT Connections</h1>
          <p className="font-body text-ink-light text-center">No puzzle available. Check back after a new edition is generated!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link to="/games" className="inline-flex items-center gap-2 text-ink-light hover:text-ink mb-6 font-body">
          <ArrowLeft className="w-4 h-4" />
          Back to Games
        </Link>
        
        <h1 className="font-headline text-4xl font-bold text-headline mb-2 text-center">FDT Connections</h1>
        <p className="font-body text-ink-light text-center mb-6">Group 16 words into 4 categories</p>

        {/* Solved categories */}
        <div className="space-y-2 mb-4">
          {solved.sort((a, b) => a.difficulty - b.difficulty).map((category) => (
            <div
              key={category.name}
              className={`p-4 rounded-lg text-center ${DIFFICULTY_COLORS[category.difficulty]}`}
            >
              <p className="font-headline font-bold uppercase">{category.name}</p>
              <p className="font-body text-sm">{category.words.join(", ")}</p>
            </div>
          ))}
        </div>

        {/* Word grid */}
        {!gameOver && (
          <div className={`grid grid-cols-4 gap-2 mb-6 ${shake ? 'animate-shake' : ''}`}>
            {words.map((word) => {
              const isSelected = selected.includes(word);
              return (
                <button
                  key={word}
                  onClick={() => toggleWord(word)}
                  className={`p-3 rounded-lg font-headline text-sm font-bold uppercase transition-all ${
                    isSelected
                      ? "bg-headline text-paper scale-95"
                      : "bg-sepia/30 text-headline hover:bg-sepia/50"
                  }`}
                >
                  {word}
                </button>
              );
            })}
          </div>
        )}

        {/* Game over - show remaining categories */}
        {gameOver && !won && (
          <div className="space-y-2 mb-4">
            {puzzle.categories
              .filter(c => !solved.includes(c))
              .sort((a, b) => a.difficulty - b.difficulty)
              .map((category) => (
                <div
                  key={category.name}
                  className={`p-4 rounded-lg text-center opacity-60 ${DIFFICULTY_COLORS[category.difficulty]}`}
                >
                  <p className="font-headline font-bold uppercase">{category.name}</p>
                  <p className="font-body text-sm">{category.words.join(", ")}</p>
                </div>
              ))}
          </div>
        )}

        {/* Controls */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => setWords(shuffleArray(words))}
            disabled={gameOver}
            className="px-4 py-2 border-2 border-headline rounded-lg font-headline text-sm disabled:opacity-50"
          >
            Shuffle
          </button>
          <button
            onClick={() => setSelected([])}
            disabled={gameOver || selected.length === 0}
            className="px-4 py-2 border-2 border-headline rounded-lg font-headline text-sm disabled:opacity-50"
          >
            Deselect All
          </button>
          <button
            onClick={submitGuess}
            disabled={gameOver || selected.length !== 4}
            className="px-4 py-2 bg-headline text-paper rounded-lg font-headline text-sm disabled:opacity-50"
          >
            Submit
          </button>
        </div>

        {/* Mistakes */}
        <div className="text-center mb-4">
          <p className="font-body text-ink-light">
            Mistakes: {Array(4).fill("●").map((dot, i) => (
              <span key={i} className={i < mistakes ? "text-red-500" : "text-ink-light/30"}>{dot}</span>
            ))}
          </p>
        </div>

        {/* Game over message */}
        {gameOver && (
          <div className="text-center">
            <p className="font-headline text-xl font-bold text-headline mb-4">
              {won ? "You got all the connections!" : "Game Over"}
            </p>
            <button
              onClick={shareResults}
              className="inline-flex items-center gap-2 px-4 py-2 bg-headline text-paper rounded-lg font-headline text-sm"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Connections;