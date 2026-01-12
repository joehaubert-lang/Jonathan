-- Create Financial Records Table
create table financial_records (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  student_id uuid references students(id), -- Nullable for general expenses
  type text not null check (type in ('income', 'expense')),
  amount numeric not null,
  due_date date not null,
  status text not null check (status in ('pending', 'paid', 'overdue')),
  payment_method text check (payment_method in ('pix', 'credit_card', 'cash', 'boleto')),
  description text,
  user_id uuid references auth.users(id) default auth.uid()
);

-- Enable Row Level Security
alter table financial_records enable row level security;

-- Create Policy (Simple policy for getting started, similar to others)
create policy "Enable all access for authenticated users" on financial_records
  for all using (true) with check (true);

-- Create Policy for anonymous (if currently using anon key in dev for everything)
create policy "Enable all access for anon" on financial_records
  for all using (true) with check (true);
