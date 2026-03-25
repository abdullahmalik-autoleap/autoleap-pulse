/*
  Warnings:

  - Added the required column `channel` to the `SupportTicket` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shopName` to the `SupportTicket` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ticketNumber` to the `SupportTicket` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "SignupEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "shopName" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "shopType" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "trialStart" DATETIME NOT NULL,
    "convertedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "RevenueSnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "mrr" REAL NOT NULL,
    "arr" REAL NOT NULL,
    "newMRR" REAL NOT NULL,
    "expansionMRR" REAL NOT NULL,
    "contractionMRR" REAL NOT NULL,
    "churnMRR" REAL NOT NULL,
    "netNewMRR" REAL NOT NULL,
    "starterRevenue" REAL NOT NULL,
    "proRevenue" REAL NOT NULL,
    "enterpriseRevenue" REAL NOT NULL,
    "avgRevenuePerShop" REAL NOT NULL,
    "ltv" REAL NOT NULL,
    "paybackPeriod" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ChurnEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "shopName" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "mrrImpact" REAL NOT NULL,
    "reason" TEXT NOT NULL,
    "tenure" INTEGER NOT NULL,
    "region" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "DailySupportMetric" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "openTickets" INTEGER NOT NULL,
    "newTickets" INTEGER NOT NULL,
    "resolvedTickets" INTEGER NOT NULL,
    "avgFirstResponseMin" INTEGER NOT NULL,
    "avgResolutionHrs" REAL NOT NULL,
    "csatScore" REAL NOT NULL,
    "slaBreaches" INTEGER NOT NULL,
    "ticketsByCategory" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SupportTicket" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ticketNumber" TEXT NOT NULL,
    "shopName" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "channel" TEXT NOT NULL,
    "assignee" TEXT,
    "firstResponseAt" DATETIME,
    "resolvedAt" DATETIME,
    "csat" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_SupportTicket" ("category", "createdAt", "id", "priority", "resolvedAt", "status", "title") SELECT "category", "createdAt", "id", "priority", "resolvedAt", "status", "title" FROM "SupportTicket";
DROP TABLE "SupportTicket";
ALTER TABLE "new_SupportTicket" RENAME TO "SupportTicket";
CREATE UNIQUE INDEX "SupportTicket_ticketNumber_key" ON "SupportTicket"("ticketNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "RevenueSnapshot_date_key" ON "RevenueSnapshot"("date");

-- CreateIndex
CREATE UNIQUE INDEX "DailySupportMetric_date_key" ON "DailySupportMetric"("date");
