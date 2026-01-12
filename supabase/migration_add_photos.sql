
-- ADD Photos column to evaluations if it doesn't exist
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'evaluations' and column_name = 'photos') then
    alter table public.evaluations add column photos jsonb default '{}'::jsonb;
  end if;
end $$;
