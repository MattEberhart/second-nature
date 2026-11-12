-- The "From $X" line on estimate-builder item cards is gone (each card already shows
-- prices in its option list and Add button), so the per-item price prefix is unused.
-- Apply only AFTER the app version that stops reading/writing
-- catalog_products.price_prefix is deployed; otherwise the live public catalog select
-- fails on the missing column.
alter table public.catalog_products drop column if exists price_prefix;
