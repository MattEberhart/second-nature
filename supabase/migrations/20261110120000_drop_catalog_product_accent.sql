-- Item accent colors (the tint behind each photo in the estimate builder) are gone:
-- every item has a real photo, shown untinted. Apply only AFTER the app version that
-- stops reading/writing catalog_products.accent is deployed; otherwise the live public
-- catalog select fails on the missing column.
alter table public.catalog_products drop column if exists accent;
