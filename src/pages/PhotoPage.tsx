import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, Camera, Download, Share2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import QRCode from 'react-qr-code';

const photoFrames = [
  { id: 1, name: 'DEÜ Klasik', preview: '/placeholder.svg', style: 'border-8 border-primary' },
  { id: 2, name: 'Modern', preview: '/placeholder.svg', style: 'border-4 border-accent rounded-2xl' },
  { id: 3, name: 'Mezuniyet', preview: '/placeholder.svg', style: 'border-6 border-gradient-to-r from-accent to-primary rounded-lg' },
  { id: 4, name: 'YBS Özel', preview: '/placeholder.svg', style: 'border-8 border-double border-primary' },
];

export default function PhotoPage() {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [photoTaken, setPhotoTaken] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [isMirrored, setIsMirrored] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [shareableImageUrl, setShareableImageUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

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

  const takePhoto = () => {
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (video && context) {
      canvas.width = video.videoWidth || video.clientWidth;
      canvas.height = video.videoHeight || video.clientHeight;

      if (isMirrored) {
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
      }

      // Önce video görüntüsünü çiz
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Çerçeveyi uygula
      drawFrame(context, canvas.width, canvas.height);

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

  const drawFrame = (context: CanvasRenderingContext2D, width: number, height: number) => {
    const frame = photoFrames[currentFrame];
    const borderWidth = 20; // Çerçeve kalınlığı
    
    context.strokeStyle = '#3B82F6'; // Primary color (blue)
    context.lineWidth = borderWidth;
    
    // Çerçeve türüne göre çiz
    switch (frame.id) {
      case 1: // DEÜ Klasik - Kalın çerçeve
        context.strokeRect(borderWidth/2, borderWidth/2, width - borderWidth, height - borderWidth);
        break;
      case 2: // Modern - Rounded çerçeve
        drawRoundedRect(context, borderWidth/2, borderWidth/2, width - borderWidth, height - borderWidth, 20);
        break;
      case 3: // Mezuniyet - Gradient çerçeve
        const gradient = context.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#3B82F6');
        gradient.addColorStop(1, '#8B5CF6');
        context.strokeStyle = gradient;
        context.strokeRect(borderWidth/2, borderWidth/2, width - borderWidth, height - borderWidth);
        break;
      case 4: // YBS Özel - Çift çerçeve
        context.strokeRect(borderWidth/2, borderWidth/2, width - borderWidth, height - borderWidth);
        context.lineWidth = borderWidth/2;
        context.strokeRect(borderWidth*1.5, borderWidth*1.5, width - borderWidth*3, height - borderWidth*3);
        break;
    }
  };

  const drawRoundedRect = (context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) => {
    context.beginPath();
    context.moveTo(x + radius, y);
    context.lineTo(x + width - radius, y);
    context.quadraticCurveTo(x + width, y, x + width, y + radius);
    context.lineTo(x + width, y + height - radius);
    context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    context.lineTo(x + radius, y + height);
    context.quadraticCurveTo(x, y + height, x, y + height - radius);
    context.lineTo(x, y + radius);
    context.quadraticCurveTo(x, y, x + radius, y);
    context.closePath();
    context.stroke();
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

  const downloadPhoto = () => {
    if (previewImage) {
      const link = document.createElement('a');
      link.href = previewImage;
      link.download = `deu-ybs-hatira-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const sharePhoto = () => {
    if (previewImage) {
      // Paylaşılabilir URL oluştur (base64'ü encode et)
      const encodedImage = encodeURIComponent(previewImage);
      const shareUrl = `${window.location.origin}/shared-photo?img=${encodedImage}&frame=${photoFrames[currentFrame].name}`;
      setShareableImageUrl(shareUrl);
      setShowQR(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4">Hatıra Fotoğrafı</h1>
          <p className="text-xl text-muted-foreground">
            Dokuz Eylül Üniversitesi YBS bölümünde özel anınızı ölümsüzleştirin
          </p>
        </div>

        {/* Main Photo Area */}
        <Card className="mb-8 p-8 bg-gradient-to-br from-card to-secondary/10 shadow-lg">
          <div className="aspect-[4/3] max-w-2xl mx-auto bg-gradient-to-br from-muted/50 to-background rounded-2xl border-4 border-dashed border-muted-foreground/20 flex items-center justify-center overflow-hidden">
            {photoTaken && previewImage ? (
              <div className={cn("w-full h-full relative", photoFrames[currentFrame].style)}>
                <img 
                  src={previewImage} 
                  alt="Preview" 
                  className="w-full h-full object-cover rounded-lg"
                />
                <div className="absolute bottom-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-lg text-sm font-medium">
                  {photoFrames[currentFrame].name}
                </div>
              </div>
            ) : cameraActive ? (
              <div className={cn("w-full h-full relative", photoFrames[currentFrame].style)}>
                <video
                  id="camera-video"
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={cn("w-full h-full object-cover rounded-lg", isMirrored && "scale-x-[-1]")}
                />
                <div className="absolute bottom-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-lg text-sm font-medium">
                  {photoFrames[currentFrame].name}
                </div>
              </div>
            ) : (
              <div className="text-center">
                <Camera className="w-24 h-24 text-muted-foreground/40 mx-auto mb-4" />
                <p className="text-2xl text-muted-foreground">
                  Fotoğraf Önizleme Alanı
                </p>
                <p className="text-lg text-muted-foreground/60 mt-2">
                  {photoFrames[currentFrame].name} çerçevesi seçili
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Controls */}
        <div className="flex flex-col items-center space-y-6">
          {/* Frame Selection */}
          <div className="flex items-center space-x-6">
            <Button
              variant="outline"
              size="lg"
              onClick={prevFrame}
              className="w-16 h-16 rounded-full p-0"
            >
              <ChevronLeft className="w-8 h-8" />
            </Button>
            
            <div className="text-center min-w-[200px]">
              <h3 className="text-2xl font-semibold text-primary mb-2">
                {photoFrames[currentFrame].name}
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
              size="lg"
              onClick={nextFrame}
              className="w-16 h-16 rounded-full p-0"
            >
              <ChevronRight className="w-8 h-8" />
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4">
            {!photoTaken ? (
              !cameraActive ? (
                <Button
                  onClick={startCamera}
                  size="lg"
                  className="bg-gradient-to-r from-primary to-accent hover:from-primary-hover hover:to-accent-hover text-xl px-12 py-6 rounded-2xl shadow-lg"
                >
                  <Camera className="w-8 h-8 mr-3" />
                  Kamerayı Aç
                </Button>
              ) : (
                <div className="flex items-center gap-3">
                  <Button
                    onClick={takePhoto}
                    size="lg"
                    className="bg-gradient-to-r from-primary to-accent hover:from-primary-hover hover:to-accent-hover text-xl px-12 py-6 rounded-2xl shadow-lg"
                  >
                    <Camera className="w-8 h-8 mr-3" />
                    Fotoğraf Çek
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setIsMirrored((v) => !v)}
                    className="text-lg px-6 py-6"
                  >
                    {isMirrored ? 'Aynalamayı Kapat' : 'Aynala'}
                  </Button>
                </div>
              )
            ) : (
              <>
                <Button
                  onClick={resetPhoto}
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 py-4"
                >
                  Yeniden Çek
                </Button>
                <Button
                  onClick={downloadPhoto}
                  size="lg"
                  className="bg-accent hover:bg-accent-hover text-lg px-8 py-4"
                >
                  <Download className="w-6 h-6 mr-2" />
                  İndir
                </Button>
                <Button
                  onClick={sharePhoto}
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-4"
                >
                  <Share2 className="w-6 h-6 mr-2" />
                  Paylaş
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
              Bu QR kodu okutarak fotoğrafı telefonunuza indirebilirsiniz
            </p>
            {shareableImageUrl && (
              <div className="bg-white p-4 rounded-lg">
                <QRCode value={shareableImageUrl} size={200} />
              </div>
            )}
            <p className="text-xs text-muted-foreground text-center">
              QR kodu telefonunuzun kamerası ile okutun
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}