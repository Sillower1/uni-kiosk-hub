-- Tighten RLS for faculty_members to prevent public exposure of sensitive columns
-- 1) Ensure RLS is enabled (no-op if already)
ALTER TABLE public.faculty_members ENABLE ROW LEVEL SECURITY;

-- 2) Drop overly permissive public SELECT policy
DROP POLICY IF EXISTS "Public can view basic faculty info" ON public.faculty_members;

-- Note: Public access to non-sensitive data remains available via the
-- SECURITY DEFINER function public.get_public_faculty_members(), which
-- returns only whitelisted columns. Admins retain full access via the
-- existing "Admins can manage faculty members" policy.
