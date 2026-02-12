-- Add is_present column to absensi_guru table
ALTER TABLE public.absensi_guru ADD COLUMN IF NOT EXISTS is_present BOOLEAN DEFAULT true;

-- Update existing records: present is true, others are false
UPDATE public.absensi_guru SET is_present = true WHERE status = 'present';
UPDATE public.absensi_guru SET is_present = false WHERE status IN ('izin', 'sakit', 'alfa');
