This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Tech stack

- **Next.js 16** (App Router, Turbopack)
- **Prisma 7** + **PostgreSQL** (Neon serverless)
- **Tailwind CSS**
- **Resend** for transactional email
- **jose** + **bcryptjs** for auth

## Environment variables

Copy [`.env.example`](./.env.example) to `.env.local` and fill in the values.
The same variables must be set in the Vercel dashboard for production.

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | ✅ | PostgreSQL (Neon) connection string |
| `JWT_SECRET` | ✅ | Signs session tokens — use a long random string |
| `ADMIN_PASSWORD` | ✅ | Password for the `/admin` panel |
| `NEXT_PUBLIC_SITE_URL` | ✅ (prod) | Public site URL (emails, invoices, SEO) |
| `NEXT_PUBLIC_BASE_URL` | ✅ (prod) | Base URL for OAuth redirects |
| `RESEND_API_KEY` | ✅ (email) | Resend API key — emails are skipped if unset |
| `RESEND_FROM` | ✅ (email) | Verified sender address |
| `ADMIN_EMAIL` | ✅ (email) | Recipient of new-order notifications |
| `CONTACT_EMAIL` | ✅ (email) | Recipient of contact-form messages |
| `PAYMENT_WEBHOOK_SECRET` | ⬜ | Payment webhook verification (not live yet) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | ⬜ | Optional Google sign-in |

## Database

```bash
# Apply the schema (non-destructive, additive changes)
npx prisma db push

# Regenerate the Prisma client after any schema change
npx prisma generate

# Seed initial data
npx tsx prisma/seed.ts
```

> ⚠️ Use `prisma db push`, **not** `prisma migrate dev` — the live database was
> created with `db push` and `migrate dev` would try to reset it (data loss).
> After a schema change, always regenerate the client **and restart** the dev
> server, otherwise the running server keeps the stale client.

## Deploy on Vercel

The project is linked to Vercel and auto-deploys from the connected Git branch.

1. Set every variable from [`.env.example`](./.env.example) in
   **Project → Settings → Environment Variables** (Production + Preview).
2. Verify the `RESEND_FROM` sending domain in the Resend dashboard.
3. Push to the deployment branch — the build runs `prisma generate && next build`.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
