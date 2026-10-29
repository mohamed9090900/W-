-- Siwa Buffet Manager — own database only. Executed on project foqysttszgnecdzpkhql.
-- This file is a portable schema reference; it must never be applied to existing buffet systems.
create table if not exists public.siwa_manager_state (
    user_id uuid primary key references auth.users(id) on delete cascade,
    payload jsonb not null default '{}'::jsonb,
    revision bigint not null default 1 check (revision > 0),
    updated_at timestamptz not null default now(),
    constraint siwa_payload_object check (jsonb_typeof(payload) = 'object')
);
alter table public.siwa_manager_state enable row level security;
revoke all on table public.siwa_manager_state from public, anon, authenticated;
grant select, insert, update on table public.siwa_manager_state to authenticated;
create policy siwa_read_self on public.siwa_manager_state for select to authenticated using ((select auth.uid()) = user_id);
create policy siwa_insert_self on public.siwa_manager_state for insert to authenticated with check ((select auth.uid()) = user_id);
create policy siwa_update_self on public.siwa_manager_state for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
