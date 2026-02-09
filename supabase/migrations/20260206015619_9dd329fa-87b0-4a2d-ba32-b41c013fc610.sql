-- Create system settings table for admin configuration
CREATE TABLE public.pengaturan_sistem (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    laporan_mingguan boolean NOT NULL DEFAULT true,
    peringatan_target boolean NOT NULL DEFAULT false,
    target_hafalan_bulanan integer NOT NULL DEFAULT 12,
    semester_aktif text NOT NULL DEFAULT 'Ganjil 2025/2026',
    tahun_ajaran text NOT NULL DEFAULT '2025/2026',
    last_updated_by uuid REFERENCES auth.users(id),
    last_updated_at timestamp with time zone NOT NULL DEFAULT now(),
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pengaturan_sistem ENABLE ROW LEVEL SECURITY;

-- Only admins can view system settings
CREATE POLICY "Admins can view system settings"
ON public.pengaturan_sistem
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can update system settings
CREATE POLICY "Admins can update system settings"
ON public.pengaturan_sistem
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can insert system settings
CREATE POLICY "Admins can insert system settings"
ON public.pengaturan_sistem
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Insert default settings row
INSERT INTO public.pengaturan_sistem (
    laporan_mingguan,
    peringatan_target,
    target_hafalan_bulanan,
    semester_aktif,
    tahun_ajaran
) VALUES (
    true,
    false,
    12,
    'Ganjil 2025/2026',
    '2025/2026'
);

-- Create trigger for updating last_updated_at
CREATE TRIGGER update_pengaturan_sistem_updated_at
BEFORE UPDATE ON public.pengaturan_sistem
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();