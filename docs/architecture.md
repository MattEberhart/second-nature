# Architecture

## Business context

**Second Nature Creative Studio** is Lydia's Charlotte, NC business (pickup in the Wesley
Heights area). The site sells two things:

1. **Gatherings / Event Rentals** — curated wedding and event tabletop rentals (linens,
   napkins, chargers, plates, flatware, custom details) with three fulfillment modes:
   customer pickup, delivered rentals (fee by round-trip distance), and full service
   (delivery + setup/styling + post-event pickup).
2. **Studio / Creative & Digital Consulting** — marketing strategy and design services
   ($175/hr consulting, $65/hr design & production, retainers from $1,500/mo, custom
   project quotes). Leads come through the contact form.

The core product is the **estimate builder**: visitors build a non-binding rental quote
from the public catalog, optionally save it (emailed private resume link), and book a
free Google Meet review with Lydia. Lydia works leads from a private dashboard with a
lightweight CRM.

People referenced in code/docs: **Lydia** (owner; "Lydia's Dashboard", notifications,
calendar owner). Business email: `hello@secondnaturecreative.com`.

## Stack

| Concern | Choice |
| --- | --- |
| Framework | **Next.js 16.2** App Router, React 19.2, TypeScript 5 (see `AGENTS.md`: this Next has breaking changes — read `node_modules/next/dist/docs/` before writing code) |
| Styling | Tailwind CSS v4 (`@theme` in `app/globals.css`), shadcn (`components.json`, base-ui primitives in `components/ui/`), `tw-animate-css`, `lucide-react` icons |
| Validation | Zod 4 (`lib/estimator/validation.ts`, `lib/estimator/admin-schemas.ts`) |
| Database / auth | Supabase Postgres (project `yrincjetscfhcjtuwlkl`, `us-east-1`) via `@supabase/supabase-js` (service role) and `@supabase/ssr` (cookie auth for admins) |
| Email | Resend + React Email templates in `emails/` |
| Calendar | Google Calendar API (freeBusy + event insert with Meet) using an encrypted stored refresh token |
| Distance | Google Routes API (`computeRoutes`, distance only) |
| Images | Static assets in `public/`; admin uploads to Cloudflare Images (`imagedelivery.net`, allowed in `next.config.ts`) |
| Hosting | Vercel project `second-nature` |

No test suite exists. Scripts: `npm run dev | build | start | lint`.

## Directory map

```
app/
  page.tsx                 Home (three tiles: About, Event Rentals, Consulting)
  about/ studio/ contact/  Marketing pages; contact/inquiry-form.tsx is the lead form
  gatherings/              Event Rentals landing
    estimate/              Build Your Estimate (server loads catalog → EstimateBuilder)
    collections/           Shop By Collections index + [slug] (EstimateBuilder scoped to a collection)
  consultation/            Free consultation booking (no cart)
  estimate/[token]/        Resume a saved estimate from the emailed link
  terms/ privacy/          Legal pages (components/legal-page.tsx)
  admin/                   Lydia's dashboard (server components + client controls)
    customers/[id]/        CRM contact profile, notes, status
    estimates/[id]/        Quote detail
  api/                     Route handlers — see api.md
  auth/callback/           Supabase OAuth code exchange (+ calendar token capture)
components/
  estimate/estimate-builder.tsx   The ~1.4k-line client app for shop → review → schedule → confirmed
  nav.tsx footer.tsx logo.tsx legal-page.tsx
  ui/                      shadcn primitives (button, input, label, select, textarea)
emails/                    React Email templates + components/email-shell.tsx
lib/
  admin-auth.ts            ADMIN_EMAILS allowlist, calendar-owner check, requireAdmin()
  supabase/admin.ts        Service-role client (server-only) + isSupabaseConfigured()
  supabase/auth.ts         Cookie-bound SSR client for admin sessions
  security.ts              Opaque tokens, SHA-256 token hashing, AES-256-GCM secret encryption
  submission-security.ts   Rate limiting (claim_submission_attempt RPC) + honeypot check
  consent.ts consent-copy.ts  Consent evidence logging + the exact checkbox copy
  crm.ts                   upsertContact() / recordContactActivity()
  estimator/
    types.ts money.ts      Shared types; formatMoney(cents)
    catalog-seed.ts        Canonical launch catalog (21 products) — fallback + seed source
    catalog-private.ts     Supplier/internal names (server-only, never public)
    data.ts                getPublicCatalog / getPublicCollections / seedLaunchCatalog
    estimate-service.ts    priceCart / saveEstimate / getEstimateByToken
    delivery.ts            Google Routes distance → fee
    calendar.ts            Availability slot generation + Google event creation
    email.ts               All Resend sends
    settings.ts            app_settings get/set with defaults
    validation.ts admin-schemas.ts   Zod schemas
supabase/migrations/       SQL migrations (apply in filename order)
public/                    Photography (PNG), logo, catalog category SVG placeholders
```

## Server / client boundary

- Every module that touches secrets or the service-role client starts with
  `import "server-only"`. Keep it that way; `catalog-private.ts` must never reach a client
  bundle or the public catalog API.
- **All database access is server-side with the service role.** RLS is enabled on every
  table and `anon`/`authenticated` have no grants, so the browser can never query Supabase
  directly. The anon key is used only for the admin OAuth session cookie.
- Client components (`"use client"`): `estimate-builder.tsx`, `nav.tsx`, the contact and
  consultation forms, and admin controls (`admin-controls.tsx`, `catalog-manager.tsx`,
  `customer-controls.tsx`). They talk to the server only through `app/api/*` with `fetch`.
- **Prices are never trusted from the client.** `priceCart()` re-prices every cart line from
  the catalog, and the schedule route recomputes delivery fees server-side.

## Graceful degradation

The site is designed to run with partial configuration:

| Missing | Behaviour |
| --- | --- |
| Supabase env | Catalog falls back to `launchCatalog`; collections to a hard-coded "Summer Blues"; save/schedule/contact return 503; `/admin` shows a setup card |
| Catalog table empty | `launchCatalog` is served |
| `curated_collections` table missing (`PGRST205`) | Fallback collections |
| `catalog_variants.image_path` column missing | Legacy select without it |
| Google Calendar not connected | Availability ignores Google busy times; booking fails with "not connected yet" |
| Routes API key / origin | Delivery estimate errors (pickup still works) |
| Resend | Saves still succeed; email status recorded as `failed`, user gets the resume link inline |

## Environment variables

| Var | Scope | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | public | Absolute links in emails and OAuth redirects |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public | Supabase project + admin auth |
| `SUPABASE_SERVICE_ROLE_KEY` | server | All data access |
| `ADMIN_EMAILS` | server | Comma-separated dashboard allowlist (falls back to `ADMIN_EMAIL`, then `LYDIA_EMAIL`) |
| `CALENDAR_OWNER_EMAIL` | server | Only account allowed to connect the booking calendar |
| `LYDIA_EMAIL` | server | Notification recipient (independent of dashboard access) |
| `APP_ENCRYPTION_KEY` | server | AES key material for the refresh token; HMAC key for IP/fingerprint hashes |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | server | Token refresh for Calendar |
| `GOOGLE_BOOKING_CALENDAR_ID` | server | Calendar that receives consultation events (default `primary`) |
| `GOOGLE_MAPS_API_KEY`, `DELIVERY_ORIGIN_ADDRESS` | server | Routes API; origin is private and never returned to the browser |
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL` | server | Email sending |
| `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_IMAGES_API_TOKEN` | server | Admin image uploads |

Never move a server-scope variable to a `NEXT_PUBLIC_` name.
