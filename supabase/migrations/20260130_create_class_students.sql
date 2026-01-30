
-- Add subject_id to classes table
ALTER TABLE classes ADD COLUMN IF NOT EXISTS subject_id uuid REFERENCES subjects(id) ON DELETE SET NULL;

-- Create class_students table for many-to-many relationship
CREATE TABLE IF NOT EXISTS class_students (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id uuid REFERENCES classes(id) ON DELETE CASCADE,
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(class_id, student_id)
);

-- Enable RLS
ALTER TABLE class_students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all access for authenticated users" ON class_students
    FOR ALL USING (auth.role() = 'authenticated');
