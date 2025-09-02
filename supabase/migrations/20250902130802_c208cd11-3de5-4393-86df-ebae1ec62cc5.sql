-- Çerçeveler için storage bucket oluştur
INSERT INTO storage.buckets (id, name, public) VALUES ('frames', 'frames', true);

-- Çerçeveler tablosu oluştur
CREATE TABLE public.frames (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  image_url text NOT NULL,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid NOT NULL
);

-- RLS politikaları
ALTER TABLE public.frames ENABLE ROW LEVEL SECURITY;

-- Herkes aktif çerçeveleri görebilir
CREATE POLICY "Anyone can view active frames" ON public.frames
FOR SELECT USING (is_active = true);

-- Adminler tüm çerçeveleri yönetebilir
CREATE POLICY "Admins can manage frames" ON public.frames
FOR ALL USING (is_admin(auth.uid()));

-- Storage politikaları - çerçeve resimleri için
CREATE POLICY "Anyone can view frame images" ON storage.objects
FOR SELECT USING (bucket_id = 'frames');

CREATE POLICY "Admins can upload frame images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'frames' AND is_admin(auth.uid()));

CREATE POLICY "Admins can update frame images" ON storage.objects
FOR UPDATE USING (bucket_id = 'frames' AND is_admin(auth.uid()));

CREATE POLICY "Admins can delete frame images" ON storage.objects
FOR DELETE USING (bucket_id = 'frames' AND is_admin(auth.uid()));

-- Updated at trigger
CREATE TRIGGER update_frames_updated_at
BEFORE UPDATE ON public.frames
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Varsayılan çerçeveler ekle (placeholder olarak)
INSERT INTO public.frames (name, image_url, display_order, created_by) VALUES
('DEÜ Klasik', '/placeholder.svg', 1, (SELECT id FROM auth.users LIMIT 1)),
('Modern', '/placeholder.svg', 2, (SELECT id FROM auth.users LIMIT 1)),
('Mezuniyet', '/placeholder.svg', 3, (SELECT id FROM auth.users LIMIT 1)),
('YBS Özel', '/placeholder.svg', 4, (SELECT id FROM auth.users LIMIT 1));