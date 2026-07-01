-- AlterTable
ALTER TABLE "Venue" ADD COLUMN     "defaultCloseTime" TEXT NOT NULL DEFAULT '17:00',
ADD COLUMN     "defaultOpenTime" TEXT NOT NULL DEFAULT '08:00',
ADD COLUMN     "defaultRate" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "defaultRateType" TEXT NOT NULL DEFAULT 'HOURLY';

-- CreateTable
CREATE TABLE "VenueDateConfig" (
    "id" TEXT NOT NULL,
    "venueId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "rate" DOUBLE PRECISION,
    "rateType" TEXT,
    "openTime" TEXT,
    "closeTime" TEXT,
    "isClosed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VenueDateConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VenueDateConfig_venueId_date_key" ON "VenueDateConfig"("venueId", "date");

-- AddForeignKey
ALTER TABLE "VenueDateConfig" ADD CONSTRAINT "VenueDateConfig_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE CASCADE ON UPDATE CASCADE;
