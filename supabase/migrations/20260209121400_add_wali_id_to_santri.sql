
-- Add wali_id column to santri table
ALTER TABLE "public"."santri" 
ADD COLUMN IF NOT EXISTS "wali_id" UUID REFERENCES "auth"."users"("id");

-- Add index for performance
CREATE INDEX IF NOT EXISTS "santri_wali_id_idx" ON "public"."santri" ("wali_id");
