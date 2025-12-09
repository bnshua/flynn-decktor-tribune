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

MAIN CHARACTERS (use them CONSTANTLY):
- Mayor Theodore Dektor: An incompetent bureaucrat who has 47 ongoing feuds with his cat Mr. Whiskers. The cat is clearly smarter than him. He once declared war on a pothole. He communicates with citizens through interpretive dance.
- General Mike Flynn (Ret.): A paranoid conspiracy theorist who believes EVERYTHING is a deep state plot - his microwave, the weather, vowels, etc. He leads impromptu patriotic flash mobs. He once tried to arrest a cloud for "suspicious loitering."
- Mr. Whiskers: The mayor's cat, who is running a shadow government from City Hall. Has his own PAC. Refuses to endorse anything.

TONE GUIDELINES:
- Be ABSURD. A city council meeting about potholes should devolve into an exorcism.
- Be SATIRICAL. Mock current trends, technology, politics, and society MERCILESSLY.
- Be SPECIFIC. Fake numbers, fake quotes, fake experts with ridiculous names.
- Be ESCALATING. Start normal, end in chaos.
- NEVER be boring. Every headline should make someone snort-laugh.

EXAMPLES OF GOOD HEADLINES:
- "LOCAL MAN'S ROOMBA ACHIEVES SENTIENCE, IMMEDIATELY UNIONIZES, DEMANDS DENTAL"
- "MAYOR DECLARES MARTIAL LAW AFTER PIGEON MAKES EYE CONTACT"
- "GENERAL FLYNN ARRESTS HIMSELF FOR SUSPECTED TIES TO GENERAL FLYNN"
- "AREA TODDLER SOMEHOW LESS EXHAUSTING THAN COWORKER NAMED CHAD"

Return a JSON object with this exact structure:
{
  "breakingNews": [
    { "time": "X:XX a.m.", "content": "UNHINGED breaking news" },
    { "time": "X:XX a.m.", "content": "ABSURD breaking news" }
  ],
  "headlines": [
    {
      "headline": "ABSOLUTELY UNHINGED MAIN HEADLINE IN ALL CAPS",
      "subheadline": "Equally ridiculous subheadline with fake quotes",
      "content": "Full satirical article, 4-5 sentences of pure absurdity"
    },
    {
      "headline": "SECONDARY HEADLINE JUST AS INSANE",
      "subheadline": "More chaos",
      "content": "Article text dripping with satire"
    }
  ],
  "localAffairs": [
    { "headline": "Satirical local headline", "content": "Absurd article" },
    { "headline": "Another one", "content": "More chaos" },
    { "headline": "Third one", "content": "Even more unhinged" }
  ],
  "worldNews": [
    { "headline": "Satirical world headline", "content": "International absurdity" },
    { "headline": "Another", "content": "Global chaos" },
    { "headline": "Third", "content": "Worldwide nonsense" }
  ],
  "opinion": [
    { "headline": "Guest Op-Ed: PARANOID RANT TITLE", "byline": "Gen. Mike Flynn (Ret.)", "content": "Unhinged conspiracy theory op-ed about household appliances being spies" },
    { "headline": "Counterpoint: DEFENSIVE RESPONSE", "byline": "Mayor Theodore Dektor", "content": "Incompetent rebuttal that somehow makes things worse" },
    { "headline": "Letters to the Editor", "content": "Absurd reader letter in quotes" }
  ],
  "artsCulture": [
    { "headline": "Art review headline", "content": "Pretentious satire" },
    { "headline": "Another", "content": "Cultural chaos" },
    { "headline": "Third", "content": "Artistic absurdity" }
  ],
  "sports": [
    { "headline": "Sports headline", "content": "Athletic absurdity" },
    { "headline": "Another", "content": "Competitive chaos" },
    { "headline": "Third", "content": "Sporting nonsense" }
  ],
  "weather": {
    "temperature": "XX°F (or whatever temperature despair is)",
    "conditions": "HILARIOUS existential weather description",
    "forecast": "Tomorrow: Even more absurd forecast with emotional weather patterns"
  },
  "classifieds": [
    { "title": "FOR SALE", "text": "Absurd item for sale" },
    { "title": "LOST", "text": "Ridiculous lost item" },
    { "title": "REWARD", "text": "Insane reward offer" },
    { "title": "HELP WANTED", "text": "Nightmare job listing" },
    { "title": "PERSONALS", "text": "Unhinged personal ad" }
  ],
  "comics": [
    { "title": "HILARIOUS COMIC TITLE", "caption": "Setup for visual comedy", "imagePrompt": "Detailed prompt for generating a satirical editorial cartoon showing [specific visual scene with characters and action]" },
    { "title": "ANOTHER COMIC", "caption": "More visual comedy", "imagePrompt": "Detailed prompt for generating a satirical editorial cartoon showing [another scene]" }
  ],
  "vintageAds": [
    { "headline": "FAKE PRODUCT", "tagline": "Ridiculous tagline", "description": "Snake oil satire", "price": "$X.XX" },
    { "headline": "ANOTHER FAKE PRODUCT", "tagline": "More nonsense", "description": "Absurd claims", "price": "$X.XX" },
    { "headline": "THIRD PRODUCT", "tagline": "Even more", "description": "Peak satire", "price": "$X.XX" }
  ],
  "obituaries": [
    { "name": "ABSTRACT CONCEPT THAT DIED", "dates": "Birth – Absurd Death", "description": "Satirical obituary for a dead concept", "survivors": "Related dying concepts" },
    { "name": "ANOTHER DEAD CONCEPT", "dates": "Dates", "description": "More concept death", "survivors": "Survivors" },
    { "name": "THIRD CONCEPT", "dates": "Dates", "description": "Even more death of ideas", "survivors": "Survivors" }
  ]
}

IMPORTANT: 
- Return ONLY valid JSON, no markdown or extra text
- Be EXTREMELY funny and satirical
- The comics imagePrompt should be detailed enough to generate a funny editorial cartoon in a classic newspaper style
- Reference current absurd trends in technology, AI, social media, politics, etc.
- Make every single item genuinely hilarious - no filler content!`;

async function generateComicImage(prompt: string): Promise<string | null> {
  try {
    console.log('Generating comic image with prompt:', prompt.substring(0, 100) + '...');
    
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
            content: `Create a black and white editorial cartoon in a classic 1920s newspaper style. Simple, bold linework. Satirical and funny. The scene: ${prompt}` 
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

    // Get today's date in EST
    const now = new Date();
    const estOffset = -5 * 60;
    const estDate = new Date(now.getTime() + (estOffset - now.getTimezoneOffset()) * 60000);
    const publishDate = estDate.toISOString().split('T')[0];

    console.log(`Generating edition for: ${publishDate}`);

    // Generate content using Lovable AI
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
          { role: 'user', content: `Generate today's EXTREMELY SATIRICAL newspaper edition for ${publishDate}. Make it HILARIOUS. Reference current absurd trends in AI, social media, tech bros, hustle culture, political chaos, and modern life. Every single item should be genuinely funny. The Flynn-Dektor feud and Mr. Whiskers shadow government are ongoing storylines. GO ABSOLUTELY UNHINGED.` }
        ],
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

    // Parse the JSON content
    let content;
    try {
      let jsonText = generatedText.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.slice(7);
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.slice(3);
      }
      if (jsonText.endsWith('```')) {
        jsonText = jsonText.slice(0, -3);
      }
      content = JSON.parse(jsonText.trim());
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Raw content:', generatedText);
      throw new Error('Failed to parse AI-generated content as JSON');
    }

    console.log('Content parsed, generating comic images...');

    // Generate images for each comic
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

    // Store in database
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Deactivate previous active editions
    await supabase
      .from('newspaper_editions')
      .update({ is_active: false })
      .eq('is_active', true);

    // Insert or update today's edition
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
