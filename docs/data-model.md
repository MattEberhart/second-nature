# Data model (Supabase Postgres)

Project: `second-nature` (`yrincjetscfhcjtuwlkl`, us-east-1, free plan — can pause when idle).

## Access model

- RLS is **enabled on every table** with **no policies**; `anon` and `authenticated` have
  all grants revoked. Only `service_role` (used by server code via
  `lib/supabase/admin.ts`) can read/write.
- RPC functions are `security invoker`, `search_path = ''`, and executable only by `service_role`.
- `consent_events` is insert/select only (append-only evidence log).

## Tables

### Catalog

**`catalog_products`** — `id text` PK (human slug, e.g. `foundation-linen`), `public_name`,
`category` (`table-linens | napkins | chargers | plates | flatware | custom-details`),
`tier` (`Essential | Premium | Luxe | Signature`), `material`, `description`, `image_path`,
`accent` (hex), `price_prefix` (e.g. "from"), private sourcing fields `internal_name`,
`supplier`, `sourcing_notes`, `active`, `sort_order`, timestamps.

**`catalog_variants`** — `id text` PK (e.g. `foundation-white-90`), `product_id` → products
(cascade), `label`, `size`, `color`, `image_path` (added 2026-11-09), `unit_price_cents`,
private `internal_sku`, `acquisition_cost_cents`, `active`, `sort_order`. Unique
`(product_id, id)` exists to support the collection-member composite FK.

**`curated_collections`** — uuid PK, unique kebab-case `slug`, `name`, `description`,
`header_image_path`, `active`, `sort_order`.
**`curated_collection_members`** — `collection_id`, `product_id`, nullable `variant_id`
(`NULL` = whole product; otherwise a specific variant, enforced to belong to the product
via composite FK). Partial unique indexes prevent duplicates.
**`curated_collection_images`** — gallery images with `alt_text`, `sort_order`.

### Leads & CRM

**`contacts`** — one row per person, unique `email_normalized` (lower/trim). `status`
(`new | contacted | qualified | booked | closed`), `first_source`
(`contact | estimate | consultation | imported`), `last_activity_at`.
**`contact_notes`** — internal notes (1–5000 chars) with `author_email`.
**`contact_activities`** — timeline: `activity_type` (e.g. `inquiry-created`,
`estimate-created`, `estimate-updated`, `appointment-booked`, `status-changed`,
`note-added`), `summary`, optional `subject_type/subject_id`, `actor_email`, `metadata jsonb`.

**`contact_inquiries`** — contact-form submissions: name/email/phone, `interest`
(`gatherings | studio | both`), `event_date`, `message`, `contact_id`, `status`
(`new | contacted | closed`), `owner_email_status` / `customer_email_status`
(`pending | sent | failed`), `email_error`, `notified_at`.

**`estimates`** — `resume_token_hash` (unique, SHA-256 of the token), `contact_id`,
customer name/email/phone, `event_date`, `date_undecided`, `guest_count`, venue name/address,
`fulfillment` (`pickup | delivery | full-service`), `notes`, `subtotal_cents`,
`delivery_fee_cents`, `full_service_fee_cents`, `total_cents`, `status`
(`draft | awaiting-scheduling | scheduled | reviewed | archived`), `catalog_version`,
`resume_email_status` / `resume_email_error` / `last_resume_email_at`.

**`estimate_items`** — **price snapshots**: `product_id`, `variant_id`,
`public_name_snapshot`, `variant_label_snapshot`, `unit_price_cents_snapshot`, `quantity`
(1–10000), `line_total_cents`. Catalog edits never change saved quotes.

**`appointments`** — `estimate_id` (nullable; null = standalone consultation), `contact_id`,
customer fields, `event_date`, `venue_name`, `notes`, `starts_at`, `ends_at`,
`meeting_type` (`google-meet`), `google_event_id` (unique), `google_meet_url`, `status`
(`pending | confirmed | cancelled`). **`unique (starts_at, ends_at)`** blocks double booking.

### Compliance & ops

**`consent_events`** — append-only; see [flows.md §8](flows.md#8-consent-capture).
`subject_type`: `contact-inquiry | consultation | estimate-consultation | estimate-save | unsubscribe`.
View **`current_email_marketing_preferences`** (`security_invoker`) = latest
`email-marketing` event per lower(email).

**`submission_attempts`** — rate-limit ledger (`scope`, `request_key` = HMAC of IP+UA, `created_at`).

**`app_settings`** — `key` → `value jsonb`. Keys: `availability`, `delivery`.

**`oauth_connections`** — `provider` PK (only `google`), `account_email`,
`encrypted_refresh_token` (AES-256-GCM `iv.tag.ciphertext`, base64url), `scopes`.

## RPC functions

| Function | Purpose |
| --- | --- |
| `claim_submission_attempt(scope, request_key, limit=8, window_seconds=900) → boolean` | Takes a per-key advisory xact lock, prunes expired attempts, returns `false` if at the limit, else records an attempt. Called by `enforceSubmissionRateLimit`. |
| `save_estimate_with_items(existing_id, record jsonb, items jsonb) → uuid` | Inserts or updates an estimate and replaces all its items in one transaction. On update, a null `status` keeps the existing status. |
| `save_curated_collection(id, collection jsonb, members jsonb, images jsonb) → uuid` | Creates (`id` null) or updates a collection and replaces its ordered members and gallery images in one transaction. Array order becomes `sort_order`. Called via `lib/estimator/collections.ts`. |

## Migration log

Apply in filename order (Supabase CLI or SQL editor).

| File | Summary |
| --- | --- |
| `202609120001_build_your_estimate.sql` | Catalog, estimates, items, appointments, app_settings, oauth_connections; RLS + grants; default settings |
| `20260912195947_add_foreign_key_indexes.sql` | FK indexes |
| `20261109163456_contact_inquiries_and_consent.sql` | `contact_inquiries`, `consent_events`, marketing-preference view, phone columns |
| `20261109170156_curated_inventory_collections.sql` | Variant `image_path`, curated collections/members/images |
| `20261109171410_index_collection_member_variant.sql` | Extra member index |
| `20261109172159_customer_relationships_and_safe_submissions.sql` | CRM tables, contact_id backfill by email, email-status columns, `submission_attempts`, both RPCs |
| `20261109174400_harden_submission_rate_limit.sql` | Rate limiter: advisory lock + pruning |
| `20261109190000_atomic_collection_save_and_estimate_save_consent.sql` | `save_curated_collection` RPC; allows `consent_events.subject_type = 'estimate-save'`. Applied to production 2026-11-09 and recorded with `migration repair`. |

**Applying migrations.** Production's migration history matches the repo version-for-version
(reconciled 2026-11-09 with `supabase migration repair`). Keep it that way:

1. Create the file in `supabase/migrations/` first (`supabase migration new <name>`).
2. Apply it with `supabase db push --linked` (check with `--dry-run` first).
3. Don't apply migrations through a tool that stamps its own version (e.g. an MCP
   `apply_migration`) — that's what caused the earlier mismatch. If one is applied that way,
   rename the local file to the recorded version, or `migration repair` the history.

All migrations listed above are applied to the production Supabase project.

## Seeding the catalog

`lib/estimator/catalog-seed.ts` is the canonical launch catalog (21 products, derived from
Lydia's read-only research workbook). `POST /api/admin/catalog/seed` (admin) upserts it plus
private sourcing metadata from `catalog-private.ts`. Re-running it **overwrites** edits to
those product/variant ids and re-activates them.
