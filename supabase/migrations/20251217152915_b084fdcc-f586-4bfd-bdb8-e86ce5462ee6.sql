-- Drop the existing restrictive policy and create a permissive one
DROP POLICY IF EXISTS "Anyone can view game puzzles" ON public.game_puzzles;

CREATE POLICY "Anyone can view game puzzles" 
ON public.game_puzzles 
FOR SELECT 
USING (true);