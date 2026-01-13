-- Migration: Add is_extra column to workouts table
alter table public.workouts add column if not exists is_extra boolean default false;

-- Notify PostgREST to reload schema
notify pgrst, 'reload config';
