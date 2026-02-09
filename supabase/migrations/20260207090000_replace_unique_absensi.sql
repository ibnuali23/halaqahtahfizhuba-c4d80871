-- Migration: Replace UNIQUE(user_id, tanggal) with UNIQUE(user_id, tanggal, waktu_halaqah)
DO $$
DECLARE
  c RECORD;
BEGIN
  -- Drop unnamed or named UNIQUE constraint on (user_id, tanggal)
  FOR c IN
    SELECT conname
    FROM pg_constraint pc
    JOIN pg_class cls ON pc.conrelid = cls.oid
    WHERE cls.relname = 'absensi_guru'
      AND pc.contype = 'u'
  LOOP
    -- Check columns in constraint
    IF (SELECT array_agg(attname ORDER BY array_position(pc.conkey, attnum))
        FROM (
          SELECT a.attname, a.attnum
          FROM unnest((SELECT conkey FROM pg_constraint WHERE conname = c.conname)) WITH ORDINALITY AS cols(attnum, ord)
          JOIN pg_attribute a ON a.attrelid = (SELECT oid FROM pg_class WHERE relname = 'absensi_guru') AND a.attnum = cols.attnum
          ORDER BY a.attnum
        ) s
       ) = ARRAY['user_id','tanggal'] THEN
      EXECUTE format('ALTER TABLE public.absensi_guru DROP CONSTRAINT IF EXISTS %I', c.conname);
    END IF;
  END LOOP;

  -- Drop any unique index explicitly covering (user_id, tanggal)
  FOR c IN
    SELECT indexname
    FROM pg_indexes
    WHERE tablename = 'absensi_guru' AND indexdef ILIKE '%(user_id, tanggal)%'
  LOOP
    IF c.indexname NOT ILIKE 'unique_absensi_waktu' THEN
      EXECUTE format('DROP INDEX IF EXISTS public.%I', c.indexname);
    END IF;
  END LOOP;

  -- Ensure the new unique index exists
  CREATE UNIQUE INDEX IF NOT EXISTS unique_absensi_waktu ON public.absensi_guru (user_id, tanggal, waktu_halaqah);
END
$$ LANGUAGE plpgsql;
