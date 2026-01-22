-- CHẠY TOÀN BỘ ĐOẠN MÃ NÀY TRONG SQL EDITOR TRÊN SUPABASE DASHBOARD

-- 1. Cấp quyền cơ bản cho bảng classes (đề phòng trường hợp quyền table bị thiếu)
GRANT ALL ON TABLE classes TO postgres, service_role;
GRANT ALL ON TABLE classes TO authenticated;
GRANT ALL ON TABLE classes TO anon;

-- 2. Đảm bảo bảng classes có cột user_id và liên kết đúng
ALTER TABLE IF EXISTS classes 
ADD COLUMN IF NOT EXISTS user_id UUID DEFAULT auth.uid();

-- (Tùy chọn) Thêm ràng buộc khóa ngoại nếu chưa có, nhưng cẩn thận lỗi nếu bảng users chưa sync
-- ALTER TABLE classes ADD CONSTRAINT classes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);

-- 3. Kích hoạt RLS
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;

-- 4. Xóa SẠCH các policy cũ để tránh xung đột
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON classes;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON classes;
DROP POLICY IF EXISTS "Enable update for owners" ON classes;
DROP POLICY IF EXISTS "Enable delete for owners" ON classes;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON classes;
DROP POLICY IF EXISTS "classes_insert_policy" ON classes;
DROP POLICY IF EXISTS "classes_select_policy" ON classes;
DROP POLICY IF EXISTS "classes_update_policy" ON classes;
DROP POLICY IF EXISTS "classes_delete_policy" ON classes;

-- 5. Tạo Policy mới (Cực kỳ chi tiết)

-- POLICY INSERT: Cho phép thêm mới nếu user đã đăng nhập
-- Quan trọng: Dùng (true) cho WITH CHECK để cho phép insert mọi dòng miễn là authenticated
-- Sau đó, trigger hoặc default value sẽ lo phần user_id, hoặc tin tưởng client gửi đúng.
-- Tuy nhiên, để bảo mật, ta nên check auth.uid() = user_id
CREATE POLICY "classes_insert_policy"
ON classes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- POLICY SELECT: Chỉ xem lớp của mình
CREATE POLICY "classes_select_policy"
ON classes FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- POLICY UPDATE: Chỉ sửa lớp của mình
CREATE POLICY "classes_update_policy"
ON classes FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- POLICY DELETE: Chỉ xóa lớp của mình
CREATE POLICY "classes_delete_policy"
ON classes FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
