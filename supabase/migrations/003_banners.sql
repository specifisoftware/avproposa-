-- Side banners for the proposal builder page
create table if not exists banners (
  id         uuid default gen_random_uuid() primary key,
  position   text not null check (position in ('left', 'right')),
  image_url  text not null default '',
  link_url   text default '',
  active     boolean default true,
  created_at timestamptz default now()
);

alter table banners enable row level security;

-- Anyone (including logged-in users) can read active banners
create policy "Public read active banners"
  on banners for select using (active = true);

-- Admins have full access
create policy "Admins full access on banners"
  on banners for all using (is_admin());
