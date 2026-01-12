
-- Create exercise_library table
create table if not exists public.exercise_library (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  video_url text,
  muscle_group text,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.exercise_library enable row level security;

-- Create policy for full access (since this is a single trainer app for now)
create policy "Allow full access to exercise_library"
  on public.exercise_library
  for all
  using (true)
  with check (true);

-- Populate with some initial data (optional but helpful)
insert into public.exercise_library (name, muscle_group, video_url)
values
  ('Supino Reto com Halteres', 'Peitoral', 'https://www.youtube.com/watch?v=kGso0r_1xfo'),
  ('Agachamento Livre', 'Pernas', 'https://www.youtube.com/watch?v=R9K42k8l5lY'),
  ('Puxada Alta', 'Costas', 'https://www.youtube.com/watch?v=CAwf7n6Luuc')
on conflict do nothing;
