-- Migration: Create trainer-profiles storage bucket
insert into storage.buckets (id, name, public)
values ('trainer-profiles', 'trainer-profiles', true)
on conflict (id) do nothing;

-- Public read access
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'trainer-profiles' );

-- Public insert/update (for dev)
create policy "Public Upload"
  on storage.objects for insert
  with check ( bucket_id = 'trainer-profiles' );

create policy "Public Update"
  on storage.objects for update
  using ( bucket_id = 'trainer-profiles' );
