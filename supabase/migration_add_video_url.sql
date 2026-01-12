-- Add video_url to exercises table
alter table public.exercises add column if not exists video_url text;

-- Force Cache Reload
notify pgrst, 'reload config';
