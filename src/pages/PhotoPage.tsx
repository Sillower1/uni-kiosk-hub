import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, Camera, Download, Share2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import QRCode from 'react-qr-code';
import { supabase } from '@/integrations/supabase/client';

interface PhotoFrame {
  id: string;
  name: string;
  image_url: string;
  display_order: number;
}

export default function PhotoPage() {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [photoFrames, setPhotoFrames] = useState<PhotoFrame[]>([]);
  const [photoTaken, setPhotoTaken] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [isMirrored, setIsMirrored] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [shareableImageUrl, setShareableImageUrl] = useState<string | null>(null);
  const [photoTimer, setPhotoTimer] = useState(0);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Countdown timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCountingDown && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (isCountingDown && countdown === 0) {
      setIsCountingDown(false);
      takePhoto();
    }
    return () => clearInterval(interval);
  }, [isCountingDown, countdown]);

  useEffect(() => {
    fetchFrames();
  }, []);

  const fetchFrames = async () => {
    try {
      const { data, error } = await supabase
        .from('frames')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setPhotoFrames(data || []);
    } catch (error) {
      console.error('Error fetching frames:', error);
    }
  };

  const nextFrame = () => {
    setCurrentFrame((prev) => (prev + 1) % photoFrames.length);
  };

  const prevFrame = () => {
    setCurrentFrame((prev) => (prev - 1 + photoFrames.length) % photoFrames.length);
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
      });
      setStream(mediaStream);
      setCameraActive(true);
    } catch (error) {
      console.error('Kamera erişimi başarısız:', error);
      alert('Kamera erişimi için izin gerekli');
    }
  };

  // Kamerayı video elementine bağla ve oynat
  useEffect(() => {
    const video = videoRef.current;
    if (cameraActive && stream && video) {
      try {
        //
        video.srcObject = stream;
        const playPromise = video.play();
        if (playPromise && typeof (playPromise as any).catch === 'function') {
          (playPromise as Promise<void>).catch(() => {});
        }
      } catch (e) {
        console.warn('Video oynatma başlatılamadı');
      }
    }
  }, [cameraActive, stream]);

  // Bileşen kapandığında kamerayı kapat
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [stream]);

  const startPhotoTimer = () => {
    if (photoTimer === 0) {
      takePhoto();
    } else {
      setCountdown(photoTimer);
      setIsCountingDown(true);
    }
  };

  const takePhoto = async () => {
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (video && context && photoFrames.length > 0) {
      // Daha yüksek çözünürlük için 2x scale
      const scale = 2;
      const baseWidth = video.videoWidth || video.clientWidth;
      const baseHeight = video.videoHeight || video.clientHeight;
      canvas.width = baseWidth * scale;
      canvas.height = baseHeight * scale;

      // Video çiziminde aynalama uygula
      if (isMirrored) {
        context.save();
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
      }

      // Önce video görüntüsünü çiz
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Aynalama varsa geri al
      if (isMirrored) {
        context.restore();
      }

      // Çerçeveyi PNG olarak overlay et (aynalama olmadan)
      await applyFrameOverlay(context, canvas.width, canvas.height);

      const photoDataUrl = canvas.toDataURL('image/png');
      setPreviewImage(photoDataUrl);
      setPhotoTaken(true);

      // Kamerayı kapat
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
        setCameraActive(false);
      }
    }
  };

  const applyFrameOverlay = (context: CanvasRenderingContext2D, width: number, height: number): Promise<void> => {
    return new Promise((resolve) => {
      const currentFrameData = photoFrames[currentFrame];
      if (!currentFrameData) {
        resolve();
        return;
      }

      const frameImage = new Image();
      frameImage.crossOrigin = 'anonymous';
      frameImage.onload = () => {
        // Yüksek kaliteli çizim için imageSmoothingQuality ayarla
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = 'high';
        // Çerçeve resmini yüksek çözünürlükte çiz
        context.drawImage(frameImage, 0, 0, width, height);
        resolve();
      };
      frameImage.onerror = () => {
        console.error('Frame image failed to load');
        resolve();
      };
      frameImage.src = currentFrameData.image_url;
    });
  };

  const resetPhoto = () => {
    setPhotoTaken(false);
    setPreviewImage(null);
    setShowQR(false);
    setShareableImageUrl(null);
    // Kamerayı açık tut, sadece fotoğrafı sıfırla
    if (!cameraActive) {
      startCamera();
    }
  };

  const savePhoto = async () => {
    if (previewImage && photoFrames.length > 0) {
      try {
        // Tüm fotoğraflar 5 dakika sonra silinecek
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 5);
        
        const { error } = await supabase
          .from('saved_photos')
          .insert({
            image_data: previewImage,
            frame_name: photoFrames[currentFrame]?.name || 'DEÜ Klasik',
            frame_id: photoFrames[currentFrame]?.id || null,
          });

        if (error) throw error;
        
        // Fotoğrafı indirmek için de kullan
        const link = document.createElement('a');
        link.href = previewImage;
        link.download = `deu-ybs-hatira-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error('Error saving photo:', error);
        alert('Fotoğraf kaydedilirken hata oluştu');
      }
    }
  };

  const saveAndSharePhoto = async () => {
    if (previewImage && photoFrames.length > 0) {
      try {
        // 5 dakika sonra expire olacak tarih
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 5);
        
        const { data, error } = await supabase
          .from('saved_photos')
          .insert({
            image_data: previewImage,
            frame_name: photoFrames[currentFrame]?.name || 'DEÜ Klasik',
            frame_id: photoFrames[currentFrame]?.id || null,
            shared_at: new Date().toISOString(),
            share_expires_at: expiresAt.toISOString(),
            is_public: true,
          })
          .select()
          .single();

        if (error) throw error;
        
        // QR kod için URL oluştur
        const shareUrl = `${window.location.origin}/shared-photo?id=${data.id}`;
        setShareableImageUrl(shareUrl);
        setShowQR(true);
      } catch (error) {
        console.error('Error saving and sharing photo:', error);
        alert('Fotoğraf kaydedilip paylaşılırken hata oluştu');
      }
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-background via-secondary/20 to-background overflow-hidden flex flex-col p-4">
      <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col min-h-0">
        {/* Header */}
        <div className="text-center mb-3">
          <h1 className="text-3xl font-bold text-primary mb-1">Hatıra Fotoğrafı</h1>
          <p className="text-base text-muted-foreground">
            Dokuz Eylül Üniversitesi YBS bölümünde özel anınızı ölümsüzleştirin
          </p>
        </div>

        {/* Main Photo Area */}
        <Card className="mb-4 p-4 bg-gradient-to-br from-card to-secondary/10 shadow-lg flex-1 flex flex-col min-h-0">
          <div className="w-full h-full max-w-3xl mx-auto bg-gradient-to-br from-muted/50 to-background rounded-2xl border-4 border-dashed border-muted-foreground/20 flex items-center justify-center overflow-hidden">
            {photoTaken && previewImage ? (
              <div className="w-full h-full relative">
                <img 
                  src={previewImage} 
                  alt="Preview" 
                  className="w-full h-full object-cover rounded-lg"
                />
                <div className="absolute bottom-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-lg text-sm font-medium">
                  {photoFrames[currentFrame]?.name || 'Çerçeve'}
                </div>
              </div>
            ) : cameraActive ? (
              <div className="w-full h-full relative">
                <video
                  id="camera-video"
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={cn("w-full h-full object-cover rounded-lg", isMirrored && "scale-x-[-1]")}
                />
                {photoFrames[currentFrame] && (
                  <div className="absolute inset-0 pointer-events-none">
                    <img
                      src={photoFrames[currentFrame].image_url}
                      alt="Frame overlay"
                      className="w-full h-full object-cover rounded-lg opacity-50"
                    />
                  </div>
                )}
                {isCountingDown && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                    <div className="text-8xl font-bold text-white">
                      {countdown}
                    </div>
                  </div>
                )}
                <div className="absolute bottom-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-lg text-sm font-medium">
                  {photoFrames[currentFrame]?.name || 'Çerçeve'}
                </div>
              </div>
            ) : (
              <div className="text-center">
                <Camera className="w-24 h-24 text-muted-foreground/40 mx-auto mb-4" />
                <p className="text-2xl text-muted-foreground">
                  Fotoğraf Önizleme Alanı
                </p>
                <p className="text-lg text-muted-foreground/60 mt-2">
                  {photoFrames[currentFrame]?.name || 'Çerçeve seçili'} çerçevesi seçili
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Controls */}
        <div className="flex flex-col items-center space-y-3">
          {/* Frame Selection */}
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={prevFrame}
              className="w-12 h-12 rounded-full p-0"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            
            <div className="text-center min-w-[160px]">
              <h3 className="text-xl font-semibold text-primary mb-1">
                {photoFrames[currentFrame]?.name || 'Çerçeve Yok'}
              </h3>
              <div className="flex justify-center space-x-2">
                {photoFrames.map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      "w-3 h-3 rounded-full transition-all",
                      index === currentFrame
                        ? "bg-primary scale-125"
                        : "bg-muted-foreground/30"
                    )}
                  />
                ))}
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={nextFrame}
              className="w-12 h-12 rounded-full p-0"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            {!photoTaken ? (
              !cameraActive ? (
                <Button
                  onClick={startCamera}
                  size="default"
                  className="bg-gradient-to-r from-primary to-accent hover:from-primary-hover hover:to-accent-hover text-lg px-8 py-5 rounded-xl shadow-lg"
                >
                  <Camera className="w-6 h-6 mr-2" />
                  Kamerayı Aç
                </Button>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  {/* Timer Selection */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Gecikme:</span>
                    {[0, 3, 5, 10].map((seconds) => (
                      <Button
                        key={seconds}
                        variant={photoTimer === seconds ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPhotoTimer(seconds)}
                        className="w-12 h-8 text-sm"
                      >
                        {seconds}s
                      </Button>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={startPhotoTimer}
                      disabled={isCountingDown}
                      size="default"
                      className="bg-gradient-to-r from-primary to-accent hover:from-primary-hover hover:to-accent-hover text-lg px-8 py-5 rounded-xl shadow-lg"
                    >
                      <Camera className="w-6 h-6 mr-2" />
                      {isCountingDown ? `${countdown}...` : photoTimer === 0 ? 'Fotoğraf Çek' : `${photoTimer}s Sonra Çek`}
                    </Button>
                    <Button
                      variant="outline"
                      size="default"
                      onClick={() => setIsMirrored((v) => !v)}
                      className="text-base px-4 py-5"
                    >
                      {isMirrored ? 'Aynalamayı Kapat' : 'Aynala'}
                    </Button>
                  </div>
                </div>
              )
            ) : (
              <>
                <Button
                  onClick={resetPhoto}
                  variant="outline"
                  size="default"
                  className="text-base px-6 py-5"
                >
                  Yeniden Çek
                </Button>
                <Button
                  onClick={savePhoto}
                  size="default"
                  className="bg-accent hover:bg-accent-hover text-base px-6 py-5"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Kaydet
                </Button>
                <Button
                  onClick={saveAndSharePhoto}
                  size="default"
                  variant="outline"
                  className="text-base px-6 py-5"
                >
                  <Share2 className="w-5 h-5 mr-2" />
                  Kaydet ve Paylaş
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* QR Code Dialog */}
      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Fotoğrafı Paylaş</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-4 top-4"
              onClick={() => setShowQR(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4 p-4">
            <p className="text-sm text-muted-foreground text-center">
              Bu QR kodu telefonunuz ile okutarak fotoğrafı mobil cihazınıza indirebilirsiniz (5 dakika geçerli)
            </p>
            {shareableImageUrl && (
              <div className="bg-white p-4 rounded-lg">
                <QRCode value={shareableImageUrl} size={200} />
              </div>
            )}
            <p className="text-xs text-muted-foreground text-center max-w-sm">
              QR kodu telefonunuzun kamerası ile okutun ve açılan sayfadan "Fotoğrafı İndir" butonuna tıklayın
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}