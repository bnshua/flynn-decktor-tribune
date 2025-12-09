interface BreakingNewsProps {
  content?: string;
}

const BreakingNews = ({ content = "EMPTY" }: BreakingNewsProps) => {
  const isEmpty = content === "EMPTY";

  return (
    <div className="bg-ink text-primary-foreground py-3 px-4 mb-6">
      <div className="flex items-center justify-center gap-4">
        <span className="font-headline font-bold uppercase tracking-widest text-sm">
          ★ Breaking News ★
        </span>
        <span className={`font-body text-lg ${isEmpty ? "italic opacity-70" : ""}`}>
          {content}
        </span>
      </div>
    </div>
  );
};

export default BreakingNews;
