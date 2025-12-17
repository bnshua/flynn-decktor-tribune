import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Check, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Clue {
  number: number;
  clue: string;
  answer: string;
  row: number;
  col: number;
}

interface MiniPuzzle {
  grid: string[][];
  clues: {
    across: Clue[];
    down: Clue[];
  };
}

const MiniCrossword = () => {
  const { toast } = useToast();
  const [puzzle, setPuzzle] = useState<MiniPuzzle | null>(null);
  const [userGrid, setUserGrid] = useState<string[][]>([]);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [direction, setDirection] = useState<'across' | 'down'>('across');
  const [solved, setSolved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timer, setTimer] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchPuzzle();
  }, []);

  useEffect(() => {
    if (timerRunning && !solved) {
      const interval = setInterval(() => setTimer(t => t + 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timerRunning, solved]);

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
          .eq('game_type', 'mini')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (puzzleData?.puzzle_data) {
          const raw = puzzleData.puzzle_data as any;
          // Handle both structures: {clues: {across, down}} OR {across, down} at top level
          const p: MiniPuzzle = {
            grid: raw.grid,
            clues: raw.clues || { across: raw.across || [], down: raw.down || [] }
          };
          setPuzzle(p);
          setUserGrid(p.grid.map(row => row.map(cell => (cell === '.' || cell === '#') ? '#' : '')));
          setTimerRunning(true);
        }
      }
    } catch (error) {
      console.error('Error fetching puzzle:', error);
    }
    setLoading(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCellClick = (row: number, col: number) => {
    if (!puzzle || puzzle.grid[row][col] === '.' || puzzle.grid[row][col] === '#') return;
    
    if (selectedCell && selectedCell[0] === row && selectedCell[1] === col) {
      setDirection(d => d === 'across' ? 'down' : 'across');
    } else {
      setSelectedCell([row, col]);
    }
    inputRef.current?.focus();
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!puzzle || !selectedCell || solved) return;
    
    const [row, col] = selectedCell;
    
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      for (let r = row - 1; r >= 0; r--) {
        if (puzzle.grid[r][col] !== '.' && puzzle.grid[r][col] !== '#') {
          setSelectedCell([r, col]);
          setDirection('down');
          break;
        }
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      for (let r = row + 1; r < 5; r++) {
        if (puzzle.grid[r][col] !== '.' && puzzle.grid[r][col] !== '#') {
          setSelectedCell([r, col]);
          setDirection('down');
          break;
        }
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      for (let c = col - 1; c >= 0; c--) {
        if (puzzle.grid[row][c] !== '.' && puzzle.grid[row][c] !== '#') {
          setSelectedCell([row, c]);
          setDirection('across');
          break;
        }
      }
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      for (let c = col + 1; c < 5; c++) {
        if (puzzle.grid[row][c] !== '.' && puzzle.grid[row][c] !== '#') {
          setSelectedCell([row, c]);
          setDirection('across');
          break;
        }
      }
    } else if (e.key === 'Backspace') {
      e.preventDefault();
      const newGrid = userGrid.map(r => [...r]);
      if (newGrid[row][col] === '') {
        // Move back
        if (direction === 'across' && col > 0) {
          for (let c = col - 1; c >= 0; c--) {
            if (puzzle.grid[row][c] !== '.' && puzzle.grid[row][c] !== '#') {
              newGrid[row][c] = '';
              setSelectedCell([row, c]);
              break;
            }
          }
        } else if (direction === 'down' && row > 0) {
          for (let r = row - 1; r >= 0; r--) {
            if (puzzle.grid[r][col] !== '.' && puzzle.grid[r][col] !== '#') {
              newGrid[r][col] = '';
              setSelectedCell([r, col]);
              break;
            }
          }
        }
      } else {
        newGrid[row][col] = '';
      }
      setUserGrid(newGrid);
    } else if (/^[a-zA-Z]$/.test(e.key)) {
      e.preventDefault();
      const newGrid = userGrid.map(r => [...r]);
      newGrid[row][col] = e.key.toUpperCase();
      setUserGrid(newGrid);
      
      // Auto-advance
      if (direction === 'across') {
        for (let c = col + 1; c < 5; c++) {
          if (puzzle.grid[row][c] !== '.' && puzzle.grid[row][c] !== '#') {
            setSelectedCell([row, c]);
            break;
          }
        }
      } else {
        for (let r = row + 1; r < 5; r++) {
          if (puzzle.grid[r][col] !== '.' && puzzle.grid[r][col] !== '#') {
            setSelectedCell([r, col]);
            break;
          }
        }
      }
      
      // Check if solved
      checkSolution(newGrid);
    }
  }, [puzzle, selectedCell, direction, userGrid, solved]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const checkSolution = (grid: string[][]) => {
    if (!puzzle) return;
    
    const isComplete = grid.every((row, r) =>
      row.every((cell, c) => puzzle.grid[r][c] === '.' || puzzle.grid[r][c] === '#' || cell === puzzle.grid[r][c])
    );
    
    if (isComplete) {
      setSolved(true);
      setTimerRunning(false);
      toast({ title: "Solved!", description: `Time: ${formatTime(timer)}` });
    }
  };

  const revealPuzzle = () => {
    if (!puzzle) return;
    setUserGrid(puzzle.grid.map(r => [...r]));
    setSolved(true);
    setTimerRunning(false);
  };

  const getCellNumber = (row: number, col: number): number | null => {
    if (!puzzle) return null;
    const acrossClue = puzzle.clues.across.find(c => c.row === row && c.col === col);
    const downClue = puzzle.clues.down.find(c => c.row === row && c.col === col);
    return acrossClue?.number || downClue?.number || null;
  };

  const isHighlighted = (row: number, col: number): boolean => {
    if (!selectedCell || !puzzle) return false;
    const [sr, sc] = selectedCell;
    
    if (direction === 'across') {
      if (row !== sr) return false;
      // Find word bounds
      let start = sc, end = sc;
      while (start > 0 && puzzle.grid[row][start - 1] !== '.' && puzzle.grid[row][start - 1] !== '#') start--;
      while (end < 4 && puzzle.grid[row][end + 1] !== '.' && puzzle.grid[row][end + 1] !== '#') end++;
      return col >= start && col <= end;
    } else {
      if (col !== sc) return false;
      let start = sr, end = sr;
      while (start > 0 && puzzle.grid[start - 1][col] !== '.' && puzzle.grid[start - 1][col] !== '#') start--;
      while (end < 4 && puzzle.grid[end + 1][col] !== '.' && puzzle.grid[end + 1][col] !== '#') end++;
      return row >= start && row <= end;
    }
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
          <h1 className="font-headline text-4xl font-bold text-headline mb-4 text-center">FDT Mini</h1>
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
        
        <h1 className="font-headline text-4xl font-bold text-headline mb-2 text-center">FDT Mini</h1>
        <p className="font-headline text-xl text-ink-light text-center mb-6">{formatTime(timer)}</p>

        {/* Hidden input for mobile keyboard */}
        <input
          ref={inputRef}
          type="text"
          className="opacity-0 absolute -z-10"
          autoComplete="off"
          autoCapitalize="characters"
        />

        {/* Grid */}
        <div className="flex justify-center mb-6">
          <div className="grid grid-cols-5 gap-0 border-2 border-headline">
            {puzzle.grid.map((row, r) =>
              row.map((cell, c) => {
                const isBlack = cell === '.' || cell === '#';
                const isSelected = selectedCell?.[0] === r && selectedCell?.[1] === c;
                const highlighted = isHighlighted(r, c);
                const cellNumber = getCellNumber(r, c);
                
                return (
                  <div
                    key={`${r}-${c}`}
                    onClick={() => handleCellClick(r, c)}
                    className={`w-12 h-12 border border-rule relative cursor-pointer select-none
                      ${isBlack ? 'bg-headline' : ''}
                      ${isSelected ? 'bg-yellow-300' : highlighted ? 'bg-yellow-100' : 'bg-paper'}
                    `}
                  >
                    {!isBlack && (
                      <>
                        {cellNumber && (
                          <span className="absolute top-0.5 left-1 text-xs font-body text-ink-light">
                            {cellNumber}
                          </span>
                        )}
                        <span className="absolute inset-0 flex items-center justify-center font-headline text-xl font-bold text-headline">
                          {userGrid[r]?.[c] || ''}
                        </span>
                      </>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => checkSolution(userGrid)}
            className="inline-flex items-center gap-2 px-4 py-2 border-2 border-headline rounded-lg font-headline text-sm"
          >
            <Check className="w-4 h-4" />
            Check
          </button>
          <button
            onClick={revealPuzzle}
            className="inline-flex items-center gap-2 px-4 py-2 border-2 border-headline rounded-lg font-headline text-sm"
          >
            <Eye className="w-4 h-4" />
            Reveal
          </button>
        </div>

        {/* Clues */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="font-headline font-bold text-headline mb-2">ACROSS</h3>
            <div className="space-y-1">
              {puzzle.clues.across.map(clue => (
                <p key={`a${clue.number}`} className="font-body text-sm text-ink">
                  <span className="font-bold">{clue.number}.</span> {clue.clue}
                </p>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-headline font-bold text-headline mb-2">DOWN</h3>
            <div className="space-y-1">
              {puzzle.clues.down.map(clue => (
                <p key={`d${clue.number}`} className="font-body text-sm text-ink">
                  <span className="font-bold">{clue.number}.</span> {clue.clue}
                </p>
              ))}
            </div>
          </div>
        </div>

        {solved && (
          <p className="font-headline text-xl font-bold text-headline text-center mt-6">
            Puzzle Complete!
          </p>
        )}
      </div>
    </div>
  );
};

export default MiniCrossword;