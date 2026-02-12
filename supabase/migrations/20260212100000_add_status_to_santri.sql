-- Add status column to santri table
ALTER TABLE public.santri ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'aktif';

-- Ensure wali_id column exists (just in case)
ALTER TABLE public.santri ADD COLUMN IF NOT EXISTS wali_id UUID REFERENCES auth.users(id);

-- Update existing records to have 'aktif' status
UPDATE public.santri SET status = 'aktif' WHERE status IS NULL;
