interface ClassifiedItem {
  title: string;
  text: string;
}

interface ClassifiedsBoxProps {
  items?: ClassifiedItem[];
}

const ClassifiedsBox = ({ items }: ClassifiedsBoxProps) => {
  const defaultItems: ClassifiedItem[] = [
    { title: "EMPTY", text: "EMPTY" },
    { title: "EMPTY", text: "EMPTY" },
    { title: "EMPTY", text: "EMPTY" },
  ];

  const displayItems = items || defaultItems;

  return (
    <div className="border border-rule p-4">
      <h4 className="font-headline font-bold uppercase tracking-widest text-sm mb-3 text-center border-b border-rule pb-2">
        Classifieds & Notices
      </h4>
      
      <div className="space-y-3">
        {displayItems.map((item, index) => {
          const isEmpty = item.title === "EMPTY";
          return (
            <div key={index} className="text-sm">
              <p className={`font-headline font-semibold ${isEmpty ? "text-ink-light italic" : "text-headline"}`}>
                {item.title}
              </p>
              <p className={`font-body ${isEmpty ? "text-ink-light italic" : "text-ink"}`}>
                {item.text}
              </p>
              {index < displayItems.length - 1 && (
                <div className="newspaper-rule mt-2" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ClassifiedsBox;
