import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Eye, Trash2, Download, Calendar, Clock, Image } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow, format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface SavedPhoto {
  id: string;
  image_data: string;
  frame_name: string;
  created_at: string;
  shared_at: string | null;
  share_expires_at: string | null;
  is_public: boolean;
}

export default function SavedPhotosManager() {
  const [photos, setPhotos] = useState<SavedPhoto[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<SavedPhoto | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('saved_photos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPhotos(data || []);
    } catch (error) {
      console.error('Error fetching photos:', error);
      toast({
        title: "Hata",
        description: "Fotoğraflar yüklenirken hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deletePhoto = async (photoId: string) => {
    try {
      const { error } = await supabase
        .from('saved_photos')
        .delete()
        .eq('id', photoId);

      if (error) throw error;

      setPhotos(photos.filter(photo => photo.id !== photoId));
      toast({
        title: "Başarılı",
        description: "Fotoğraf silindi.",
      });
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast({
        title: "Hata",
        description: "Fotoğraf silinirken hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const downloadPhoto = (photo: SavedPhoto) => {
    const link = document.createElement('a');
    link.href = photo.image_data;
    link.download = `deu-hatira-${photo.id}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getShareStatus = (photo: SavedPhoto) => {
    if (!photo.is_public || !photo.share_expires_at) {
      return { status: 'Paylaşılmamış', color: 'secondary' as const };
    }
    
    const expiresAt = new Date(photo.share_expires_at);
    const now = new Date();
    
    if (expiresAt > now) {
      return { 
        status: 'Aktif', 
        color: 'default' as const,
        timeLeft: formatDistanceToNow(expiresAt, { locale: tr, addSuffix: true })
      };
    } else {
      return { status: 'Süresi Dolmuş', color: 'destructive' as const };
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Kaydedilen Fotoğraflar</CardTitle>
          <CardDescription>
            Kullanıcılar tarafından kaydedilen fotoğrafları görüntüleyin ve yönetin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="w-5 h-5" />
            Kaydedilen Fotoğraflar
          </CardTitle>
          <CardDescription>
            Kullanıcılar tarafından kaydedilen fotoğrafları görüntüleyin ve yönetin ({photos.length} fotoğraf)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {photos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Image className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Henüz kaydedilen fotoğraf bulunmuyor.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Önizleme</TableHead>
                    <TableHead>Çerçeve</TableHead>
                    <TableHead>Oluşturma Tarihi</TableHead>
                    <TableHead>Paylaşım Durumu</TableHead>
                    <TableHead>İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {photos.map((photo) => {
                    const shareStatus = getShareStatus(photo);
                    return (
                      <TableRow key={photo.id}>
                        <TableCell>
                          <img
                            src={photo.image_data}
                            alt="Fotoğraf önizleme"
                            className="w-16 h-12 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => {
                              setSelectedPhoto(photo);
                              setShowPreview(true);
                            }}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{photo.frame_name}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{format(new Date(photo.created_at), 'dd/MM/yyyy')}</span>
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(photo.created_at), 'HH:mm')}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <Badge variant={shareStatus.color}>
                              {shareStatus.status}
                            </Badge>
                            {shareStatus.timeLeft && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                {shareStatus.timeLeft}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedPhoto(photo);
                                setShowPreview(true);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => downloadPhoto(photo)}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Fotoğrafı Sil</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Bu fotoğrafı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>İptal</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deletePhoto(photo.id)}>
                                    Sil
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Photo Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Fotoğraf Önizleme</DialogTitle>
          </DialogHeader>
          {selectedPhoto && (
            <div className="space-y-4">
              <div className="aspect-[4/3] w-full bg-muted rounded-lg overflow-hidden">
                <img
                  src={selectedPhoto.image_data}
                  alt="Fotoğraf önizleme"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Çerçeve:</span> {selectedPhoto.frame_name}
                </div>
                <div>
                  <span className="font-medium">Tarih:</span> {format(new Date(selectedPhoto.created_at), 'dd/MM/yyyy HH:mm')}
                </div>
                <div>
                  <span className="font-medium">Paylaşım Durumu:</span> {getShareStatus(selectedPhoto).status}
                </div>
                {selectedPhoto.share_expires_at && (
                  <div>
                    <span className="font-medium">Paylaşım Bitiş:</span> {format(new Date(selectedPhoto.share_expires_at), 'dd/MM/yyyy HH:mm')}
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => downloadPhoto(selectedPhoto)}>
                  <Download className="w-4 h-4 mr-2" />
                  İndir
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}