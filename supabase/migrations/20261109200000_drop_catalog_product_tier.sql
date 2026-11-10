-- Price level ("tier") is no longer part of the catalog. Apply only AFTER the
-- app version that stops reading/writing catalog_products.tier is deployed;
-- otherwise the live public catalog select fails on the missing column.
alter table public.catalog_products drop column if exists tier;
