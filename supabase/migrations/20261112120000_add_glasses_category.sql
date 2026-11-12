-- Adds the 'glasses' catalog category. Widening the check is safe to apply before or
-- after the app deploy that offers the new option.
alter table public.catalog_products drop constraint if exists catalog_products_category_check;
alter table public.catalog_products add constraint catalog_products_category_check
  check (category in ('table-linens', 'napkins', 'chargers', 'plates', 'flatware', 'glasses', 'custom-details'));
