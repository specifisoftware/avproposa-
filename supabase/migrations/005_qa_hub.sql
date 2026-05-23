create table if not exists qa_items (
  id           uuid default gen_random_uuid() primary key,
  question     text not null default '',
  slug         text unique not null default '',
  answer       text not null default '',
  category     text default null,
  published    boolean default false,
  position     int default 0,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now(),
  author_id    uuid references auth.users(id)
);

alter table qa_items enable row level security;

create policy "Public read published qa"
  on qa_items for select using (published = true);

create policy "Admins full access on qa_items"
  on qa_items for all using (is_admin());
