-- Verification script for UNIQUE(user_id, tanggal, waktu_halaqah)
-- Replace <GURU_UUID> with a real user_id from your auth.users/profiles
-- Run this in Supabase SQL editor or via psql against your database

-- 1) Show current unique constraints / indexes
SELECT conname, pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'absensi_guru'::regclass AND contype = 'u';

SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'absensi_guru';

-- 2) Test inserts using plpgsql to catch unique violations without aborting entire script
DO $$
BEGIN
  -- First insert: Subuh (should succeed if no existing row)
  BEGIN
    INSERT INTO public.absensi_guru (user_id, tanggal, waktu_check_in, waktu_halaqah)
    VALUES ('<GURU_UUID>', '2026-02-06', now(), 'subuh');
    RAISE NOTICE 'Inserted subuh ok';
  EXCEPTION WHEN unique_violation THEN
    RAISE NOTICE 'Insert subuh blocked (already exists): %', SQLERRM;
  END;

  -- Second insert: Maghrib (should succeed)
  BEGIN
    INSERT INTO public.absensi_guru (user_id, tanggal, waktu_check_in, waktu_halaqah)
    VALUES ('<GURU_UUID>', '2026-02-06', now(), 'maghrib');
    RAISE NOTICE 'Inserted maghrib ok';
  EXCEPTION WHEN unique_violation THEN
    RAISE NOTICE 'Insert maghrib blocked (already exists): %', SQLERRM;
  END;

  -- Third insert: Duplicate Subuh (should be blocked by unique constraint)
  BEGIN
    INSERT INTO public.absensi_guru (user_id, tanggal, waktu_check_in, waktu_halaqah)
    VALUES ('<GURU_UUID>', '2026-02-06', now(), 'subuh');
    RAISE NOTICE 'Inserted duplicate subuh (UNEXPECTED)';
  EXCEPTION WHEN unique_violation THEN
    RAISE NOTICE 'Expected duplicate detected for subuh: %', SQLERRM;
  END;
END
$$ LANGUAGE plpgsql;

-- 3) Show resulting rows for that user/date
SELECT id, user_id, tanggal, waktu_halaqah, waktu_check_in
FROM public.absensi_guru
WHERE user_id = '<GURU_UUID>' AND tanggal = '2026-02-06'
ORDER BY waktu_halaqah;

-- Notes:
-- - If you see two rows (subuh and maghrib) and the duplicate insert produced a NOTICE 'Expected duplicate detected', then the unique constraint is working as desired.
-- - If the duplicate insert succeeded, you still have the old UNIQUE(user_id, tanggal) missing or a misconfigured index; run the migration file supabase/migrations/20260207090000_replace_unique_absensi.sql to fix it.
