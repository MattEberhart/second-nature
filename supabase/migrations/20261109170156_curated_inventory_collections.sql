-- Turn the original product/variant catalog into a reusable inventory model and
-- add Lydia-curated editorial collections. Existing estimates keep their
-- snapshots and remain valid.

alter table public.catalog_variants
  add column if not exists image_path text;

create table if not exists public.curated_collections (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null,
  description text not null default '',
  header_image_path text,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.curated_collection_members (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null references public.curated_collections(id) on delete cascade,
  product_id text not null references public.catalog_products(id) on delete cascade,
  variant_id text references public.catalog_variants(id) on delete cascade,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.catalog_variants
  add constraint catalog_variants_product_id_id_key unique (product_id, id);
alter table public.curated_collection_members
  add constraint curated_collection_member_variant_belongs_to_product
  foreign key (product_id, variant_id)
  references public.catalog_variants(product_id, id)
  on delete cascade;

create unique index if not exists curated_collection_whole_product_idx
  on public.curated_collection_members (collection_id, product_id)
  where variant_id is null;
create unique index if not exists curated_collection_variant_idx
  on public.curated_collection_members (collection_id, variant_id)
  where variant_id is not null;
create index if not exists curated_collection_members_collection_idx
  on public.curated_collection_members (collection_id, sort_order);
create index if not exists curated_collection_members_product_idx
  on public.curated_collection_members (product_id);
create index if not exists curated_collection_members_variant_idx
  on public.curated_collection_members (variant_id) where variant_id is not null;

create table if not exists public.curated_collection_images (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null references public.curated_collections(id) on delete cascade,
  image_path text not null,
  alt_text text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists curated_collection_images_collection_idx
  on public.curated_collection_images (collection_id, sort_order);

alter table public.curated_collections enable row level security;
alter table public.curated_collection_members enable row level security;
alter table public.curated_collection_images enable row level security;

revoke all on table
  public.curated_collections,
  public.curated_collection_members,
  public.curated_collection_images
from anon, authenticated;

grant select, insert, update, delete on table
  public.curated_collections,
  public.curated_collection_members,
  public.curated_collection_images
to service_role;
