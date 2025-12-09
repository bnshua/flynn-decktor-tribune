-- Create table for reader letter submissions
CREATE TABLE public.letter_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  author_name TEXT NOT NULL,
  author_location TEXT,
  letter_content TEXT NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_approved BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false
);

-- Enable RLS
ALTER TABLE public.letter_submissions ENABLE ROW LEVEL SECURITY;

-- Anyone can submit letters (insert)
CREATE POLICY "Anyone can submit letters" 
ON public.letter_submissions 
FOR INSERT 
WITH CHECK (true);

-- Anyone can view approved letters
CREATE POLICY "Anyone can view approved letters" 
ON public.letter_submissions 
FOR SELECT 
USING (is_approved = true);

-- Create index for faster queries
CREATE INDEX idx_letter_submissions_approved ON public.letter_submissions(is_approved, submitted_at DESC);