import { useState, useEffect } from "react";
import { format } from "date-fns";
import Masthead from "@/components/newspaper/Masthead";
import Section from "@/components/newspaper/Section";
import HeadlineSlot from "@/components/newspaper/HeadlineSlot";
import ArticleSlot from "@/components/newspaper/ArticleSlot";
import BreakingNews from "@/components/newspaper/BreakingNews";
import WeatherBox from "@/components/newspaper/WeatherBox";
import ClassifiedsBox from "@/components/newspaper/ClassifiedsBox";
import ComicsSection from "@/components/newspaper/ComicsSection";
import VintageAds from "@/components/newspaper/VintageAds";
import ObituariesSection from "@/components/newspaper/ObituariesSection";
import Footer from "@/components/newspaper/Footer";
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { getLatestEdition, generateNewEdition, NewspaperContent } from "@/lib/newspaper";

// Default content when no edition exists
const defaultContent: NewspaperContent = {
  breakingNews: [
    { 
      time: "2:14 a.m.", 
      content: 'Mysterious plume of glitter seen rising from abandoned disco on 8th Street. Authorities blame "rogue wedding planner."'
    },
    { 
      time: "6:47 a.m.", 
      content: "Local man claims his Roomba achieved sentience, unionized with the other appliances, and is demanding dental." 
    },
  ],
  headlines: [
    {
      headline: "CITY HALL IN CHAOS AS MAYOR DEKTOR ACCIDENTALLY LIVE-STREAMS 47-MINUTE ARGUMENT WITH HIS CAT",
      subheadline: '"Mr. Whiskers refuses to endorse budget proposal," claims visibly exhausted mayor',
      content: 'In what officials are calling "the most watched municipal broadcast since the sewer main exploded on Channel 4," Mayor Theodore Dektor inadvertently left his webcam running during what was supposed to be a private budget review session. Viewers across the city watched in mounting disbelief as the mayor spent nearly an hour attempting to negotiate fiscal policy with his 14-pound tabby, Mr. Whiskers. "He just kept knocking the spreadsheets off the desk," a clearly shaken Dektor told reporters. "I think he is in the pocket of Big Catnip." City Hall has declined to comment on whether Mr. Whiskers will face an ethics inquiry.'
    },
    {
      headline: "GENERAL FLYNN SPOTTED LEADING FLASH-MOB PATRIOTIC LINE-DANCE OUTSIDE WHOLE FOODS",
      subheadline: "Witnesses report participants formed perfect flying wedge; organic kale sales up 400%",
      content: 'Shoppers at the downtown Whole Foods were treated to an unexpected display of synchronized patriotism yesterday when retired General Mike Flynn emerged from behind the bulk quinoa bins to lead approximately 200 participants in what eyewitnesses described as "the most aggressive square dance I have ever seen." The flash mob concluded with a 21-shopping-cart salute and the mass purchase of every American flag-themed reusable bag in stock. Store management has requested he give 24 hours notice next time.'
    }
  ],
  localAffairs: [
    { headline: "City Council Votes to Make 'Reply-All' E-Mail Chains a Felony", content: "The measure passed 5-4 after a 412-message thread about parking signs crashed municipal servers. Councilwoman Jenkins cast the deciding vote while still receiving notifications from the original thread." },
    { headline: "Beloved Hot-Dog Cart Shut Down by Health Department", content: 'The popular vendor "Frank & Sense," known for philosophical condiment recommendations, was closed for "excessive existentialism." Owner maintains the sauerkraut was merely asking uncomfortable questions.' },
    { headline: "Annual Christmas Tree Files Restraining Order Against Pigeons", content: 'The 40-foot Norway spruce arrived in Civic Plaza Tuesday and immediately retained legal counsel. "My client has been through this before," said attorney Gerald Finch. "She knows what is coming."' }
  ],
  worldNews: [
    { headline: "EU Bans Memes Containing More Than Three Layers of Irony", content: "Black market for 2016-era rage comics has skyrocketed following the controversial ruling. Interpol reports a 600% increase in smuggled Pepe derivatives across the Swiss border." },
    { headline: "Antarctic Penguins Begin Synchronized Swimming to ABBA", content: 'Researchers at McMurdo Station report the colony has been rehearsing routines to "Waterloo" for three weeks. "The choreography is honestly better than most cruise ships," noted Dr. Sarah Chen.' },
    { headline: "Middle East Peace Talks Stalled Over Hummus Pronunciation", content: "Delegates argued for six straight hours before agreeing to table the discussion. The correct pronunciation remains classified pending further diplomatic review." }
  ],
  opinion: [
    { headline: "Guest Op-Ed: Wake Up, Sheeple!", byline: "Gen. Mike Flynn (Ret.)", content: "The real deep state is your toaster. It knows when you burn the toast on purpose. It reports to the microwave. The microwave reports to forces I cannot name in print. Stay vigilant." },
    { headline: "Counterpoint: The General Is Distracted Again", byline: "Mayor Theodore Dektor", content: "The General is distracted by shiny objects again. Also, his cat is clearly a Chinese asset. I have documentation. Mr. Whiskers, however, remains under investigation by my own office." },
    { headline: "Letters to the Editor", content: '"Dear Tribune, Why does my coffee taste like regret and Wi-Fi passwords?" — Concerned on Maple St.' }
  ],
  artsCulture: [
    { headline: "Avant-Garde Play Sells Out in 11 Minutes", content: '"Waiting for Godot 2: Godot Shows Up But He Is in a Bad Mood" has captivated audiences with its 4-hour runtime consisting entirely of one man sighing. Critics call it "devastatingly accurate."' },
    { headline: "Local Painter Unveils 40-Foot Mural Entitled '2025 So Far'", content: 'The work consists entirely of one giant screaming emoji. The artist declined to comment but was seen weeping softly into a coffee cup labeled "HELP."' },
    { headline: "Indie Band Forced to Cancel Tour", content: '"Supply Chain Issues" has postponed all dates after their drummer became literally stuck in the Panama Canal. Management says he is "comfortable but annoyed."' }
  ],
  sports: [
    { headline: "Rivertown Rollers Claim Roller Derby Championship", content: 'The Rollers defeated the Iron City Anvils 34–12 in a match officials are calling "unnecessarily sparkly." MVP was awarded to the woman who weaponized a glitter bomb in the fourth quarter.' },
    { headline: "High-School Chess Team Disqualified", content: 'Captain Jeremy Thornton declared during the state semifinals that "en passant is a psy-op designed to confuse patriots." The team has been banned pending psychological evaluation.' },
    { headline: "Local Man Still Insisting He Could Beat LeBron", content: 'Area resident Dale Hutchins, 54, maintains he could "totally" defeat LeBron James one-on-one, provided the court were "slightly downhill" and James had "maybe a mild cold."' }
  ],
  weather: {
    temperature: "48°F",
    conditions: "Mostly cloudy with a 70% chance of existential dread",
    forecast: "Tomorrow: Sudden bursts of unearned optimism, followed by light sarcasm in the evening. Low: Whatever is left of your will to live."
  },
  classifieds: [
    { title: "FOR SALE", text: "One slightly used moral compass. Spins freely. $5 OBO." },
    { title: "LOST", text: "My last remaining cope. Last seen heading south for the winter." },
    { title: "REWARD", text: "$500 for information leading to the recovery of 2020–2024. No questions asked." },
    { title: "HELP WANTED", text: "Night security guard for abandoned Chuck E. Cheese. Must be comfortable with animatronics that whisper Latin." },
    { title: "PERSONALS", text: "SWM seeking anyone who still remembers Blockbuster late fees. Let us reminisce and cry." }
  ],
  comics: [
    { title: "The Deep State Toaster", caption: "Gen. Flynn discovers the truth about kitchen appliances" },
    { title: "Mr. Whiskers for Mayor", caption: "The cat finally announces his 2026 campaign" }
  ],
  vintageAds: [
    { headline: "Dr. Pemberton's Miracle Elixir", tagline: "For What Ails Ye!", description: "Cures anxiety, existential dread, and the inexplicable urge to check your phone every 30 seconds. Made from genuine snake oil and concentrated optimism.", price: "Only $1.99 per bottle!" },
    { headline: "Professor Whiskers' Brain Tonic", tagline: "Endorsed by One Mayoral Cat", description: "Guaranteed to increase your political acumen by at least 47%. Side effects may include sudden urges to knock things off desks and stare judgmentally.", price: "Three bottles for $5.00" },
    { headline: "Flynn's Patriotic Foot Powder", tagline: "For the Freedom-Loving Feet", description: "Keep your feet dry during flash-mob line dances! Contains real American grit and a hint of organic kale extract. Not affiliated with any intelligence agencies.", price: "$2.50 per tin" }
  ],
  obituaries: [
    { name: "Common Sense", dates: "c. 3000 B.C. – 2020 A.D.", description: "After a long and valiant struggle against social media algorithms, cable news, and reply-all email chains, Common Sense passed peacefully in its sleep. It is remembered for its brief but meaningful contributions to public discourse, parallel parking, and not microwaving metal.", survivors: "Critical Thinking (estranged), Basic Decency (in hospice)" },
    { name: "Civil Discourse", dates: "1776 – 2016", description: "Beloved by moderates and reasonable people everywhere, Civil Discourse succumbed to complications from Twitter and 24-hour news cycles. In lieu of flowers, please send strongly-worded but respectful letters to your local representative.", survivors: "Polite Disagreement (missing), The Benefit of the Doubt (presumed deceased)" },
    { name: "The Attention Span", dates: "Unknown – 2007 (iPhone launch)", description: "The Attention Span lived a full life before being tragically cut short by the invention of infinite scroll. Services will be held but attendees are expected to leave after approximately 8 seconds.", survivors: "Goldfish Memory, TikTok" }
  ]
};

const Index = () => {
  const [content, setContent] = useState<NewspaperContent>(defaultContent);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<string | null>(null);

  useEffect(() => {
    loadEdition();
  }, []);

  const loadEdition = async () => {
    setIsLoading(true);
    const edition = await getLatestEdition();
    if (edition) {
      setContent(edition.content);
      setLastGenerated(edition.generatedAt);
    }
    setIsLoading(false);
  };

  const handleGenerateNew = async () => {
    setIsGenerating(true);
    toast({
      title: "Generating new edition...",
      description: "Our AI reporters are hard at work. This may take a moment.",
    });

    const success = await generateNewEdition();
    
    if (success) {
      await loadEdition();
      toast({
        title: "Fresh off the press!",
        description: "A new edition has been generated.",
      });
    } else {
      toast({
        title: "Generation failed",
        description: "Could not generate a new edition. Please try again.",
        variant: "destructive",
      });
    }
    
    setIsGenerating(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-paper paper-texture flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-ink-light" />
          <p className="font-headline text-xl mt-4 text-ink-light">Loading today's edition...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper paper-texture">
      <div className="container max-w-6xl mx-auto px-4 py-6">
        {/* Generate button */}
        <div className="flex justify-end mb-4">
          <Button
            onClick={handleGenerateNew}
            disabled={isGenerating}
            variant="outline"
            className="font-headline text-sm border-ink text-ink hover:bg-sepia"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Generate New Edition
          </Button>
        </div>

        {lastGenerated && (
          <p className="text-right text-xs text-ink-light font-body mb-2">
            Last generated: {format(new Date(lastGenerated), "PPpp")}
          </p>
        )}

        {/* Masthead */}
        <Masthead />

        {/* Breaking News Banner */}
        <BreakingNews items={content.breakingNews} />

        {/* Main Headlines Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            {content.headlines[0] && (
              <HeadlineSlot 
                number={1}
                size="large"
                headline={content.headlines[0].headline}
                subheadline={content.headlines[0].subheadline}
                content={content.headlines[0].content}
              />
            )}
            <div className="newspaper-rule-thick my-4" />
            {content.headlines[1] && (
              <HeadlineSlot 
                number={2}
                size="medium"
                headline={content.headlines[1].headline}
                subheadline={content.headlines[1].subheadline}
                content={content.headlines[1].content}
              />
            )}
          </div>

          <div className="lg:col-span-1 column-rule">
            <WeatherBox 
              temperature={content.weather.temperature}
              conditions={content.weather.conditions}
              forecast={content.weather.forecast}
            />
            <div className="mt-6">
              <ClassifiedsBox items={content.classifieds} />
            </div>
          </div>
        </div>

        <div className="newspaper-rule-double mb-6" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <Section title="Local Affairs">
              {content.localAffairs.map((article, i) => (
                <div key={i}>
                  <ArticleSlot 
                    headline={article.headline}
                    content={article.content}
                    byline={article.byline}
                  />
                  {i < content.localAffairs.length - 1 && <div className="newspaper-rule my-3" />}
                </div>
              ))}
            </Section>
          </div>

          <div className="md:column-rule">
            <Section title="World News">
              {content.worldNews.map((article, i) => (
                <div key={i}>
                  <ArticleSlot 
                    headline={article.headline}
                    content={article.content}
                    byline={article.byline}
                  />
                  {i < content.worldNews.length - 1 && <div className="newspaper-rule my-3" />}
                </div>
              ))}
            </Section>
          </div>

          <div className="lg:column-rule">
            <Section title="Opinion & Editorial">
              {content.opinion.map((article, i) => (
                <div key={i}>
                  <ArticleSlot 
                    headline={article.headline}
                    content={article.content}
                    byline={article.byline}
                  />
                  {i < content.opinion.length - 1 && <div className="newspaper-rule my-3" />}
                </div>
              ))}
            </Section>
          </div>
        </div>

        <div className="newspaper-rule-thick my-6" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Section title="Arts & Culture">
              {content.artsCulture.map((article, i) => (
                <div key={i}>
                  <ArticleSlot 
                    headline={article.headline}
                    content={article.content}
                  />
                  {i < content.artsCulture.length - 1 && <div className="newspaper-rule my-3" />}
                </div>
              ))}
            </Section>
          </div>

          <div className="md:column-rule">
            <Section title="Sports Dispatch">
              {content.sports.map((article, i) => (
                <div key={i}>
                  <ArticleSlot 
                    headline={article.headline}
                    content={article.content}
                  />
                  {i < content.sports.length - 1 && <div className="newspaper-rule my-3" />}
                </div>
              ))}
            </Section>
          </div>
        </div>

        <div className="newspaper-rule-thick my-6" />

        <ComicsSection comics={content.comics} />

        <div className="newspaper-rule-thick my-6" />

        <VintageAds ads={content.vintageAds} />

        <div className="newspaper-rule-thick my-6" />

        <ObituariesSection obituaries={content.obituaries} />

        <Footer />
      </div>
    </div>
  );
};

export default Index;
