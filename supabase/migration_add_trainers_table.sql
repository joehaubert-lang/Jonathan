-- Migration: Create trainers table
create table public.trainers (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text unique not null,
  photo text,
  specialty text,
  phone text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS
alter table public.trainers enable row level security;

-- Public access for dev (adjust for auth later)
create policy "Public all access" on public.trainers for all using (true);

-- Seed default trainer (Optional, for testing)
insert into public.trainers (name, email, specialty, photo)
values ('Treinador FitFlow', 'contato@fitflow.com', 'Consultoria Esportiva', 'https://picsum.photos/id/64/100/100')
on conflict (email) do nothing;

-- Notify PostgREST to reload schema
notify pgrst, 'reload config';
