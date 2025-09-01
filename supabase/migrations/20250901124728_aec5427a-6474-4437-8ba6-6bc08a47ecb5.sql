-- Fix security vulnerability: Restrict faculty_members access to authenticated users only
-- Remove the overly permissive policy that allows anyone to view faculty data

DROP POLICY IF EXISTS "Anyone can view faculty members" ON public.faculty_members;

-- Create a new policy that only allows authenticated users to view faculty members
-- This protects sensitive personal information (email, phone, office) from public access
CREATE POLICY "Authenticated users can view faculty members" 
ON public.faculty_members 
FOR SELECT 
TO authenticated
USING (true);

-- Optionally, if you want to allow public access to only basic non-sensitive info in the future,
-- you could create a view like this (commented out for now):
/*
CREATE VIEW public.faculty_members_public AS
SELECT 
  id,
  name,
  title,
  department,
  image_url,
  created_at,
  updated_at
FROM public.faculty_members;

-- Then create RLS policy for the view
ALTER VIEW public.faculty_members_public OWNER TO postgres;
ALTER TABLE public.faculty_members_public ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public faculty info" 
ON public.faculty_members_public 
FOR SELECT 
USING (true);
*/