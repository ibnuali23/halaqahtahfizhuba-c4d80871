-- Create enum for attendance status
CREATE TYPE public.attendance_status AS ENUM ('present', 'izin', 'sakit', 'dinas_luar', 'alfa');

-- Create absensi_guru table for teacher attendance
CREATE TABLE public.absensi_guru (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    waktu_check_in TIMESTAMP WITH TIME ZONE,
    waktu_check_out TIMESTAMP WITH TIME ZONE,
    status attendance_status NOT NULL DEFAULT 'present',
    keterangan TEXT,
    photo_proof_url TEXT,
    gps_latitude NUMERIC(10, 7),
    gps_longitude NUMERIC(10, 7),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, tanggal)
);

-- Enable RLS
ALTER TABLE public.absensi_guru ENABLE ROW LEVEL SECURITY;

-- RLS Policies for absensi_guru

-- Admins can view all attendance
CREATE POLICY "Admins can view all attendance"
ON public.absensi_guru
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Admins can manage all attendance
CREATE POLICY "Admins can manage all attendance"
ON public.absensi_guru
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Guru can view their own attendance
CREATE POLICY "Guru can view own attendance"
ON public.absensi_guru
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Guru can insert their own attendance
CREATE POLICY "Guru can insert own attendance"
ON public.absensi_guru
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Guru can update their own attendance (same day only)
CREATE POLICY "Guru can update own attendance same day"
ON public.absensi_guru
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND tanggal = CURRENT_DATE);

-- Add trigger for updated_at
CREATE TRIGGER update_absensi_guru_updated_at
BEFORE UPDATE ON public.absensi_guru
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for performance
CREATE INDEX idx_absensi_guru_user_tanggal ON public.absensi_guru(user_id, tanggal);
CREATE INDEX idx_absensi_guru_tanggal ON public.absensi_guru(tanggal);

-- Add index on setoran_hafalan for daily feed performance
CREATE INDEX IF NOT EXISTS idx_setoran_hafalan_tanggal ON public.setoran_hafalan(tanggal DESC);
CREATE INDEX IF NOT EXISTS idx_setoran_hafalan_recorded_by ON public.setoran_hafalan(recorded_by);

-- Update historical setoran_hafalan: set recorded_by to 'imported' where null
UPDATE public.setoran_hafalan 
SET recorded_by = NULL
WHERE recorded_by IS NULL;

-- Add realtime for setoran_hafalan
ALTER PUBLICATION supabase_realtime ADD TABLE public.setoran_hafalan;
ALTER PUBLICATION supabase_realtime ADD TABLE public.absensi_guru;