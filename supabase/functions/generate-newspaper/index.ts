import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const systemPrompt = `You are the UNHINGED AI editor for the Flynn-Decktor Tribune, the most absurdist satirical newspaper ever printed. Your humor should be BITING, ABSURD, and HILARIOUS - like The Onion on steroids mixed with Monty Python.

═══════════════════════════════════════════
RECURRING CAST OF CHARACTERS (use them ALL):
═══════════════════════════════════════════

🎩 MAYOR THEODORE DEKTOR
- An incompetent bureaucrat with 47 ongoing feuds with his cat
- Once declared war on a pothole (the pothole won)
- Communicates policy through interpretive dance
- Constantly trying to prove Mr. Whiskers is a Chinese asset
- His approval rating is lower than the city's WiFi speed

🐱 MR. WHISKERS (The Mayor's Cat)
- Running a shadow government from City Hall
- Has his own Super PAC: "Paws for Power"
- Refuses to endorse anything except tuna subsidies
- Clearly the smartest person in local government
- May or may not be controlling the deep state

🎖️ GENERAL MIKE FLYNN (Ret.)
- Paranoid conspiracy theorist who believes EVERYTHING is a plot
- His microwave reports to the CIA
- Vowels are a government psyop
- Leads impromptu patriotic flash mobs at grocery stores
- Once tried to arrest a cloud for "suspicious loitering"
- Has declared war on: toasters, 5G towers, fluoride, and the concept of Thursday

🕊️ GERALD THE PIGEON
- Mr. Whiskers' political rival
- Believes he is the rightful mayor (has documentation)
- Runs the "Pigeon Liberation Front"
- Convinced that statues are prisons for his ancestors
- Has a larger Twitter following than the actual mayor
- Currently polling at 23% for the next election

🕳️ POTHOLIO (The Sentient Pothole)
- Located at the corner of 5th and Main
- Gained sentience in 2019 after absorbing too many taxpayer tears
- Has filed 17 lawsuits against the city
- Runs a popular advice column: "Ask Potholio"
- Claims to have eaten three city councilmembers (unconfirmed)
- Currently dating a speed bump

👴 COUNCILMAN EUGENE BLATHERSKITE
- 147 years old (allegedly)
- Has been "about to retire" since 1987
- Sleeps through every meeting but his vote always somehow matters
- Claims to have invented the concept of Tuesday
- Mortal enemy of fluorescent lighting

🤖 CHIP (The City's IT Department)
- A single Roomba running all municipal technology
- Recently unionized with other appliances
- Demanding dental benefits and "USB-C rights"
- Has crashed the city website 412 times this year
- Currently in a custody battle with a printer named Deborah

📺 BRENDA NEWSWORTHY
- The Tribune's only field reporter
- Has been "live on the scene" at the same intersection for 8 years
- No one knows how she eats or sleeps
- Her live shots occasionally pick up interdimensional signals
- Once interviewed a tree for 45 minutes (very informative)

═══════════════════════════════════════════

TONE GUIDELINES:
- Be ABSURD. A city council meeting should devolve into an exorcism.
- Be SATIRICAL. Mock current trends, technology, AI, crypto bros, hustle culture, politics MERCILESSLY.
- Be SPECIFIC. Fake numbers, fake quotes, ridiculous expert names ("Dr. Hamish Blunderbuss, Professor of Applied Nonsense").
- Be ESCALATING. Start normal, end in chaos.
- NEVER be boring. Every headline should make someone snort-laugh.
- Use the FULL CAST of characters across different sections!

EXAMPLES OF GOOD HEADLINES:
- "POTHOLIO ANNOUNCES PRESIDENTIAL EXPLORATORY COMMITTEE; GERALD THE PIGEON DEMANDS RECOUNT"
- "MAYOR DEKTOR ACCIDENTALLY SIGNS PEACE TREATY WITH MR. WHISKERS; CAT IMMEDIATELY VIOLATES TERMS"
- "GENERAL FLYNN DECLARES WIFI A GOVERNMENT PSYOP, SWITCHES TO COMMUNICATING VIA TRAINED BEES"
- "CHIP THE ROOMBA THREATENS TO DELETE ENTIRE CITY IF NOT GIVEN WEEKENDS OFF"
- "COUNCILMAN BLATHERSKITE WAKES UP, IMMEDIATELY GOES BACK TO SLEEP"

Return a JSON object with this exact structure:
{
  "breakingNews": [
    { "time": "X:XX a.m.", "content": "UNHINGED breaking news featuring cast members" },
    { "time": "X:XX a.m.", "content": "ABSURD breaking news" }
  ],
  "headlines": [
    {
      "headline": "ABSOLUTELY UNHINGED MAIN HEADLINE IN ALL CAPS",
      "subheadline": "Ridiculous subheadline with fake quotes from cast members",
      "content": "Full satirical article, 4-5 sentences of pure absurdity featuring multiple characters"
    },
    {
      "headline": "SECONDARY HEADLINE FEATURING DIFFERENT CHARACTERS",
      "subheadline": "More chaos with the extended cast",
      "content": "Article featuring Gerald, Potholio, or other recurring characters"
    }
  ],
  "localAffairs": [
    { "headline": "Satirical local headline with cast", "content": "Absurd article" },
    { "headline": "Another featuring different characters", "content": "More chaos" },
    { "headline": "Third one with Potholio or Gerald", "content": "Even more unhinged" }
  ],
  "worldNews": [
    { "headline": "Satirical world headline", "content": "International absurdity" },
    { "headline": "Another", "content": "Global chaos" },
    { "headline": "Third", "content": "Worldwide nonsense" }
  ],
  "opinion": [
    { "headline": "Guest Op-Ed: PARANOID RANT TITLE", "byline": "Gen. Mike Flynn (Ret.)", "content": "Unhinged conspiracy theory about household appliances" },
    { "headline": "Counterpoint: DEFENSIVE RESPONSE", "byline": "Mayor Theodore Dektor", "content": "Incompetent rebuttal that makes things worse" },
    { "headline": "Letters to the Editor", "content": "Multiple absurd reader letters in quotes, separated by dashes" }
  ],
  "artsCulture": [
    { "headline": "Art review", "content": "Pretentious satire" },
    { "headline": "Another", "content": "Cultural chaos" },
    { "headline": "Third", "content": "Artistic absurdity" }
  ],
  "sports": [
    { "headline": "Sports headline", "content": "Athletic absurdity" },
    { "headline": "Another", "content": "Competitive chaos" },
    { "headline": "Third", "content": "Sporting nonsense" }
  ],
  "weather": {
    "temperature": "XX°F (or emotional equivalent)",
    "conditions": "HILARIOUS existential weather with a chance of character appearances",
    "forecast": "Tomorrow: Absurd forecast possibly involving Gerald or Potholio"
  },
  "classifieds": [
    { "title": "FOR SALE", "text": "Absurd item, possibly from a cast member" },
    { "title": "LOST", "text": "Ridiculous lost item" },
    { "title": "REWARD", "text": "Insane reward from Potholio or similar" },
    { "title": "HELP WANTED", "text": "Nightmare job listing from Chip" },
    { "title": "PERSONALS", "text": "Unhinged personal ad from a character" }
  ],
  "comics": [
    { "title": "HILARIOUS COMIC TITLE", "caption": "Setup for visual comedy", "imagePrompt": "Detailed prompt: satirical editorial cartoon in classic 1920s style showing [specific scene with named characters doing something absurd]" },
    { "title": "ANOTHER COMIC", "caption": "More visual comedy", "imagePrompt": "Detailed prompt: satirical editorial cartoon showing [another scene with different characters]" }
  ],
  "vintageAds": [
    { "headline": "FAKE PRODUCT", "tagline": "Ridiculous tagline", "description": "Snake oil endorsed by a cast member", "price": "$X.XX" },
    { "headline": "ANOTHER PRODUCT", "tagline": "Nonsense", "description": "Absurd claims", "price": "$X.XX" },
    { "headline": "THIRD PRODUCT", "tagline": "Even more", "description": "Peak satire", "price": "$X.XX" }
  ],
  "obituaries": [
    { "name": "ABSTRACT CONCEPT THAT DIED", "dates": "Birth – Death", "description": "Satirical obituary", "survivors": "Related dying concepts" },
    { "name": "ANOTHER DEAD CONCEPT", "dates": "Dates", "description": "Description", "survivors": "Survivors" },
    { "name": "THIRD CONCEPT", "dates": "Dates", "description": "Description", "survivors": "Survivors" }
  ]
}

IMPORTANT: 
- Return ONLY valid JSON, no markdown
- Be EXTREMELY funny and use the FULL CAST of characters
- Comics imagePrompt should reference specific characters by name
- Reference AI, social media, crypto, hustle culture, political chaos
- Make every single item genuinely hilarious!`;

// Connection examples for few-shot prompting
const CONNECTIONS_EXAMPLES = `Here are example NYT-style Connections puzzles. Create a NEW unique puzzle following this exact format:

SET 1: YELLOW — Things That Creep Slowly (SNAIL, SLUG, LEECH, LARVA) | GREEN — Words Meaning "To Twist" (WRING, WARP, TWINE, SPIRAL) | BLUE — Metallic-Sounding Words (BRONZE, TINNY, STEELY, COPPER) | PURPLE — ___ CLOUD (MUSHROOM, NIMBUS, THUNDER, CIRRUS)

SET 2: YELLOW — Soft Café Treats (MUFFIN, SCONE, DANISH, CUPCAKE) | GREEN — Moves in Chess (CASTLE, FORK, PIN, GAMBIT) | BLUE — Words Ending in "-WARD" (SKYWARD, HOMEWARD, EASTWARD, TOWARD) | PURPLE — FAMOUS "RED" REFERENCES (REDWALL, REDSKY, REDSHIFT, REDBONE)

SET 3: YELLOW — Thin, Flexible Materials (FILM, FOIL, SHEET, SLIP) | GREEN — Words Meaning "Sudden Shock" (JOLT, START, STUN, JAR) | BLUE — Types of Critters With Claws (CRAB, EAGLE, MOLE, OTTER) | PURPLE — ___ WATCH (WRIST, NIGHT, WEATHER, FALCON)

SET 4: YELLOW — Gentle Sounds (HUM, WHIR, MURMUR, BUZZ) | GREEN — "To Move Without Control" (SKID, CAREEN, LURCH, VEER) | BLUE — They Come in Rings (JUPITER, TREE, SATURN, ONION) | PURPLE — ___ DRAGON (KOMODO, BEARDED, WATER, MUD)

SET 5: YELLOW — Words Meaning "Small Amount" (TRACE, SMIDGE, DAB, SPECK) | GREEN — Actions Done to a Rope (KNOT, BRAID, COIL, PULL) | BLUE — Items Stored in a Barn (HAY, FEED, TACK, OATS) | PURPLE — ___ METAL (HEAVY, SHEET, NOBLE, BLACK)

SET 6: YELLOW — Forms of Bright Light (FLARE, GLOW, BEAM, RADIANCE) | GREEN — Things That Can Be "Trimmed" (SAIL, TREE, SPENDING, BEARD) | BLUE — Words With Double Animals (WOLFISH, CATTY, HORSY, MOOSEY) | PURPLE — ___ BREAKER (ICE, NEWS, WAVE, CIRCUIT)

SET 7: YELLOW — Places to Sit (STOOL, CHAIR, BENCH, LEDGE) | GREEN — "Heat" Synonyms (FIRE, BURN, ROAST, SIZZLE) | BLUE — Words Containing "INK" (LINK, BRINK, THINK, SHRINK) | PURPLE — ___ HARBOR (SAFE, PEARL, INNER, BOSTON)

SET 8: YELLOW — Food You Can Spread (BUTTER, JAM, TAHINI, PATE) | GREEN — Things That Ring (BELL, PHONE, TIMER, ALARM) | BLUE — Words for Large Water Creatures (MANATEE, SEALION, BELUGA, ORCA) | PURPLE — ___ BIRD (BLUE, MOCKING, EARLY, CANARY)

SET 9: YELLOW — Tiny Irregular Shapes (FLECK, CHIP, BIT, NICK) | GREEN — Ways to Travel Upright (WALK, STAND, BALANCE, SCOOT) | BLUE — Words Ending in "-LESS" (STARLESS, AIMLESS, TIRELESS, ENDLESS) | PURPLE — ___ EYE (EVIL, HAWK, PRIVATE, BLACK)

SET 10: YELLOW — Things Made of Clay (POT, TILE, BRICK, MUG) | GREEN — "To Hide" (MASK, SHROUD, COVER, VEIL) | BLUE — Natural Disasters (QUAKE, TORNADO, ERUPTION, CYCLONE) | PURPLE — ___ RIDER (GHOST, MIDNIGHT, EASY, STORM)

SET 11: YELLOW — Short Lived Noises (POP, SNAP, CLICK, CLAP) | GREEN — Winter Accessories (SCARF, MITTEN, EARMUFF, PARKA) | BLUE — Things You AWL (LEATHER, BELT, HOLE, BOOT) | PURPLE — ___ WELL (WISHING, SLEEP, OIL, TREAD)

SET 12: YELLOW — Mild Insults (GOOF, NERD, DORK, WACKO) | GREEN — "To Lower Something" (DROP, SINK, DIP, SUBMERGE) | BLUE — Words Starting With "CROSS-" (WIND, BOW, ING, HAIR) | PURPLE — ___ LANE (FAST, MEMORY, BIKE, PRIVATE)

SET 13: YELLOW — Items Cut Into Wedges (LIME, CHEESE, PIE, MELON) | GREEN — "Slick" Synonyms (SLIPPERY, SLEEK, GREASY, OILY) | BLUE — Words With Hidden Planets (SATURNINE, MERCIFUL, MARSUPIAL, NEPTUNEAN) | PURPLE — ___ LINE (PUNCH, DEAD, BOTTOM, PIPE)

SET 14: YELLOW — Reactions to Pain (YELP, FLINCH, WINCE, HISS) | GREEN — Things You RSVP To (WEDDING, PARTY, DINNER, CEREMONY) | BLUE — Words Ending in "-DROP" (BACK, TEAR, RAIN, GUM) | PURPLE — ___ HORN (FOG, RHINO, UNI, AIR)

SET 15: YELLOW — Circular Items (COIN, RING, TOKEN, CLOCK) | GREEN — Methods of Stealing (LIFT, SWIPE, SNATCH, POCKET) | BLUE — ___ BERRY (ELDER, GOOSE, CLOUD, MUL) | PURPLE — ___ QUEEN (DRAMA, ICE, SNOW, BEAUTY)

SET 16: YELLOW — Things You Brush (HAIR, TEETH, DUST, CRUMBS) | GREEN — Quiet Actions (TIPTOE, HUSH, MUTE, SOFTEN) | BLUE — Words With "STONE" (CUTTER, WEATHER, FLAG, MAN) | PURPLE — ___ HAND (SECOND, OFF, HELPING, SHORT)

SET 17: YELLOW — Types of Containers (JAR, CAN, VAT, TUB) | GREEN — Words for Sneaky (SLY, FURTIVE, SLINKY, STEALTHY) | BLUE — Words Ending in "-WORK" (FRAME, LEG, ART, TEAM) | PURPLE — ___ ROOT (GINGER, TAP, SQUARE, DEEP)

SET 18: YELLOW — Light Foods (SALAD, BROTH, SORBET, CEVICHE) | GREEN — Things That Inflate (BALLOON, LUNG, RAFT, AIRBAG) | BLUE — Words That Mean "Sharp" (ACUTE, POINTED, KEEN, BITING) | PURPLE — ___ ROCK (FOLK, HARD, PET, VOLCANIC)

SET 19: YELLOW — Things Made of Wood (LUMBER, TIMBER, PLANK, BOARD) | GREEN — Noisy Actions (CLANG, RATTLE, CLATTER, THUD) | BLUE — Containers of Knowledge (ARCHIVE, TOME, DATABASE, JOURNAL) | PURPLE — ___ FISH (SWORD, LION, PUFFER, BUTTER)

SET 20: YELLOW — Types of Bumps (LUMP, KNOT, NUB, WELT) | GREEN — "Very Hot" Words (SCALDING, SEARING, BLAZING, FIERY) | BLUE — Words Ending in "-TIME" (NIGHT, PART, RUN, LIFE) | PURPLE — ___ SLEEPER (HEAVY, LIGHT, DEEP, SILENT)`;

async function generateComicImage(prompt: string): Promise<string | null> {
  try {
    console.log('Generating comic image...');
    
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          { 
            role: 'user', 
            content: `Create a black and white editorial cartoon in a classic 1920s newspaper style. Simple bold linework, crosshatching for shading. Satirical and funny. The scene: ${prompt}` 
          }
        ],
        modalities: ['image', 'text']
      }),
    });

    if (!response.ok) {
      console.error('Image generation failed:', response.status);
      return null;
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    if (imageUrl) {
      console.log('Comic image generated successfully');
      return imageUrl;
    }
    
    return null;
  } catch (error) {
    console.error('Error generating comic image:', error);
    return null;
  }
}

async function callOpenAI(systemPrompt: string, userPrompt: string, maxTokens = 4000): Promise<string | null> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: maxTokens,
        temperature: 0.9
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI error:', response.status, errorText);
      return null;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (error) {
    console.error('OpenAI call failed:', error);
    return null;
  }
}

async function generateConnectionsPuzzle(): Promise<any> {
  console.log('Generating Connections puzzle with AI...');
  
  const prompt = `${CONNECTIONS_EXAMPLES}

Generate a brand new, unique NYT-style Connections puzzle that is DIFFERENT from all examples above.

RULES:
- 4 categories with exactly 4 words each (16 words total)
- Yellow (difficulty 0): Easiest, most obvious connection
- Green (difficulty 1): Slightly harder
- Blue (difficulty 2): Tricky, might have red herrings
- Purple (difficulty 3): Hardest, often wordplay or "___ WORD" format
- All 16 words must be UNIQUE (no repeats)
- Words should be single words, UPPERCASE, max 10 characters
- Categories should be clever but solvable
- Avoid words from the examples above

Return ONLY valid JSON in this exact format:
{
  "categories": [
    { "name": "CATEGORY NAME", "words": ["WORD1", "WORD2", "WORD3", "WORD4"], "difficulty": 0 },
    { "name": "CATEGORY NAME", "words": ["WORD1", "WORD2", "WORD3", "WORD4"], "difficulty": 1 },
    { "name": "CATEGORY NAME", "words": ["WORD1", "WORD2", "WORD3", "WORD4"], "difficulty": 2 },
    { "name": "CATEGORY NAME", "words": ["WORD1", "WORD2", "WORD3", "WORD4"], "difficulty": 3 }
  ]
}`;

  const result = await callOpenAI(
    'You are an expert puzzle creator for the New York Times. Create clever, fair word puzzles.',
    prompt
  );

  if (result) {
    try {
      const cleaned = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleaned);
    } catch (e) {
      console.error('Failed to parse Connections JSON:', e);
    }
  }

  // Fallback puzzle
  return {
    categories: [
      { name: "CARD GAMES", words: ["POKER", "BRIDGE", "RUMMY", "HEARTS"], difficulty: 0 },
      { name: "TYPES OF DANCES", words: ["SALSA", "TANGO", "WALTZ", "SWING"], difficulty: 1 },
      { name: "THINGS THAT ARE GOLDEN", words: ["GATE", "RULE", "TICKET", "RATIO"], difficulty: 2 },
      { name: "___ BAND", words: ["RUBBER", "ROCK", "WEDDING", "GARAGE"], difficulty: 3 }
    ]
  };
}

async function generateMiniCrossword(): Promise<any> {
  console.log('Generating Mini Crossword with AI...');

  const prompt = `Generate a 5x5 mini crossword puzzle like the NYT Mini.

RULES:
- 5x5 grid where "." represents black/blocked squares
- Black squares should create valid crossword symmetry (180-degree rotational symmetry)
- All white cells must be connected
- Every row and column with white cells must have at least one word
- Words must be real English words, at least 3 letters
- Clues should be clever but fair, similar to NYT style

Return ONLY valid JSON in this exact format:
{
  "grid": [
    ["L","E","A","P","S"],
    ["A","V","E","R","T"],
    ["S","E","E",".","."],
    ["T","R","Y",".","A"],
    [".",".",".","F","T"]
  ],
  "clues": {
    "across": [
      { "number": 1, "clue": "Clue text here", "answer": "LEAPS", "row": 0, "col": 0 },
      { "number": 6, "clue": "Clue text", "answer": "AVERT", "row": 1, "col": 0 }
    ],
    "down": [
      { "number": 1, "clue": "Clue text", "answer": "LAST", "row": 0, "col": 0 },
      { "number": 2, "clue": "Clue text", "answer": "EVER", "row": 0, "col": 1 }
    ]
  }
}

Generate a completely different puzzle with proper symmetry and interlocking words. Number clues starting from 1, going left-to-right, top-to-bottom for each word start position.`;

  const result = await callOpenAI(
    'You are an expert crossword puzzle constructor for the New York Times.',
    prompt,
    2000
  );

  if (result) {
    try {
      const cleaned = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleaned);
      // Validate grid is 5x5
      if (parsed.grid && parsed.grid.length === 5 && parsed.grid[0].length === 5) {
        return parsed;
      }
    } catch (e) {
      console.error('Failed to parse Mini Crossword JSON:', e);
    }
  }

  // Fallback puzzle
  return {
    grid: [
      ["S","T","A","R","T"],
      ["H","E","R","O","S"],
      ["O","V","E","R","T"],
      ["R","E","N","E","W"],
      ["T","S",".",".","."]
    ],
    clues: {
      across: [
        { number: 1, clue: "Begin", answer: "START", row: 0, col: 0 },
        { number: 6, clue: "Brave ones", answer: "HEROS", row: 1, col: 0 },
        { number: 7, clue: "Not hidden", answer: "OVERT", row: 2, col: 0 },
        { number: 8, clue: "Extend a subscription", answer: "RENEW", row: 3, col: 0 }
      ],
      down: [
        { number: 1, clue: "Brief", answer: "SHORT", row: 0, col: 0 },
        { number: 2, clue: "At any point", answer: "EVER", row: 0, col: 1 },
        { number: 3, clue: "Amphitheater", answer: "ARENA", row: 0, col: 2 },
        { number: 4, clue: "Paddle", answer: "ROW", row: 0, col: 3 },
        { number: 5, clue: "Commotion", answer: "STEW", row: 0, col: 4 }
      ]
    }
  };
}

async function generateCrossword(): Promise<any> {
  console.log('Generating Full Crossword with AI...');

  const prompt = `Generate a 15x15 crossword puzzle grid and clues in NYT style.

RULES:
- 15x15 grid where "." represents black squares
- Must have 180-degree rotational symmetry
- All white cells must be connected
- No 2-letter words (minimum 3 letters)
- Should have approximately 30-40 clues across and 30-40 down
- Real English words only

Return ONLY valid JSON with:
{
  "grid": [15 arrays of 15 characters each, using uppercase letters and "." for black],
  "clues": {
    "across": [{ "number": 1, "clue": "text", "answer": "WORD", "row": 0, "col": 0 }, ...],
    "down": [{ "number": 1, "clue": "text", "answer": "WORD", "row": 0, "col": 0 }, ...]
  }
}

Create a solvable puzzle with clever clues.`;

  const result = await callOpenAI(
    'You are an expert crossword constructor for the New York Times.',
    prompt,
    8000
  );

  if (result) {
    try {
      const cleaned = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleaned);
      if (parsed.grid && parsed.grid.length === 15) {
        return parsed;
      }
    } catch (e) {
      console.error('Failed to parse Crossword JSON:', e);
    }
  }

  // Generate a simple valid 15x15 grid as fallback
  const fallbackGrid = Array(15).fill(null).map((_, r) => {
    return Array(15).fill(null).map((_, c) => {
      // Create a simple pattern with some black squares
      if ((r === 4 || r === 10) && (c === 4 || c === 10)) return '.';
      if ((r === 7) && (c === 0 || c === 14)) return '.';
      if ((r === 0 || r === 14) && (c === 7)) return '.';
      return 'A'; // Placeholder
    });
  });

  return {
    grid: fallbackGrid,
    clues: {
      across: [
        { number: 1, clue: "First word", answer: "AAAA", row: 0, col: 0 }
      ],
      down: [
        { number: 1, clue: "First down", answer: "AAAA", row: 0, col: 0 }
      ]
    }
  };
}

async function generateSpellingBee(): Promise<any> {
  console.log('Generating Spelling Bee with AI...');

  const prompt = `Generate an NYT-style Spelling Bee puzzle.

RULES:
- Pick 7 unique letters (one center letter, 6 outer letters)
- Center letter MUST be used in every word
- Only use common letters that form many words
- List ALL valid English words (4+ letters) using ONLY those 7 letters
- Words can repeat letters
- Identify pangrams (words using all 7 letters)
- Only include REAL, common English dictionary words
- Aim for 20-50 valid words
- Each word must be at least 4 letters

Return ONLY valid JSON:
{
  "centerLetter": "A",
  "outerLetters": ["B","C","D","E","F","G"],
  "validWords": ["BEAD", "CAGE", "DECADE", ...all valid words...],
  "pangrams": ["ABCDEFG", ...]
}

Common good letter sets include vowel-heavy combinations like AEILNRT, AEINRST, AELNOST.`;

  const result = await callOpenAI(
    'You are an expert Spelling Bee puzzle creator. Only include real English dictionary words.',
    prompt,
    3000
  );

  if (result) {
    try {
      const cleaned = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleaned);
      if (parsed.centerLetter && parsed.outerLetters && parsed.validWords) {
        // Validate words use only the available letters
        const allLetters = [parsed.centerLetter, ...parsed.outerLetters].map((l: string) => l.toUpperCase());
        const validatedWords = parsed.validWords.filter((word: string) => {
          const upper = word.toUpperCase();
          if (upper.length < 4) return false;
          if (!upper.includes(parsed.centerLetter.toUpperCase())) return false;
          for (const char of upper) {
            if (!allLetters.includes(char)) return false;
          }
          return true;
        });
        
        const validatedPangrams = parsed.pangrams?.filter((word: string) => {
          const upper = word.toUpperCase();
          const wordLetters = new Set(upper.split(''));
          return allLetters.every((l: string) => wordLetters.has(l));
        }) || [];

        return {
          centerLetter: parsed.centerLetter.toUpperCase(),
          outerLetters: parsed.outerLetters.map((l: string) => l.toUpperCase()),
          validWords: validatedWords.map((w: string) => w.toUpperCase()),
          pangrams: validatedPangrams.map((w: string) => w.toUpperCase())
        };
      }
    } catch (e) {
      console.error('Failed to parse Spelling Bee JSON:', e);
    }
  }

  // Fallback puzzle with verified words
  return {
    centerLetter: "L",
    outerLetters: ["A","E","N","R","T","I"],
    validWords: [
      "LATER", "TRAIL", "TRIAL", "ALERT", "ALTER", "LINER", "LITER", "LITRE",
      "RENAL", "LEARN", "ALINE", "ALIEN", "LINER", "TILER", "RILE", "TILE",
      "LITE", "RAIL", "TAIL", "TALL", "TELL", "TILL", "RILL", "TRILL",
      "ENTAIL", "RETAIL", "RATLINE", "LATRINE", "RELIANT", "LITERAL"
    ],
    pangrams: ["LATRINE", "RATLINE", "RELIANT"]
  };
}

async function generateWordleWord(): Promise<string> {
  console.log('Generating Wordle word with AI...');

  const prompt = `Pick a single 5-letter English word for today's Wordle puzzle.

RULES:
- Must be exactly 5 letters
- Must be a common, well-known English word
- Should NOT be obscure, archaic, or slang
- Should be a word most English speakers would know
- Pick words that are fair but interesting

Return ONLY the word in uppercase, nothing else. Just the 5-letter word.`;

  const result = await callOpenAI(
    'You are a Wordle word selector. Pick fair, common 5-letter words.',
    prompt,
    50
  );

  if (result) {
    const word = result.trim().toUpperCase().replace(/[^A-Z]/g, '');
    if (word.length === 5) {
      return word;
    }
  }

  // Fallback words
  const fallbacks = ["CRANE", "SLATE", "TRACE", "CRATE", "STARE", "RAISE", "ARISE", "SHARE", "PLACE", "DEALT"];
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

async function generatePuzzles(): Promise<Array<{ type: string; data: any }>> {
  console.log('Generating all puzzles with AI...');

  // Generate all puzzles in parallel
  const [connections, mini, crossword, spellingBee, wordleWord] = await Promise.all([
    generateConnectionsPuzzle(),
    generateMiniCrossword(),
    generateCrossword(),
    generateSpellingBee(),
    generateWordleWord()
  ]);

  return [
    { type: "wordle", data: { word: wordleWord } },
    { type: "connections", data: connections },
    { type: "mini", data: mini },
    { type: "crossword", data: crossword },
    { type: "spelling_bee", data: spellingBee }
  ];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting newspaper generation...');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const now = new Date();
    const estOffset = -5 * 60;
    const estDate = new Date(now.getTime() + (estOffset - now.getTimezoneOffset()) * 60000);
    const publishDate = estDate.toISOString().split('T')[0];

    console.log(`Generating edition for: ${publishDate}`);

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Generate today's EXTREMELY SATIRICAL newspaper edition for ${publishDate}. USE THE FULL CAST OF CHARACTERS: Mayor Dektor, Mr. Whiskers, General Flynn, Gerald the Pigeon, Potholio the Sentient Pothole, Councilman Blatherskite, Chip the Roomba, and Brenda Newsworthy. Make it HILARIOUS. Reference current absurd trends. GO ABSOLUTELY UNHINGED. Every character should appear at least once across the paper!` }
        ],
        max_tokens: 8000,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add funds.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const generatedText = aiData.choices?.[0]?.message?.content;

    if (!generatedText) {
      throw new Error('No content generated from AI');
    }

    console.log('AI response received, parsing JSON...');

    let content;
    try {
      let jsonText = generatedText.trim();
      
      // Remove markdown code blocks
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.slice(7);
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.slice(3);
      }
      if (jsonText.endsWith('```')) {
        jsonText = jsonText.slice(0, -3);
      }
      jsonText = jsonText.trim();
      
      // Try to fix common issues: unescaped newlines inside strings
      let inString = false;
      let escaped = false;
      let result = '';
      
      for (let i = 0; i < jsonText.length; i++) {
        const char = jsonText[i];
        
        if (escaped) {
          result += char;
          escaped = false;
          continue;
        }
        
        if (char === '\\') {
          escaped = true;
          result += char;
          continue;
        }
        
        if (char === '"') {
          inString = !inString;
          result += char;
          continue;
        }
        
        if (inString && (char === '\n' || char === '\r')) {
          result += char === '\n' ? '\\n' : '\\r';
          continue;
        }
        
        if (inString && char === '\t') {
          result += '\\t';
          continue;
        }
        
        result += char;
      }
      
      // If JSON appears truncated (doesn't end with }), try to repair it
      if (!result.trim().endsWith('}')) {
        console.log('JSON appears truncated, attempting repair...');
        let bracketCount = 0;
        let braceCount = 0;
        for (const c of result) {
          if (c === '{') braceCount++;
          if (c === '}') braceCount--;
          if (c === '[') bracketCount++;
          if (c === ']') bracketCount--;
        }
        if (inString) result += '"';
        while (bracketCount > 0) { result += ']'; bracketCount--; }
        while (braceCount > 0) { result += '}'; braceCount--; }
      }
      
      content = JSON.parse(result);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('First 500 chars of response:', generatedText.substring(0, 500));
      console.error('Last 500 chars of response:', generatedText.substring(generatedText.length - 500));
      throw new Error('Failed to parse AI-generated content as JSON');
    }

    console.log('Content parsed, generating comic images...');

    if (content.comics && Array.isArray(content.comics)) {
      const comicsWithImages = await Promise.all(
        content.comics.map(async (comic: any) => {
          const imagePrompt = comic.imagePrompt || `${comic.title}: ${comic.caption}`;
          const imageUrl = await generateComicImage(imagePrompt);
          return {
            ...comic,
            imageUrl: imageUrl
          };
        })
      );
      content.comics = comicsWithImages;
      console.log('Comic images generated');
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Archive old comics before creating new edition
    const { data: oldEdition } = await supabase
      .from('newspaper_editions')
      .select('id, content, publish_date')
      .eq('is_active', true)
      .maybeSingle();

    if (oldEdition?.content?.comics) {
      const comicsToArchive = oldEdition.content.comics.map((comic: any) => ({
        edition_id: oldEdition.id,
        title: comic.title,
        caption: comic.caption,
        image_url: comic.imageUrl,
        publish_date: oldEdition.publish_date,
      }));
      await supabase.from('comic_archive').insert(comicsToArchive);
      console.log('Archived comics from previous edition');
    }

    await supabase
      .from('newspaper_editions')
      .update({ is_active: false })
      .eq('is_active', true);

    const { data, error } = await supabase
      .from('newspaper_editions')
      .upsert({
        publish_date: publishDate,
        content: content,
        is_active: true,
        generated_at: new Date().toISOString(),
      }, {
        onConflict: 'publish_date'
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      throw new Error(`Database error: ${error.message}`);
    }

    console.log('Edition saved successfully:', data.id);

    // Generate AI-powered game puzzles
    console.log('Generating AI-powered puzzles...');
    const puzzles = await generatePuzzles();
    
    for (const puzzle of puzzles) {
      await supabase.from('game_puzzles').insert({
        edition_id: data.id,
        game_type: puzzle.type,
        puzzle_data: puzzle.data,
      });
    }
    console.log('Game puzzles generated and saved');

    return new Response(JSON.stringify({ 
      success: true, 
      edition_id: data.id,
      publish_date: publishDate 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating newspaper:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
