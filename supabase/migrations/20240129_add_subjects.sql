
-- Create subjects table
create table if not exists subjects (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null unique,
  code text
);

-- Create student_subjects table
create table if not exists student_subjects (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references students(id) on delete cascade,
  subject_id uuid references subjects(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(student_id, subject_id)
);

-- Add subject_id to attendance
alter table attendance add column if not exists subject_id uuid references subjects(id);

-- Enable RLS
alter table subjects enable row level security;
create policy "Enable all for authenticated users" on subjects for all using (auth.role() = 'authenticated');

alter table student_subjects enable row level security;
create policy "Enable all for authenticated users" on student_subjects for all using (auth.role() = 'authenticated');
