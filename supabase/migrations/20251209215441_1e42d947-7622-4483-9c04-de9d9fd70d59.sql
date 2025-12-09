-- Create table for newspaper editions
CREATE TABLE public.newspaper_editions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  publish_date DATE NOT NULL UNIQUE,
  content JSONB NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT false
);

-- Enable RLS (but allow public read access for the newspaper)
ALTER TABLE public.newspaper_editions ENABLE ROW LEVEL SECURITY;

-- Anyone can read editions (it's a public newspaper)
CREATE POLICY "Anyone can view newspaper editions" 
ON public.newspaper_editions 
FOR SELECT 
USING (true);

-- Only authenticated users (admin) can insert/update
CREATE POLICY "Service role can manage editions" 
ON public.newspaper_editions 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create index for faster lookups by date
CREATE INDEX idx_newspaper_editions_date ON public.newspaper_editions(publish_date DESC);
CREATE INDEX idx_newspaper_editions_active ON public.newspaper_editions(is_active) WHERE is_active = true;