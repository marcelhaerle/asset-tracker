-- CreateTable
CREATE TABLE "ServiceSchedule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "intervalMonths" INTEGER NOT NULL,
    "lastServiceDate" DATETIME,
    "nextServiceDate" DATETIME NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "assetId" TEXT NOT NULL,
    CONSTRAINT "ServiceSchedule_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ServiceRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "serviceDate" DATETIME NOT NULL,
    "description" TEXT NOT NULL,
    "cost" REAL,
    "provider" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "serviceScheduleId" TEXT NOT NULL,
    CONSTRAINT "ServiceRecord_serviceScheduleId_fkey" FOREIGN KEY ("serviceScheduleId") REFERENCES "ServiceSchedule" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ServiceSchedule_assetId_key" ON "ServiceSchedule"("assetId");
