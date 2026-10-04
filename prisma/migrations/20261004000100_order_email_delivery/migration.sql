CREATE TABLE "OrderEmailDelivery" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "kind" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "payload" JSONB,
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "firstAttemptAt" TIMESTAMP(3),
  "startedAt" TIMESTAMP(3),
  "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "acceptedAt" TIMESTAMP(3),
  "providerId" TEXT,
  "error" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OrderEmailDelivery_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "OrderEmailDelivery_orderId_kind_key" ON "OrderEmailDelivery"("orderId", "kind");
CREATE INDEX "OrderEmailDelivery_status_nextAttemptAt_idx" ON "OrderEmailDelivery"("status", "nextAttemptAt");
ALTER TABLE "OrderEmailDelivery" ADD CONSTRAINT "OrderEmailDelivery_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
