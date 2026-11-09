create index if not exists curated_collection_members_product_variant_idx
  on public.curated_collection_members (product_id, variant_id)
  where variant_id is not null;
