import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ArchivedComic {
  id: string;
  title: string;
  caption: string | null;
  image_url: string | null;
  publish_date: string;
}

const ComicArchive = () => {
  const [comics, setComics] = useState<ArchivedComic[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedComic, setSelectedComic] = useState<ArchivedComic | null>(null);

  useEffect(() => {
    fetchComics();
  }, []);

  const fetchComics = async () => {
    try {
      const { data, error } = await supabase
        .from('comic_archive')
        .select('*')
        .order('publish_date', { ascending: false });

      if (error) throw error;
      setComics(data || []);
    } catch (error) {
      console.error('Error fetching comics:', error);
    }
    setLoading(false);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Group comics by date
  const comicsByDate = comics.reduce((acc, comic) => {
    const date = comic.publish_date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(comic);
    return acc;
  }, {} as Record<string, ArchivedComic[]>);

  if (loading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <p className="font-body text-ink">Loading archive...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link to="/" className="inline-flex items-center gap-2 text-ink-light hover:text-ink mb-6 font-body">
          <ArrowLeft className="w-4 h-4" />
          Back to Tribune
        </Link>
        
        <h1 className="font-headline text-4xl font-bold text-headline mb-2 text-center">📜 Comic Archive</h1>
        <p className="font-body text-ink-light text-center mb-8">A collection of editorial cartoons from past editions</p>

        {comics.length === 0 ? (
          <div className="text-center py-12">
            <p className="font-headline text-xl text-ink-light">No archived comics yet.</p>
            <p className="font-body text-ink-light mt-2">Comics will be archived when new editions are generated.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(comicsByDate).map(([date, dateComics]) => (
              <div key={date} className="border-2 border-rule p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-4 border-b border-rule pb-2">
                  <Calendar className="w-4 h-4 text-ink-light" />
                  <h2 className="font-headline font-bold text-headline">{formatDate(date)}</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dateComics.map((comic) => (
                    <div
                      key={comic.id}
                      onClick={() => setSelectedComic(comic)}
                      className="border border-rule cursor-pointer hover:shadow-lg transition-shadow"
                    >
                      <div className="aspect-[4/3] bg-sepia/30 flex items-center justify-center overflow-hidden">
                        {comic.image_url ? (
                          <img 
                            src={comic.image_url} 
                            alt={comic.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-center p-4">
                            <span className="font-headline text-4xl text-ink-light">✎</span>
                            <p className="font-body text-sm text-ink-light italic mt-2">[No Image]</p>
                          </div>
                        )}
                      </div>
                      <div className="p-3 text-center">
                        <p className="font-headline font-semibold text-sm text-headline">{comic.title}</p>
                        {comic.caption && (
                          <p className="font-body text-xs mt-1 text-ink-light">{comic.caption}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Lightbox */}
        {selectedComic && (
          <div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedComic(null)}
          >
            <div className="max-w-3xl w-full bg-paper p-4 rounded-lg" onClick={e => e.stopPropagation()}>
              {selectedComic.image_url && (
                <img 
                  src={selectedComic.image_url} 
                  alt={selectedComic.title}
                  className="w-full rounded-lg mb-4"
                />
              )}
              <h3 className="font-headline font-bold text-xl text-headline text-center">{selectedComic.title}</h3>
              {selectedComic.caption && (
                <p className="font-body text-ink-light text-center mt-2">{selectedComic.caption}</p>
              )}
              <p className="font-body text-ink-light text-center text-sm mt-4">{formatDate(selectedComic.publish_date)}</p>
              <button
                onClick={() => setSelectedComic(null)}
                className="mt-4 w-full py-2 border-2 border-headline rounded-lg font-headline text-sm"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComicArchive;