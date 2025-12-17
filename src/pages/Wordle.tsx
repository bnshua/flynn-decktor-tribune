import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Share2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Fallback words if database fetch fails
const FALLBACK_WORDS = [
  "CRANE", "SLATE", "TRACE", "CRATE", "STARE", "RAISE", "ARISE", "SHARE", 
  "PLACE", "DEALT", "BRAIN", "DREAM", "FLAME", "GRAPE", "HOUSE", "LIGHT",
  "MONEY", "OCEAN", "PEACE", "QUIET", "RIVER", "SPACE", "TRAIN", "WORLD"
];

const getRandomFallbackWord = () => {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  return FALLBACK_WORDS[seed % FALLBACK_WORDS.length];
};

type LetterState = "correct" | "present" | "absent" | "empty";

interface LetterResult {
  letter: string;
  state: LetterState;
}

const Wordle = () => {
  const [targetWord, setTargetWord] = useState<string>("");
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [shake, setShake] = useState(false);
  const [usedLetters, setUsedLetters] = useState<Record<string, LetterState>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWord();
  }, []);

  const fetchWord = async () => {
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
          .eq('game_type', 'wordle')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (puzzleData?.puzzle_data) {
          const data = puzzleData.puzzle_data as { word: string };
          setTargetWord(data.word.toUpperCase());
          setLoading(false);
          return;
        }
      }
    } catch (error) {
      console.error('Error fetching Wordle word:', error);
    }
    
    // Fallback to random word
    setTargetWord(getRandomFallbackWord());
    setLoading(false);
  };

  const checkGuess = useCallback((guess: string): LetterResult[] => {
    if (!targetWord) return [];
    
    const result: LetterResult[] = [];
    const targetArr = targetWord.split("");
    const guessArr = guess.split("");
    const used: boolean[] = new Array(5).fill(false);

    // First pass: correct positions
    for (let i = 0; i < 5; i++) {
      if (guessArr[i] === targetArr[i]) {
        result[i] = { letter: guessArr[i], state: "correct" };
        used[i] = true;
      }
    }

    // Second pass: present but wrong position
    for (let i = 0; i < 5; i++) {
      if (result[i]) continue;
      const idx = targetArr.findIndex((l, j) => l === guessArr[i] && !used[j]);
      if (idx !== -1) {
        result[i] = { letter: guessArr[i], state: "present" };
        used[idx] = true;
      } else {
        result[i] = { letter: guessArr[i], state: "absent" };
      }
    }

    return result;
  }, [targetWord]);

  const submitGuess = useCallback(() => {
    if (!targetWord) return;
    
    if (currentGuess.length !== 5) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      toast.error("Not enough letters");
      return;
    }

    const upperGuess = currentGuess.toUpperCase();
    
    const results = checkGuess(upperGuess);
    setGuesses([...guesses, upperGuess]);
    
    // Update used letters
    const newUsedLetters = { ...usedLetters };
    results.forEach(({ letter, state }) => {
      if (!newUsedLetters[letter] || state === "correct" || 
          (state === "present" && newUsedLetters[letter] === "absent")) {
        newUsedLetters[letter] = state;
      }
    });
    setUsedLetters(newUsedLetters);

    if (upperGuess === targetWord) {
      setWon(true);
      setGameOver(true);
      toast.success("Brilliant!");
    } else if (guesses.length === 5) {
      setGameOver(true);
      toast.error(`The word was ${targetWord}`);
    }

    setCurrentGuess("");
  }, [currentGuess, guesses, targetWord, checkGuess, usedLetters]);

  const handleKeyPress = useCallback((key: string) => {
    if (gameOver || !targetWord) return;

    if (key === "ENTER") {
      submitGuess();
    } else if (key === "BACKSPACE") {
      setCurrentGuess(prev => prev.slice(0, -1));
    } else if (/^[A-Z]$/.test(key) && currentGuess.length < 5) {
      setCurrentGuess(prev => prev + key);
    }
  }, [gameOver, targetWord, currentGuess, submitGuess]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      if (key === "ENTER" || key === "BACKSPACE" || /^[A-Z]$/.test(key)) {
        handleKeyPress(key);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleKeyPress]);

  const shareResults = () => {
    const emojiGrid = guesses.map(guess => {
      return checkGuess(guess).map(({ state }) => {
        if (state === "correct") return "🟩";
        if (state === "present") return "🟨";
        return "⬛";
      }).join("");
    }).join("\n");

    const text = `FDT Wordle ${won ? guesses.length : "X"}/6\n\n${emojiGrid}`;
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const keyboard = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACKSPACE"]
  ];

  const getLetterStyle = (state: LetterState) => {
    switch (state) {
      case "correct": return "bg-green-600 text-white border-green-600";
      case "present": return "bg-yellow-500 text-white border-yellow-500";
      case "absent": return "bg-gray-500 text-white border-gray-500";
      default: return "bg-paper border-rule";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <p className="font-body text-ink">Loading puzzle...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <header className="border-b-2 border-rule p-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <Link to="/games" className="flex items-center gap-2 text-ink-light hover:text-ink">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-headline text-2xl font-bold text-headline">FDT Wordle</h1>
          <div className="w-5" />
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 gap-6">
        {/* Game board */}
        <div className="grid gap-1.5">
          {[...Array(6)].map((_, rowIdx) => {
            const guess = guesses[rowIdx];
            const isCurrentRow = rowIdx === guesses.length;
            const display = guess || (isCurrentRow ? currentGuess.padEnd(5, " ") : "     ");
            const results = guess ? checkGuess(guess) : null;

            return (
              <div 
                key={rowIdx} 
                className={`flex gap-1.5 ${isCurrentRow && shake ? "animate-shake" : ""}`}
              >
                {display.split("").map((letter, colIdx) => {
                  const state = results?.[colIdx]?.state || "empty";
                  return (
                    <div
                      key={colIdx}
                      className={`w-14 h-14 flex items-center justify-center text-2xl font-bold font-headline border-2 transition-all ${
                        letter !== " " && !results ? "border-ink-light" : ""
                      } ${getLetterStyle(state)}`}
                    >
                      {letter !== " " ? letter : ""}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Game over message */}
        {gameOver && (
          <div className="text-center">
            <p className="font-headline text-xl font-bold text-headline mb-2">
              {won ? "Congratulations!" : `The word was: ${targetWord}`}
            </p>
            <button
              onClick={shareResults}
              className="inline-flex items-center gap-2 px-4 py-2 bg-headline text-paper font-body rounded hover:opacity-90"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
        )}

        {/* Keyboard */}
        <div className="flex flex-col gap-1.5 mt-4">
          {keyboard.map((row, rowIdx) => (
            <div key={rowIdx} className="flex justify-center gap-1.5">
              {row.map((key) => {
                const state = usedLetters[key];
                const isWide = key === "ENTER" || key === "BACKSPACE";
                return (
                  <button
                    key={key}
                    onClick={() => handleKeyPress(key)}
                    className={`${isWide ? "px-3 text-xs" : "w-10"} h-14 rounded font-bold font-body transition-all ${
                      state ? getLetterStyle(state) : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  >
                    {key === "BACKSPACE" ? "⌫" : key}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Wordle;
