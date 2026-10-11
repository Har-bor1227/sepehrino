-- Add an optional Hozorino account ID to Sepehrino users.
ALTER TABLE "users"
ADD COLUMN "hozorinoUserId" TEXT;

-- Ensure one Hozorino account cannot be linked to multiple users.
CREATE UNIQUE INDEX "users_hozorinoUserId_key"
ON "users"("hozorinoUserId");