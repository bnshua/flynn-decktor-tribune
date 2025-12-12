import { Link } from "react-router-dom";

interface ComicEntry {
  title: string;
  caption?: string;
  imageUrl?: string;
  date?: string;
}

interface ComicArchiveProps {
  comics?: ComicEntry[];
}

const ComicArchive = ({ comics }: ComicArchiveProps) => {
  // If no comics are provided, generate placeholder entries
  const placeholderComics: ComicEntry[] = Array.from({ length: 10 }).map(() => ({
    title: "COMING SOON",
    caption: "COMING SOON",
    imageUrl: undefined,
    date: "",
  }));

  const displayComics = comics || placeholderComics;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-headline font-bold mb-6 uppercase tracking-widest text-center">Comic Archive</h2>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayComics.map((comic, idx) => (
          <div key={idx} className="border border-rule rounded bg-paper shadow-md overflow-hidden">
            {/* Always COMING SOON */}
            <div className="aspect-[4/3] bg-sepia/30 flex items-center justify-center border-b border-rule">
              <div className="text-center p-4">
                <span className="font-headline text-4xl text-ink-light">✎</span>
                <p className="font-body text-sm text-ink-light italic mt-2">COMING SOON</p>
              </div>
            </div>

            {/* Text */}
            <div className="p-4 text-center">
              <p className="font-headline font-semibold text-base text-ink-light italic">COMING SOON</p>
              <p className="font-body text-xs mt-1 text-ink-light italic">COMING SOON</p>
            </div>
          </div>
        ))}
      </div>

      {/* Back Button */}
      <div className="text-center mt-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 border-2 border-headline rounded font-headline text-sm hover:bg-headline hover:text-paper transition-colors"
        >
          ⟵ Back to Home
        </Link>
      </div>
    </div>
  );
};

export default ComicArchive;
