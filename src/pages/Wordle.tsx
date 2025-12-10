import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Share2 } from "lucide-react";
import { toast } from "sonner";

// Common 5-letter words
const WORDS = [
  "ABOUT", "ABOVE", "ABUSE", "ACTOR", "ADMIT", "ADOPT", "ADULT", "AFTER", "AGAIN", "AGENT",
  "AGREE", "AHEAD", "ALARM", "ALBUM", "ALERT", "ALIEN", "ALIGN", "ALIKE", "ALIVE", "ALLOW",
  "ALONE", "ALONG", "ALTER", "ANGEL", "ANGER", "ANGLE", "ANGRY", "APART", "APPLE", "APPLY",
  "ARENA", "ARGUE", "ARISE", "ARMOR", "ARRAY", "ARROW", "ASSET", "AVOID", "AWARD", "AWARE",
  "BASIC", "BASIS", "BEACH", "BEAST", "BEGIN", "BEING", "BELOW", "BENCH", "BERRY", "BIRTH",
  "BLACK", "BLADE", "BLAME", "BLANK", "BLAST", "BLEND", "BLIND", "BLOCK", "BLOOD", "BLOOM",
  "BLOWN", "BOARD", "BOOST", "BOOTH", "BOUND", "BRAIN", "BRAND", "BRAVE", "BREAD", "BREAK",
  "BRICK", "BRIDE", "BRIEF", "BRING", "BROAD", "BROKE", "BROWN", "BUILD", "BUNCH", "BURST",
  "CABIN", "CABLE", "CAMEL", "CANDY", "CARRY", "CATCH", "CAUSE", "CHAIN", "CHAIR", "CHAOS",
  "CHARM", "CHART", "CHASE", "CHEAP", "CHECK", "CHEST", "CHIEF", "CHILD", "CHINA", "CHOSE",
  "CHUNK", "CLAIM", "CLASS", "CLEAN", "CLEAR", "CLERK", "CLICK", "CLIMB", "CLING", "CLOCK",
  "CLOSE", "CLOTH", "CLOUD", "COACH", "COAST", "CORAL", "COUCH", "COULD", "COUNT", "COURT",
  "COVER", "CRACK", "CRAFT", "CRANE", "CRASH", "CRAZY", "CREAM", "CRIME", "CRISP", "CROSS",
  "CROWD", "CROWN", "CRUEL", "CRUSH", "CURVE", "CYCLE", "DAILY", "DANCE", "DEATH", "DEBUT",
  "DECAY", "DELAY", "DENSE", "DEPTH", "DEVIL", "DIARY", "DIRTY", "DOUBT", "DOUGH", "DOZEN",
  "DRAFT", "DRAIN", "DRAMA", "DRANK", "DRAWN", "DREAD", "DREAM", "DRESS", "DRIED", "DRIFT",
  "DRILL", "DRINK", "DRIVE", "DROWN", "DRUNK", "DYING", "EAGER", "EARLY", "EARTH", "EIGHT",
  "ELECT", "ELITE", "EMPTY", "ENEMY", "ENJOY", "ENTER", "ENTRY", "EQUAL", "ERROR", "ESSAY",
  "EVENT", "EVERY", "EXACT", "EXIST", "EXTRA", "FAINT", "FAITH", "FALSE", "FANCY", "FATAL",
  "FAULT", "FAVOR", "FEAST", "FIELD", "FIFTH", "FIFTY", "FIGHT", "FINAL", "FIRST", "FIXED",
  "FLAME", "FLASH", "FLEET", "FLESH", "FLOAT", "FLOOD", "FLOOR", "FLOUR", "FLUID", "FLUSH",
  "FOCUS", "FORCE", "FORGE", "FORTH", "FORTY", "FORUM", "FOUND", "FRAME", "FRANK", "FRAUD",
  "FRESH", "FRONT", "FROST", "FRUIT", "FULLY", "FUNNY", "GIANT", "GIVEN", "GLASS", "GLOBE",
  "GLORY", "GOING", "GRACE", "GRADE", "GRAIN", "GRAND", "GRANT", "GRAPE", "GRASP", "GRASS",
  "GRAVE", "GREAT", "GREEN", "GREET", "GRIEF", "GRILL", "GRIND", "GROSS", "GROUP", "GROVE",
  "GROWN", "GUARD", "GUESS", "GUEST", "GUIDE", "GUILT", "HABIT", "HAPPY", "HARSH", "HASTE",
  "HAUNT", "HEART", "HEAVY", "HELLO", "HENCE", "HONEY", "HONOR", "HORSE", "HOTEL", "HOUSE",
  "HUMAN", "HUMOR", "HURRY", "IDEAL", "IMAGE", "IMPLY", "INDEX", "INNER", "INPUT", "ISSUE",
  "IVORY", "JOINT", "JONES", "JUDGE", "JUICE", "JUICY", "KNOCK", "KNOWN", "LABEL", "LABOR",
  "LARGE", "LASER", "LATER", "LAUGH", "LAYER", "LEARN", "LEAST", "LEAVE", "LEGAL", "LEMON",
  "LEVEL", "LEVER", "LIGHT", "LIMIT", "LINEN", "LIVER", "LIVING", "LOCAL", "LOGIC", "LONELY",
  "LOOSE", "LORRY", "LOTUS", "LOUD", "LOVER", "LOWER", "LOYAL", "LUCKY", "LUNAR", "LUNCH",
  "LYING", "MAGIC", "MAJOR", "MAKER", "MANOR", "MAPLE", "MARCH", "MARRY", "MARSH", "MATCH",
  "MAYOR", "MEANS", "MEANT", "MEDAL", "MEDIA", "MELON", "MERCY", "MERGE", "MERIT", "MERRY",
  "METAL", "MIDST", "MIGHT", "MINOR", "MINUS", "MIXED", "MODEL", "MONEY", "MONTH", "MORAL",
  "MOTOR", "MOUNT", "MOUSE", "MOUTH", "MOVIE", "MUSIC", "NAIVE", "NAKED", "NASTY", "NAVAL",
  "NERVE", "NEVER", "NEWLY", "NIGHT", "NINTH", "NOBLE", "NOISE", "NORTH", "NOTED", "NOVEL",
  "NURSE", "OCCUR", "OCEAN", "OFFER", "OFTEN", "OLIVE", "ONION", "OPERA", "ORBIT", "ORDER",
  "ORGAN", "OTHER", "OUGHT", "OUTER", "OWNER", "OXIDE", "OZONE", "PAINT", "PANEL", "PANIC",
  "PAPER", "PARTY", "PASTA", "PATCH", "PAUSE", "PEACE", "PENNY", "PERCH", "PERIL", "PHASE",
  "PHONE", "PHOTO", "PIANO", "PIECE", "PILOT", "PINCH", "PITCH", "PLACE", "PLAIN", "PLANE",
  "PLANT", "PLATE", "PLAZA", "PLEAD", "PLUCK", "POINT", "POLAR", "PORCH", "POSED", "POUND",
  "POWER", "PRESS", "PRICE", "PRIDE", "PRIME", "PRINT", "PRIOR", "PRIZE", "PROBE", "PRONE",
  "PROOF", "PROSE", "PROUD", "PROVE", "PROXY", "PULSE", "PUNCH", "PUPIL", "PURSE", "QUEEN",
  "QUERY", "QUEST", "QUEUE", "QUICK", "QUIET", "QUITE", "QUOTA", "QUOTE", "RADAR", "RADIO",
  "RAISE", "RALLY", "RANCH", "RANGE", "RAPID", "RATIO", "REACH", "READY", "REALM", "REBEL",
  "REFER", "REIGN", "RELAX", "REPLY", "REPAY", "RIDER", "RIDGE", "RIFLE", "RIGHT", "RIGID",
  "RISKY", "RIVAL", "RIVER", "ROBOT", "ROCKY", "ROMAN", "ROAST", "ROGER", "ROMAN", "ROUGE",
  "ROUGH", "ROUND", "ROUTE", "ROYAL", "RUGBY", "RULER", "RURAL", "SADLY", "SAINT", "SALAD",
  "SALON", "SANDY", "SAUCE", "SAVED", "SCALE", "SCARE", "SCENE", "SCENT", "SCOPE", "SCORE",
  "SCOUT", "SCRAP", "SEIZE", "SENSE", "SERVE", "SETUP", "SEVEN", "SHADE", "SHAKE", "SHALL",
  "SHAME", "SHAPE", "SHARE", "SHARK", "SHARP", "SHEEP", "SHEER", "SHEET", "SHELF", "SHELL",
  "SHIFT", "SHINE", "SHIRT", "SHOCK", "SHOOT", "SHORT", "SHOUT", "SHOWN", "SHRUG", "SIGHT",
  "SIGMA", "SILLY", "SINCE", "SIXTH", "SIXTY", "SIZED", "SKILL", "SKULL", "SLASH", "SLATE",
  "SLAVE", "SLEEP", "SLICE", "SLIDE", "SLOPE", "SMALL", "SMART", "SMELL", "SMILE", "SMOKE",
  "SNAKE", "SOLAR", "SOLID", "SOLVE", "SORRY", "SOUND", "SOUTH", "SPACE", "SPARE", "SPARK",
  "SPEAK", "SPEAR", "SPEED", "SPELL", "SPEND", "SPICE", "SPILL", "SPINE", "SPLIT", "SPOKE",
  "SPORT", "SPRAY", "SQUAD", "STACK", "STAFF", "STAGE", "STAIN", "STAKE", "STALL", "STAMP",
  "STAND", "STARK", "START", "STATE", "STAYS", "STEAK", "STEAL", "STEAM", "STEEL", "STEEP",
  "STEER", "STICK", "STILL", "STOCK", "STONE", "STOOD", "STORE", "STORM", "STORY", "STOVE",
  "STRAP", "STRAW", "STRIP", "STUCK", "STUDY", "STUFF", "STYLE", "SUGAR", "SUITE", "SUNNY",
  "SUPER", "SURGE", "SWAMP", "SWEAR", "SWEAT", "SWEEP", "SWEET", "SWIFT", "SWING", "SWORD",
  "TABLE", "TAKEN", "TASTE", "TEACH", "TEETH", "TEMPO", "TENSE", "TENTH", "TERMS", "THANK",
  "THEFT", "THEME", "THERE", "THICK", "THIEF", "THING", "THINK", "THIRD", "THOSE", "THREE",
  "THREW", "THROW", "THUMB", "TIGER", "TIGHT", "TIMER", "TINY", "TIRED", "TITLE", "TODAY",
  "TOKEN", "TOOTH", "TOPIC", "TOTAL", "TOUCH", "TOUGH", "TOWER", "TRACE", "TRACK", "TRADE",
  "TRAIL", "TRAIN", "TRASH", "TREAT", "TREND", "TRIAL", "TRIBE", "TRICK", "TRIED", "TROOP",
  "TRUCK", "TRULY", "TRUNK", "TRUST", "TRUTH", "TWICE", "TWIST", "TYLER", "ULTRA", "UNCLE",
  "UNDER", "UNION", "UNITY", "UNTIL", "UPPER", "UPSET", "URBAN", "USAGE", "USUAL", "VALID",
  "VALUE", "VALVE", "VAPOR", "VAULT", "VENUS", "VERSE", "VERY", "VIDEO", "VIEWS", "VILLA",
  "VIRAL", "VIRUS", "VISIT", "VITAL", "VIVID", "VOCAL", "VOICE", "VOTER", "WAGON", "WAIST",
  "WASTE", "WATCH", "WATER", "WEARY", "WEDGE", "WEIGH", "WEIRD", "WHALE", "WHEAT", "WHEEL",
  "WHERE", "WHICH", "WHILE", "WHITE", "WHOLE", "WHOSE", "WIDEN", "WIDTH", "WITCH", "WOMAN",
  "WORLD", "WORRY", "WORSE", "WORST", "WORTH", "WOULD", "WOUND", "WRIST", "WRITE", "WRONG",
  "WROTE", "YACHT", "YIELD", "YOUNG", "YOUTH", "ZEBRA", "ZONE"
].filter(w => w.length === 5);

const getRandomWord = () => {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  return WORDS[seed % WORDS.length];
};

type LetterState = "correct" | "present" | "absent" | "empty";

interface LetterResult {
  letter: string;
  state: LetterState;
}

const Wordle = () => {
  const [targetWord] = useState(() => getRandomWord());
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [shake, setShake] = useState(false);
  const [usedLetters, setUsedLetters] = useState<Record<string, LetterState>>({});

  const checkGuess = useCallback((guess: string): LetterResult[] => {
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
    if (currentGuess.length !== 5) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      toast.error("Not enough letters");
      return;
    }

    // Check if it's a valid word (simplified - accept all 5-letter combos)
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
    if (gameOver) return;

    if (key === "ENTER") {
      submitGuess();
    } else if (key === "BACKSPACE") {
      setCurrentGuess(prev => prev.slice(0, -1));
    } else if (/^[A-Z]$/.test(key) && currentGuess.length < 5) {
      setCurrentGuess(prev => prev + key);
    }
  }, [gameOver, currentGuess, submitGuess]);

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
