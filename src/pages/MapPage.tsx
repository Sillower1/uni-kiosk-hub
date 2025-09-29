import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Users, 
  BookOpen, 
  Coffee, 
  Car, 
  Wifi, 
  Printer,
  Building
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Marker {
  id: string;
  name: string;
  type: string;
  description?: string;
  x_position: number;
  y_position: number;
  color: string;
  is_active: boolean;
  size?: number;
  icon?: string | null;
}

const getIconByKey = (key?: string | null) => {
  switch (key) {
    case 'building': return Building;
    case 'users': return Users;
    case 'book-open': return BookOpen;
    case 'coffee': return Coffee;
    case 'car': return Car;
    case 'wifi': return Wifi;
    case 'printer': return Printer;
    case 'map-pin':
    default:
      return MapPin;
  }
};

const locationTypes = {
  office: { label: 'Ofis', color: 'bg-primary text-primary-foreground' },
  lab: { label: 'Laboratuvar', color: 'bg-accent text-accent-foreground' },
  classroom: { label: 'Derslik', color: 'bg-secondary text-secondary-foreground' },
  facility: { label: 'Tesis', color: 'bg-muted text-muted-foreground' },
  tech: { label: 'Teknoloji', color: 'bg-destructive/80 text-destructive-foreground' }
};

const getLocationTypeConfig = (type: string) => {
  return locationTypes[type as keyof typeof locationTypes] || {
    label: 'Diğer',
    color: 'bg-muted text-muted-foreground'
  };
};

export default function MapPage() {
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [bumpMarkerId, setBumpMarkerId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMarkers();
  }, []);


  // Sayfanın herhangi bir boş yerine tıklamada baloncuğu kapat
  useEffect(() => {
    const handleDocClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Marker veya konum listesi içi tıklamaları yoksay
      if (target.closest('button[data-marker]')) return;
      if (target.closest('[data-location-list]')) return;
      setSelectedLocation(null);
    };
    document.addEventListener('click', handleDocClick);
    return () => document.removeEventListener('click', handleDocClick);
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
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoom === 1) return; // Don't pan when zoom is 1x
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
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setMarkers(data || []);
    } catch (error) {
      console.error('Markerlar yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLocations = filterType === 'all' 
    ? markers 
    : markers.filter(marker => marker.type === filterType);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4">Kampüs Haritası</h1>
          <p className="text-xl text-muted-foreground">
            YBS Bölümü ve kampüs içi konum bilgileri
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <Button
            variant={filterType === 'all' ? 'default' : 'outline'}
            onClick={() => setFilterType('all')}
            className="text-lg px-6 py-3"
          >
            Tümü
          </Button>
          {Object.entries(locationTypes).map(([type, config]) => (
            <Button
              key={type}
              variant={filterType === type ? 'default' : 'outline'}
              onClick={() => setFilterType(type)}
              className="text-lg px-6 py-3"
            >
              {config.label}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Interactive Map */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl text-primary">İnteraktif Harita</CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  ref={mapContainerRef}
                  className={cn(
                    "relative aspect-[4/3] rounded-xl overflow-hidden shadow-lg select-none",
                    isDragging && zoom > 1 ? "cursor-grabbing" : zoom > 1 ? "cursor-grab" : "cursor-default"
                  )}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseLeave}
                  onClick={(e) => {
                    // Haritanın boş alanına tıklanınca baloncuğu kapat
                    if ((e.target as HTMLElement).closest('button[data-marker]') == null) {
                      setSelectedLocation(null);
                    }
                  }}
                >
                  {/* Transformed canvas: image + markers share same transform */}
                  <div
                    className="absolute inset-0"
                    style={{
                      transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                      transformOrigin: 'center center'
                    }}
                  >
                    {/* Map Background Image */}
                    <img 
                      src="/maps.png" 
                      alt="Kampüs Haritası" 
                      className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
                      draggable={false}
                    />
                    {/* Overlay for better marker visibility */}
                    <div className="absolute inset-0 bg-black/10 pointer-events-none" />

                    {/* Marker overlay within transformed canvas */}
                    <div className="absolute inset-0">
                  {/* Location Pins */}
                  {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-muted-foreground">Markerlar yükleniyor...</div>
                    </div>
                  ) : (
                    filteredLocations.map((marker) => {
                      const Icon = getIconByKey(marker.icon);
                      const isSelected = selectedLocation === marker.id;
                      
                      return (
                        <button
                          key={marker.id}
                          data-marker
                          className={cn(
                            "absolute transition-all duration-200 z-10 focus:outline-none",
                          )}
                          style={{ 
                            left: `${marker.x_position}%`,
                            top: `${marker.y_position}%`,
                            transform: `translate(-50%, -50%)`,
                            pointerEvents: 'auto'
                          }}
                          onClick={(ev) => {
                            ev.stopPropagation();
                            setSelectedLocation(marker.id);
                            setBumpMarkerId(marker.id);
                            setTimeout(() => {
                              setBumpMarkerId((curr) => (curr === marker.id ? null : curr));
                            }, 220);
                          }}
                        >
                          <div
                            className={cn(
                              "transform",
                              isSelected ? (bumpMarkerId === marker.id ? "scale-150" : "scale-125") : "scale-100"
                            )}
                            style={{ transition: 'transform 200ms' }}
                          >
                            <Icon 
                              className="drop-shadow-lg" 
                              style={{ 
                                color: marker.color,
                                width: `${marker.size || 24}px`,
                                height: `${marker.size || 24}px`
                              }} 
                            />
                            {(isSelected && (marker.description || (marker as any).floor_info)) && (
                              <div
                                className="absolute top-full mt-2 left-1/2 bg-card border border-border rounded-lg p-2 shadow-lg min-w-[200px] z-30"
                                style={{
                                  transform: `translate(-50%, 0) scale(${1/zoom})`,
                                  transformOrigin: 'top center'
                                }}
                              >
                                {(marker as any).floor_info && (
                                  <div className="text-[11px] font-medium text-primary mb-1">{(marker as any).floor_info}</div>
                                )}
                                {marker.description && (
                                  <p className="text-xs text-muted-foreground whitespace-pre-line">{marker.description}</p>
                                )}
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })
                  )}
                    </div>
                  </div>
                  
                  {/* Floor Labels */}
                  <div className="absolute bottom-4 left-4 space-y-1">
                    <Badge variant="outline" className="bg-card/80">3. Kat - Ofisler</Badge>
                    <Badge variant="outline" className="bg-card/80">2. Kat - Laboratuvarlar</Badge>
                    <Badge variant="outline" className="bg-card/80">1. Kat - Derslikler</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Location List */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-primary">Konum Listesi</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-96 overflow-y-auto" data-location-list>
                  {loading ? (
                    <div className="p-4 text-center text-muted-foreground">
                      Markerlar yükleniyor...
                    </div>
                  ) : filteredLocations.length > 0 ? (
                    filteredLocations.map((marker) => {
                      const Icon = getIconByKey(marker.icon);
                      const isSelected = selectedLocation === marker.id;
                      
                      return (
                        <button
                          key={marker.id}
                          className={cn(
                            "w-full p-4 border-b border-border hover:bg-muted/50 text-left transition-colors",
                            isSelected ? "bg-primary/10 border-primary/20" : ""
                          )}
                          onClick={() => {
                            setSelectedLocation(marker.id);
                            setBumpMarkerId(marker.id);
                            setTimeout(() => {
                              setBumpMarkerId((curr) => (curr === marker.id ? null : curr));
                            }, 220);
                          }}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="w-10 h-10 flex items-center justify-center">
                              <Icon 
                                style={{ 
                                  color: marker.color,
                                  width: `${Math.min(marker.size || 24, 32)}px`,
                                  height: `${Math.min(marker.size || 24, 32)}px`
                                }} 
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm text-foreground truncate">
                                {marker.name}
                              </h4>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge 
                                  variant="secondary" 
                                  className="text-xs"
                                >
                                  {locationTypes[marker.type as keyof typeof locationTypes]?.label || 'Diğer'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">
                      {filterType === 'all' ? 'Henüz marker eklenmemiş.' : 'Bu kategoride marker bulunamadı.'}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <Card className="text-center p-4">
                <Building className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-xl font-bold text-primary">3</div>
                <div className="text-xs text-muted-foreground">Kat</div>
              </Card>
              <Card className="text-center p-4">
                <MapPin className="w-8 h-8 text-accent mx-auto mb-2" />
                <div className="text-xl font-bold text-accent">{markers.length}</div>
                <div className="text-xs text-muted-foreground">Konum</div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}