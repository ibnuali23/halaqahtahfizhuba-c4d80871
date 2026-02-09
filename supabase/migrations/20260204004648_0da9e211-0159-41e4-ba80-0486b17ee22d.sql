-- Create table for tracking halaqah changes history
CREATE TABLE public.riwayat_halaqah (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    santri_id UUID NOT NULL REFERENCES public.santri(id) ON DELETE CASCADE,
    halaqah_sebelumnya TEXT NOT NULL,
    halaqah_baru TEXT NOT NULL,
    tanggal_perubahan TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    diubah_oleh UUID NOT NULL,
    keterangan TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on riwayat_halaqah
ALTER TABLE public.riwayat_halaqah ENABLE ROW LEVEL SECURITY;

-- RLS policies for riwayat_halaqah
CREATE POLICY "Admins can manage riwayat_halaqah"
ON public.riwayat_halaqah
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view all riwayat_halaqah"
ON public.riwayat_halaqah
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for faster queries
CREATE INDEX idx_riwayat_halaqah_santri_id ON public.riwayat_halaqah(santri_id);
CREATE INDEX idx_riwayat_halaqah_tanggal ON public.riwayat_halaqah(tanggal_perubahan DESC);

-- Update RLS policies for wali_santri role - they can only view data
CREATE POLICY "Wali santri can view all santri"
ON public.santri
FOR SELECT
USING (has_role(auth.uid(), 'wali_santri'::app_role));

CREATE POLICY "Wali santri can view all setoran"
ON public.setoran_hafalan
FOR SELECT
USING (has_role(auth.uid(), 'wali_santri'::app_role));

CREATE POLICY "Wali santri can view all hafalan_summary"
ON public.hafalan_summary
FOR SELECT
USING (has_role(auth.uid(), 'wali_santri'::app_role));