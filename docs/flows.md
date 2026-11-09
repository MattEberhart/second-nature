# Flows

Every flow that writes data follows the same skeleton:

1. `isSupabaseConfigured()` guard → 503 if not.
2. `enforceSubmissionRateLimit(request, scope, {limit, windowSeconds})` → 429.
3. Zod `safeParse` of the JSON body → 400 with the first issue message.
4. `upsertContact()` (CRM, keyed by normalized email) → write the subject row.
5. `recordSubmissionConsent()` (two `consent_events` rows) where the form has consent boxes.
6. Side effects (Google Calendar, Resend).
7. `recordContactActivity()` for the CRM timeline (usually `.catch(() => undefined)` — best effort).
8. On failure: compensate (delete the appointment / inquiry, roll estimate status back).

## 1. Contact inquiry — `/contact` → `POST /api/contact`

Form: `app/contact/inquiry-form.tsx`. Fields: name, email, phone, interest
(`gatherings | studio | both`, pre-selectable from CTA query params), event date (required
only for `gatherings`), message, a hidden **`website` honeypot**, and two consent boxes.

Server (`app/api/contact/route.ts`):
- Rate limit scope `contact-inquiry`, 6 per 15 min.
- Honeypot filled → respond `{ok: true}` and silently drop.
- Upsert contact (`source: "contact"`), insert `contact_inquiries`, record consent
  (`contact-form` / `contact-inquiry`), record activity `inquiry-created`.
- Emails are sent **after the response** using `after()` from `next/server`:
  customer acknowledgement + owner notification (with a deep link to
  `/admin/customers/{contactId}`). Results are written back to
  `owner_email_status`, `customer_email_status`, `email_error`, `notified_at`.
- If anything before the response throws, the inquiry row is deleted.

## 2. Free consultation — `/consultation` → `POST /api/consultations/schedule`

Form: `app/consultation/consultation-form.tsx`. Loads slots from `GET /api/availability`,
groups them by day (America/New_York), user picks one.

Server:
- Rate limit `consultation-booking`, 6 / 15 min.
- **Re-runs `listAvailability()`** and requires the exact `slotStart` to still be free → 409
  "That time was just taken" otherwise.
- Upsert contact (`consultation`), insert `appointments` with `status: "pending"`.
  The `unique (starts_at, ends_at)` constraint is the last line of defence against double booking.
- Record consent (`consultation-form`).
- `createCalendarMeeting()` → event on `GOOGLE_BOOKING_CALENDAR_ID` with a Meet link, the
  customer as attendee, `sendUpdates=all` (Google sends the invite). Event id is a
  deterministic hash of the appointment id (idempotent retries).
- Update appointment → `confirmed` with `google_event_id`, `google_meet_url`.
- Resend confirmation + owner notification (failure ignored — Google already invited them).
- On error: delete the appointment.

## 3. Estimate builder — `/gatherings/estimate`

`app/gatherings/estimate/page.tsx` (server) loads `getPublicCatalog()` and renders
`components/estimate/estimate-builder.tsx`. The same component powers
`/gatherings/collections/[slug]` (scoped product list + heading/intro props) and
`/estimate/[token]` (resume).

Client stages: `shop → review → schedule → confirmed`.

- **Shop**: filter by category and tier, pick a variant + quantity, add to cart (max 10,000
  per line). Cart persists in `localStorage["second-nature-estimate-v1"]`; the last resume
  token in `localStorage["second-nature-estimate-token-v1"]`.
- **Save for later** (modal, any stage): `POST /api/estimates/save` → server prices the
  cart, upserts the contact, saves via the `save_estimate_with_items` RPC (status `draft`),
  emails a private link `/estimate/{token}`. If email fails the response includes the URL
  and a warning so the user can copy it.
- **Review**: event details (date or "Not sure yet", guest count, venue, address,
  fulfillment, notes, consent). On continue the client calls
  `POST /api/delivery/estimate` (unless pickup) and `GET /api/availability`.
- **Schedule**: pick a slot → `POST /api/estimates/schedule`.
- **Confirmed**: shows the Meet link and appointment label; cart is cleared.

### Schedule (server) — `app/api/estimates/schedule/route.ts`

1. Rate limit `estimate-booking`, 6 / 15 min; parse `scheduleSchema`.
2. Re-validate slot against `listAvailability()` (409 if gone).
3. **Recompute delivery** server-side via `calculateDelivery()` (client numbers ignored).
4. `saveEstimate(... status: "awaiting-scheduling")` — reuses the row if a resume token was sent.
5. Insert appointment (`pending`) linked to estimate + contact; record consent
   (`estimate-consultation-form`).
6. Create Google event; mark appointment `confirmed`, estimate `scheduled`.
7. Activity `appointment-booked`; send customer confirmation (itemised quote + resume link)
   and owner notification. Email failure → `warning` in the response, booking stands.
8. On failure: delete appointment; estimate rolled back to `draft` only if still `awaiting-scheduling`.

### Resume — `/estimate/[token]`

Page passes `resumeToken` to the builder, which calls `GET /api/estimates/resume/{token}`.
Tokens are 32 random bytes (base64url); only the SHA-256 hash is stored
(`estimates.resume_token_hash`). The route returns cart lines + details (no ids, no prices —
the client re-derives prices from the current catalog).

## 4. Delivery pricing

`lib/estimator/delivery.ts`: Google Routes `computeRoutes` (DRIVE, traffic-unaware) from
the private `DELIVERY_ORIGIN_ADDRESS` to the venue. Fee =
`baseFeeCents + roundTripMiles × roundTripPerMileCents`; full service adds
`fullServiceStartingFeeCents`. Defaults: $75 base, $2 per round-trip mile, $250 full
service — editable in `/admin` (`app_settings.delivery`).

## 5. Availability

`lib/estimator/calendar.ts#listAvailability`:
- Settings from `app_settings.availability` (defaults: America/New_York, 30-min meetings,
  15-min buffer, 24h minimum notice, 60-day horizon, Mon–Thu 10–4, Fri 10–2).
- Busy = Google freeBusy across `busyCalendarIds` **plus** non-cancelled rows in `appointments`.
- Slots step by `duration + buffer`; a slot is dropped if its buffered window overlaps any busy period.
- Time-zone math is done by hand (`zonedToUtc` / `partsInZone`) with `Intl` — no date library.

## 6. Admin sign-in — `/admin`

- `GET /api/admin/auth/start` → Supabase `signInWithOAuth({provider: "google"})`,
  identity scopes only, redirect to `/auth/callback?next=/admin`.
- `/auth/callback` exchanges the code; if the email is not in `ADMIN_EMAILS` it signs out
  and redirects with an error.
- Pages call `getAdminUser()`; API routes call `requireAdmin()` (throws → 400/401).
- `POST /api/admin/auth/logout` signs out (303 back to `/admin`).

## 7. Calendar connect (calendar owner only)

- `GET /api/admin/calendar/connect` — only if the signed-in admin is `CALENDAR_OWNER_EMAIL`.
  Requests `calendar.events`, `calendar.freebusy`, `calendar.calendarlist.readonly` with
  `access_type=offline&prompt=consent`, redirecting to `/auth/callback?...&calendar=connect`.
- The callback re-checks the owner, requires `provider_refresh_token`, encrypts it with
  AES-256-GCM (`encryptSecret`) and upserts `oauth_connections` (`provider = 'google'`, single row).
- Every Calendar call mints a fresh access token from that refresh token.

## 8. Consent capture

`lib/consent.ts`: each consented submission writes **two** append-only rows to
`consent_events` — `inquiry-communications` (always `granted`; the checkbox is required)
and `email-marketing` (`granted` or `declined`). Stored evidence: exact disclosure text
(`lib/consent-copy.ts`), `CONSENT_DISCLOSURE_VERSION` (`2026-11-09`), source, subject,
HMAC'd IP, user agent, referrer. The view `current_email_marketing_preferences` gives the
latest marketing state per email. If you change checkbox copy, bump the version.

Note: the estimate **save** flow does not capture consent; only booking flows and the
contact form do.
