-- نفّذ الملف في مشروع Supabase جديد مخصص لبرنامج إدارة بوفيه سيوة فقط.
-- لا تنفذه على مشروع برنامج العسكري أو مشروع الجرد.
-- أنشئ مستخدمك أنت فقط من Auth -> Users وعطّل التسجيل العام من Auth settings.

create table if not exists public.siwa_manager_state (
    user_id uuid primary key references auth.users(id) on delete cascade,
    payload jsonb not null default '{}'::jsonb,
    revision bigint not null default 1,
    updated_at timestamptz not null default now()
);

alter table public.siwa_manager_state enable row level security;
revoke all on public.siwa_manager_state from anon;
grant select, insert, update on public.siwa_manager_state to authenticated;

drop policy if exists "siwa_read_self" on public.siwa_manager_state;
create policy "siwa_read_self" on public.siwa_manager_state
for select to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "siwa_insert_self" on public.siwa_manager_state;
create policy "siwa_insert_self" on public.siwa_manager_state
for insert to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "siwa_update_self" on public.siwa_manager_state;
create policy "siwa_update_self" on public.siwa_manager_state
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

-- لا توجد سياسة حذف. الربط يستعمل publishable/anon key فقط في الواجهة.
