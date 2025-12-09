interface Obituary {
  name: string;
  dates: string;
  description: string;
  survivors?: string;
}

interface ObituariesSectionProps {
  obituaries?: Obituary[];
}

const ObituariesSection = ({ obituaries }: ObituariesSectionProps) => {
  const defaultObituaries: Obituary[] = [
    { name: "EMPTY", dates: "EMPTY", description: "EMPTY" },
  ];

  const displayObituaries = obituaries || defaultObituaries;

  return (
    <div className="border border-rule p-4">
      <div className="text-center mb-4">
        <div className="text-2xl mb-2">✝</div>
        <h4 className="font-headline font-bold uppercase tracking-widest text-lg text-headline">
          Obituaries & Memorials
        </h4>
        <p className="font-body italic text-sm text-ink-light">
          In Loving Memory
        </p>
        <div className="newspaper-rule-thick my-3" />
      </div>

      <div className="space-y-4">
        {displayObituaries.map((obit, index) => {
          const isEmpty = obit.name === "EMPTY";
          return (
            <div key={index} className="text-center">
              {/* Name */}
              <h5 className={`font-headline font-bold text-xl ${isEmpty ? "text-ink-light italic" : "text-headline"}`}>
                {obit.name}
              </h5>
              
              {/* Dates */}
              <p className={`font-body text-sm ${isEmpty ? "text-ink-light italic" : "text-ink-light"}`}>
                {obit.dates}
              </p>
              
              {/* Description */}
              <p className={`font-body mt-2 leading-relaxed ${isEmpty ? "text-ink-light italic" : "text-ink"}`}>
                {obit.description}
              </p>
              
              {/* Survivors */}
              {obit.survivors && (
                <p className="font-body text-sm italic text-ink-light mt-2">
                  Survived by: {obit.survivors}
                </p>
              )}
              
              {index < displayObituaries.length - 1 && (
                <div className="my-4 text-ink-light">— ✝ —</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ObituariesSection;
