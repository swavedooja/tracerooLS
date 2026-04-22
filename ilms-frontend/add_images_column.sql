-- Add images column to materials table
-- Intended for base64 data up to 500KB

ALTER TABLE public.materials 
ADD COLUMN IF NOT EXISTS images TEXT;

COMMENT ON COLUMN public.materials.images IS 'Base64 encoded image data (up to 500KB recommended)';
