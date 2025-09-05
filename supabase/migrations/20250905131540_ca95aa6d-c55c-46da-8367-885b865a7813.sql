-- Add public SELECT policy for faculty_members table
CREATE POLICY "Anyone can view faculty members" 
ON public.faculty_members 
FOR SELECT 
USING (true);