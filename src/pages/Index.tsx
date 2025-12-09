import Masthead from "@/components/newspaper/Masthead";
import Section from "@/components/newspaper/Section";
import HeadlineSlot from "@/components/newspaper/HeadlineSlot";
import ArticleSlot from "@/components/newspaper/ArticleSlot";
import BreakingNews from "@/components/newspaper/BreakingNews";
import WeatherBox from "@/components/newspaper/WeatherBox";
import ClassifiedsBox from "@/components/newspaper/ClassifiedsBox";
import Footer from "@/components/newspaper/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-paper paper-texture">
      <div className="container max-w-6xl mx-auto px-4 py-6">
        {/* Masthead */}
        <Masthead />

        {/* Breaking News Banner */}
        <BreakingNews />

        {/* Main Headlines Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Main Headline - spans 2 columns */}
          <div className="lg:col-span-2">
            <HeadlineSlot 
              number={1}
              size="large"
            />
            <div className="newspaper-rule-thick my-4" />
            <HeadlineSlot 
              number={2}
              size="medium"
            />
          </div>

          {/* Sidebar column */}
          <div className="lg:col-span-1 column-rule">
            <WeatherBox />
            <div className="mt-6">
              <ClassifiedsBox />
            </div>
          </div>
        </div>

        {/* Three-column news sections */}
        <div className="newspaper-rule-double mb-6" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Local Affairs */}
          <div>
            <Section title="Local Affairs">
              <ArticleSlot />
              <div className="newspaper-rule my-3" />
              <ArticleSlot />
            </Section>
          </div>

          {/* World News */}
          <div className="md:column-rule">
            <Section title="World News">
              <ArticleSlot />
              <div className="newspaper-rule my-3" />
              <ArticleSlot />
            </Section>
          </div>

          {/* Opinion & Editorial */}
          <div className="lg:column-rule">
            <Section title="Opinion & Editorial">
              <ArticleSlot />
              <div className="newspaper-rule my-3" />
              <ArticleSlot />
            </Section>
          </div>
        </div>

        <div className="newspaper-rule-thick my-6" />

        {/* Two-column lower sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Arts & Culture */}
          <div>
            <Section title="Arts & Culture">
              <ArticleSlot />
              <div className="newspaper-rule my-3" />
              <ArticleSlot />
            </Section>
          </div>

          {/* Sports Dispatch */}
          <div className="md:column-rule">
            <Section title="Sports Dispatch">
              <ArticleSlot />
              <div className="newspaper-rule my-3" />
              <ArticleSlot />
            </Section>
          </div>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default Index;
