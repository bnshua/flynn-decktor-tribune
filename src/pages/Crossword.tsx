import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Check, Eye, Pause, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Clue {
  number: number;
  clue: string;
  answer: string;
  row: number;
  col: number;
}

interface CrosswordPuzzle {
  grid: string[][];
  clues: {
    across: Clue[];
    down: Clue[];
  };
}

const GRID_SIZE = 15;

const Crossword = () => {
  const { toast } = useToast();
  const [puzzle, setPuzzle] = useState<CrosswordPuzzle | null>(null);
  const [userGrid, setUserGrid] = useState<string[][]>([]);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [direction, setDirection] = useState<'across' | 'down'>('across');
  const [solved, setSolved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timer, setTimer] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchPuzzle();
  }, []);

  useEffect(() => {
    if (timerRunning && !solved && !paused) {
      const interval = setInterval(() => setTimer(t => t + 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timerRunning, solved, paused]);

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
          .eq('game_type', 'crossword')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (puzzleData?.puzzle_data) {
          const raw = puzzleData.puzzle_data as any;
          // Handle both structures: {clues: {across, down}} OR {across, down} at top level
          const p: CrosswordPuzzle = {
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
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
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
    if (!puzzle || !selectedCell || solved || paused) return;
    
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
      for (let r = row + 1; r < GRID_SIZE; r++) {
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
      for (let c = col + 1; c < GRID_SIZE; c++) {
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
      
      if (direction === 'across') {
        for (let c = col + 1; c < GRID_SIZE; c++) {
          if (puzzle.grid[row][c] !== '.' && puzzle.grid[row][c] !== '#') {
            setSelectedCell([row, c]);
            break;
          }
        }
      } else {
        for (let r = row + 1; r < GRID_SIZE; r++) {
          if (puzzle.grid[r][col] !== '.' && puzzle.grid[r][col] !== '#') {
            setSelectedCell([r, col]);
            break;
          }
        }
      }
      
      checkSolution(newGrid);
    }
  }, [puzzle, selectedCell, direction, userGrid, solved, paused]);

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
      toast({ title: "Congratulations!", description: `Completed in ${formatTime(timer)}` });
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
      let start = sc, end = sc;
      while (start > 0 && puzzle.grid[row][start - 1] !== '.' && puzzle.grid[row][start - 1] !== '#') start--;
      while (end < GRID_SIZE - 1 && puzzle.grid[row][end + 1] !== '.' && puzzle.grid[row][end + 1] !== '#') end++;
      return col >= start && col <= end;
    } else {
      if (col !== sc) return false;
      let start = sr, end = sr;
      while (start > 0 && puzzle.grid[start - 1][col] !== '.' && puzzle.grid[start - 1][col] !== '#') start--;
      while (end < GRID_SIZE - 1 && puzzle.grid[end + 1][col] !== '.' && puzzle.grid[end + 1][col] !== '#') end++;
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
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Link to="/games" className="inline-flex items-center gap-2 text-ink-light hover:text-ink mb-6 font-body">
            <ArrowLeft className="w-4 h-4" />
            Back to Games
          </Link>
          <h1 className="font-headline text-4xl font-bold text-headline mb-4 text-center">FDT Crossword</h1>
          <p className="font-body text-ink-light text-center">No puzzle available. Check back after a new edition is generated!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Link to="/games" className="inline-flex items-center gap-2 text-ink-light hover:text-ink mb-6 font-body">
          <ArrowLeft className="w-4 h-4" />
          Back to Games
        </Link>
        
        <h1 className="font-headline text-4xl font-bold text-headline mb-2 text-center">FDT Crossword</h1>
        
        <div className="flex justify-center items-center gap-4 mb-6">
          <p className="font-headline text-xl text-ink-light">{formatTime(timer)}</p>
          <button
            onClick={() => setPaused(!paused)}
            className="p-2 border border-headline rounded"
          >
            {paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>
        </div>

        <input
          ref={inputRef}
          type="text"
          className="opacity-0 absolute -z-10"
          autoComplete="off"
          autoCapitalize="characters"
        />

        {paused ? (
          <div className="flex justify-center items-center h-96">
            <p className="font-headline text-2xl text-ink-light">Paused</p>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Grid */}
            <div className="flex justify-center">
              <div className="grid gap-0 border-2 border-headline" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}>
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
                        className={`w-6 h-6 sm:w-7 sm:h-7 border border-rule relative cursor-pointer select-none
                          ${isBlack ? 'bg-headline' : ''}
                          ${isSelected ? 'bg-yellow-300' : highlighted ? 'bg-yellow-100' : 'bg-paper'}
                        `}
                      >
                        {!isBlack && (
                          <>
                            {cellNumber && (
                              <span className="absolute top-0 left-0.5 text-[8px] font-body text-ink-light leading-none">
                                {cellNumber}
                              </span>
                            )}
                            <span className="absolute inset-0 flex items-center justify-center font-headline text-sm font-bold text-headline">
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

            {/* Clues */}
            <div className="flex-1 grid grid-cols-2 gap-4 max-h-[500px] overflow-y-auto">
              <div>
                <h3 className="font-headline font-bold text-headline mb-2 sticky top-0 bg-paper">ACROSS</h3>
                <div className="space-y-1">
                  {puzzle.clues.across.map(clue => (
                    <p key={`a${clue.number}`} className="font-body text-xs text-ink">
                      <span className="font-bold">{clue.number}.</span> {clue.clue}
                    </p>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-headline font-bold text-headline mb-2 sticky top-0 bg-paper">DOWN</h3>
                <div className="space-y-1">
                  {puzzle.clues.down.map(clue => (
                    <p key={`d${clue.number}`} className="font-body text-xs text-ink">
                      <span className="font-bold">{clue.number}.</span> {clue.clue}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex justify-center gap-4 mt-6">
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
            Reveal All
          </button>
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

export default Crossword;