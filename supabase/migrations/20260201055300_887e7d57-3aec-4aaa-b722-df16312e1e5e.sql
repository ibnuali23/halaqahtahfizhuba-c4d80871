-- Create enum for angkatan/kelas
CREATE TYPE public.kelas_type AS ENUM ('Angkatan 1', 'Angkatan 2', 'Angkatan 3');

-- Create santri table
CREATE TABLE public.santri (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    nama TEXT NOT NULL,
    kelas kelas_type NOT NULL,
    musyrif TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create setoran_hafalan table
CREATE TABLE public.setoran_hafalan (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    santri_id UUID NOT NULL REFERENCES public.santri(id) ON DELETE CASCADE,
    bulan TEXT NOT NULL,
    tahun INTEGER NOT NULL,
    jumlah_halaman DECIMAL(5,2) NOT NULL DEFAULT 0,
    surat TEXT,
    ayat TEXT,
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    keterangan TEXT,
    recorded_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create hafalan_summary table for storing aggregated data
CREATE TABLE public.hafalan_summary (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    santri_id UUID NOT NULL REFERENCES public.santri(id) ON DELETE CASCADE,
    tahun INTEGER NOT NULL,
    juli DECIMAL(5,2) DEFAULT 0,
    agustus DECIMAL(5,2) DEFAULT 0,
    september DECIMAL(5,2) DEFAULT 0,
    oktober DECIMAL(5,2) DEFAULT 0,
    november DECIMAL(5,2) DEFAULT 0,
    desember DECIMAL(5,2) DEFAULT 0,
    total_hafalan DECIMAL(5,2) DEFAULT 0,
    setoran_terakhir TEXT,
    target_bulanan INTEGER DEFAULT 12,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(santri_id, tahun)
);

-- Enable RLS
ALTER TABLE public.santri ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.setoran_hafalan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hafalan_summary ENABLE ROW LEVEL SECURITY;

-- Create helper function to get user's musyrif name
CREATE OR REPLACE FUNCTION public.get_user_musyrif()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT musyrif_nama FROM public.profiles WHERE user_id = auth.uid()
$$;

-- RLS Policies for santri
-- Admins can see all santri
CREATE POLICY "Admins can view all santri" 
ON public.santri 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- Guru can only view their own halaqah students
CREATE POLICY "Guru can view their halaqah santri" 
ON public.santri 
FOR SELECT 
USING (musyrif = public.get_user_musyrif());

-- Only admins can insert/update/delete santri
CREATE POLICY "Admins can insert santri" 
ON public.santri 
FOR INSERT 
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update santri" 
ON public.santri 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete santri" 
ON public.santri 
FOR DELETE 
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for setoran_hafalan
-- Admins can view all setoran
CREATE POLICY "Admins can view all setoran" 
ON public.setoran_hafalan 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- Guru can only view setoran for their halaqah
CREATE POLICY "Guru can view their halaqah setoran" 
ON public.setoran_hafalan 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.santri 
        WHERE santri.id = setoran_hafalan.santri_id 
        AND santri.musyrif = public.get_user_musyrif()
    )
);

-- Admins can insert setoran
CREATE POLICY "Admins can insert setoran" 
ON public.setoran_hafalan 
FOR INSERT 
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Guru can insert setoran only for their halaqah
CREATE POLICY "Guru can insert their halaqah setoran" 
ON public.setoran_hafalan 
FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.santri 
        WHERE santri.id = santri_id 
        AND santri.musyrif = public.get_user_musyrif()
    )
);

-- Admins can update/delete any setoran
CREATE POLICY "Admins can update setoran" 
ON public.setoran_hafalan 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete setoran" 
ON public.setoran_hafalan 
FOR DELETE 
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for hafalan_summary
CREATE POLICY "Admins can view all hafalan_summary" 
ON public.hafalan_summary 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Guru can view their halaqah hafalan_summary" 
ON public.hafalan_summary 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.santri 
        WHERE santri.id = hafalan_summary.santri_id 
        AND santri.musyrif = public.get_user_musyrif()
    )
);

CREATE POLICY "Admins can manage hafalan_summary" 
ON public.hafalan_summary 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_santri_updated_at
BEFORE UPDATE ON public.santri
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_setoran_hafalan_updated_at
BEFORE UPDATE ON public.setoran_hafalan
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_hafalan_summary_updated_at
BEFORE UPDATE ON public.hafalan_summary
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_santri_musyrif ON public.santri(musyrif);
CREATE INDEX idx_santri_kelas ON public.santri(kelas);
CREATE INDEX idx_setoran_santri_id ON public.setoran_hafalan(santri_id);
CREATE INDEX idx_setoran_bulan_tahun ON public.setoran_hafalan(bulan, tahun);
CREATE INDEX idx_hafalan_summary_santri_id ON public.hafalan_summary(santri_id);