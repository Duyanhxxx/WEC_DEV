
-- Create staff table
CREATE TABLE IF NOT EXISTS staff (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  staff_code text UNIQUE NOT NULL, -- Mã nhân viên
  name text NOT NULL,
  email text,
  phone text,
  role text, -- Vị trí: Kế toán, Tư vấn, Bảo vệ, Tạp vụ...
  employment_type text CHECK (employment_type IN ('full-time', 'part-time')) DEFAULT 'full-time',
  salary_rate numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create staff_attendance table
CREATE TABLE IF NOT EXISTS staff_attendance (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  staff_id uuid REFERENCES staff(id) ON DELETE CASCADE,
  date date NOT NULL,
  hours_worked numeric DEFAULT 0,
  status text DEFAULT 'present', -- present, absent
  note text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(staff_id, date)
);

-- Enable RLS
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_attendance ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Enable all access for authenticated users" ON staff
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all access for authenticated users" ON staff_attendance
    FOR ALL USING (auth.role() = 'authenticated');
