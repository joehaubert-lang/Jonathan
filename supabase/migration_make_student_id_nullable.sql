-- Make student_id nullable to support Workout Templates
alter table public.workouts alter column student_id drop not null;
