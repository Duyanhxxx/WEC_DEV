
-- Add employment_type and salary_rate to teachers table
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS employment_type text CHECK (employment_type IN ('full-time', 'part-time')) DEFAULT 'full-time';
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS salary_rate numeric DEFAULT 0;

-- Create teacher_attendance table
CREATE TABLE IF NOT EXISTS teacher_attendance (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id uuid REFERENCES teachers(id) ON DELETE CASCADE,
  date date NOT NULL,
  hours_worked numeric DEFAULT 0,
  status text DEFAULT 'present', -- present, absent, leave
  note text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(teacher_id, date)
);

-- Enable RLS
ALTER TABLE teacher_attendance ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users
CREATE POLICY "Enable all access for authenticated users" ON teacher_attendance
    FOR ALL USING (auth.role() = 'authenticated');
