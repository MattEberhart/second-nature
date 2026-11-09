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

These were observed on 2026-11-09; confirm before fixing.

1. **Settings save clobbers weekly hours** — `PATCH /api/admin/settings` hard-codes
   `weekly` and `timeZone`, so any custom hours written directly to `app_settings` are lost.
2. **Collection update isn't atomic** — members/images are deleted then reinserted in
   separate calls; a failure mid-way leaves an emptied collection.
3. **Inventory PATCH deletes omitted variants**, which cascades to collection members that
   referenced them.
4. **`/api/delivery/estimate` is unauthenticated and not rate-limited** but calls the paid
   Google Routes API. A quota + budget alert is the only guard (per SETUP.md).
5. **`/api/estimates/save` rate-limits after parsing** (other routes limit first), and the
   save flow records no consent.
6. **Shared localStorage cart across pages** — the cart key is the same on
   `/gatherings/estimate` and collection pages. On a collection page, lines for products
   outside that collection are hidden from the cart UI but still submitted and priced.
7. **CRM upsert overwrites name/phone** with whatever the latest submission says.
8. **Customers search** filters the latest 250 contacts in memory, not in SQL.
9. **Availability race** — the slot is re-checked at booking time, and
   `unique (starts_at, ends_at)` on `appointments` backs it up; a conflicting insert
   surfaces as a 500 rather than a friendly 409.
10. **Supabase free plan** can pause the project after inactivity, which would take down
    lead capture.
11. Root `README.md` was create-next-app boilerplate (replaced 2026-11-09); unused
    template SVGs remain in `public/`.

## Handy commands

```bash
npm run dev        # http://localhost:3000 — estimator works without Supabase using launchCatalog
npm run lint
npx tsc --noEmit
npm run build
```
