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

  -- Serialize claims for this exact scope and fingerprint so simultaneous
  -- requests cannot all observe the same pre-insert count.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_scope || ':' || p_request_key, 0)
  );

  delete from public.submission_attempts
  where scope = p_scope
    and request_key = p_request_key
    and created_at < now() - make_interval(secs => p_window_seconds);

  select count(*) into recent_count
  from public.submission_attempts
  where scope = p_scope
    and request_key = p_request_key;

  if recent_count >= p_limit then
    return false;
  end if;

  insert into public.submission_attempts (scope, request_key)
  values (p_scope, p_request_key);
  return true;
end;
$$;

revoke all on function public.claim_submission_attempt(text, text, integer, integer)
from public, anon, authenticated;

grant execute on function public.claim_submission_attempt(text, text, integer, integer)
to service_role;
