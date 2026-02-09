-- Add waktu_halaqah enum type
CREATE TYPE public.waktu_halaqah AS ENUM ('subuh', 'maghrib');

-- Add new columns to absensi_guru table
ALTER TABLE public.absensi_guru 
ADD COLUMN IF NOT EXISTS waktu_halaqah waktu_halaqah DEFAULT NULL,
ADD COLUMN IF NOT EXISTS alamat_lokasi TEXT DEFAULT NULL;

-- Create unique constraint to prevent double check-in for same time slot
CREATE UNIQUE INDEX IF NOT EXISTS unique_absensi_waktu 
ON public.absensi_guru (user_id, tanggal, waktu_halaqah);

-- Create table for halaqah reference locations
CREATE TABLE IF NOT EXISTS public.halaqah_locations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    nama TEXT NOT NULL,
    waktu_halaqah waktu_halaqah NOT NULL,
    latitude NUMERIC NOT NULL,
    longitude NUMERIC NOT NULL,
    radius_meter INTEGER DEFAULT 100,
    alamat TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on halaqah_locations
ALTER TABLE public.halaqah_locations ENABLE ROW LEVEL SECURITY;

-- Admin can manage locations
CREATE POLICY "Admins can manage halaqah_locations" 
ON public.halaqah_locations 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Everyone authenticated can view locations (for distance calculation)
CREATE POLICY "Authenticated users can view halaqah_locations" 
ON public.halaqah_locations 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Create hafalan_log table for audit trail
CREATE TABLE IF NOT EXISTS public.hafalan_log (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    setoran_id UUID NOT NULL,
    action TEXT NOT NULL, -- 'created', 'updated', 'deleted'
    old_data JSONB,
    new_data JSONB,
    reason TEXT,
    performed_by UUID NOT NULL,
    performed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on hafalan_log
ALTER TABLE public.hafalan_log ENABLE ROW LEVEL SECURITY;

-- Admins can view all logs
CREATE POLICY "Admins can view all hafalan_logs" 
ON public.hafalan_log 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Guru can view logs for their own entries
CREATE POLICY "Guru can view own hafalan_logs" 
ON public.hafalan_log 
FOR SELECT 
USING (performed_by = auth.uid());

-- Anyone can insert logs
CREATE POLICY "Authenticated users can insert logs" 
ON public.hafalan_log 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Add update and delete policies for setoran_hafalan (guru can edit/delete own)
CREATE POLICY "Guru can update their own setoran" 
ON public.setoran_hafalan 
FOR UPDATE 
USING (recorded_by = auth.uid());

CREATE POLICY "Guru can delete their own setoran" 
ON public.setoran_hafalan 
FOR DELETE 
USING (recorded_by = auth.uid());

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_absensi_waktu_halaqah 
ON public.absensi_guru (waktu_halaqah, tanggal);

CREATE INDEX IF NOT EXISTS idx_hafalan_log_setoran 
ON public.hafalan_log (setoran_id);

-- Enable realtime for halaqah_locations
ALTER PUBLICATION supabase_realtime ADD TABLE public.halaqah_locations;

-- Add trigger for updated_at on halaqah_locations
CREATE TRIGGER update_halaqah_locations_updated_at
BEFORE UPDATE ON public.halaqah_locations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();