-- Add new fields to faculty_members table for detailed academic information
ALTER TABLE public.faculty_members 
ADD COLUMN IF NOT EXISTS education TEXT,
ADD COLUMN IF NOT EXISTS research_areas TEXT,
ADD COLUMN IF NOT EXISTS position TEXT;

-- Update the get_public_faculty_members function to include new fields
CREATE OR REPLACE FUNCTION public.get_public_faculty_members()
 RETURNS TABLE(
   id uuid, 
   name text, 
   title text, 
   department text, 
   office text, 
   image_url text, 
   education text,
   research_areas text,
   position text,
   created_at timestamp with time zone, 
   updated_at timestamp with time zone
 )
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT 
    f.id,
    f.name,
    f.title,
    f.department,
    f.office,
    f.image_url,
    f.education,
    f.research_areas,
    f.position,
    f.created_at,
    f.updated_at
  FROM public.faculty_members f
  ORDER BY f.department, f.name;
$function$;