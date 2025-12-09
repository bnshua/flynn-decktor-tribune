interface HeadlineSlotProps {
  number: number;
  headline?: string;
  subheadline?: string;
  content?: string;
  size?: "large" | "medium";
}

const HeadlineSlot = ({ 
  number, 
  headline = "EMPTY", 
  subheadline = "", 
  content = "EMPTY",
  size = "large" 
}: HeadlineSlotProps) => {
  const isEmpty = headline === "EMPTY";

  return (
    <article className={`${size === "large" ? "mb-8" : "mb-6"}`}>
      {/* Headline */}
      <h3 
        className={`font-headline font-bold text-headline leading-tight text-balance
          ${size === "large" ? "text-3xl md:text-4xl lg:text-5xl" : "text-2xl md:text-3xl"}
          ${isEmpty ? "text-ink-light italic" : ""}
        `}
      >
        {headline}
      </h3>
      
      {/* Subheadline */}
      {subheadline && (
        <p className="font-headline text-lg italic text-ink-light mt-2">
          {subheadline}
        </p>
      )}
      
      {/* Rule */}
      <div className="newspaper-rule my-3" />
      
      {/* Content */}
      <div className={`font-body text-lg leading-relaxed ${isEmpty ? "text-ink-light italic" : "drop-cap"}`}>
        <p>{content}</p>
      </div>
    </article>
  );
};

export default HeadlineSlot;
