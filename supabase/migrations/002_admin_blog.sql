-- ── Profiles ──────────────────────────────────────────────────────────────
create table if not exists profiles (
  id         uuid references auth.users(id) on delete cascade primary key,
  email      text,
  is_admin   boolean default false,
  created_at timestamptz default now()
);

alter table profiles enable row level security;

-- Non-recursive admin check (avoids infinite RLS recursion)
create or replace function is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select is_admin from profiles where id = auth.uid()), false);
$$;

create policy "Users see own profile"
  on profiles for select using (auth.uid() = id);

create policy "Admins see all profiles"
  on profiles for select using (is_admin());

create policy "Admins update profiles"
  on profiles for update using (is_admin());

-- Auto-create profile when a user signs up
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ── Blog posts ─────────────────────────────────────────────────────────────
create table if not exists blog_posts (
  id           uuid default gen_random_uuid() primary key,
  title        text not null default '',
  slug         text unique not null default '',
  html_content text default '',
  css_content  text default '',
  published    boolean default false,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now(),
  author_id    uuid references auth.users(id)
);

alter table blog_posts enable row level security;

create policy "Public read published posts"
  on blog_posts for select using (published = true);

create policy "Admins full access on blog_posts"
  on blog_posts for all using (is_admin());

-- ── Make yourself admin ────────────────────────────────────────────────────
-- Run this once after signing up, replacing with your email:
-- update profiles set is_admin = true where email = 'your@email.com';
