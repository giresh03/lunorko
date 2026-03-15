-- Ensure lunor.ko@gmail.com has admin role in user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'lunor.ko@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;
