create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  email_normalized text unique not null,
  phone text,
  status text not null default 'new'
    check (status in ('new', 'contacted', 'qualified', 'booked', 'closed')),
  first_source text not null default 'contact'
    check (first_source in ('contact', 'estimate', 'consultation', 'imported')),
  last_activity_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists contacts_status_activity_idx
  on public.contacts (status, last_activity_at desc);
create index if not exists contacts_name_idx
  on public.contacts (lower(name));

create table if not exists public.contact_notes (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references public.contacts(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 5000),
  author_email text not null,
  created_at timestamptz not null default now()
);

create index if not exists contact_notes_contact_created_idx
  on public.contact_notes (contact_id, created_at desc);

create table if not exists public.contact_activities (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references public.contacts(id) on delete cascade,
  activity_type text not null,
  summary text not null,
  subject_type text,
  subject_id uuid,
  actor_email text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists contact_activities_contact_created_idx
  on public.contact_activities (contact_id, created_at desc);
create index if not exists contact_activities_subject_idx
  on public.contact_activities (subject_type, subject_id);

alter table public.contact_inquiries
  add column if not exists contact_id uuid references public.contacts(id) on delete set null,
  add column if not exists status text not null default 'new'
    check (status in ('new', 'contacted', 'closed')),
  add column if not exists owner_email_status text not null default 'pending'
    check (owner_email_status in ('pending', 'sent', 'failed')),
  add column if not exists customer_email_status text not null default 'pending'
    check (customer_email_status in ('pending', 'sent', 'failed')),
  add column if not exists email_error text,
  add column if not exists notified_at timestamptz;

alter table public.estimates
  add column if not exists contact_id uuid references public.contacts(id) on delete set null,
  add column if not exists resume_email_status text not null default 'pending'
    check (resume_email_status in ('pending', 'sent', 'failed')),
  add column if not exists resume_email_error text;

alter table public.appointments
  add column if not exists contact_id uuid references public.contacts(id) on delete set null;

create index if not exists contact_inquiries_contact_idx
  on public.contact_inquiries (contact_id, created_at desc);
create index if not exists estimates_contact_idx
  on public.estimates (contact_id, created_at desc);
create index if not exists appointments_contact_idx
  on public.appointments (contact_id, starts_at desc);

-- Existing records are linked by normalized email. These statements are safe
-- on a fresh project and preserve the original snapshots on populated projects.
insert into public.contacts (name, email, email_normalized, phone, first_source, last_activity_at)
select distinct on (email_normalized)
  name,
  email,
  email_normalized,
  phone,
  source,
  activity_at
from (
  select customer_name as name, customer_email as email,
    lower(trim(customer_email)) as email_normalized, customer_phone as phone,
    'estimate'::text as source, updated_at as activity_at
  from public.estimates
  union all
  select customer_name, customer_email, lower(trim(customer_email)), customer_phone,
    'consultation'::text, created_at
  from public.appointments
  union all
  select name, email, lower(trim(email)), phone, 'contact'::text, created_at
  from public.contact_inquiries
) source_rows
where email_normalized <> ''
order by email_normalized, activity_at desc
on conflict (email_normalized) do nothing;

update public.estimates estimate
set contact_id = contact.id
from public.contacts contact
where estimate.contact_id is null
  and lower(trim(estimate.customer_email)) = contact.email_normalized;

update public.appointments appointment
set contact_id = contact.id
from public.contacts contact
where appointment.contact_id is null
  and lower(trim(appointment.customer_email)) = contact.email_normalized;

update public.contact_inquiries inquiry
set contact_id = contact.id
from public.contacts contact
where inquiry.contact_id is null
  and lower(trim(inquiry.email)) = contact.email_normalized;

create table if not exists public.submission_attempts (
  id bigint generated always as identity primary key,
  scope text not null,
  request_key text not null,
  created_at timestamptz not null default now()
);

create index if not exists submission_attempts_lookup_idx
  on public.submission_attempts (scope, request_key, created_at desc);

create or replace function public.claim_submission_attempt(
  p_scope text,
  p_request_key text,
  p_limit integer default 8,
  p_window_seconds integer default 900
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  recent_count integer;
begin
  if p_limit < 1 or p_window_seconds < 1 then
    raise exception 'Invalid rate limit configuration';
  end if;

  select count(*) into recent_count
  from public.submission_attempts
  where scope = p_scope
    and request_key = p_request_key
    and created_at >= now() - make_interval(secs => p_window_seconds);

  if recent_count >= p_limit then
    return false;
  end if;

  insert into public.submission_attempts (scope, request_key)
  values (p_scope, p_request_key);
  return true;
end;
$$;

create or replace function public.save_estimate_with_items(
  p_existing_id uuid,
  p_record jsonb,
  p_items jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  saved_id uuid;
begin
  if p_existing_id is null then
    insert into public.estimates (
      resume_token_hash, contact_id, customer_name, customer_email,
      customer_phone, event_date, date_undecided, guest_count, venue_name,
      venue_address, fulfillment, notes, subtotal_cents, delivery_fee_cents,
      full_service_fee_cents, total_cents, status, updated_at
    ) values (
      p_record->>'resume_token_hash',
      nullif(p_record->>'contact_id', '')::uuid,
      p_record->>'customer_name',
      p_record->>'customer_email',
      nullif(p_record->>'customer_phone', ''),
      nullif(p_record->>'event_date', '')::date,
      coalesce((p_record->>'date_undecided')::boolean, false),
      nullif(p_record->>'guest_count', '')::integer,
      nullif(p_record->>'venue_name', ''),
      nullif(p_record->>'venue_address', ''),
      coalesce(nullif(p_record->>'fulfillment', ''), 'pickup'),
      nullif(p_record->>'notes', ''),
      coalesce((p_record->>'subtotal_cents')::integer, 0),
      coalesce((p_record->>'delivery_fee_cents')::integer, 0),
      coalesce((p_record->>'full_service_fee_cents')::integer, 0),
      coalesce((p_record->>'total_cents')::integer, 0),
      coalesce(nullif(p_record->>'status', ''), 'draft'),
      now()
    ) returning id into saved_id;
  else
    update public.estimates set
      contact_id = nullif(p_record->>'contact_id', '')::uuid,
      customer_name = p_record->>'customer_name',
      customer_email = p_record->>'customer_email',
      customer_phone = nullif(p_record->>'customer_phone', ''),
      event_date = nullif(p_record->>'event_date', '')::date,
      date_undecided = coalesce((p_record->>'date_undecided')::boolean, false),
      guest_count = nullif(p_record->>'guest_count', '')::integer,
      venue_name = nullif(p_record->>'venue_name', ''),
      venue_address = nullif(p_record->>'venue_address', ''),
      fulfillment = coalesce(nullif(p_record->>'fulfillment', ''), 'pickup'),
      notes = nullif(p_record->>'notes', ''),
      subtotal_cents = coalesce((p_record->>'subtotal_cents')::integer, 0),
      delivery_fee_cents = coalesce((p_record->>'delivery_fee_cents')::integer, 0),
      full_service_fee_cents = coalesce((p_record->>'full_service_fee_cents')::integer, 0),
      total_cents = coalesce((p_record->>'total_cents')::integer, 0),
      status = coalesce(nullif(p_record->>'status', ''), status),
      updated_at = now()
    where id = p_existing_id
    returning id into saved_id;

    if saved_id is null then
      raise exception 'Estimate not found';
    end if;
  end if;

  delete from public.estimate_items where estimate_id = saved_id;

  insert into public.estimate_items (
    estimate_id, product_id, variant_id, public_name_snapshot,
    variant_label_snapshot, unit_price_cents_snapshot, quantity,
    line_total_cents
  )
  select
    saved_id,
    item.product_id,
    item.variant_id,
    item.public_name,
    item.variant_label,
    item.unit_price_cents,
    item.quantity,
    item.line_total_cents
  from jsonb_to_recordset(coalesce(p_items, '[]'::jsonb)) as item(
    product_id text,
    variant_id text,
    public_name text,
    variant_label text,
    unit_price_cents integer,
    quantity integer,
    line_total_cents integer
  );

  return saved_id;
end;
$$;

alter table public.contacts enable row level security;
alter table public.contact_notes enable row level security;
alter table public.contact_activities enable row level security;
alter table public.submission_attempts enable row level security;

revoke all on table
  public.contacts,
  public.contact_notes,
  public.contact_activities,
  public.submission_attempts
from anon, authenticated, service_role;

grant select, insert, update, delete on table
  public.contacts,
  public.contact_notes,
  public.contact_activities
to service_role;

grant select, insert, delete on table public.submission_attempts to service_role;
grant usage, select on sequence public.submission_attempts_id_seq to service_role;

revoke all on function public.claim_submission_attempt(text, text, integer, integer)
from public, anon, authenticated;
revoke all on function public.save_estimate_with_items(uuid, jsonb, jsonb)
from public, anon, authenticated;

grant execute on function public.claim_submission_attempt(text, text, integer, integer)
to service_role;
grant execute on function public.save_estimate_with_items(uuid, jsonb, jsonb)
to service_role;
