-- 1. Create the trainers table (if not exists)
create table if not exists public.trainers (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text unique not null,
  photo text,
  specialty text,
  phone text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS on table
alter table public.trainers enable row level security;
drop policy if exists "Public all access" on public.trainers;
create policy "Public all access" on public.trainers for all using (true);

-- 2. Create the storage bucket 'trainer-profiles'
-- This part needs to be run in the SQL editor
insert into storage.buckets (id, name, public)
values ('trainer-profiles', 'trainer-profiles', true)
on conflict (id) do nothing;

-- 3. Set up storage policies for 'trainer-profiles'
-- Remove existing to avoid errors if rerunning
drop policy if exists "Public Access" on storage.objects;
drop policy if exists "Public Upload" on storage.objects;
drop policy if exists "Public Update" on storage.objects;

-- Allow public access to view photos
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'trainer-profiles' );

-- Allow public uploads
create policy "Public Upload"
  on storage.objects for insert
  with check ( bucket_id = 'trainer-profiles' );

-- Allow updates
create policy "Public Update"
  on storage.objects for update
  using ( bucket_id = 'trainer-profiles' );

-- Seed default trainer if table is empty
insert into public.trainers (name, email, specialty, photo)
select 'Treinador FitFlow', 'contato@fitflow.com', 'Consultoria Esportiva', 'https://picsum.photos/id/64/100/100'
where not exists (select 1 from public.trainers);
