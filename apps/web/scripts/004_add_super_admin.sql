-- Add super admin for krutik@infinitylinkage.com
-- This script should be run after the super_admins table is created
-- You'll need to replace USER_ID with the actual UUID from auth.users table

INSERT INTO public.super_admins (user_id, email, role)
SELECT id, email, 'super_admin'
FROM auth.users
WHERE email = 'krutik@infinitylinkage.com'
ON CONFLICT (user_id) DO UPDATE 
SET role = 'super_admin', updated_at = NOW();

-- Verify the insert
SELECT * FROM public.super_admins WHERE email = 'krutik@infinitylinkage.com';
