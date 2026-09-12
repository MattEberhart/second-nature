create index if not exists catalog_variants_product_id_idx
  on public.catalog_variants (product_id);

create index if not exists appointments_estimate_id_idx
  on public.appointments (estimate_id);
