import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

const photoFrames = [
  { id: 1, name: 'DEÜ Klasik', style: 'border-8 border-primary' },
  { id: 2, name: 'Modern', style: 'border-4 border-accent rounded-2xl' },
  { id: 3, name: 'Mezuniyet', style: 'border-6 border-gradient-to-r from-accent to-primary rounded-lg' },
  { id: 4, name: 'YBS Özel', style: 'border-8 border-double border-primary' },
];

export default function SharedPhotoPage() {
  const [searchParams] = useSearchParams();
  const [imageData, setImageData] = useState<string | null>(null);
  const [frameName, setFrameName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPhoto = async () => {
      const photoId = searchParams.get('id');
      const frameParam = searchParams.get('frame');
      
      if (photoId) {
        // UUID formatında ise veritabanından çek
        if (photoId.includes('-')) {
          try {
            const { data, error } = await supabase
              .from('saved_photos')
              .select('*')
              .eq('id', photoId)
              .eq('is_public', true)
              .single();

            if (error) throw error;
            
            // Süre kontrolü
            if (data.share_expires_at && new Date(data.share_expires_at) < new Date()) {
              setImageData(null);
              setLoading(false);
              return;
            }
            
            setImageData(data.image_data);
            setFrameName(data.frame_name);
          } catch (error) {
            console.error('Error fetching photo:', error);
            setImageData(null);
          }
        } else {
          // Eski localStorage sistemi
          const savedPhoto = localStorage.getItem(photoId);
          if (savedPhoto) {
            setImageData(savedPhoto);
            setFrameName(decodeURIComponent(frameParam || 'DEÜ Klasik'));
          }
        }
      } else {
        // Eski URL sistemi desteği (geriye dönük uyumluluk)
        const imgParam = searchParams.get('img');
        if (imgParam) {
          try {
            const decodedImage = decodeURIComponent(imgParam);
            setImageData(decodedImage);
            setFrameName(frameParam || 'DEÜ Klasik');
          } catch (error) {
            console.error('Fotoğraf yüklenemedi:', error);
          }
        }
      }
      
      setLoading(false);
    };

    fetchPhoto();
  }, [searchParams]);

  const downloadPhoto = () => {
    if (imageData) {
      const link = document.createElement('a');
      link.href = imageData;
      link.download = `deu-ybs-hatira-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getFrameStyle = () => {
    const frame = photoFrames.find(f => f.name === frameName);
    return frame ? frame.style : photoFrames[0].style;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Fotoğraf yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!imageData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background p-6 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold text-primary mb-4">Fotoğraf Bulunamadı</h1>
          <p className="text-muted-foreground mb-6">
            Paylaşılan fotoğraf bulunamadı veya süresi dolmuş. Lütfen QR kodu tekrar okutun.
          </p>
          <Button onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Geri Dön
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4">Paylaşılan Hatıra Fotoğrafı</h1>
          <p className="text-xl text-muted-foreground">
            Dokuz Eylül Üniversitesi YBS bölümü
          </p>
        </div>

        {/* Photo Display */}
        <Card className="mb-8 p-8 bg-gradient-to-br from-card to-secondary/10 shadow-lg">
          <div className="aspect-[4/3] max-w-2xl mx-auto bg-gradient-to-br from-muted/50 to-background rounded-2xl border-4 border-dashed border-muted-foreground/20 flex items-center justify-center overflow-hidden">
            <div className={cn("w-full h-full relative", getFrameStyle())}>
              <img 
                src={imageData} 
                alt="Shared Photo" 
                className="w-full h-full object-cover rounded-lg"
              />
              <div className="absolute bottom-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-lg text-sm font-medium">
                {frameName || 'DEÜ Klasik'}
              </div>
            </div>
          </div>
        </Card>

        {/* Download Button */}
        <div className="flex justify-center space-x-4">
          <Button
            onClick={downloadPhoto}
            size="lg"
            className="bg-gradient-to-r from-primary to-accent hover:from-primary-hover hover:to-accent-hover text-xl px-12 py-6 rounded-2xl shadow-lg"
          >
            <Download className="w-8 h-8 mr-3" />
            Fotoğrafı İndir
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => window.history.back()}
            className="text-xl px-12 py-6 rounded-2xl"
          >
            <ArrowLeft className="w-6 h-6 mr-3" />
            Geri Dön
          </Button>
        </div>
      </div>
    </div>
  );
}