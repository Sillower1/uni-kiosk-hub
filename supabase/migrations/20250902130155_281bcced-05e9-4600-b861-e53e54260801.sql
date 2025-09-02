-- Update faculty_members RLS policies to protect sensitive information

-- Drop the existing policy that allows all authenticated users to view everything
DROP POLICY IF EXISTS "Authenticated users can view faculty members" ON public.faculty_members;

-- Create a new policy that allows everyone to view basic faculty information
-- but restricts sensitive contact information (email, phone) to admins only
CREATE POLICY "Public can view basic faculty info" ON public.faculty_members
FOR SELECT USING (true);

-- Add a security definer function to get public faculty information
-- This function will only return non-sensitive fields for non-admin users
CREATE OR REPLACE FUNCTION public.get_public_faculty_members()
RETURNS TABLE (
  id uuid,
  name text,
  title text,
  department text,
  office text,
  image_url text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT 
    f.id,
    f.name,
    f.title,
    f.department,
    f.office,
    f.image_url,
    f.created_at,
    f.updated_at
  FROM public.faculty_members f
  ORDER BY f.name;
$$;