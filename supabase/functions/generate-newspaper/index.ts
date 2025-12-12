import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

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
- NEVER be boring. Use the FULL CAST of characters across different sections!
- EVERY comic should say "COMING SOON" and have no AI-generated image.
`;

// Connection examples for few-shot prompting
const CONNECTIONS_EXAMPLES = `SET 1: YELLOW — Things That Creep Slowly (SNAIL, SLUG, LEECH, LARVA) | GREEN — Words Meaning "To Twist" (WRING, WARP, TWINE, SPIRAL) | BLUE — Metallic-Sounding Words (BRONZE, TINNY, STEELY, COPPER) | PURPLE — ___ CLOUD (MUSHROOM, NIMBUS, THUNDER, CIRRUS)
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
const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

async function getPromptFromDB(promptId: string) {
  const { data, error } = await supabase.from("prompts").select("*").eq("id", promptId).single();

  if (error) {
    console.error("Supabase fetch error:", error);
    throw new Error("Failed to fetch prompt");
  }

  return data?.content;
}

async function callOpenAI(prompt: string) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      temperature: 0.9,
      max_tokens: 1500,
    }),
  });

  const data = await response.json();
  return data.choices[0].message.content;
}

async function generateConnections(promptId: string) {
  const userPrompt = await getPromptFromDB(promptId);
  if (!userPrompt) throw new Error("Prompt not found");

  const fullPrompt = `
You are given a user input: "${userPrompt}"

Use these examples as inspiration for connections between words:
${CONNECTIONS_EXAMPLES}

Generate 20 unique sets of YELLOW, GREEN, BLUE, PURPLE connections in the same format. Make sure each set is funny, absurd, and creative.
`;

  const aiOutput = await callOpenAI(fullPrompt);
  return aiOutput;
}

async function handleRequest(req: Request) {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const promptId = url.searchParams.get("promptId");
    if (!promptId) {
      return new Response("Missing promptId", { status: 400, headers: corsHeaders });
    }

    const result = await generateConnections(promptId);
    return new Response(JSON.stringify({ result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}

serve(handleRequest, { port: 8787 });
// Helper function to shuffle an array (used for randomizing connections)
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Function to parse AI output into structured connection sets
function parseConnections(output: string) {
  const sets: Record<string, string[]>[] = [];
  const lines = output.split("\n").filter((line) => line.trim() !== "");

  let currentSet: Record<string, string[]> = {};
  for (const line of lines) {
    const match = line.match(/(YELLOW|GREEN|BLUE|PURPLE):\s*(.*)/i);
    if (match) {
      const color = match[1].toUpperCase();
      const items = match[2].split(",").map((s) => s.trim());
      currentSet[color] = items;
    }

    // if we collected all four colors, push and reset
    if (Object.keys(currentSet).length === 4) {
      sets.push(currentSet);
      currentSet = {};
    }
  }

  return sets;
}

// Example usage in your request handler
async function generateStructuredConnections(promptId: string) {
  const rawOutput = await generateConnections(promptId);
  const structured = parseConnections(rawOutput);
  return structured;
}

// Optional: expose a debug endpoint for testing AI output
async function handleDebug(req: Request) {
  const url = new URL(req.url);
  const promptId = url.searchParams.get("promptId");
  if (!promptId) return new Response("Missing promptId", { status: 400, headers: corsHeaders });

  const rawOutput = await generateConnections(promptId);
  return new Response(rawOutput, { headers: { ...corsHeaders, "Content-Type": "text/plain" } });
}

// You can swap serve(handleRequest) with a router if needed
serve(
  async (req: Request) => {
    const url = new URL(req.url);
    if (url.pathname === "/debug") return handleDebug(req);
    return handleRequest(req);
  },
  { port: 8787 },
);
