# Admin phone notifications

Implemented with Web Push, a push-only service worker, database subscriptions, and a durable per-device delivery queue. The existing order notification is saved in the same write as its order, so recovery discovers orders even if the immediate background task crashes. Each registered owner/manager device receives future order and payment alerts. No customer details appear on the lock screen.

## Server setup

1. Install dependencies and run `node scripts/setup-admin-push.mjs`. This generates a stable VAPID key pair and cron secret in ignored `.env.local` without printing secrets. Do not regenerate keys after registering devices.
2. Apply `prisma/migrations/20261004000200_admin_push/migration.sql` to the intended database using your migration workflow. For a database with complete migration history use `npx prisma migrate deploy`; do not reset an existing database. Generate the client with `npx prisma generate`.
3. Set `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`, and `CRON_SECRET` in the hosting environment. Keep the private key and cron secret server-only. Deploy the application over HTTPS.
4. `vercel.json` schedules `/api/cron/admin-notifications` daily at 08:00 UTC for the current Hobby plan. New orders dispatch immediately; recovery without an open page otherwise waits for the daily job. For prompt retries, use an external scheduler every minute, sending `Authorization: Bearer <CRON_SECRET>` to this route. The existing custom `ADMIN_NOTIFICATIONS_CRON_SECRET` remains supported if `CRON_SECRET` is unset. A scheduler is required for recovery without any page open.

## Phone setup

Open Admin → Notifications on the phone, press **Activer sur cet appareil**, and allow notifications. Press **Envoyer un test** and check the phone's notification tray. On iPhone/iPad (iOS 16.4+), first add the HTTPS site to the Home Screen from Safari, then activate inside the installed app. Register every phone separately. Localhost is suitable for desktop development; a phone needs a reachable HTTPS deployment.

## Reliability and operations

Temporary network errors, timeouts, rate limits and provider server errors retry with exponential backoff, capped at one hour. Provider acceptance is recorded separately from actual device display. Interrupted claims recover after two minutes. Expired subscriptions (404/410) are removed and must be activated again. Permanent provider failures are visible in the device's settings; fix the VAPID configuration and reset affected FAILED rows to PENDING to retry. Inactive or demoted staff devices are removed by the worker.

Retries may reach the device more than once when a provider response is lost. Stable notification tags replace duplicates in the notification tray. The worker never caches admin pages or API responses. Device delivery still depends on notification permissions, OS settings, connectivity, and the browser's push service; no web push implementation can guarantee every alert is displayed. The saved admin feed remains the source of truth.

## Acceptance check

Run `npm run test:notifications`, `node --test tests/admin-push.test.mjs`, and `npx tsc --noEmit`. On a registered phone, verify the test alert, close the panel, place a real test order, and confirm its alert opens the correct protected order page. Verify cron requests without a secret return 401. Monitor cron execution and pending/failed deliveries after deployment.
