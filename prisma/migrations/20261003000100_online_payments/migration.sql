ALTER TABLE "Order"
  ADD COLUMN IF NOT EXISTS "paymentProvider" TEXT,
  ADD COLUMN IF NOT EXISTS "paymentReference" TEXT,
  ADD COLUMN IF NOT EXISTS "paymentAmount" INTEGER,
  ADD COLUMN IF NOT EXISTS "paymentCurrency" TEXT NOT NULL DEFAULT 'EUR',
  ADD COLUMN IF NOT EXISTS "subscriptionInformation" TEXT,
  ADD COLUMN IF NOT EXISTS "subscriptionSentAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "subscriptionEmailId" TEXT,
  ADD COLUMN IF NOT EXISTS "subscriptionDeliveryKey" TEXT,
  ADD COLUMN IF NOT EXISTS "subscriptionSendingAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "subscriptionFirstAttemptAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "subscriptionDeliveryError" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "Order_paymentReference_key" ON "Order"("paymentReference");
CREATE UNIQUE INDEX IF NOT EXISTS "Order_subscriptionDeliveryKey_key" ON "Order"("subscriptionDeliveryKey");
CREATE TABLE IF NOT EXISTS "PaymentCheckout" (
  "orderId" TEXT NOT NULL PRIMARY KEY,
  "generation" TEXT NOT NULL,
  "sessionId" TEXT,
  "amount" INTEGER NOT NULL,
  "currency" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PaymentCheckout_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "PaymentCheckout_generation_key" ON "PaymentCheckout"("generation");
CREATE UNIQUE INDEX IF NOT EXISTS "PaymentCheckout_sessionId_key" ON "PaymentCheckout"("sessionId");
CREATE TABLE IF NOT EXISTS "PaymentWebhookEvent" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "orderId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PaymentWebhookEvent_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
