interface BreakingNewsItem {
  time: string;
  content: string;
}

interface BreakingNewsProps {
  items?: BreakingNewsItem[];
}

const BreakingNews = ({ items }: BreakingNewsProps) => {
  const defaultItems: BreakingNewsItem[] = [
    { time: "", content: "EMPTY" }
  ];

  const displayItems = items || defaultItems;
  const isEmpty = displayItems[0]?.content === "EMPTY";

  return (
    <div className="bg-ink text-primary-foreground py-3 px-4 mb-6">
      <div className="text-center mb-2">
        <span className="font-headline font-bold uppercase tracking-widest text-sm">
          ★ Breaking News ★
        </span>
      </div>
      <div className="space-y-1">
        {displayItems.map((item, index) => (
          <div key={index} className="flex items-start justify-center gap-2 text-center">
            {item.time && (
              <span className="font-body font-semibold text-sm shrink-0">{item.time}:</span>
            )}
            <span className={`font-body ${isEmpty ? "italic opacity-70" : ""}`}>
              {item.content}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BreakingNews;
