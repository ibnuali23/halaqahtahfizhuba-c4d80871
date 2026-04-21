-- Convert kelas from enum to free text so admins can input any angkatan name
ALTER TABLE public.santri ALTER COLUMN kelas TYPE text USING kelas::text;