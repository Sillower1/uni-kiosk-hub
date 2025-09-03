import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Trash2, Edit, Plus, Upload, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface Frame {
  id: string;
  name: string;
  image_url: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

interface FormData {
  name: string;
  is_active: boolean;
  display_order: number;
}

// Sanitizes filenames to ASCII-safe kebab-case and preserves extension
function sanitizeFileName(name: string) {
  // Turkish character map + general diacritics removal
  const map: Record<string, string> = {
    'ç': 'c', 'Ç': 'C', 'ğ': 'g', 'Ğ': 'G', 'ş': 's', 'Ş': 'S',
    'ı': 'i', 'İ': 'I', 'ö': 'o', 'Ö': 'O', 'ü': 'u', 'Ü': 'U'
  };
  const replaced = name.replace(/[çÇğĞşŞıİöÖüÜ]/g, (ch) => map[ch] || ch);
  const parts = replaced.split('.');
  const ext = (parts.length > 1 ? parts.pop() : 'png')!.toLowerCase();
  const base = parts.join('.') || 'frame';
  const safeBase = base
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .replace(/[^a-zA-Z0-9-_]+/g, '-') // non-safe to hyphen
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  const safeExt = ext === 'jpeg' ? 'jpg' : ext;
  return `${safeBase || 'frame'}.${safeExt || 'png'}`;
}

export default function FrameManager() {
  const [frames, setFrames] = useState<Frame[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    is_active: true,
    display_order: 0,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFrames();
  }, []);

  const fetchFrames = async () => {
    try {
      const { data, error } = await supabase
        .from('frames')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setFrames(data || []);
    } catch (error: any) {
      toast.error('Çerçeveler yüklenemedi: ' + error.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = '';

      // Eğer yeni bir resim yüklendiyse
      if (imageFile) {
        const safeOriginal = sanitizeFileName(imageFile.name);
        const timestamp = Date.now();
        const fileName = `frame-${timestamp}-${safeOriginal}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('frames')
          .upload(fileName, imageFile, {
            contentType: imageFile.type || 'image/png',
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('frames')
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
      }

      const frameData: any = {
        name: formData.name,
        is_active: formData.is_active,
        display_order: formData.display_order,
      };

      // Yeni resim yüklendiyse URL'i güncelle
      if (imageUrl) {
        frameData.image_url = imageUrl;
      }

      if (editingId) {
        const { error } = await supabase
          .from('frames')
          .update(frameData)
          .eq('id', editingId);

        if (error) throw error;
        toast.success('Çerçeve güncellendi');
      } else {
        // Yeni çerçeve için resim zorunlu
        if (!imageUrl) {
          toast.error('Lütfen bir çerçeve resmi yükleyin');
          setLoading(false);
          return;
        }

        frameData.image_url = imageUrl;

        const { error } = await supabase
          .from('frames')
          .insert(frameData);

        if (error) throw error;
        toast.success('Çerçeve eklendi');
      }

      setIsDialogOpen(false);
      resetForm();
      fetchFrames();
    } catch (error: any) {
      toast.error('İşlem başarısız: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (frame: Frame) => {
    setEditingId(frame.id);
    setFormData({
      name: frame.name,
      is_active: frame.is_active,
      display_order: frame.display_order,
    });
    setImagePreview(frame.image_url);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu çerçeveyi silmek istediğinizden emin misiniz?')) return;

    try {
      const { error } = await supabase
        .from('frames')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Çerçeve silindi');
      fetchFrames();
    } catch (error: any) {
      toast.error('Silme işlemi başarısız: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      is_active: true,
      display_order: 0,
    });
    setEditingId(null);
    setImageFile(null);
    setImagePreview(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Çerçeve Yönetimi</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Yeni Çerçeve
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingId ? 'Çerçeve Düzenle' : 'Yeni Çerçeve Ekle'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Çerçeve Adı</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="image">Çerçeve Resmi (PNG)</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/png"
                  onChange={handleImageChange}
                />
                {imagePreview && (
                  <div className="mt-2">
                    <img 
                      src={imagePreview} 
                      alt="Önizleme" 
                      className="w-full max-w-[200px] h-auto border rounded"
                    />
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="display_order">Sıralama</Label>
                <Input
                  id="display_order"
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="is_active">Aktif</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  İptal
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Kaydediliyor...' : editingId ? 'Güncelle' : 'Ekle'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {frames.map((frame) => (
          <Card key={frame.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{frame.name}</CardTitle>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(frame)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(frame.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                  <img
                    src={frame.image_url}
                    alt={frame.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Sıra: {frame.display_order}</span>
                  <span className={frame.is_active ? 'text-green-600' : 'text-red-600'}>
                    {frame.is_active ? 'Aktif' : 'Pasif'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {frames.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">Henüz çerçeve eklenmemiş.</p>
          </div>
        )}
      </div>
    </div>
  );
}