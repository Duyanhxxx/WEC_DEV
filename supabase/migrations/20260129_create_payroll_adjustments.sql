create table if not exists payroll_adjustments (
  id uuid default gen_random_uuid() primary key,
  teacher_id uuid references teachers(id) on delete cascade,
  staff_id uuid references staff(id) on delete cascade,
  month text not null, -- Format: 'YYYY-MM'
  amount numeric not null default 0,
  type text not null check (type in ('bonus', 'deduction')),
  description text,
  created_at timestamptz default now(),
  
  -- Ensure only one of teacher_id or staff_id is set
  constraint payroll_adjustments_entity_check check (
    (teacher_id is not null and staff_id is null) or
    (teacher_id is null and staff_id is not null)
  )
);

-- Index for faster queries
create index if not exists idx_payroll_adjustments_month on payroll_adjustments(month);
create index if not exists idx_payroll_adjustments_teacher on payroll_adjustments(teacher_id);
create index if not exists idx_payroll_adjustments_staff on payroll_adjustments(staff_id);
