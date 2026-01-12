-- Add birth_date column to students table
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'students' and column_name = 'birth_date') then
    alter table public.students add column birth_date date;
  end if;
end $$;
