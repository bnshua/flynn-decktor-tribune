import { ReactNode } from "react";

interface SectionProps {
  title: string;
  children: ReactNode;
  className?: string;
}

const Section = ({ title, children, className = "" }: SectionProps) => {
  return (
    <section className={`mb-6 ${className}`}>
      {/* Section header */}
      <div className="section-divider mb-3">
        <h2 className="font-headline text-lg font-bold uppercase tracking-widest text-center text-headline">
          {title}
        </h2>
      </div>
      
      {/* Section content */}
      <div className="font-body text-ink leading-relaxed">
        {children}
      </div>
    </section>
  );
};

export default Section;
