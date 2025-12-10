import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting newspaper generation...');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
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
        // Find last complete object/array and close remaining brackets
        let bracketCount = 0;
        let braceCount = 0;
        for (const c of result) {
          if (c === '{') braceCount++;
          if (c === '}') braceCount--;
          if (c === '[') bracketCount++;
          if (c === ']') bracketCount--;
        }
        // Close any unclosed strings first
        if (inString) result += '"';
        // Close brackets/braces
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
