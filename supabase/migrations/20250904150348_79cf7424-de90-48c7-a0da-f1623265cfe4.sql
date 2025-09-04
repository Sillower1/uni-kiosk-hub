-- Create photos table for saved photos
CREATE TABLE public.saved_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_data TEXT NOT NULL,
  frame_name TEXT NOT NULL,
  frame_id UUID REFERENCES public.frames(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  shared_at TIMESTAMP WITH TIME ZONE,
  share_expires_at TIMESTAMP WITH TIME ZONE,
  is_public BOOLEAN NOT NULL DEFAULT false
);

-- Enable RLS
ALTER TABLE public.saved_photos ENABLE ROW LEVEL SECURITY;

-- Create policies for saved photos
CREATE POLICY "Admins can manage all saved photos" 
ON public.saved_photos 
FOR ALL 
USING (is_admin(auth.uid()));

CREATE POLICY "Anyone can view public shared photos" 
ON public.saved_photos 
FOR SELECT 
USING (is_public = true AND (share_expires_at IS NULL OR share_expires_at > now()));

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_saved_photos_updated_at
BEFORE UPDATE ON public.saved_photos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();