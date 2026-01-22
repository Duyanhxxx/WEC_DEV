-- Enable Row Level Security
alter default privileges in schema public grant all on tables to postgres, anon, authenticated, service_role;

-- 1. Classes Table
create table classes (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  grade text,
  teacher text,
  user_id uuid references auth.users(id)
);

-- 2. Students Table
create table students (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  student_code text unique,
  name text not null,
  email text,
  phone text,
  class_id uuid references classes(id),
  user_id uuid references auth.users(id)
);

-- 3. Teachers Table
create table teachers (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  teacher_code text unique,
  name text not null,
  email text,
  phone text,
  subject text,
  user_id uuid references auth.users(id)
);

-- 4. Attendance Table
create table attendance (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  date date not null,
  class_id uuid references classes(id),
  student_id uuid references students(id),
  status text check (status in ('present', 'absent_excused', 'absent_unexcused')),
  note text,
  user_id uuid references auth.users(id)
);

-- 5. Finance (Transactions) Table
create table transactions (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  date date not null,
  description text not null,
  amount numeric not null,
  type text check (type in ('income', 'expense')),
  user_id uuid references auth.users(id)
);

-- 6. Marketing Reports (Aggregated Data usually, but we can store leads here)
create table leads (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text,
  source text,
  status text,
  user_id uuid references auth.users(id)
);

-- RLS Policies (Simple start: authenticated users can do everything)
alter table classes enable row level security;
create policy "Enable all for authenticated users" on classes for all using (auth.role() = 'authenticated');

alter table students enable row level security;
create policy "Enable all for authenticated users" on students for all using (auth.role() = 'authenticated');

alter table teachers enable row level security;
create policy "Enable all for authenticated users" on teachers for all using (auth.role() = 'authenticated');

alter table attendance enable row level security;
create policy "Enable all for authenticated users" on attendance for all using (auth.role() = 'authenticated');

alter table transactions enable row level security;
create policy "Enable all for authenticated users" on transactions for all using (auth.role() = 'authenticated');

alter table leads enable row level security;
create policy "Enable all for authenticated users" on leads for all using (auth.role() = 'authenticated');
