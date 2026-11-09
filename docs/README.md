# Second Nature — project docs

Internal knowledge base for the Second Nature Creative Studio website
(`https://www.secondnaturecreative.com`). Start here, then jump to the doc you need.

| Doc | What it covers |
| --- | --- |
| [architecture.md](architecture.md) | Business context, stack, directory map, server/client boundary, external services |
| [flows.md](flows.md) | Step-by-step behaviour of every public and admin flow (contact, consultation, estimate save/resume/schedule, admin sign-in, calendar connect) |
| [data-model.md](data-model.md) | Supabase tables, RPC functions, access model, migration history |
| [api.md](api.md) | Reference for every route handler under `app/api` and `app/auth` |
| [admin.md](admin.md) | Lydia's dashboard: CRM, quotes, inventory, curated collections, image uploads, settings |
| [brand-and-ui.md](brand-and-ui.md) | Palette, typography, page inventory, component conventions, copy voice |
| [conventions-and-gotchas.md](conventions-and-gotchas.md) | Coding patterns to follow, Next.js 16 notes, known sharp edges and open TODOs |

Operational setup (Supabase, Google OAuth/Calendar/Routes, Resend, Cloudflare Images,
Vercel env vars) lives in [`../SETUP.md`](../SETUP.md). Environment variable names are
listed in [`../.env.example`](../.env.example).

## Keeping these docs current

- Add a migration → update [data-model.md](data-model.md) (tables + migration log).
- Add or change a route handler → update [api.md](api.md) and, if user-visible, [flows.md](flows.md).
- Add an env var → `.env.example`, `SETUP.md`, and the env table in [architecture.md](architecture.md).
- Discover a footgun → add it to [conventions-and-gotchas.md](conventions-and-gotchas.md).

_Last reviewed: 2026-11-09 (includes the CRM, curated-collections, and submission-security work)._
