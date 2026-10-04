CREATE TABLE "AdminOrderNotification" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "event" TEXT NOT NULL,
  "readAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "phoneStatus" TEXT NOT NULL DEFAULT 'DISABLED',
  "phoneTo" TEXT,
  "phoneChannel" TEXT,
  "phoneStartedAt" TIMESTAMP(3),
  "phoneAcceptedAt" TIMESTAMP(3),
  "phoneReference" TEXT,
  "phoneError" TEXT,
  CONSTRAINT "AdminOrderNotification_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AdminOrderNotification_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "AdminOrderNotification_orderId_event_key" ON "AdminOrderNotification"("orderId", "event");
CREATE INDEX "AdminOrderNotification_readAt_createdAt_idx" ON "AdminOrderNotification"("readAt", "createdAt");
CREATE INDEX "AdminOrderNotification_phoneStatus_createdAt_idx" ON "AdminOrderNotification"("phoneStatus", "createdAt");
