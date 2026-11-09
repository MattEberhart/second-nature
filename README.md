# Second Nature Creative Studio

Website for Second Nature Creative Studio (Charlotte, NC) — curated event & wedding rentals
and creative/digital consulting. Live at https://www.secondnaturecreative.com.

Highlights:

- **Build Your Estimate** — browse the rental catalog, build a quote, save it for later via a
  private emailed link, and book a free Google Meet review with Lydia.
- **Curated collections** — Lydia's pre-styled edits that feed into the estimate builder.
- **Contact & consultation flows** with consent logging and rate limiting.
- **Lydia's dashboard** (`/admin`) — CRM, quotes, inventory/collection management, booking
  and delivery settings, Google Calendar connection.

Stack: Next.js 16 (App Router) · React 19 · Tailwind v4 + shadcn · Supabase · Resend ·
Google Calendar/Routes · Cloudflare Images · Vercel.

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in what you have; the estimator UI runs without Supabase
npm run dev
```

## Documentation

- [docs/](docs/README.md) — architecture, flows, data model, API, admin, brand, gotchas
- [SETUP.md](SETUP.md) — provisioning Supabase, Google, Resend, Cloudflare, Vercel
- [AGENTS.md](AGENTS.md) — notes for AI coding agents
