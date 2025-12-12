import { Link } from "react-router-dom";

interface ComicSlot {
  title: string;
  caption?: string;
  imageUrl?: string;
}

interface ComicsSectionProps {
  comics?: ComicSlot[];
}

const ComicsSection = ({ comics }: ComicsSectionProps) => {
  const defaultComics: ComicSlot[] = [
    { title: "EMPTY", caption: "EMPTY" },
    { title: "EMPTY", caption: "EMPTY" },
  ];

  const displayComics = comics || defaultComics;

  return (
    <div className="border-2 border-ink p-4">
      <h4 className="font-headline font-bold uppercase tracking-widest text-sm mb-4 text-center border-b-2 border-ink pb-2">
        ✎ Editorial Cartoons ✎
      </h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayComics.map((comic, index) => {
          const isEmpty = comic.title === "EMPTY";
          const hasImage = comic.imageUrl && comic.imageUrl.length > 0;
          
          return (
            <div key={index} className="border border-rule">
              {/* Comic image or placeholder */}
              <div className="aspect-[4/3] bg-sepia/30 flex items-center justify-center border-b border-rule overflow-hidden">
                {hasImage ? (
                  <img 
                    src={comic.imageUrl} 
                    alt={comic.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-4">
                    <span className="font-headline text-4xl text-ink-light">✎</span>
                    <p className="font-body text-sm text-ink-light italic mt-2">
                      [Illustration Here]
                    </p>
                  </div>
                )}
              </div>
              {/* Caption */}
              <div className="p-3 text-center">
                <p className={`font-headline font-semibold text-sm ${isEmpty ? "text-ink-light italic" : "text-headline"}`}>
                  {comic.title}
                </p>
                {comic.caption && (
                  <p className={`font-body text-xs mt-1 ${isEmpty ? "text-ink-light italic" : "text-ink-light"}`}>
                    {comic.caption}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Comic Archive Button */}
      <div className="mt-4 text-center border-t border-rule pt-4">
        <Link
          to="/comic-archive"
          className="inline-flex items-center gap-2 px-4 py-2 border-2 border-headline rounded font-headline text-sm hover:bg-headline hover:text-paper transition-colors"
        >
          📜 Comic Archive
        </Link>
      </div>
    </div>
  );
};

export default ComicsSection;