# API reference

All handlers are App Router route handlers returning `Response.json`. Errors are
`{ error: string }`. Dynamic params use the generated `RouteContext<"/path/[param]">` type
and `await context.params`.

## Public

| Method & path | File | Rate limit | Notes |
| --- | --- | --- | --- |
| `GET /api/catalog` | `app/api/catalog/route.ts` | — | `{ products: CatalogProduct[] }` (public fields only) |
| `GET /api/availability` | `app/api/availability/route.ts` | — | `force-dynamic`; `{ slots: {start,end}[] }` ISO UTC |
| `POST /api/delivery/estimate` | `app/api/delivery/estimate/route.ts` | `delivery-estimate` 20/15m (when Supabase is configured) | Body `{address, fulfillment: "delivery"\|"full-service"}` → `DeliveryEstimate`; 422 on routing failure. Each call hits the paid Google Routes API |
| `POST /api/contact` | `app/api/contact/route.ts` | `contact-inquiry` 6/15m | Honeypot `website`; emails via `after()` |
| `POST /api/consultations/schedule` | `app/api/consultations/schedule/route.ts` | `consultation-booking` 6/15m | Body = `consultationSchema`; returns `{appointmentLabel, meetUrl}`; 409 if slot taken (including a simultaneous-booking unique violation) |
| `POST /api/estimates/save` | `app/api/estimates/save/route.ts` | `estimate-save` 10/15m | Body `{cart, details, resumeToken?}` — details need name, email, `communicationsConsent: true` and `marketingConsent`; records consent → `{id, resumeToken, resumeUrl, emailSent, warning?}` |
| `GET /api/estimates/resume/[token]` | `app/api/estimates/resume/[token]/route.ts` | — | Token length 20–200; returns `{cart, details}` |
| `POST /api/estimates/schedule` | `app/api/estimates/schedule/route.ts` | `estimate-booking` 6/15m | Body = `scheduleSchema`; returns `{appointmentId, appointmentLabel, meetUrl, resumeToken, totalCents, warning?}` |

## Auth

| Method & path | Notes |
| --- | --- |
| `GET /api/admin/auth/start` | Starts Google OAuth (identity only) |
| `POST /api/admin/auth/logout` | Signs out, 303 → `/admin` |
| `GET /api/admin/calendar/connect` | Calendar-owner only; offline Calendar scopes |
| `GET /auth/callback` | Code exchange; allowlist check; stores encrypted refresh token when `calendar=connect`. `next` must start with `/` |

## Admin (all call `requireAdmin()`)

| Method & path | Body / effect |
| --- | --- |
| `PATCH /api/admin/settings` | `{availability:{durationMinutes,bufferMinutes,minimumNoticeHours,bookingHorizonDays,busyCalendarIds}, delivery:{baseFeeCents,roundTripPerMileCents,fullServiceStartingFeeCents}}`. Merged over the stored availability, so `weekly` hours and `timeZone` are preserved |
| `PATCH /api/admin/catalog/[id]` | `{active}` toggle on a product (legacy) |
| `POST /api/admin/catalog/seed` | Upsert `launchCatalog` + private metadata. **Don't run in prod** — the placeholder inventory was cleared 2026-11-09 so Lydia could start fresh; this would bring it back |
| `POST /api/admin/inventory` | `inventoryItemSchema` → new product id `slug-xxxxxxxx`, variants inserted; 201 `{id}` |
| `PATCH /api/admin/inventory/[id]` | Full replace: update product, upsert variants, **delete variants not in the payload** |
| `DELETE /api/admin/inventory/[id]` | Deletes product (variants + collection members cascade; estimate snapshots survive) |
| `POST /api/admin/collections` | `curatedCollectionSchema` → 201 `{id}` (same RPC) |
| `PATCH /api/admin/collections/[id]` | Full replace of the collection, members and images in one transaction (`save_curated_collection` RPC) |
| `DELETE /api/admin/collections/[id]` | Cascade delete |
| `PATCH /api/admin/customers/[id]` | `{status}` → contact status + activity |
| `POST /api/admin/customers/[id]/notes` | `{body}` → note + activity |
| `POST /api/admin/uploads` | multipart `file` (JPG/PNG/WebP/AVIF ≤ 10 MB), `kind` (`item\|variant\|collection-header\|collection-gallery`), `label` → Cloudflare Images; 201 `{path, imageId}` where `path` is the `/public` variant URL |
