import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

// Prompt IDs from OpenAI
const PROMPT_IDS = {
  newspaper: { id: "pmpt_693d801184f881949331e4368a97af3806c501321688733a", version: "2" },
  connections: { id: "pmpt_693d8086e790819790809c7545cb71c40fb6aa30ab342204", version: "2" },
  mini: { id: "pmpt_693d82139b38819692fc20bb62c9726f0cb9a0f39559a71c", version: "3" },
  crossword: { id: "pmpt_693d834df35081979aeafe00d07bc92d0774a968558c829a", version: "2" },
  spellingBee: { id: "pmpt_693d83cc46dc8190b277db44151802e90592b50c1e5feb76", version: "1" },
  wordle: { id: "pmpt_693d8414a9708195b840709ff56e9de10844ec996b371103", version: "1" },
};

// Call OpenAI Responses API with a prompt ID
async function callResponsesAPI(promptId: { id: string; version: string }, input: string, maxOutputTokens = 4000): Promise<string | null> {
  try {
    console.log(`Calling Responses API with prompt: ${promptId.id}`);
    
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        prompt: {
          id: promptId.id,
          version: promptId.version,
        },
        input: input,
        max_output_tokens: maxOutputTokens,
        temperature: 0.9,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI Responses API error:', response.status, errorText);
      return null;
    }

    const data = await response.json();
    
    // Extract text from the Responses API output format
    // output[0].content[0].text
    const outputText = data.output?.[0]?.content?.[0]?.text;
    
    if (outputText) {
      console.log('Responses API call successful');
      return outputText;
    }
    
    console.error('No output text in response:', JSON.stringify(data).substring(0, 500));
    return null;
  } catch (error) {
    console.error('Responses API call failed:', error);
    return null;
  }
}

// Parse JSON from AI response, handling markdown code blocks and conversational text
function parseAIJson(text: string): any {
  let jsonText = text.trim();
  
  // Remove markdown code blocks
  if (jsonText.includes('```json')) {
    const start = jsonText.indexOf('```json') + 7;
    const end = jsonText.indexOf('```', start);
    jsonText = end > start ? jsonText.slice(start, end) : jsonText.slice(start);
  } else if (jsonText.includes('```')) {
    const start = jsonText.indexOf('```') + 3;
    const end = jsonText.indexOf('```', start);
    jsonText = end > start ? jsonText.slice(start, end) : jsonText.slice(start);
  }
  jsonText = jsonText.trim();
  
  // Find the first { or [ to extract JSON from conversational text
  const firstBrace = jsonText.indexOf('{');
  const firstBracket = jsonText.indexOf('[');
  
  if (firstBrace === -1 && firstBracket === -1) {
    throw new Error('No JSON object or array found in response');
  }
  
  // Start from whichever comes first (if both exist)
  let startIndex: number;
  let isObject: boolean;
  
  if (firstBrace === -1) {
    startIndex = firstBracket;
    isObject = false;
  } else if (firstBracket === -1) {
    startIndex = firstBrace;
    isObject = true;
  } else {
    startIndex = Math.min(firstBrace, firstBracket);
    isObject = firstBrace < firstBracket;
  }
  
  // Find the matching closing brace/bracket
  let depth = 0;
  let inStr = false;
  let esc = false;
  let endIndex = startIndex;
  
  for (let i = startIndex; i < jsonText.length; i++) {
    const char = jsonText[i];
    
    if (esc) {
      esc = false;
      continue;
    }
    
    if (char === '\\') {
      esc = true;
      continue;
    }
    
    if (char === '"') {
      inStr = !inStr;
      continue;
    }
    
    if (!inStr) {
      if (char === '{' || char === '[') depth++;
      if (char === '}' || char === ']') {
        depth--;
        if (depth === 0) {
          endIndex = i + 1;
          break;
        }
      }
    }
  }
  
  jsonText = jsonText.slice(startIndex, endIndex);
  
  // Fix unescaped newlines inside strings
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
  
  // Repair truncated JSON
  if (!result.trim().endsWith('}')) {
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
  
  return JSON.parse(result);
}

async function generateConnectionsPuzzle(): Promise<any> {
  console.log('Generating Connections puzzle with prompt ID...');
  
  const result = await callResponsesAPI(PROMPT_IDS.connections, "Generate a new Connections puzzle", 2000);

  if (result) {
    try {
      return parseAIJson(result);
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
  console.log('Generating Mini Crossword with prompt ID...');

  const result = await callResponsesAPI(PROMPT_IDS.mini, "Generate a new Mini Crossword puzzle", 2000);

  if (result) {
    try {
      const parsed = parseAIJson(result);
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
  console.log('Generating Full Crossword with prompt ID...');

  const result = await callResponsesAPI(PROMPT_IDS.crossword, "Generate a new 15x15 Crossword puzzle", 8000);

  if (result) {
    try {
      const parsed = parseAIJson(result);
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
      if ((r === 4 || r === 10) && (c === 4 || c === 10)) return '.';
      if ((r === 7) && (c === 0 || c === 14)) return '.';
      if ((r === 0 || r === 14) && (c === 7)) return '.';
      return 'A';
    });
  });

  return {
    grid: fallbackGrid,
    clues: {
      across: [{ number: 1, clue: "First word", answer: "AAAA", row: 0, col: 0 }],
      down: [{ number: 1, clue: "First down", answer: "AAAA", row: 0, col: 0 }]
    }
  };
}

async function generateSpellingBee(): Promise<any> {
  console.log('Generating Spelling Bee with prompt ID...');

  const result = await callResponsesAPI(PROMPT_IDS.spellingBee, "Generate a new Spelling Bee puzzle", 3000);

  if (result) {
    try {
      const parsed = parseAIJson(result);
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
  console.log('Generating Wordle word with prompt ID...');

  const result = await callResponsesAPI(PROMPT_IDS.wordle, "Generate a new Wordle word", 50);

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
  console.log('Generating all puzzles with prompt IDs...');

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

    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const now = new Date();
    const estOffset = -5 * 60;
    const estDate = new Date(now.getTime() + (estOffset - now.getTimezoneOffset()) * 60000);
    const publishDate = estDate.toISOString().split('T')[0];

    console.log(`Generating edition for: ${publishDate}`);

    // Generate newspaper content using Responses API with prompt ID
    const generatedText = await callResponsesAPI(
      PROMPT_IDS.newspaper,
      `Generate today's newspaper edition for ${publishDate}`,
      8000
    );

    if (!generatedText) {
      throw new Error('No content generated from AI');
    }

    console.log('AI response received, parsing JSON...');

    let content;
    try {
      content = parseAIJson(generatedText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('First 500 chars of response:', generatedText.substring(0, 500));
      console.error('Last 500 chars of response:', generatedText.substring(generatedText.length - 500));
      throw new Error('Failed to parse AI-generated content as JSON');
    }

    // Set comics to Coming Soon placeholder (no image generation)
    console.log('Setting comics section to Coming Soon placeholder...');
    content.comics = [
      {
        title: "COMING SOON",
        caption: "Editorial cartoons are coming soon to the Flynn-Decktor Tribune.",
        imageUrl: null,
      },
    ];

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

    // Generate AI-powered game puzzles using prompt IDs
    console.log('Generating AI-powered puzzles with prompt IDs...');
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
