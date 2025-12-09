interface VintageAd {
  headline: string;
  tagline: string;
  description: string;
  price?: string;
}

interface VintageAdsProps {
  ads?: VintageAd[];
}

const VintageAds = ({ ads }: VintageAdsProps) => {
  const defaultAds: VintageAd[] = [
    { headline: "EMPTY", tagline: "EMPTY", description: "EMPTY" },
  ];

  const displayAds = ads || defaultAds;

  return (
    <div className="space-y-4">
      <div className="section-divider mb-3">
        <h2 className="font-headline text-lg font-bold uppercase tracking-widest text-center text-headline">
          Advertisements
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayAds.map((ad, index) => {
          const isEmpty = ad.headline === "EMPTY";
          return (
            <div 
              key={index} 
              className="border-2 border-ink p-4 text-center bg-sepia/20"
            >
              {/* Decorative top border */}
              <div className="text-2xl mb-2">✦ ✦ ✦</div>
              
              {/* Headline */}
              <h4 className={`font-headline font-bold text-xl uppercase tracking-wide ${isEmpty ? "text-ink-light italic" : "text-headline"}`}>
                {ad.headline}
              </h4>
              
              {/* Tagline */}
              <p className={`font-headline italic text-sm mt-1 ${isEmpty ? "text-ink-light" : "text-ink"}`}>
                {ad.tagline}
              </p>
              
              <div className="my-3 text-ink-light">— ❧ —</div>
              
              {/* Description */}
              <p className={`font-body text-sm leading-relaxed ${isEmpty ? "text-ink-light italic" : "text-ink"}`}>
                {ad.description}
              </p>
              
              {/* Price */}
              {ad.price && (
                <div className="mt-3 pt-2 border-t border-rule">
                  <span className="font-headline font-bold text-lg">{ad.price}</span>
                </div>
              )}
              
              {/* Decorative bottom border */}
              <div className="text-2xl mt-2">✦ ✦ ✦</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VintageAds;
