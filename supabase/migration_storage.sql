-- Create the storage bucket 'evaluation-photos' if it doesn't exist
insert into storage.buckets (id, name, public)
values ('evaluation-photos', 'evaluation-photos', true)
on conflict (id) do nothing;

-- Set up security policies for the bucket
-- Allow public access to view photos
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'evaluation-photos' );

-- Allow authenticated uploads (or public for this dev/demo context)
create policy "Public Upload"
  on storage.objects for insert
  with check ( bucket_id = 'evaluation-photos' );

-- Allow updates (for replacing photos)
create policy "Public Update"
  on storage.objects for update
  using ( bucket_id = 'evaluation-photos' );
