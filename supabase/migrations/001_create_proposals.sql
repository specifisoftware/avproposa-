-- proposals table: tracks download events for daily limit enforcement
create table if not exists proposals (
  id         uuid        default gen_random_uuid() primary key,
  user_id    uuid        references auth.users(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  date       date
);

alter table proposals enable row level security;

create policy "Users can view their own proposals"
  on proposals for select
  using (auth.uid() = user_id);

create policy "Users can insert their own proposals"
  on proposals for insert
  with check (auth.uid() = user_id);
