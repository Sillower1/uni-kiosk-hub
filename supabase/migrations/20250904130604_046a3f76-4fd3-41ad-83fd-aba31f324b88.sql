-- Create markers table for campus locations
CREATE TABLE public.markers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  x_position DECIMAL(5,2) NOT NULL,
  y_position DECIMAL(5,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.markers ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage markers" 
ON public.markers 
FOR ALL 
USING (is_admin(auth.uid()));

CREATE POLICY "Anyone can view active markers" 
ON public.markers 
FOR SELECT 
USING (is_active = true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_markers_updated_at
BEFORE UPDATE ON public.markers
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();