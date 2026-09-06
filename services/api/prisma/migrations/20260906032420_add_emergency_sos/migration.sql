-- CreateEnum
CREATE TYPE "EmergencyEventType" AS ENUM ('RESIDENT_SOS', 'GUARD_SOS', 'BROADCAST', 'EVACUATION_START');

-- CreateEnum
CREATE TYPE "EvacuationUnitState" AS ENUM ('UNKNOWN', 'SAFE', 'UNACCOUNTED');

-- CreateTable
CREATE TABLE "EmergencyEvent" (
    "id" TEXT NOT NULL,
    "societyId" TEXT NOT NULL,
    "type" "EmergencyEventType" NOT NULL,
    "triggeredByUserId" TEXT NOT NULL,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "EmergencyEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvacuationUnitStatus" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "status" "EvacuationUnitState" NOT NULL DEFAULT 'UNKNOWN',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EvacuationUnitStatus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EmergencyEvent_societyId_idx" ON "EmergencyEvent"("societyId");

-- CreateIndex
CREATE INDEX "EvacuationUnitStatus_eventId_idx" ON "EvacuationUnitStatus"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "EvacuationUnitStatus_eventId_unitId_key" ON "EvacuationUnitStatus"("eventId", "unitId");

-- AddForeignKey
ALTER TABLE "EmergencyEvent" ADD CONSTRAINT "EmergencyEvent_societyId_fkey" FOREIGN KEY ("societyId") REFERENCES "Society"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvacuationUnitStatus" ADD CONSTRAINT "EvacuationUnitStatus_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "EmergencyEvent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
