-- Run this in Supabase Dashboard > SQL Editor to remove a user by email
-- Replace the email with the user you want to remove

DO $$
DECLARE
  target_user_id uuid;
BEGIN
  SELECT id INTO target_user_id FROM auth.users WHERE email = 'ujjwal.agarwal2024@vitstudent.ac.in';
  
  IF target_user_id IS NOT NULL THEN
    -- Delete payment requests
    DELETE FROM public.payment_requests WHERE user_id = target_user_id;
    -- Delete subscriptions
    DELETE FROM public.subscriptions WHERE user_id = target_user_id;
    -- Delete auth user (cascades to profiles, user_roles, domain_progress, bookmarks, etc.)
    DELETE FROM auth.users WHERE id = target_user_id;
    RAISE NOTICE 'User % removed successfully', 'ujjwal.agarwal2024@vitstudent.ac.in';
  ELSE
    RAISE EXCEPTION 'User not found with email: ujjwal.agarwal2024@vitstudent.ac.in';
  END IF;
END $$;
