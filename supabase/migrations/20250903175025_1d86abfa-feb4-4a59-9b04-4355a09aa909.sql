-- Create storage policies for frames bucket
CREATE POLICY "Admin can upload frames" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'frames' 
  AND is_admin(auth.uid())
);

CREATE POLICY "Anyone can view frames" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'frames');

CREATE POLICY "Admin can update frames" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'frames' 
  AND is_admin(auth.uid())
);

CREATE POLICY "Admin can delete frames" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'frames' 
  AND is_admin(auth.uid())
);