/*
  Warnings:

  - The values [SUBMITTED,APPROVED,DECLINED] on the enum `ReservationStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
DO $$
BEGIN
  CREATE TYPE "BookingSource" AS ENUM ('CLIENT_SUBMITTED', 'VENUE_MANAGER_ASSISTED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- AlterEnum
BEGIN;
CREATE TYPE "ReservationStatus_new" AS ENUM ('PRELIMINARY_SUBMITTED', 'UNDER_REVIEW', 'PENCIL_BOOKED_DRAFT', 'RETURNED_FOR_COMPLETION', 'EXPIRED_AUTO_REJECTED', 'PAYMENT_PENDING', 'PAYMENT_OVERDUE', 'BOOKED_CONFIRMED', 'REJECTED', 'CANCELLED', 'BLOCKED');
ALTER TABLE "public"."Reservation" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Reservation" ALTER COLUMN "status" TYPE "ReservationStatus_new" USING (
  CASE "status"::text
    WHEN 'SUBMITTED' THEN 'PRELIMINARY_SUBMITTED'
    WHEN 'APPROVED' THEN 'BOOKED_CONFIRMED'
    WHEN 'DECLINED' THEN 'REJECTED'
    ELSE "status"::text
  END::"ReservationStatus_new"
);
ALTER TYPE "ReservationStatus" RENAME TO "ReservationStatus_old";
ALTER TYPE "ReservationStatus_new" RENAME TO "ReservationStatus";
DROP TYPE "public"."ReservationStatus_old";
ALTER TABLE "Reservation" ALTER COLUMN "status" SET DEFAULT 'UNDER_REVIEW';
COMMIT;

-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "bookingSource" "BookingSource" NOT NULL DEFAULT 'CLIENT_SUBMITTED',
ADD COLUMN     "paymentDeadline" TIMESTAMP(3),
ADD COLUMN     "paymentRemarks" TEXT,
ADD COLUMN     "pencilBookingDeadline" TIMESTAMP(3),
ADD COLUMN     "returnRemarks" TEXT,
ADD COLUMN     "submittedAt" TIMESTAMP(3),
ALTER COLUMN "status" SET DEFAULT 'UNDER_REVIEW';

-- AlterTable
ALTER TABLE "Venue" ADD COLUMN     "allowsPencilBooking" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "paymentDeadlineDays" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "pencilBookingDays" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "preliminaryRequirements" TEXT[],
ADD COLUMN     "supplementaryRequirements" TEXT[];
