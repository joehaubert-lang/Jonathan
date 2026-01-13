-- Add Pollock 7-fold skinfolds columns to evaluations table
alter table evaluations
add column if not exists fold_chest numeric,
add column if not exists fold_axillary numeric,
add column if not exists fold_triceps numeric,
add column if not exists fold_subscapular numeric,
add column if not exists fold_abdominal numeric,
add column if not exists fold_suprailiac numeric,
add column if not exists fold_thigh numeric;
