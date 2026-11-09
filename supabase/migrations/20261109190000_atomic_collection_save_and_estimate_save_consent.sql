-- 1. Save a curated collection (header row + ordered members + gallery images)
--    in a single transaction, so a failure can never leave a half-emptied
--    collection. Members and images are a full replacement of the ordered lists
--    the dashboard editor sends.
-- 2. Allow consent evidence captured from the "save estimate" form.

create or replace function public.save_curated_collection(
  p_id uuid,
  p_collection jsonb,
  p_members jsonb,
  p_images jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  saved_id uuid;
begin
  if p_id is null then
    insert into public.curated_collections (
      slug, name, description, header_image_path, active
    ) values (
      p_collection->>'slug',
      p_collection->>'name',
      coalesce(p_collection->>'description', ''),
      nullif(p_collection->>'header_image_path', ''),
      coalesce((p_collection->>'active')::boolean, true)
    ) returning id into saved_id;
  else
    update public.curated_collections set
      slug = p_collection->>'slug',
      name = p_collection->>'name',
      description = coalesce(p_collection->>'description', ''),
      header_image_path = nullif(p_collection->>'header_image_path', ''),
      active = coalesce((p_collection->>'active')::boolean, true),
      updated_at = now()
    where id = p_id
    returning id into saved_id;

    if saved_id is null then
      raise exception 'Collection not found';
    end if;
  end if;

  delete from public.curated_collection_members where collection_id = saved_id;
  delete from public.curated_collection_images where collection_id = saved_id;

  insert into public.curated_collection_members (collection_id, product_id, variant_id, sort_order)
  select saved_id, member.value->>'product_id', nullif(member.value->>'variant_id', ''),
    (member.ordinality - 1)::integer
  from jsonb_array_elements(coalesce(p_members, '[]'::jsonb))
    with ordinality as member(value, ordinality);

  insert into public.curated_collection_images (collection_id, image_path, alt_text, sort_order)
  select saved_id, image.value->>'image_path', coalesce(image.value->>'alt_text', ''),
    (image.ordinality - 1)::integer
  from jsonb_array_elements(coalesce(p_images, '[]'::jsonb))
    with ordinality as image(value, ordinality);

  return saved_id;
end;
$$;

revoke all on function public.save_curated_collection(uuid, jsonb, jsonb, jsonb)
from public, anon, authenticated;
grant execute on function public.save_curated_collection(uuid, jsonb, jsonb, jsonb)
to service_role;

alter table public.consent_events
  drop constraint if exists consent_events_subject_type_check;
alter table public.consent_events
  add constraint consent_events_subject_type_check
  check (subject_type in (
    'contact-inquiry', 'consultation', 'estimate-consultation', 'estimate-save', 'unsubscribe'
  ));
