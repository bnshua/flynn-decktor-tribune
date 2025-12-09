interface ArticleSlotProps {
  headline?: string;
  content?: string;
  byline?: string;
}

const ArticleSlot = ({ 
  headline = "EMPTY", 
  content = "EMPTY",
  byline = ""
}: ArticleSlotProps) => {
  const isEmpty = headline === "EMPTY";

  return (
    <article className="mb-4">
      {/* Headline */}
      <h4 
        className={`font-headline font-semibold text-xl leading-tight mb-2
          ${isEmpty ? "text-ink-light italic" : "text-headline"}
        `}
      >
        {headline}
      </h4>
      
      {/* Byline */}
      {byline && (
        <p className="font-body text-sm italic text-ink-light mb-2">
          By {byline}
        </p>
      )}
      
      {/* Content */}
      <p className={`font-body leading-relaxed ${isEmpty ? "text-ink-light italic" : "text-ink"}`}>
        {content}
      </p>
    </article>
  );
};

export default ArticleSlot;
