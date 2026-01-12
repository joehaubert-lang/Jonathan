-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Students Table
create table public.students (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text unique not null,
  photo text,
  status text check (status in ('active', 'inactive', 'pending')) default 'active',
  last_activity timestamp with time zone default timezone('utc'::text, now()),
  goal text,
  plan text check (plan in ('Mensal', 'Trimestral', 'Anual')),
  phone text,
  gender text check (gender in ('masculino', 'feminino')),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Exercises Catalog Table (Base list of exercises)
create table public.exercises (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  muscle_group text not null,
  video_url text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Workouts Table
create table public.workouts (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid references public.students(id) on delete cascade not null,
  name text not null,
  date_created timestamp with time zone default timezone('utc'::text, now()),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Workout Items (Exercises within a workout)
create table public.workout_items (
  id uuid primary key default uuid_generate_v4(),
  workout_id uuid references public.workouts(id) on delete cascade not null,
  exercise_id uuid references public.exercises(id) on delete set null, -- Optional link to catalog
  name text not null, -- Store name here in case catalog item is deleted or custom exercise
  muscle_group text,
  sets int not null,
  reps text not null,
  rest text not null,
  weight text,
  video_url text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Evaluations Table
create table public.evaluations (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid references public.students(id) on delete cascade not null,
  date timestamp with time zone default timezone('utc'::text, now()),
  weight numeric not null,
  height numeric not null,
  body_fat numeric,
  measurements jsonb default '{}'::jsonb, -- Store dynamic measurements
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Notifications Table
create table public.notifications (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid references public.students(id) on delete cascade,
  type text check (type in ('payment', 'workout', 'evaluation', 'system')) not null,
  title text not null,
  description text not null,
  timestamp timestamp with time zone default timezone('utc'::text, now()),
  read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Basic Policies (RLS is enabled by default on new Supabase projects, so we need policies or to disable it)
-- For development simplicity, we can enable public access, but it's better to be explicit.
alter table public.students enable row level security;
alter table public.exercises enable row level security;
alter table public.workouts enable row level security;
alter table public.workout_items enable row level security;
alter table public.evaluations enable row level security;
alter table public.notifications enable row level security;

-- Public READ for now (Adjust as needed for Auth)
create policy "Public read access" on public.students for select using (true);
create policy "Public read access" on public.exercises for select using (true);
create policy "Public read access" on public.workouts for select using (true);
create policy "Public read access" on public.workout_items for select using (true);
create policy "Public read access" on public.evaluations for select using (true);
create policy "Public read access" on public.notifications for select using (true);

-- Public INSERT/UPDATE for now (DANGEROUS: For dev only)
create policy "Public all access" on public.students for all using (true);
create policy "Public all access" on public.exercises for all using (true);
create policy "Public all access" on public.workouts for all using (true);
create policy "Public all access" on public.workout_items for all using (true);
create policy "Public all access" on public.evaluations for all using (true);
create policy "Public all access" on public.notifications for all using (true);
