-- 1. Tạo bảng profiles (nếu chưa có)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  role text default 'staff' check (role in ('admin', 'staff', 'teacher')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Bật bảo mật RLS
alter table public.profiles enable row level security;

-- Xóa policies cũ để tránh lỗi trùng lặp khi chạy lại
drop policy if exists "Public profiles are viewable by everyone." on public.profiles;
drop policy if exists "Users can insert their own profile." on public.profiles;
drop policy if exists "Users can update own profile." on public.profiles;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- 3. Tạo hàm xử lý khi có user mới đăng ký
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'staff');
  return new;
end;
$$;

-- 4. Tạo Trigger (Kích hoạt mỗi khi có user mới)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 5. ĐỒNG BỘ DỮ LIỆU (Backfill)
-- Tạo profile cho tất cả user hiện có trong hệ thống nếu họ chưa có profile
insert into public.profiles (id, email, role)
select id, email, 'staff'
from auth.users
on conflict (id) do nothing;

-- 6. PHÂN QUYỀN ADMIN
-- Cập nhật quyền admin cho email cụ thể
update public.profiles
set role = 'admin'
where email = 'wonderacademy.vn@gmail.com';
