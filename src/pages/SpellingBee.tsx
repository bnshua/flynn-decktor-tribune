import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Delete, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SpellingBeePuzzle {
  centerLetter: string;
  outerLetters: string[];
  validWords: string[];
  pangrams: string[];
}

const SpellingBee = () => {
  const { toast } = useToast();
  const [puzzle, setPuzzle] = useState<SpellingBeePuzzle | null>(null);
  const [currentWord, setCurrentWord] = useState("");
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [shake, setShake] = useState(false);

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
          .eq('game_type', 'spelling_bee')
          .maybeSingle();

        if (puzzleData?.puzzle_data) {
          setPuzzle(puzzleData.puzzle_data as unknown as SpellingBeePuzzle);
        }
      }
    } catch (error) {
      console.error('Error fetching puzzle:', error);
    }
    setLoading(false);
  };

  const calculateScore = (word: string, isPangram: boolean) => {
    if (word.length === 4) return 1;
    if (isPangram) return word.length + 7;
    return word.length;
  };

  const getMaxScore = () => {
    if (!puzzle) return 0;
    return puzzle.validWords.reduce((total, word) => {
      const isPangram = puzzle.pangrams.includes(word.toUpperCase());
      return total + calculateScore(word, isPangram);
    }, 0);
  };

  const getRank = () => {
    const maxScore = getMaxScore();
    const percentage = (score / maxScore) * 100;
    if (percentage >= 100) return "Queen Bee";
    if (percentage >= 70) return "Genius";
    if (percentage >= 50) return "Amazing";
    if (percentage >= 40) return "Great";
    if (percentage >= 25) return "Nice";
    if (percentage >= 15) return "Solid";
    if (percentage >= 8) return "Good";
    if (percentage >= 5) return "Moving Up";
    if (percentage >= 2) return "Good Start";
    return "Beginner";
  };

  const handleLetterClick = (letter: string) => {
    setCurrentWord(prev => prev + letter);
  };

  const handleDelete = () => {
    setCurrentWord(prev => prev.slice(0, -1));
  };

  const shuffleLetters = () => {
    if (!puzzle) return;
    const shuffled = [...puzzle.outerLetters];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setPuzzle({ ...puzzle, outerLetters: shuffled });
  };

  const submitWord = useCallback(() => {
    if (!puzzle || currentWord.length < 4) {
      toast({ title: "Too short", description: "Words must be at least 4 letters" });
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    if (!currentWord.includes(puzzle.centerLetter)) {
      toast({ title: "Missing center letter", description: `Words must contain ${puzzle.centerLetter}` });
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    const word = currentWord.toUpperCase();
    
    if (foundWords.includes(word)) {
      toast({ title: "Already found", description: "You've already found this word" });
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setCurrentWord("");
      return;
    }

    if (!puzzle.validWords.map(w => w.toUpperCase()).includes(word)) {
      toast({ title: "Not in word list", description: "This word isn't accepted" });
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setCurrentWord("");
      return;
    }

    const isPangram = puzzle.pangrams.map(p => p.toUpperCase()).includes(word);
    const points = calculateScore(word, isPangram);
    
    setFoundWords([...foundWords, word]);
    setScore(score + points);
    setCurrentWord("");
    
    if (isPangram) {
      toast({ title: "PANGRAM!", description: `+${points} points!` });
    } else {
      toast({ title: word.length === 4 ? "Nice!" : "Great!", description: `+${points} points` });
    }
  }, [puzzle, currentWord, foundWords, score, toast]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!puzzle) return;
    
    const allLetters = [puzzle.centerLetter, ...puzzle.outerLetters];
    
    if (e.key === 'Enter') {
      e.preventDefault();
      submitWord();
    } else if (e.key === 'Backspace') {
      e.preventDefault();
      handleDelete();
    } else if (/^[a-zA-Z]$/.test(e.key)) {
      const letter = e.key.toUpperCase();
      if (allLetters.includes(letter)) {
        setCurrentWord(prev => prev + letter);
      }
    }
  }, [puzzle, submitWord]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const shareResults = () => {
    const result = `FDT Spelling Bee\n${getRank()}: ${score} points\n${foundWords.length} words found`;
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
          <h1 className="font-headline text-4xl font-bold text-headline mb-4 text-center">FDT Spelling Bee</h1>
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
        
        <h1 className="font-headline text-4xl font-bold text-headline mb-2 text-center">FDT Spelling Bee</h1>
        <p className="font-body text-ink-light text-center mb-4">Make words using these letters. Must include center letter.</p>

        {/* Score and rank */}
        <div className="text-center mb-6">
          <p className="font-headline text-2xl font-bold text-headline">{getRank()}</p>
          <p className="font-body text-ink-light">{score} points • {foundWords.length} words</p>
        </div>

        {/* Current word */}
        <div className={`text-center mb-6 h-12 ${shake ? 'animate-shake' : ''}`}>
          <p className="font-headline text-3xl font-bold text-headline tracking-wider">
            {currentWord || <span className="text-ink-light">Type or click</span>}
          </p>
        </div>

        {/* Honeycomb */}
        <div className="flex justify-center mb-6">
          <div className="relative w-64 h-64">
            {/* Center */}
            <button
              onClick={() => handleLetterClick(puzzle.centerLetter)}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center font-headline text-2xl font-bold text-headline hover:bg-yellow-500 transition-colors"
            >
              {puzzle.centerLetter}
            </button>
            {/* Outer letters in hexagon pattern */}
            {puzzle.outerLetters.map((letter, i) => {
              const angle = (i * 60 - 90) * (Math.PI / 180);
              const x = Math.cos(angle) * 70;
              const y = Math.sin(angle) * 70;
              return (
                <button
                  key={i}
                  onClick={() => handleLetterClick(letter)}
                  className="absolute w-14 h-14 bg-sepia/30 rounded-full flex items-center justify-center font-headline text-xl font-bold text-headline hover:bg-sepia/50 transition-colors"
                  style={{
                    top: `calc(50% + ${y}px)`,
                    left: `calc(50% + ${x}px)`,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  {letter}
                </button>
              );
            })}
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={handleDelete}
            className="px-4 py-2 border-2 border-headline rounded-lg font-headline text-sm"
          >
            <Delete className="w-4 h-4" />
          </button>
          <button
            onClick={shuffleLetters}
            className="px-4 py-2 border-2 border-headline rounded-lg font-headline text-sm"
          >
            Shuffle
          </button>
          <button
            onClick={submitWord}
            className="px-6 py-2 bg-headline text-paper rounded-lg font-headline text-sm"
          >
            Enter
          </button>
        </div>

        {/* Found words */}
        <div className="border-2 border-rule rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-headline font-bold text-headline">Found Words ({foundWords.length})</h3>
            <button onClick={shareResults} className="text-ink-light hover:text-ink">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {foundWords.sort().map(word => (
              <span
                key={word}
                className={`px-2 py-1 rounded text-sm font-body ${
                  puzzle.pangrams.map(p => p.toUpperCase()).includes(word)
                    ? 'bg-yellow-300 text-yellow-900 font-bold'
                    : 'bg-sepia/30 text-ink'
                }`}
              >
                {word}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpellingBee;