import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Camera, Download, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';

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

  const nextFrame = () => {
    setCurrentFrame((prev) => (prev + 1) % photoFrames.length);
  };

  const prevFrame = () => {
    setCurrentFrame((prev) => (prev - 1 + photoFrames.length) % photoFrames.length);
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      setStream(mediaStream);
      setCameraActive(true);
      
      const video = document.getElementById('camera-video') as HTMLVideoElement;
      if (video) {
        video.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Kamera erişimi başarısız:', error);
      alert('Kamera erişimi için izin gerekli');
    }
  };

  const takePhoto = () => {
    const video = document.getElementById('camera-video') as HTMLVideoElement;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (video && context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);
      
      const photoDataUrl = canvas.toDataURL('image/png');
      setPreviewImage(photoDataUrl);
      setPhotoTaken(true);
      
      // Stop camera
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
        setCameraActive(false);
      }
    }
  };

  const resetPhoto = () => {
    setPhotoTaken(false);
    setPreviewImage(null);
    setCameraActive(false);
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
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
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover rounded-lg"
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
                <Button
                  onClick={takePhoto}
                  size="lg"
                  className="bg-gradient-to-r from-primary to-accent hover:from-primary-hover hover:to-accent-hover text-xl px-12 py-6 rounded-2xl shadow-lg"
                >
                  <Camera className="w-8 h-8 mr-3" />
                  Fotoğraf Çek
                </Button>
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
                  size="lg"
                  className="bg-accent hover:bg-accent-hover text-lg px-8 py-4"
                >
                  <Download className="w-6 h-6 mr-2" />
                  İndir
                </Button>
                <Button
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
    </div>
  );
}