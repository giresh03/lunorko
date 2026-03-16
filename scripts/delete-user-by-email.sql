-- Run this in Supabase Dashboard > SQL Editor to remove a user by email
-- Replace the email with the user you want to remove
-- Project: lgtpgglphbcncrtaajsg (ensure you're in the correct project's SQL Editor)

DO $$
DECLARE
  target_user_id uuid;
BEGIN
  SELECT id INTO target_user_id FROM auth.users WHERE email = 'ujjwal.agarwal2024@vitstudent.ac.in';
  
  IF target_user_id IS NOT NULL THEN
    -- Clear FK references
    UPDATE public.community_posts SET removed_by = null WHERE removed_by = target_user_id;
    -- Delete payment requests
    DELETE FROM public.payment_requests WHERE user_id = target_user_id;
    -- Delete subscriptions
    DELETE FROM public.subscriptions WHERE user_id = target_user_id;
    -- Delete auth user (cascades to profiles, user_roles, domain_progress, bookmarks, etc.)
    DELETE FROM auth.users WHERE id = target_user_id;
    RAISE NOTICE 'User removed successfully';
  ELSE
    RAISE EXCEPTION 'User not found';
  END IF;
END $$;
