-- 1) Shared timestamp trigger function
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 2) Profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  first_name text,
  last_name text,
  avatar_url text,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy if not exists "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy if not exists "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy if not exists "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create trigger if not exists update_profiles_updated_at
before update on public.profiles
for each row execute function public.update_updated_at_column();

-- 3) Auto-insert profile on new auth user
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, first_name, last_name, avatar_url)
  values (new.id,
          coalesce(new.raw_user_meta_data ->> 'display_name', new.email),
          new.raw_user_meta_data ->> 'first_name',
          new.raw_user_meta_data ->> 'last_name',
          new.raw_user_meta_data ->> 'avatar_url');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 4) Enum for family membership roles
do $$ begin
  create type public.membership_role as enum ('owner', 'admin', 'member');
exception when duplicate_object then null; end $$;

-- 5) Families table
create table if not exists public.families (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.families enable row level security;

-- Helper functions to avoid recursive RLS
create or replace function public.is_family_owner(_user_id uuid, _family_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.families f where f.id = _family_id and f.owner_id = _user_id
  );
$$;

create or replace function public.is_family_member(_user_id uuid, _family_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.family_members m where m.family_id = _family_id and m.user_id = _user_id
  );
$$;

-- Policies for families
create policy if not exists "Owners and members can view family"
  on public.families for select
  using (public.is_family_owner(auth.uid(), id) or public.is_family_member(auth.uid(), id));

create policy if not exists "Users can create family as owner"
  on public.families for insert
  with check (owner_id = auth.uid());

create policy if not exists "Only owner can update family"
  on public.families for update
  using (owner_id = auth.uid());

create policy if not exists "Only owner can delete family"
  on public.families for delete
  using (owner_id = auth.uid());

create trigger if not exists update_families_updated_at
before update on public.families
for each row execute function public.update_updated_at_column();

-- 6) Family members table
create table if not exists public.family_members (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.membership_role not null default 'member',
  created_at timestamptz not null default now(),
  unique (family_id, user_id)
);

alter table public.family_members enable row level security;

-- Policies for family_members
create policy if not exists "Members can view memberships of their families"
  on public.family_members for select
  using (
    public.is_family_member(auth.uid(), family_id) or public.is_family_owner(auth.uid(), family_id)
  );

create policy if not exists "Owners can add members to their family"
  on public.family_members for insert
  with check (
    public.is_family_owner(auth.uid(), family_id)
  );

create policy if not exists "Owners can update memberships in their family"
  on public.family_members for update
  using (public.is_family_owner(auth.uid(), family_id));

create policy if not exists "Members can remove themselves; owners can remove anyone"
  on public.family_members for delete
  using (
    public.is_family_owner(auth.uid(), family_id) or auth.uid() = user_id
  );

-- 7) Trigger: when a family is created, add owner as a member
create or replace function public.add_owner_as_member()
returns trigger
language plpgsql
as $$
begin
  insert into public.family_members (family_id, user_id, role)
  values (new.id, new.owner_id, 'owner')
  on conflict (family_id, user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists add_owner_membership on public.families;
create trigger add_owner_membership
  after insert on public.families
  for each row execute procedure public.add_owner_as_member();

-- 8) Realtime support (optional - safe to run even if publication exists)
alter table public.families replica identity full;
alter table public.family_members replica identity full;

do $$ begin
  perform 1 from pg_publication where pubname = 'supabase_realtime';
  if not found then
    create publication supabase_realtime;
  end if;
end $$;

alter publication supabase_realtime add table public.families;
alter publication supabase_realtime add table public.family_members;