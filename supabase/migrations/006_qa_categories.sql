create table if not exists qa_categories (
  id         uuid default gen_random_uuid() primary key,
  name       text not null unique,
  position   int default 0,
  created_at timestamptz default now()
);

alter table qa_categories enable row level security;

create policy "Public read qa_categories"
  on qa_categories for select using (true);

create policy "Admins full access on qa_categories"
  on qa_categories for all using (is_admin());
