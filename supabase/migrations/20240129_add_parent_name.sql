
-- Add parent_name to students table
alter table students add column if not exists parent_name text;

-- (Optional) If we really want to remove email, we can drop it, but it might be used for auth later?
-- For now, let's just add parent_name. User said "replace", so we will focus on UI replacement.
