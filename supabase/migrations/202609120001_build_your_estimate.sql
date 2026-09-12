create extension if not exists pgcrypto;

create table if not exists public.catalog_products (
  id text primary key,
  public_name text not null,
  category text not null check (category in ('table-linens', 'napkins', 'chargers', 'plates', 'flatware', 'custom-details')),
  tier text not null check (tier in ('Essential', 'Premium', 'Luxe', 'Signature')),
  material text not null,
  description text not null default '',
  image_path text not null,
  accent text not null default '#9E9576',
  price_prefix text,
  internal_name text,
  supplier text,
  sourcing_notes text,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.catalog_variants (
  id text primary key,
  product_id text not null references public.catalog_products(id) on delete cascade,
  label text not null,
  size text,
  color text,
  unit_price_cents integer not null check (unit_price_cents >= 0),
  internal_sku text,
  acquisition_cost_cents integer,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.estimates (
  id uuid primary key default gen_random_uuid(),
  resume_token_hash text unique not null,
  customer_name text not null,
  customer_email text not null,
  event_date date,
  date_undecided boolean not null default false,
  guest_count integer,
  venue_name text,
  venue_address text,
  fulfillment text not null default 'pickup' check (fulfillment in ('pickup', 'delivery', 'full-service')),
  notes text,
  subtotal_cents integer not null default 0,
  delivery_fee_cents integer not null default 0,
  full_service_fee_cents integer not null default 0,
  total_cents integer not null default 0,
  status text not null default 'draft' check (status in ('draft', 'awaiting-scheduling', 'scheduled', 'reviewed', 'archived')),
  catalog_version text not null default 'launch-2026-09',
  last_resume_email_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists estimates_customer_email_idx on public.estimates (lower(customer_email));
create index if not exists estimates_status_idx on public.estimates (status, created_at desc);

create table if not exists public.estimate_items (
  id uuid primary key default gen_random_uuid(),
  estimate_id uuid not null references public.estimates(id) on delete cascade,
  product_id text,
  variant_id text,
  public_name_snapshot text not null,
  variant_label_snapshot text not null,
  unit_price_cents_snapshot integer not null,
  quantity integer not null check (quantity > 0 and quantity <= 10000),
  line_total_cents integer not null,
  created_at timestamptz not null default now()
);

create index if not exists estimate_items_estimate_idx on public.estimate_items (estimate_id);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  estimate_id uuid references public.estimates(id) on delete set null,
  customer_name text not null,
  customer_email text not null,
  event_date date,
  venue_name text,
  notes text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  meeting_type text not null default 'google-meet',
  google_event_id text unique,
  google_meet_url text,
  status text not null default 'confirmed' check (status in ('pending', 'confirmed', 'cancelled')),
  created_at timestamptz not null default now(),
  unique (starts_at, ends_at)
);

create index if not exists appointments_starts_at_idx on public.appointments (starts_at);

create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.oauth_connections (
  provider text primary key,
  account_email text not null,
  encrypted_refresh_token text not null,
  scopes text,
  updated_at timestamptz not null default now()
);

alter table public.catalog_products enable row level security;
alter table public.catalog_variants enable row level security;
alter table public.estimates enable row level security;
alter table public.estimate_items enable row level security;
alter table public.appointments enable row level security;
alter table public.app_settings enable row level security;
alter table public.oauth_connections enable row level security;

-- The application accesses these tables only from trusted Next.js server code.
-- Make that boundary explicit for projects using Supabase's opt-in Data API grants.
revoke all on table
  public.catalog_products,
  public.catalog_variants,
  public.estimates,
  public.estimate_items,
  public.appointments,
  public.app_settings,
  public.oauth_connections
from anon, authenticated;

grant select, insert, update, delete on table
  public.catalog_products,
  public.catalog_variants,
  public.estimates,
  public.estimate_items,
  public.appointments,
  public.app_settings,
  public.oauth_connections
to service_role;

insert into public.app_settings (key, value) values
  ('availability', '{"timeZone":"America/New_York","durationMinutes":30,"bufferMinutes":15,"minimumNoticeHours":24,"bookingHorizonDays":60,"weekly":{"1":[["10:00","16:00"]],"2":[["10:00","16:00"]],"3":[["10:00","16:00"]],"4":[["10:00","16:00"]],"5":[["10:00","14:00"]]},"busyCalendarIds":["primary"]}'::jsonb),
  ('delivery', '{"baseFeeCents":7500,"roundTripPerMileCents":200,"fullServiceStartingFeeCents":25000}'::jsonb)
on conflict (key) do nothing;
