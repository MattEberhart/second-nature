<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

# Project knowledge

Second Nature Creative Studio — Lydia's Charlotte, NC event-rental + creative-consulting
site. Core product: the estimate builder (`components/estimate/estimate-builder.tsx`) backed
by Supabase, Google Calendar/Meet booking, Resend email, and a private `/admin` dashboard/CRM.

Read before changing things:

- `docs/README.md` — index of the knowledge base
- `docs/architecture.md` — stack, directory map, server/client boundary, env vars
- `docs/flows.md` — what each user/admin flow does end to end
- `docs/data-model.md` — tables, RPCs, migrations, access model
- `docs/api.md` — every route handler
- `docs/conventions-and-gotchas.md` — patterns to follow and known sharp edges
- `SETUP.md` — external service provisioning

Non-negotiables:

- All DB access is server-side with the service-role client; tables have RLS on with no
  anon/authenticated grants. Never query Supabase from the browser.
- Secret-touching modules import `"server-only"`; `lib/estimator/catalog-private.ts`
  (supplier data) must never reach the client or the public catalog API.
- Never trust client prices — `priceCart()` and `calculateDelivery()` recompute server-side.
- Money is integer cents; user-facing time zone is `America/New_York`.
- New public write routes: rate limit, Zod-validate, upsert CRM contact, log consent if
  the form has consent boxes, record activity, compensate on failure.
- When you add migrations, routes, env vars, or discover a footgun, update the matching doc in `docs/`.
<!-- END:nextjs-agent-rules -->
