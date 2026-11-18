create table if not exists public.visitors (
  token_hash text primary key,
  results text[] not null default '{}',
  submitted boolean not null default false,
  mobile text,
  submitted_at timestamptz,
  claimed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint max_three_spins check (coalesce(array_length(results,1),0) <= 3),
  constraint submitted_needs_data check (not submitted or (mobile is not null and array_length(results,1) = 3))
);
alter table public.visitors enable row level security; -- no policies: only the service role can access

create or replace function public.get_state(p_hash text) returns jsonb language plpgsql security definer as $$
declare v public.visitors;
begin
  insert into public.visitors(token_hash) values (p_hash) on conflict do nothing;
  select * into v from public.visitors where token_hash = p_hash;
  return jsonb_build_object('results', v.results, 'submitted', v.submitted);
end $$;

create or replace function public.do_spin(p_hash text) returns jsonb language plpgsql security definer as $$
declare v public.visitors; n int; prizes text[] := array['Rs. 500','Rs. 5,000','Empty'];
begin
  insert into public.visitors(token_hash) values (p_hash) on conflict do nothing;
  select * into v from public.visitors where token_hash = p_hash for update; -- row lock stops double spins
  n := coalesce(array_length(v.results,1),0);
  if v.submitted or n >= 3 then
    return jsonb_build_object('spun', false, 'results', v.results, 'submitted', v.submitted);
  end if;
  update public.visitors set results = array_append(results, prizes[n+1]) where token_hash = p_hash returning * into v;
  return jsonb_build_object('spun', true, 'results', v.results, 'submitted', v.submitted);
end $$;

create or replace function public.claim_submission(p_hash text) returns jsonb language plpgsql security definer as $$
declare v public.visitors;
begin
  select * into v from public.visitors where token_hash = p_hash for update;
  if not found then return jsonb_build_object('status','incomplete'); end if;
  if v.submitted then return jsonb_build_object('status','already'); end if;
  if coalesce(array_length(v.results,1),0) < 3 then return jsonb_build_object('status','incomplete'); end if;
  if v.claimed_at is not null and v.claimed_at > now() - interval '60 seconds' then return jsonb_build_object('status','busy'); end if;
  update public.visitors set claimed_at = now() where token_hash = p_hash;
  return jsonb_build_object('status','ok','results', v.results);
end $$;

create or replace function public.finish_submission(p_hash text, p_mobile text) returns void language sql security definer as $$
  update public.visitors set submitted = true, mobile = p_mobile, submitted_at = now(), claimed_at = null
  where token_hash = p_hash and not submitted;
$$;
create or replace function public.release_claim(p_hash text) returns void language sql security definer as $$
  update public.visitors set claimed_at = null where token_hash = p_hash and not submitted;
$$;

revoke execute on all functions in schema public from public, anon, authenticated;
