import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MapPin, Plus, Trash2, Edit, Building, Car, Coffee, Zap, Wifi, TreePine } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Marker {
  id: string;
  name: string;
  type: string;
  description?: string;
  x_position: number;
  y_position: number;
  is_active: boolean;
  created_at: string;
}

const markerTypes = {
  office: { label: 'Ofis', icon: Building, color: 'bg-blue-500' },
  parking: { label: 'Park Alanı', icon: Car, color: 'bg-gray-500' },
  cafeteria: { label: 'Kafeterya', icon: Coffee, color: 'bg-orange-500' },
  lab: { label: 'Laboratuvar', icon: Zap, color: 'bg-purple-500' },
  wifi: { label: 'WiFi Noktası', icon: Wifi, color: 'bg-green-500' },
  garden: { label: 'Bahçe', icon: TreePine, color: 'bg-emerald-500' }
};

export const MarkersManager = () => {
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMarker, setEditingMarker] = useState<Marker | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    description: '',
    x_position: 50,
    y_position: 50
  });

  useEffect(() => {
    fetchMarkers();
  }, []);

  const fetchMarkers = async () => {
    try {
      const { data, error } = await supabase
        .from('markers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setMarkers(data || []);
    } catch (error) {
      console.error('Error fetching markers:', error);
      toast.error('Markerler yüklenirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.type) {
      toast.error('Lütfen gerekli alanları doldurun');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Kullanıcı bulunamadı');

      if (editingMarker) {
        const { error } = await supabase
          .from('markers')
          .update({
            name: formData.name,
            type: formData.type,
            description: formData.description || null,
            x_position: formData.x_position,
            y_position: formData.y_position
          })
          .eq('id', editingMarker.id);
        
        if (error) throw error;
        toast.success('Marker başarıyla güncellendi');
      } else {
        const { error } = await supabase
          .from('markers')
          .insert({
            name: formData.name,
            type: formData.type,
            description: formData.description || null,
            x_position: formData.x_position,
            y_position: formData.y_position,
            created_by: user.id
          });
        
        if (error) throw error;
        toast.success('Marker başarıyla eklendi');
      }
      
      await fetchMarkers();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving marker:', error);
      toast.error('Marker kaydedilirken hata oluştu');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu markeri silmek istediğinizden emin misiniz?')) return;

    try {
      const { error } = await supabase
        .from('markers')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast.success('Marker başarıyla silindi');
      await fetchMarkers();
    } catch (error) {
      console.error('Error deleting marker:', error);
      toast.error('Marker silinirken hata oluştu');
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('markers')
        .update({ is_active: !currentStatus })
        .eq('id', id);
      
      if (error) throw error;
      toast.success(currentStatus ? 'Marker devre dışı bırakıldı' : 'Marker aktif edildi');
      await fetchMarkers();
    } catch (error) {
      console.error('Error toggling marker status:', error);
      toast.error('Marker durumu değiştirilirken hata oluştu');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: '',
      description: '',
      x_position: 50,
      y_position: 50
    });
    setEditingMarker(null);
  };

  const openEditDialog = (marker: Marker) => {
    setFormData({
      name: marker.name,
      type: marker.type,
      description: marker.description || '',
      x_position: Number(marker.x_position),
      y_position: Number(marker.y_position)
    });
    setEditingMarker(marker);
    setIsDialogOpen(true);
  };

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return <div className="flex justify-center py-8">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Harita Markerları</h2>
          <p className="text-muted-foreground">Kampüs haritası üzerindeki noktaları yönetin</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Yeni Marker
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingMarker ? 'Marker Düzenle' : 'Yeni Marker Ekle'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">İsim</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Marker ismi"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="type">Tür</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Marker türünü seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(markerTypes).map(([key, { label }]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Açıklama</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Opsiyonel açıklama"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="x_position">X Pozisyonu (%)</Label>
                  <Input
                    id="x_position"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.x_position}
                    onChange={(e) => setFormData({ ...formData, x_position: Number(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="y_position">Y Pozisyonu (%)</Label>
                  <Input
                    id="y_position"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.y_position}
                    onChange={(e) => setFormData({ ...formData, y_position: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  İptal
                </Button>
                <Button type="submit">
                  {editingMarker ? 'Güncelle' : 'Ekle'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {markers.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Henüz marker eklenmemiş</p>
            </CardContent>
          </Card>
        ) : (
          markers.map((marker) => {
            const markerType = markerTypes[marker.type as keyof typeof markerTypes];
            const IconComponent = markerType?.icon || MapPin;
            
            return (
              <Card key={marker.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-full ${markerType?.color || 'bg-gray-500'}`}>
                        <IconComponent className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">{marker.name}</h3>
                          <Badge variant={marker.is_active ? "default" : "secondary"}>
                            {marker.is_active ? 'Aktif' : 'Pasif'}
                          </Badge>
                          <Badge variant="outline">
                            {markerType?.label || marker.type}
                          </Badge>
                        </div>
                        {marker.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {marker.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          Pozisyon: X: {marker.x_position}%, Y: {marker.y_position}%
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(marker.id, marker.is_active)}
                      >
                        {marker.is_active ? 'Pasif Yap' : 'Aktif Yap'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(marker)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(marker.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};