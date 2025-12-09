import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Lock, Check, X, Star, Trash2, ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

interface LetterSubmission {
  id: string;
  author_name: string;
  author_location: string | null;
  letter_content: string;
  submitted_at: string;
  is_approved: boolean;
  is_featured: boolean;
}

const ADMIN_PIN = "6767";

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);
  const [letters, setLetters] = useState<LetterSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      setIsAuthenticated(true);
      setPinError(false);
      loadLetters();
    } else {
      setPinError(true);
      setPin("");
    }
  };

  const loadLetters = async () => {
    setIsLoading(true);
    // Use service role would be ideal, but for simplicity we'll query all
    // We need to temporarily bypass RLS - let's use an edge function instead
    try {
      const { data, error } = await supabase.functions.invoke("get-letter-submissions");
      if (error) throw error;
      setLetters(data.letters || []);
    } catch (error) {
      console.error("Failed to load letters:", error);
      toast({
        title: "Error",
        description: "Failed to load letter submissions",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  const updateLetter = async (id: string, updates: { is_approved?: boolean; is_featured?: boolean }) => {
    try {
      const { error } = await supabase.functions.invoke("update-letter-submission", {
        body: { id, ...updates },
      });
      if (error) throw error;
      
      setLetters((prev) =>
        prev.map((letter) =>
          letter.id === id ? { ...letter, ...updates } : letter
        )
      );
      
      toast({
        title: "Updated!",
        description: updates.is_approved !== undefined 
          ? (updates.is_approved ? "Letter approved" : "Letter rejected")
          : (updates.is_featured ? "Letter featured" : "Letter unfeatured"),
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update letter",
        variant: "destructive",
      });
    }
  };

  const deleteLetter = async (id: string) => {
    try {
      const { error } = await supabase.functions.invoke("delete-letter-submission", {
        body: { id },
      });
      if (error) throw error;
      
      setLetters((prev) => prev.filter((letter) => letter.id !== id));
      
      toast({
        title: "Deleted",
        description: "Letter has been removed",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete letter",
        variant: "destructive",
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-paper paper-texture flex items-center justify-center">
        <div className="max-w-sm w-full mx-4">
          <div className="border-4 border-double border-ink p-8 bg-sepia/30">
            <div className="text-center mb-6">
              <Lock className="w-12 h-12 mx-auto text-headline" />
              <h1 className="font-masthead text-2xl mt-4 text-headline">
                Editor's Office
              </h1>
              <p className="font-body text-sm text-ink-light mt-2">
                Enter your access code
              </p>
            </div>

            <form onSubmit={handlePinSubmit} className="space-y-4">
              <Input
                type="password"
                placeholder="Enter PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="text-center text-2xl tracking-widest font-mono bg-paper border-ink"
                maxLength={4}
              />
              {pinError && (
                <p className="text-destructive text-sm text-center font-body">
                  Invalid PIN. Access denied.
                </p>
              )}
              <Button
                type="submit"
                className="w-full font-headline uppercase tracking-wide bg-ink text-primary-foreground hover:bg-ink/90"
              >
                Enter
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link
                to="/"
                className="font-body text-sm text-ink-light hover:text-ink underline"
              >
                ← Return to Tribune
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper paper-texture">
      <div className="container max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-masthead text-3xl text-headline">
              📬 Letters to the Editor
            </h1>
            <p className="font-body text-ink-light">
              Review, approve, and feature reader submissions
            </p>
          </div>
          <Link to="/">
            <Button variant="outline" className="font-headline text-sm border-ink">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Tribune
            </Button>
          </Link>
        </div>

        <div className="newspaper-rule-thick mb-6" />

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-ink" />
          </div>
        ) : letters.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-rule">
            <p className="font-headline text-xl text-ink-light">
              No letters yet
            </p>
            <p className="font-body text-sm text-ink-light mt-2">
              Submissions will appear here for review
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {letters.map((letter) => (
              <div
                key={letter.id}
                className={`border-2 p-4 ${
                  letter.is_approved
                    ? letter.is_featured
                      ? "border-accent bg-accent/10"
                      : "border-ink/50 bg-sepia/20"
                    : "border-ink bg-paper"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-headline font-bold text-headline">
                        {letter.author_name}
                      </span>
                      {letter.author_location && (
                        <span className="font-body text-sm text-ink-light">
                          — {letter.author_location}
                        </span>
                      )}
                      {letter.is_featured && (
                        <span className="px-2 py-0.5 bg-accent text-accent-foreground text-xs font-headline uppercase">
                          Featured
                        </span>
                      )}
                      {letter.is_approved && !letter.is_featured && (
                        <span className="px-2 py-0.5 bg-ink/20 text-ink text-xs font-headline uppercase">
                          Approved
                        </span>
                      )}
                    </div>
                    <p className="font-body text-ink leading-relaxed">
                      "{letter.letter_content}"
                    </p>
                    <p className="font-body text-xs text-ink-light mt-2">
                      Submitted: {format(new Date(letter.submitted_at), "PPp")}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    {!letter.is_approved ? (
                      <>
                        <Button
                          size="sm"
                          onClick={() => updateLetter(letter.id, { is_approved: true })}
                          className="bg-green-600 hover:bg-green-700 text-primary-foreground"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteLetter(letter.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant={letter.is_featured ? "default" : "outline"}
                          onClick={() =>
                            updateLetter(letter.id, { is_featured: !letter.is_featured })
                          }
                          className={letter.is_featured ? "bg-accent hover:bg-accent/80" : "border-ink"}
                        >
                          <Star className={`w-4 h-4 ${letter.is_featured ? "fill-current" : ""}`} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => updateLetter(letter.id, { is_approved: false })}
                          className="text-ink-light hover:text-ink"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteLetter(letter.id)}
                          className="text-destructive hover:text-destructive/80"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
