import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Send } from "lucide-react";

const letterSchema = z.object({
  authorName: z.string().trim().min(1, "Name is required").max(100, "Name too long"),
  authorLocation: z.string().trim().max(100, "Location too long").optional(),
  letterContent: z.string().trim().min(10, "Letter must be at least 10 characters").max(500, "Letter must be under 500 characters"),
});

const LetterSubmissionForm = () => {
  const [authorName, setAuthorName] = useState("");
  const [authorLocation, setAuthorLocation] = useState("");
  const [letterContent, setLetterContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate
    const result = letterSchema.safeParse({
      authorName,
      authorLocation: authorLocation || undefined,
      letterContent,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("letter_submissions").insert({
        author_name: result.data.authorName,
        author_location: result.data.authorLocation || null,
        letter_content: result.data.letterContent,
      });

      if (error) throw error;

      toast({
        title: "📬 Letter Received!",
        description: "Our editors will review your submission. If selected, it may appear in a future edition!",
      });

      // Clear form
      setAuthorName("");
      setAuthorLocation("");
      setLetterContent("");
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Could not submit your letter. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border-2 border-ink p-4 bg-sepia/20">
      <div className="text-center mb-4">
        <h4 className="font-headline font-bold uppercase tracking-widest text-lg text-headline">
          ✉️ Write to the Editor ✉️
        </h4>
        <p className="font-body italic text-sm text-ink-light mt-1">
          Submit your satirical grievances, absurd observations, or conspiracy theories
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Input
              placeholder="Your Name (or Alias)"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="font-body bg-paper border-rule focus:border-ink"
              maxLength={100}
            />
            {errors.authorName && (
              <p className="text-destructive text-xs mt-1 font-body">{errors.authorName}</p>
            )}
          </div>
          <div>
            <Input
              placeholder="Location (e.g., Confused on Maple St.)"
              value={authorLocation}
              onChange={(e) => setAuthorLocation(e.target.value)}
              className="font-body bg-paper border-rule focus:border-ink"
              maxLength={100}
            />
          </div>
        </div>

        <div>
          <Textarea
            placeholder="Dear Editor, I am writing to express my extreme concern about..."
            value={letterContent}
            onChange={(e) => setLetterContent(e.target.value)}
            className="font-body bg-paper border-rule focus:border-ink min-h-[100px] resize-none"
            maxLength={500}
          />
          <div className="flex justify-between mt-1">
            {errors.letterContent ? (
              <p className="text-destructive text-xs font-body">{errors.letterContent}</p>
            ) : (
              <span />
            )}
            <p className="text-xs text-ink-light font-body">{letterContent.length}/500</p>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full font-headline uppercase tracking-wide bg-ink text-primary-foreground hover:bg-ink/90"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Send className="w-4 h-4 mr-2" />
          )}
          Submit Letter
        </Button>
      </form>

      <p className="text-center text-xs text-ink-light font-body mt-3 italic">
        All submissions subject to editorial review. The Tribune reserves the right to add excessive punctuation.
      </p>
    </div>
  );
};

export default LetterSubmissionForm;
