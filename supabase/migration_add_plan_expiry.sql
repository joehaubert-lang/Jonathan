-- Add plan_expiry_date to students table
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS plan_expiry_date DATE;
