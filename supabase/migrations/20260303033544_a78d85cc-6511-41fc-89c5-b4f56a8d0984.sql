-- Allow all authenticated users to read system settings
CREATE POLICY "Authenticated users can view system settings"
ON public.pengaturan_sistem
FOR SELECT
TO authenticated
USING (true);