create table if not exists public.contact_inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null,
  interest text not null check (interest in ('gatherings', 'studio', 'both')),
  event_date date,
  message text,
  created_at timestamptz not null default now()
);

create index if not exists contact_inquiries_created_at_idx
  on public.contact_inquiries (created_at desc);
create index if not exists contact_inquiries_email_idx
  on public.contact_inquiries (lower(email));

alter table public.estimates add column if not exists customer_phone text;
alter table public.appointments add column if not exists customer_phone text;

-- Consent is an append-only evidence log. A changed preference is a new event,
-- never an update to prior evidence.
create table if not exists public.consent_events (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  phone text,
  person_name text,
  consent_scope text not null check (consent_scope in ('inquiry-communications', 'email-marketing')),
  action text not null check (action in ('granted', 'declined', 'revoked')),
  disclosure_text text not null,
  disclosure_version text not null,
  capture_source text not null,
  subject_type text not null check (subject_type in ('contact-inquiry', 'consultation', 'estimate-consultation', 'unsubscribe')),
  subject_id uuid,
  captured_at timestamptz not null default now(),
  ip_hash text,
  user_agent text,
  referrer text,
  evidence jsonb not null default '{}'::jsonb
);

create index if not exists consent_events_email_scope_idx
  on public.consent_events (lower(email), consent_scope, captured_at desc);
create index if not exists consent_events_subject_idx
  on public.consent_events (subject_type, subject_id);

create or replace view public.current_email_marketing_preferences
with (security_invoker = true) as
select distinct on (lower(email))
  email,
  phone,
  person_name,
  action,
  disclosure_version,
  capture_source,
  captured_at,
  id as consent_event_id
from public.consent_events
where consent_scope = 'email-marketing'
order by lower(email), captured_at desc, id desc;

alter table public.contact_inquiries enable row level security;
alter table public.consent_events enable row level security;

revoke all on table public.contact_inquiries, public.consent_events
from anon, authenticated, service_role;
revoke all on table public.current_email_marketing_preferences
from anon, authenticated, service_role;

grant select, insert, update, delete on table public.contact_inquiries
to service_role;
grant select, insert on table public.consent_events
to service_role;
grant select on table public.current_email_marketing_preferences
to service_role;
