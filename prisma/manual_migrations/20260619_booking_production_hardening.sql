-- Production hardening for booking flow
-- 1) Align booking statuses with the app
-- 2) Preserve legacy "paid" rows by converting them to "pending"
-- 3) Add a DB-level uniqueness guard for hourly booking slots

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'BookingStatus'
  ) THEN
    BEGIN
      ALTER TYPE "BookingStatus" ADD VALUE IF NOT EXISTS 'expired';
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END;

    BEGIN
      ALTER TYPE "BookingStatus" ADD VALUE IF NOT EXISTS 'no_show';
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END;
  END IF;
END $$;

UPDATE "bookings"
SET "status" = 'pending'
WHERE "status"::text = 'paid';

CREATE UNIQUE INDEX IF NOT EXISTS "booking_items_courtId_date_startTime_key"
ON "booking_items" ("courtId", "date", "startTime");
