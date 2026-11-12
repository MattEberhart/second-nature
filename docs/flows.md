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
  The `unique (starts_at, ends_at)` constraint is the last line of defence against double
  booking; a violation becomes `SlotTakenError` → 409 "That time was just taken."
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

- **Shop**: filter by category, pick a variant + quantity, add to cart (max 10,000
  per line). Cart persists in `localStorage["second-nature-estimate-v1"]`; the last resume
  token in `localStorage["second-nature-estimate-token-v1"]`.
- **Save for later** (modal, any stage): name, email, required communications consent,
  optional marketing consent → `POST /api/estimates/save` (rate limit `estimate-save`
  10/15m) → server prices the cart, upserts the contact, saves via the
  `save_estimate_with_items` RPC (status `draft`), records consent (`estimate-save-form` /
  `estimate-save`), emails a private link `/estimate/{token}`. If email fails the response includes the URL
  and a warning so the user can copy it.
- **Review**: event details (date or "Not sure yet", guest count, venue, address,
  fulfillment, notes, consent). The venue address is an `AddressAutocomplete` combobox
  (`components/estimate/address-autocomplete.tsx`) fed by `POST /api/places/autocomplete`
  (debounced 280 ms, ≥3 chars). Picking a suggestion stores its Google `placeId`, fills
  an empty venue name for named places, and immediately calls `POST /api/delivery/estimate`;
  the quote (miles + fee, plus full-service fee) shows beside the field. Switching
  delivery ↔ full service re-quotes (picked addresses, and typed ones already quoted);
  editing the text clears the place ID and the quote.
  Hand-typed addresses get an "estimate with this address" link. The "Your Estimate"
  sidebar (and the Schedule summary) use the shared `ChargesSummary`: Rentals + delivery
  + full-service lines and an "Estimated total"; until a quote exists the fee lines read
  "Add venue address" / "Pending" / "Calculating…" and the total is labelled "Total
  before delivery". On continue the client
  reuses a current quote or fetches one (unless pickup), then `GET /api/availability`.
- **Schedule**: pick a slot → `POST /api/estimates/schedule` (sends `venuePlaceId` when one
  was picked).
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

Stale lines: `priceCart()` silently skips cart lines whose variant is no longer active (the
builder already hides them); if none remain it throws `EmptyCartError` → 400.

### Resume — `/estimate/[token]`

Page passes `resumeToken` to the builder, which calls `GET /api/estimates/resume/{token}`.
Tokens are 32 random bytes (base64url); only the SHA-256 hash is stored
(`estimates.resume_token_hash`). The route returns cart lines + details (no ids, no prices —
the client re-derives prices from the current catalog).

## 4. Delivery pricing

`lib/estimator/delivery.ts`: Google Routes `computeRoutes` (DRIVE, traffic-unaware) from
the private `DELIVERY_ORIGIN_ADDRESS` to the venue (by `placeId` when the customer picked an
autocomplete suggestion, otherwise by address text). Fee =
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

All four forms capture consent: contact, consultation, estimate save, estimate booking.
