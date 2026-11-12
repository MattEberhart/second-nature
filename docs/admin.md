# Lydia's dashboard (`/admin`)

Server-rendered, `force-dynamic`. Access: Google sign-in through Supabase Auth, allowed only
for emails in `ADMIN_EMAILS`. Dashboard sign-in requests identity only — it does **not**
grant calendar or mail access. Sub-pages redirect to `/admin` when not signed in. Each page and route still checks auth
itself; `proxy.ts` (matcher `/admin/:path*`, `/api/admin/:path*`) only refreshes the Supabase
session cookie so Lydia stays signed in past the ~1 hour access-token lifetime.

## Pages

| Route | File | Shows |
| --- | --- | --- |
| `/admin` | `app/admin/page.tsx` | Clickable stat cards (customers → `/admin/customers`, upcoming calls → `#consultations`, saved quotes → `/admin/estimates`, published collections → `#collections`, which switches `CatalogManager` to collections), recent inquiries (with Lydia-email delivery status), upcoming consultations (Meet links) + recent estimates, `CatalogManager`, then `AdminControls` (collapsed advanced settings) last. Header has only Sign out. |
| `/admin/customers` | `app/admin/customers/page.tsx` | Latest 250 contacts by activity with inquiry/quote/call counts; `?q=` filters name/email/phone in memory |
| `/admin/customers/[id]` | `app/admin/customers/[id]/page.tsx` + `customer-controls.tsx` | Profile, inquiries, estimates, appointments, notes, activity timeline; status select and add-note form |
| `/admin/estimates` | `app/admin/estimates/page.tsx` | Latest 250 quotes, status + resume-email status |
| `/admin/estimates/[id]` | `app/admin/estimates/[id]/page.tsx` | Quote detail from snapshots |

If Supabase isn't configured the page renders a "Setup required" card pointing to `SETUP.md`.
OAuth errors arrive as `?error=` and are shown in a banner.

## CRM model

Every public submission upserts a `contacts` row by normalized email and appends to `contact_activities`. Lydia moves
contacts through `new → contacted → qualified → booked → closed` manually; nothing
changes status automatically. Name always follows the latest submission; phone follows it
only when the form supplied one. Search (`?q=`) runs in SQL (`ilike` on name, email,
phone; gaps between words match anything).

## Inventory & collections — `app/admin/catalog-manager.tsx`

Two modes:

- **Items**: create/edit a product (public name, category, material, description,
  image, active) and its variants (label, size, color,
  optional image, price in dollars → cents, active). Saving an existing item sends the
  full variant list; variants omitted are **deleted**.
- **Collections**: name, slug, description, header image, gallery images (≤ 20, with alt
  text), active, and members — whole products or individual variants. Saves are atomic. Public pages:
  `/gatherings/collections` and `/gatherings/collections/[slug]`, where the estimate
  builder is limited to the collection's products/variants.

Image fields accept a path in `public/` (e.g. `/catalog/table-linens.svg`) or an uploaded
Cloudflare Images URL. Uploads go through `POST /api/admin/uploads`; the token never
reaches the browser.

Private sourcing (supplier, internal name, SKU, acquisition cost) is stored in the DB but
not exposed by the inventory form or the public catalog.

## Settings & calendar — `app/admin/admin-controls.tsx`

- Availability: meeting length, buffer, minimum notice, booking horizon, busy calendar ids
  (`primary`, the consultations calendar id, and Lydia's shared personal free/busy calendar).
- Delivery: base fee, per round-trip mile, full-service starting fee.
- Calendar connection: shows the connected account; **Connect calendar** is only offered to
  `CALENDAR_OWNER_EMAIL`. Weekly hours (default Mon–Thu 10–4, Fri 10–2 ET) and the time
  zone are not editable in the UI; saving settings preserves whatever is stored.
