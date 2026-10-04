BEGIN;
CREATE TABLE "AdminPushSubscription" (
  "id" TEXT NOT NULL,
  "endpoint" TEXT NOT NULL,
  "owner" TEXT NOT NULL,
  "p256dh" TEXT NOT NULL,
  "auth" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AdminPushSubscription_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "AdminPushSubscription_endpoint_key" ON "AdminPushSubscription"("endpoint");
CREATE TABLE "AdminPushDelivery" (
  "id" TEXT NOT NULL,
  "notificationId" TEXT NOT NULL,
  "subscriptionId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "startedAt" TIMESTAMP(3),
  "acceptedAt" TIMESTAMP(3),
  "error" TEXT,
  CONSTRAINT "AdminPushDelivery_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "AdminPushDelivery_notificationId_subscriptionId_key" ON "AdminPushDelivery"("notificationId", "subscriptionId");
CREATE INDEX "AdminPushDelivery_status_nextAttemptAt_idx" ON "AdminPushDelivery"("status", "nextAttemptAt");
ALTER TABLE "AdminPushDelivery" ADD CONSTRAINT "AdminPushDelivery_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "AdminOrderNotification"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AdminPushDelivery" ADD CONSTRAINT "AdminPushDelivery_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "AdminPushSubscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;
