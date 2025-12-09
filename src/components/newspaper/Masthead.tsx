import { format } from "date-fns";

const Masthead = () => {
  const today = new Date();
  const formattedDate = format(today, "EEEE, MMMM do, yyyy");

  return (
    <header className="text-center py-6 border-b-4 border-double border-ink">
      {/* Top bar */}
      <div className="flex justify-between items-center text-sm text-ink-light mb-4 px-4">
        <span className="font-body italic">Est. 1983</span>
        <span className="font-body">{formattedDate}</span>
        <span className="font-body italic">Vol. XLII, No. 317</span>
      </div>

      {/* Main title */}
      <div className="relative">
        <div className="ornament">❦</div>
        <h1 className="font-masthead text-5xl md:text-7xl lg:text-8xl tracking-wide text-headline leading-tight">
          Flynn-Decktor Tribune
        </h1>
        <p className="font-headline text-lg md:text-xl italic text-ink-light mt-2">
          "All the Truth That's Fit to Print – And Some That Isn't"
        </p>
        <div className="ornament">❦</div>
      </div>

      {/* Edition bar */}
      <div className="flex justify-center items-center gap-8 mt-4 text-sm font-body text-ink-light">
        <span>Price: $2.00 (or one good rumor)</span>
        <span className="text-xl">✦</span>
        <span>Tuesday Edition</span>
        <span className="text-xl">✦</span>
        <span>Weather: Existential</span>
      </div>
    </header>
  );
};

export default Masthead;
