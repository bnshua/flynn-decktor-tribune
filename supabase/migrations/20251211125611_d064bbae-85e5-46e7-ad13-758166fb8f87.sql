-- Create game_puzzles table
CREATE TABLE public.game_puzzles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  edition_id UUID REFERENCES public.newspaper_editions(id) ON DELETE CASCADE,
  game_type TEXT NOT NULL,
  puzzle_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.game_puzzles ENABLE ROW LEVEL SECURITY;

-- Anyone can view puzzles
CREATE POLICY "Anyone can view game puzzles"
ON public.game_puzzles
FOR SELECT
USING (true);

-- Create comic_archive table
CREATE TABLE public.comic_archive (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  edition_id UUID REFERENCES public.newspaper_editions(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  caption TEXT,
  image_url TEXT,
  publish_date DATE NOT NULL,
  archived_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.comic_archive ENABLE ROW LEVEL SECURITY;

-- Anyone can view archived comics
CREATE POLICY "Anyone can view archived comics"
ON public.comic_archive
FOR SELECT
USING (true);

-- Create indexes
CREATE INDEX idx_game_puzzles_edition ON public.game_puzzles(edition_id);
CREATE INDEX idx_game_puzzles_type ON public.game_puzzles(game_type);
CREATE INDEX idx_comic_archive_date ON public.comic_archive(publish_date DESC);