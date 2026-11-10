# Brand & UI

## Identity

- Name: **Second Nature Creative Studio** (sender: `Second Nature <hello@secondnaturecreative.com>`).
- Tagline/meta: "The smallest details often tell the biggest stories. Based in Charlotte, NC."
- Voice: warm, editorial, first-person-plural; "collected, never copied"; refers to the
  owner by first name ("Lydia's edit", "Tell Lydia a little"). Rentals are "Gatherings" /
  "Event Rentals"; consulting is "Studio" / "Creative & Digital Consulting".
- The original design came from Lydia's Figma file (see commit `fd04aab`).

## Palette (`app/globals.css`, Tailwind `@theme` tokens)

| Token | Hex | Typical use |
| --- | --- | --- |
| `limestone` | `#F4F1EA` | Page background (`--background`) |
| `ink` | `#28241D` | Text (`--foreground`), dark buttons |
| `olive` | `#9E9576` | Primary, active nav, focus ring |
| `olive-dark` | `#6B644E` | |
| `fig` | `#7D4E6D` | Accent: primary CTAs ("Build Your Estimate"), eyebrows |
| `terracotta` | `#B86A52` | Destructive / error banners (`bg-terracotta/15`) |
| `denim` | `#4F6174` | Chart/secondary accent |
| card | `#FAF8F4` | `bg-card` panels |

A `.dark` theme block exists (shadcn default) but is unused.

## Typography

- Display: **Le Jour Serif** (local `app/fonts/le-jour-serif.woff2`) → `--font-display`;
  all headings use it automatically, plus `.font-display`.
- Body: **Inter** 300–600 via `next/font/google` → `--font-body`.
- Pattern for labels/buttons: `font-display text-xs uppercase tracking-[0.2em]`.

## Layout conventions

- Sections: `bg-limestone px-6 md:px-16`, inner `mx-auto max-w-7xl`.
- Panels: `rounded-2xl bg-card p-6`; list rows `rounded-xl border border-ink/10 p-4`.
- Images: `next/image` with `fill` inside `relative aspect-[w/h] overflow-hidden rounded-2xl bg-secondary`.
- Buttons as links: `inline-flex h-12 items-center rounded-lg bg-fig px-8 ... text-limestone`.
- Use `cn()` from `lib/utils.ts` for conditional classes.

## Page inventory

| Route | Purpose |
| --- | --- |
| `/` | Three image tiles → About, Event Rentals, Consulting |
| `/about` | Founder story |
| `/gatherings` | Event Rentals landing: CTAs + pickup/delivered/full-service explainer |
| `/gatherings/estimate` | Estimate builder |
| `/gatherings/collections`, `/[slug]` | Curated collections |
| `/consultation` | Free Google Meet consultation |
| `/estimate/[token]` | Resume saved estimate |
| `/studio` | Consulting services + pricing |
| `/contact` | Inquiry form |
| `/terms` (effective 2026-11-06), `/privacy` (effective 2026-11-09) | Legal, via `components/legal-page.tsx` |
| `/admin/*` | Private dashboard |

Nav (`components/nav.tsx`): Contact · About · **Gatherings ▾** (Build Your Estimate, Shop By
Collections, Free Consultation) · Studio. Footer: logo, email, © line, Terms & Privacy.

## Emails (`emails/`)

All wrap `components/email-shell.tsx`. Templates: `resume-estimate`,
`customer-confirmation` (itemised quote + Meet link), `lydia-notification`,
`contact-inquiry-customer`, `contact-inquiry-owner`. Customer emails set Reply-To to
Lydia; owner emails set Reply-To to the customer. Every send uses a Resend idempotency key.

## Assets

`public/photos/*.jpg`: one JPEG per placement, cropped from Lydia's original photos at
native resolution (never upscaled) and stripped of EXIF:

| File | Source in Drive | Used on |
| --- | --- | --- |
| `about-church.jpg` | `IMG_1711.JPG` | Home tile, About |
| `rentals-tablescape.jpg` | `866598774_…_n.jpg` | Home tile, Event Rentals |
| `rentals-place-setting.jpg` | `866730386_…_n.jpg` | Event Rentals |
| `consulting-workshop.jpg` | `Bobby-event-me-1.jpg` | Studio banner |
| `studio-phone.jpg` | `Bobby-event-me-2.jpg` | Studio gallery |
| `studio-bookshelf.jpg` | `DSC02245.JPG` | Studio gallery |
| `home-tablet.jpg`, `home-bridge.jpg`, `home-bookshelf.jpg`, `home-phone.jpg` | `Bobby-event-me-1.jpg`, `IMG_0528.JPG`, `DSC02245.JPG`, `Bobby-event-me-2.jpg` | Home consulting tile (four-up grid in `app/page.tsx`) |

Most sources are only ~1000px wide (social or web downloads), so wide placements such as the
Studio banner are as sharp as they can get until higher-res originals arrive. Keep the
originals in Drive, not the repo; export a crop with `sharp` at native size and quality 90.
The home consulting tile used to be one flattened collage PNG; it is now four photos in a
grid whose column widths match her original layout. Also in `public/`:
`logo.png` and the `catalog/*.svg` category placeholders used as default product images.
When replacing a photo, give the file a new name: the Next.js image optimizer caches
resized copies by URL, so it can keep serving the old image under a reused name. Leftover
create-next-app SVGs (`next.svg`, `vercel.svg`, `file.svg`, `globe.svg`, `window.svg`) are
unused.
