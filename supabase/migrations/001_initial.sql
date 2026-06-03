-- Run in Supabase SQL editor or via supabase db push after linking your project.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  role text not null default 'contributor' check (role in ('contributor', 'moderator')),
  created_at timestamptz not null default now()
);

create table if not exists public.officials (
  id uuid primary key default gen_random_uuid(),
  county_fips text not null,
  name text not null,
  position text not null,
  phone text,
  email text,
  website text,
  submitted_by uuid references public.profiles (id) on delete set null,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.official_reports (
  id uuid primary key default gen_random_uuid(),
  official_id uuid not null references public.officials (id) on delete cascade,
  reporter_id uuid references public.profiles (id) on delete set null,
  reason text not null,
  created_at timestamptz not null default now()
);

create index if not exists officials_county_fips_idx on public.officials (county_fips);
create index if not exists officials_status_idx on public.officials (status);

alter table public.profiles enable row level security;
alter table public.officials enable row level security;
alter table public.official_reports enable row level security;

-- Profiles: users read/update own row
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- Officials: public read approved; authenticated insert pending; owners edit own pending
create policy "officials_select_approved" on public.officials
  for select using (status = 'approved');

create policy "officials_select_own_pending" on public.officials
  for select using (
    auth.uid() = submitted_by and status = 'pending'
  );

create policy "officials_insert_authenticated" on public.officials
  for insert with check (
    auth.uid() is not null
    and submitted_by = auth.uid()
    and status = 'pending'
  );

create policy "officials_update_own_pending" on public.officials
  for update using (
    auth.uid() = submitted_by and status = 'pending'
  );

create policy "officials_moderator_update" on public.officials
  for update using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'moderator'
    )
  );

-- Reports: authenticated users can insert
create policy "reports_insert_authenticated" on public.official_reports
  for insert with check (auth.uid() = reporter_id);

create policy "reports_select_own" on public.official_reports
  for select using (auth.uid() = reporter_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
