-- Add protocol column to evaluations table
alter table public.evaluations add column if not exists protocol text;
