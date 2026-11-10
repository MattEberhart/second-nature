# Conventions & gotchas

## Conventions to follow

- **Next.js 16**: read `node_modules/next/dist/docs/` before using an API you think you
  know. Patterns already in use here:
  - `params` / `searchParams` are **Promises** — always `await` them.
  - Route handlers type dynamic segments with the generated global
    `RouteContext<"/api/foo/[id]">`.
  - `after()` from `next/server` for post-response work (contact emails).
  - `export const dynamic = "force-dynamic"` on admin pages and `/api/availability`.
- **Server-only**: anything touching env secrets, Supabase, Google, Resend, or Cloudflare
  imports `"server-only"`. Client code only uses `fetch("/api/...")`.
- **Money is integer cents** everywhere (`*_cents` columns, `unitPriceCents`). Format with
  `formatMoney()` (drops `.00` on whole dollars). Admin forms convert dollars ↔ cents.
- **Time zone** is `America/New_York` for all user-facing times; store ISO UTC.
- **Validation**: add Zod schemas to `lib/estimator/validation.ts` (public) or
  `lib/estimator/admin-schemas.ts` (admin). Return `parsed.error.issues[0].message` as the error.
- **Public write routes** must: check `isSupabaseConfigured()`, call
  `enforceSubmissionRateLimit` with a new scope name, upsert the CRM contact, record consent
  if the form shows consent boxes, log a `contact_activities` row, and compensate on failure.
- **Admin routes** start with `await requireAdmin()`; admin pages use `getAdminUser()` and redirect.
  Any admin write to products, variants or collections must call `revalidatePublicCatalog()`
  (`lib/estimator/revalidate.ts`) before returning: `/gatherings/*` pages are prerendered
  snapshots of the catalog and otherwise only refresh on the next deploy.
- **Emails**: add a template in `emails/` wrapped in `EmailShell`, send from
  `lib/estimator/email.ts`, always pass an `idempotencyKey`.
- **Migrations**: new file `supabase/migrations/YYYYMMDDHHMMSS_name.sql`; enable RLS, revoke
  from `anon, authenticated`, grant to `service_role`. Code should tolerate the migration not
  being applied yet when practical (see the `PGRST204/42703/PGRST205` fallbacks in `lib/estimator/data.ts`).
- **Catalog ids** are stable text slugs; estimates reference them, so don't rename ids —
  deactivate instead.
- No tests exist; verify with `npm run lint`, `npx tsc --noEmit`, and `npm run build`, then
  exercise the flow in the browser.

## Known sharp edges / TODO candidates

**Form submit buttons need `type="submit"`.** `components/ui/button.tsx` wraps Base UI's
`Button`, which renders `type="button"` by default, so a `<Button>` inside a `<form>` does
**not** submit it. This silently broke consultation booking, the estimate "Choose a
consultation time" step, "Email my private link" and the admin add-note form until each got an
explicit `type="submit"`. Any new form must set it.

**Supabase SSR sessions need `proxy.ts`.** Server Components can't write cookies, so
`getAuthSupabase()` alone can never persist a refreshed access token; once it expired (~1 hour)
`getAdminUser()` returned null and Lydia had to sign in with Google again. `proxy.ts` refreshes
the session before admin pages/routes render. Keep its matcher covering every admin path.

Open (confirm before fixing):

1. **Supabase free plan** can pause the project after inactivity (accepted for now;
   upgrade before relying on uninterrupted lead capture).
2. Unused create-next-app SVGs remain in `public/`.

By design:

- The localStorage cart is shared between `/gatherings/estimate` and collection pages —
  they are two ways to shop one estimate. Collection pages pass the full `catalog` to
  `EstimateBuilder`, so lines from elsewhere appear under "Also in your estimate" with a
  "This collection / Other pieces / Estimate subtotal" breakdown.
- Saving an item replaces its full option list; options Lydia removes are deleted (and drop
  out of collections via cascade). Estimate snapshots are unaffected.
- CRM contacts take the latest submission's name, and its phone when one is provided.
- Phone fields use `components/ui/phone-input.tsx` (formats US numbers as "(704) 555-0123"
  while typing). `lib/phone.ts` holds the shared helpers: the Zod `phoneSchema` requires 10 US
  digits (or a `+` international number) and stores the formatted string; admin views run
  `formatPhone()` so older raw rows display consistently. Admin customer search matches
  digit-only queries against formatted phones.

Fixed 2026-11-09: settings save no longer resets weekly hours/time zone; collection saves
are a single transaction (`save_curated_collection`); `/api/delivery/estimate` is rate
limited (20 / 15 min); estimate save rate-limits first and records consent; a save without
a phone no longer erases the contact's phone; `priceCart()` skips cart lines whose option was
removed or deactivated (400 only if nothing is left); customer search runs in SQL; a double-booking
race returns 409 "That time was just taken."; production migration history reconciled with the repo
(`supabase db push` is safe again).

## Handy commands

```bash
npm run dev        # http://localhost:3000 — estimator works without Supabase using launchCatalog
npm run lint
npx tsc --noEmit
npm run build
```
