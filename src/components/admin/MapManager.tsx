import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Edit, Plus, MapPin, Users, BookOpen, Coffee, Car, Wifi, Printer, Building } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Marker {
  id: string;
  name: string;
  type: string;
  description?: string;
  x_position: number;
  y_position: number;
  latitude?: number;
  longitude?: number;
  color: string;
  is_active: boolean;
  created_at: string;
  size?: number;
  icon?: string | null;
  floor_info?: string | null;
}

interface FormData {
  name: string;
  type: string;
  description: string;
  x_position: number;
  y_position: number;
  latitude: number | null;
  longitude: number | null;
  color: string;
  is_active: boolean;
  size: number;
  icon: string;
  floor_info?: string;
}

const markerTypes = {
  office: { label: 'Ofis', color: 'bg-primary text-primary-foreground' },
  lab: { label: 'Laboratuvar', color: 'bg-accent text-accent-foreground' },
  classroom: { label: 'Derslik', color: 'bg-secondary text-secondary-foreground' },
  facility: { label: 'Tesis', color: 'bg-muted text-muted-foreground' },
  tech: { label: 'Teknoloji', color: 'bg-destructive/80 text-destructive-foreground' }
};

export default function MapManager() {
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    type: 'office',
    description: '',
    x_position: 50,
    y_position: 50,
    latitude: null,
    longitude: null,
    color: '#6B7280',
    is_active: true,
    size: 24,
    icon: 'map-pin',
    floor_info: ''
  });
  const [loading, setLoading] = useState(false);
  const [mapClickMode, setMapClickMode] = useState(false);

  useEffect(() => {
    fetchMarkers();
  }, []);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      const newZoom = Math.max(1, Math.min(3, zoom + delta));
      setZoom(newZoom);
      
      // Reset pan when zoom is at minimum (1x) to center the image
      if (newZoom === 1) {
        setPan({ x: 0, y: 0 });
      }
    };

    const mapContainer = mapContainerRef.current;
    if (mapContainer) {
      mapContainer.addEventListener('wheel', handleWheel, { passive: false });
      return () => mapContainer.removeEventListener('wheel', handleWheel);
    }
  }, [zoom]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (mapClickMode) return; // Don't drag when in click mode
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || mapClickMode || zoom === 1) return; // Don't pan when zoom is 1x
    e.preventDefault();
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const fetchMarkers = async () => {
    try {
      const { data, error } = await supabase
        .from('markers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMarkers(data || []);
    } catch (error: any) {
      toast.error('Markerlar yüklenemedi: ' + error.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const markerData = {
        name: formData.name,
        type: formData.type,
        description: formData.description || null,
        x_position: formData.x_position,
        y_position: formData.y_position,
        latitude: formData.latitude,
        longitude: formData.longitude,
        color: formData.color,
        is_active: formData.is_active,
        size: formData.size,
        icon: formData.icon,
        floor_info: formData.floor_info || null,
        created_by: (await supabase.auth.getUser()).data.user?.id || '',
      };

      if (editingId) {
        const { error } = await supabase
          .from('markers')
          .update(markerData)
          .eq('id', editingId);

        if (error) throw error;
        toast.success('Marker güncellendi');
      } else {
        const { error } = await supabase
          .from('markers')
          .insert(markerData);

        if (error) throw error;
        toast.success('Marker eklendi');
      }

      setIsDialogOpen(false);
      resetForm();
      fetchMarkers();
    } catch (error: any) {
      toast.error('İşlem başarısız: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (marker: Marker) => {
    setEditingId(marker.id);
    setFormData({
      name: marker.name,
      type: marker.type,
      description: marker.description || '',
      x_position: marker.x_position,
      y_position: marker.y_position,
      latitude: marker.latitude,
      longitude: marker.longitude,
      color: marker.color,
      is_active: marker.is_active,
      size: marker.size || 24,
      icon: marker.icon || 'map-pin',
      floor_info: marker.floor_info || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu markeri silmek istediğinizden emin misiniz?')) return;

    try {
      const { error } = await supabase
        .from('markers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Marker silindi');
      fetchMarkers();
    } catch (error: any) {
      toast.error('Silme işlemi başarısız: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'office',
      description: '',
      x_position: 50,
      y_position: 50,
      latitude: null,
      longitude: null,
      color: '#6B7280',
      is_active: true,
      size: 24,
      icon: 'map-pin',
      floor_info: ''
    });
    setEditingId(null);
    setMapClickMode(false);
  };

  const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!mapClickMode) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    setFormData(prev => ({
      ...prev,
      x_position: Math.round(x * 10) / 10,
      y_position: Math.round(y * 10) / 10,
    }));

    setMapClickMode(false);
    toast.success(`Konum seçildi: X:${Math.round(x * 10) / 10}%, Y:${Math.round(y * 10) / 10}%`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Harita Marker Yönetimi</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Yeni Marker
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingId ? 'Marker Düzenle' : 'Yeni Marker Ekle'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Marker Adı</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="color">Marker Rengi</Label>
                  <Input
                    id="color"
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    className="h-10 w-full cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="size">Marker Boyutu (px)</Label>
                  <Input
                    id="size"
                    type="number"
                    min="16"
                    max="64"
                    value={formData.size}
                    onChange={(e) => setFormData(prev => ({ ...prev, size: parseInt(e.target.value) || 24 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="icon">Marker İkonu</Label>
                  <Select value={formData.icon} onValueChange={(value) => setFormData(prev => ({ ...prev, icon: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="map-pin"><div className="flex items-center space-x-2"><MapPin className="w-4 h-4" /> <span>Map Pin</span></div></SelectItem>
                      <SelectItem value="building"><div className="flex items-center space-x-2"><Building className="w-4 h-4" /> <span>Bina</span></div></SelectItem>
                      <SelectItem value="users"><div className="flex items-center space-x-2"><Users className="w-4 h-4" /> <span>Kullanıcılar</span></div></SelectItem>
                      <SelectItem value="book-open"><div className="flex items-center space-x-2"><BookOpen className="w-4 h-4" /> <span>Kitap</span></div></SelectItem>
                      <SelectItem value="coffee"><div className="flex items-center space-x-2"><Coffee className="w-4 h-4" /> <span>Kafe</span></div></SelectItem>
                      <SelectItem value="car"><div className="flex items-center space-x-2"><Car className="w-4 h-4" /> <span>Otopark</span></div></SelectItem>
                      <SelectItem value="wifi"><div className="flex items-center space-x-2"><Wifi className="w-4 h-4" /> <span>Wi‑Fi</span></div></SelectItem>
                      <SelectItem value="printer"><div className="flex items-center space-x-2"><Printer className="w-4 h-4" /> <span>Yazıcı</span></div></SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="floor_info">Kat Bilgisi (İsteğe bağlı)</Label>
                <Input
                  id="floor_info"
                  placeholder="Örn: 3. Kat - Ofisler"
                  value={formData.floor_info || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, floor_info: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Tür</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(markerTypes).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          {config.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Açıklama (İsteğe bağlı)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              {/* Interactive Map for Position Selection */}
              <div className="space-y-2">
                <Label>Harita Konumu</Label>
                <div className="text-sm text-muted-foreground mb-2">
                  Aşağıdaki haritaya tıklayarak marker konumunu seçebilirsiniz
                </div>
                <Button
                  type="button"
                  variant={mapClickMode ? "default" : "outline"}
                  onClick={() => setMapClickMode(!mapClickMode)}
                  className="mb-2"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  {mapClickMode ? 'Konum Seçme Aktif' : 'Haritadan Konum Seç'}
                </Button>
                
                <div 
                  ref={mapContainerRef}
                  className={cn(
                    "relative aspect-[4/3] rounded-xl overflow-hidden shadow-lg select-none",
                    mapClickMode 
                      ? "cursor-crosshair ring-2 ring-primary" 
                      : isDragging && zoom > 1
                        ? "cursor-grabbing" 
                        : zoom > 1
                          ? "cursor-grab"
                          : "cursor-default"
                  )}
                  onClick={handleMapClick}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseLeave}
                >
                  {/* Map Background Image */}
                  <img 
                    src="/maps.png" 
                    alt="Kampüs Haritası" 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-150 select-none pointer-events-none"
                    style={{ 
                      transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                      transformOrigin: 'center center'
                    }}
                    draggable={false}
                  />
                  {/* Overlay for better marker visibility and interactivity */}
                  <div className="absolute inset-0 bg-black/10" />
                  
                  {/* Current marker position preview */}
                  <div
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
                    style={{ 
                      left: `${formData.x_position}%`, 
                      top: `${formData.y_position}%`,
                      transform: `translate(-50%, -50%) scale(${1/zoom})`,
                      pointerEvents: 'none'
                    }}
                  >
                    {formData.icon === 'building' ? (
                      <Building className="drop-shadow-lg" style={{ color: formData.color, width: `${formData.size}px`, height: `${formData.size}px` }} />
                    ) : formData.icon === 'users' ? (
                      <Users className="drop-shadow-lg" style={{ color: formData.color, width: `${formData.size}px`, height: `${formData.size}px` }} />
                    ) : formData.icon === 'book-open' ? (
                      <BookOpen className="drop-shadow-lg" style={{ color: formData.color, width: `${formData.size}px`, height: `${formData.size}px` }} />
                    ) : formData.icon === 'coffee' ? (
                      <Coffee className="drop-shadow-lg" style={{ color: formData.color, width: `${formData.size}px`, height: `${formData.size}px` }} />
                    ) : formData.icon === 'car' ? (
                      <Car className="drop-shadow-lg" style={{ color: formData.color, width: `${formData.size}px`, height: `${formData.size}px` }} />
                    ) : formData.icon === 'wifi' ? (
                      <Wifi className="drop-shadow-lg" style={{ color: formData.color, width: `${formData.size}px`, height: `${formData.size}px` }} />
                    ) : formData.icon === 'printer' ? (
                      <Printer className="drop-shadow-lg" style={{ color: formData.color, width: `${formData.size}px`, height: `${formData.size}px` }} />
                    ) : (
                      <MapPin className="drop-shadow-lg" style={{ color: formData.color, width: `${formData.size}px`, height: `${formData.size}px` }} />
                    )}
                  </div>
                  
                  {mapClickMode && (
                    <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                      <div className="bg-background/90 px-4 py-2 rounded-lg text-sm font-medium">
                        Konumu seçmek için haritaya tıklayın
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="x_position">X Pozisyon (%)</Label>
                  <Input
                    id="x_position"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={formData.x_position}
                    onChange={(e) => setFormData(prev => ({ ...prev, x_position: parseFloat(e.target.value) || 0 }))}
                  />
                </div>

                <div>
                  <Label htmlFor="y_position">Y Pozisyon (%)</Label>
                  <Input
                    id="y_position"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={formData.y_position}
                    onChange={(e) => setFormData(prev => ({ ...prev, y_position: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="latitude">Enlem (İsteğe bağlı)</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="0.000001"
                    value={formData.latitude || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, latitude: parseFloat(e.target.value) || null }))}
                  />
                </div>

                <div>
                  <Label htmlFor="longitude">Boylam (İsteğe bağlı)</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="0.000001"
                    value={formData.longitude || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, longitude: parseFloat(e.target.value) || null }))}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="is_active">Aktif</Label>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
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
        {markers.map((marker) => (
          <Card key={marker.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{marker.name}</CardTitle>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(marker)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(marker.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <MapPin 
                    style={{ 
                      color: marker.color,
                      width: `${Math.min(marker.size || 24, 20)}px`,
                      height: `${Math.min(marker.size || 24, 20)}px`
                    }} 
                  />
                  <span className="text-sm font-medium">
                    {markerTypes[marker.type as keyof typeof markerTypes]?.label || 'Diğer'}
                  </span>
                </div>
                
                {marker.description && (
                  <p className="text-sm text-muted-foreground">
                    {marker.description}
                  </p>
                )}
                
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>Pozisyon: X:{marker.x_position}%, Y:{marker.y_position}%</div>
                  {marker.latitude && marker.longitude && (
                    <div>GPS: {marker.latitude}, {marker.longitude}</div>
                  )}
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className={marker.is_active ? 'text-green-600' : 'text-red-600'}>
                    {marker.is_active ? 'Aktif' : 'Pasif'}
                  </span>
                  <span className="text-muted-foreground">
                    {new Date(marker.created_at).toLocaleDateString('tr-TR')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {markers.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">Henüz marker eklenmemiş.</p>
          </div>
        )}
      </div>
    </div>
  );
}