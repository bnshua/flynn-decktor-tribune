import { supabase } from "@/integrations/supabase/client";

export interface NewspaperContent {
  breakingNews: Array<{ time: string; content: string }>;
  headlines: Array<{ headline: string; subheadline: string; content: string }>;
  localAffairs: Array<{ headline: string; content: string; byline?: string }>;
  worldNews: Array<{ headline: string; content: string; byline?: string }>;
  opinion: Array<{ headline: string; content: string; byline?: string }>;
  artsCulture: Array<{ headline: string; content: string; byline?: string }>;
  sports: Array<{ headline: string; content: string; byline?: string }>;
  weather: { temperature: string; conditions: string; forecast: string };
  classifieds: Array<{ title: string; text: string }>;
  comics: Array<{ title: string; caption: string; imageUrl?: string; imagePrompt?: string }>;
  vintageAds: Array<{ headline: string; tagline: string; description: string; price: string }>;
  obituaries: Array<{ name: string; dates: string; description: string; survivors?: string }>;
}

export interface NewspaperEdition {
  id: string;
  publishDate: string;
  content: NewspaperContent;
  generatedAt: string;
}

export async function getLatestEdition(): Promise<NewspaperEdition | null> {
  try {
    const { data, error } = await supabase.functions.invoke('get-newspaper');
    
    if (error) {
      console.error('Error fetching edition:', error);
      return null;
    }
    
    if (!data.hasEdition) {
      return null;
    }
    
    return data.edition;
  } catch (error) {
    console.error('Error fetching edition:', error);
    return null;
  }
}

export async function generateNewEdition(): Promise<boolean> {
  try {
    const { data, error } = await supabase.functions.invoke('generate-newspaper');
    
    if (error) {
      console.error('Error generating edition:', error);
      return false;
    }
    
    return data.success;
  } catch (error) {
    console.error('Error generating edition:', error);
    return false;
  }
}
