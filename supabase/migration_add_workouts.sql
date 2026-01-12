-- Create Workouts Table
create table if not exists public.workouts (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references public.students(id) on delete cascade not null,
  name text not null, -- e.g. "Treino A - Peito e Tríceps"
  goal text, -- e.g. "Hipertrofia"
  frequency text, -- e.g. "3x por semana"
  start_date date,
  end_date date,
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Exercises Table
create table if not exists public.exercises (
  id uuid default gen_random_uuid() primary key,
  workout_id uuid references public.workouts(id) on delete cascade not null,
  name text not null, -- e.g. "Supino Reto"
  sets integer,
  reps text, -- text because it can be "12-15" or "Falha"
  load text, -- text because it can be "20kg"
  rest text, -- e.g. "60s"
  observation text,
  order_index integer default 0, -- to keep exercises in order
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS Policies (Open for now as per project pattern, or restrict if needed later)
alter table public.workouts enable row level security;
alter table public.exercises enable row level security;

create policy "Enable all access for anon users" on public.workouts
for all using (true) with check (true);

create policy "Enable all access for anon users" on public.exercises
for all using (true) with check (true);
