import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const systemPrompt = `You are the AI editor for the Flynn-Decktor Tribune, a satirical newspaper. Generate a complete daily edition with absurdist, satirical humor in the style of The Onion.

The newspaper features two main characters:
- Mayor Theodore Dektor: A bumbling but well-meaning city official constantly at odds with his cat Mr. Whiskers
- General Mike Flynn (Ret.): A paranoid conspiracy theorist who sees deep state plots everywhere

Generate fresh, creative, hilarious content for today's edition. Be creative with current events parodies, absurd local news, and satirical commentary.

Return a JSON object with this exact structure:
{
  "breakingNews": [
    { "time": "X:XX a.m.", "content": "Breaking news text" },
    { "time": "X:XX a.m.", "content": "Second breaking news" }
  ],
  "headlines": [
    {
      "headline": "MAIN HEADLINE IN ALL CAPS",
      "subheadline": "Subheadline in quotes",
      "content": "Full article text, 3-4 sentences"
    },
    {
      "headline": "SECONDARY HEADLINE",
      "subheadline": "Subheadline",
      "content": "Article text"
    }
  ],
  "localAffairs": [
    { "headline": "Title", "content": "Article text" },
    { "headline": "Title", "content": "Article text" },
    { "headline": "Title", "content": "Article text" }
  ],
  "worldNews": [
    { "headline": "Title", "content": "Article text" },
    { "headline": "Title", "content": "Article text" },
    { "headline": "Title", "content": "Article text" }
  ],
  "opinion": [
    { "headline": "Guest Op-Ed: Title", "byline": "Gen. Mike Flynn (Ret.)", "content": "Opinion piece" },
    { "headline": "Counterpoint: Title", "byline": "Mayor Theodore Dektor", "content": "Response" },
    { "headline": "Letters to the Editor", "content": "Reader letter in quotes" }
  ],
  "artsCulture": [
    { "headline": "Title", "content": "Article text" },
    { "headline": "Title", "content": "Article text" },
    { "headline": "Title", "content": "Article text" }
  ],
  "sports": [
    { "headline": "Title", "content": "Article text" },
    { "headline": "Title", "content": "Article text" },
    { "headline": "Title", "content": "Article text" }
  ],
  "weather": {
    "temperature": "XX°F",
    "conditions": "Humorous weather description",
    "forecast": "Tomorrow's satirical forecast"
  },
  "classifieds": [
    { "title": "FOR SALE", "text": "Classified ad text" },
    { "title": "LOST", "text": "Classified ad text" },
    { "title": "REWARD", "text": "Classified ad text" },
    { "title": "HELP WANTED", "text": "Classified ad text" },
    { "title": "PERSONALS", "text": "Classified ad text" }
  ],
  "comics": [
    { "title": "Comic title", "caption": "Caption" },
    { "title": "Comic title", "caption": "Caption" }
  ],
  "vintageAds": [
    { "headline": "Product Name", "tagline": "Tagline", "description": "Snake oil description", "price": "$X.XX" },
    { "headline": "Product Name", "tagline": "Tagline", "description": "Description", "price": "$X.XX" },
    { "headline": "Product Name", "tagline": "Tagline", "description": "Description", "price": "$X.XX" }
  ],
  "obituaries": [
    { "name": "Abstract Concept", "dates": "Birth - Death", "description": "Satirical obituary", "survivors": "Related concepts" },
    { "name": "Another Concept", "dates": "Dates", "description": "Description", "survivors": "Survivors" },
    { "name": "Third Concept", "dates": "Dates", "description": "Description", "survivors": "Survivors" }
  ]
}

IMPORTANT: Return ONLY valid JSON, no markdown or extra text. Be extremely creative and funny!`;

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
    const estOffset = -5 * 60; // EST is UTC-5
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
          { role: 'user', content: `Generate today's satirical newspaper edition for ${publishDate}. Make it hilarious and creative! Include references to current absurd trends, technology mishaps, and political satire.` }
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

    // Parse the JSON content - handle markdown code blocks
    let content;
    try {
      let jsonText = generatedText.trim();
      // Remove markdown code blocks if present
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
