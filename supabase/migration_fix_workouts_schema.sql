-- FINAL FIX SCRIPT v4 (The Ultimate Fix)

-- 1. Fix WORKOUTS table
alter table public.workouts add column if not exists goal text;
alter table public.workouts add column if not exists active boolean default true;
alter table public.workouts add column if not exists source text default 'manual';
alter table public.workouts add column if not exists frequency text;
alter table public.workouts add column if not exists start_date date;
alter table public.workouts add column if not exists end_date date;
update public.workouts set active = true where active is null;
alter table public.workouts alter column student_id drop not null;

-- 2. Fix EXERCISES table
alter table public.exercises add column if not exists workout_id uuid references public.workouts(id) on delete cascade;

-- Ensure all these columns exist
alter table public.exercises add column if not exists load text;
alter table public.exercises add column if not exists reps text;
alter table public.exercises add column if not exists sets integer;
alter table public.exercises add column if not exists rest text;
alter table public.exercises add column if not exists observation text;
alter table public.exercises add column if not exists order_index integer default 0;

-- Fix for muscle_group (missing column error or null violation)
alter table public.exercises add column if not exists muscle_group text; 
-- If it was created as NOT NULL but we have old data, this might fail, but usually adding a column is nullable by default.
-- If the error was violation of not-null, it means the column exists and is not null. Use this to be safe:
alter table public.exercises alter column muscle_group drop not null; 

-- 3. Force Cache Reload
notify pgrst, 'reload config';
