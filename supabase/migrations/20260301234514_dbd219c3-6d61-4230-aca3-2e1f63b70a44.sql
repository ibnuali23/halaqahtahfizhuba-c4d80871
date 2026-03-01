
-- Add unique constraint on hafalan_summary(santri_id, tahun) so upsert works
ALTER TABLE public.hafalan_summary 
  ADD CONSTRAINT hafalan_summary_santri_tahun_unique UNIQUE (santri_id, tahun);

-- Add total_juz column to setoran_hafalan for per-record tracking
ALTER TABLE public.setoran_hafalan 
  ADD COLUMN IF NOT EXISTS total_juz numeric DEFAULT 0;
