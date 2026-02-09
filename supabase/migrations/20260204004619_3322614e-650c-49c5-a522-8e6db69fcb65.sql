-- Step 1: Add 'wali_santri' to the app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'wali_santri';