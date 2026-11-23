-- Network-D License Management schema (Supabase / PostgreSQL)
-- Run this file in the Supabase SQL Editor before enabling the API.

create extension if not exists pgcrypto;

create table if not exists public.licenses (
  id uuid primary key default gen_random_uuid(),
  key_hash text not null unique,
  customer_email text not null,
  plan text not null default 'developer-monthly',
  status text not null default 'active' check (status in ('active','suspended','revoked','expired')),
  expires_at timestamptz not null,
  max_activations integer not null default 1 check (max_activations between 1 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.license_activations (
  id uuid primary key default gen_random_uuid(),
  license_id uuid not null references public.licenses(id) on delete cascade,
  device_id text not null,
  token_hash text not null unique,
  status text not null default 'active' check (status in ('active','deactivated')),
  activated_at timestamptz not null default now(),
  last_checked_at timestamptz,
  unique (license_id, device_id)
);

create index if not exists idx_licenses_status_expiry on public.licenses(status, expires_at);
create index if not exists idx_activations_license_status on public.license_activations(license_id, status);

alter table public.licenses enable row level security;
alter table public.license_activations enable row level security;
-- Do not create anon/authenticated policies. The server uses the service-role key only.
revoke all on public.licenses from anon, authenticated;
revoke all on public.license_activations from anon, authenticated;

create or replace function public.activate_network_d_license(
  p_key_hash text, p_device_id text, p_token_hash text
) returns jsonb language plpgsql security definer set search_path = public as $$
declare
  lic public.licenses%rowtype;
  act public.license_activations%rowtype;
  active_count integer;
begin
  select * into lic from public.licenses where key_hash = p_key_hash for update;
  if not found then return jsonb_build_object('error','invalid_license'); end if;
  if lic.status <> 'active' or lic.expires_at <= now() then
    return jsonb_build_object('error',case when lic.expires_at <= now() then 'expired' else lic.status end);
  end if;

  select * into act from public.license_activations
    where license_id = lic.id and device_id = p_device_id;
  if found and act.status = 'active' then
    update public.license_activations
      set token_hash = p_token_hash, last_checked_at = now()
      where id = act.id returning * into act;
    return jsonb_build_object('activation_id',act.id,'status',lic.status,'expires_at',lic.expires_at);
  end if;

  select count(*) into active_count from public.license_activations
    where license_id = lic.id and status = 'active';
  if active_count >= lic.max_activations then
    return jsonb_build_object('error','activation_limit_reached');
  end if;

  insert into public.license_activations(license_id,device_id,token_hash)
    values (lic.id,p_device_id,p_token_hash)
    returning * into act;
  return jsonb_build_object('activation_id',act.id,'status',lic.status,'expires_at',lic.expires_at);
end;
$$;

create or replace function public.validate_network_d_license(
  p_token_hash text, p_device_id text
) returns jsonb language plpgsql security definer set search_path = public as $$
declare
  lic public.licenses%rowtype;
  act public.license_activations%rowtype;
begin
  select a.* into act from public.license_activations a
    where a.token_hash = p_token_hash and a.device_id = p_device_id and a.status = 'active';
  if not found then return jsonb_build_object('valid',false,'status','invalid'); end if;

  select * into lic from public.licenses where id = act.license_id;
  if not found then return jsonb_build_object('valid',false,'status','invalid'); end if;

  update public.license_activations set last_checked_at = now() where id = act.id;
  if lic.status <> 'active' then return jsonb_build_object('valid',false,'status',lic.status); end if;
  if lic.expires_at <= now() then return jsonb_build_object('valid',false,'status','expired','expires_at',lic.expires_at); end if;
  return jsonb_build_object('valid',true,'status','active','expires_at',lic.expires_at);
end;
$$;

create or replace function public.deactivate_network_d_license(
  p_token_hash text, p_device_id text
) returns jsonb language plpgsql security definer set search_path = public as $$
declare affected integer;
begin
  update public.license_activations
    set status = 'deactivated'
    where token_hash = p_token_hash and device_id = p_device_id and status = 'active';
  get diagnostics affected = row_count;
  return jsonb_build_object('success',affected > 0);
end;
$$;

revoke all on function public.activate_network_d_license(text,text,text) from public, anon, authenticated;
revoke all on function public.validate_network_d_license(text,text) from public, anon, authenticated;
revoke all on function public.deactivate_network_d_license(text,text) from public, anon, authenticated;
grant execute on function public.activate_network_d_license(text,text,text) to service_role;
grant execute on function public.validate_network_d_license(text,text) to service_role;
grant execute on function public.deactivate_network_d_license(text,text) to service_role;
