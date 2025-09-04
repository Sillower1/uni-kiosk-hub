import { useState, useRef } from 'react';
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
  Building,
  Trash2,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import campusImage from '@/assets/deu-campus-satellite.jpg';

interface UserMarker {
  id: number;
  name: string;
  type: string;
  x: number;
  y: number;
  icon: React.ComponentType<{ className?: string; }>;
  description?: string;
}

const locationTypes = {
  office: { label: 'Ofis', color: 'bg-primary text-primary-foreground' },
  lab: { label: 'Laboratuvar', color: 'bg-accent text-accent-foreground' },
  classroom: { label: 'Derslik', color: 'bg-secondary text-secondary-foreground' },
  facility: { label: 'Tesis', color: 'bg-muted text-muted-foreground' },
  tech: { label: 'Teknoloji', color: 'bg-destructive/80 text-destructive-foreground' }
};

export default function MapPage() {
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [userMarkers, setUserMarkers] = useState<UserMarker[]>([]);
  const [isAddingMarker, setIsAddingMarker] = useState(false);
  const [newMarkerName, setNewMarkerName] = useState('');
  const [selectedMarkerType, setSelectedMarkerType] = useState<string>('office');
  const mapRef = useRef<HTMLDivElement>(null);

  const filteredLocations = filterType === 'all' 
    ? userMarkers 
    : userMarkers.filter(loc => loc.type === filterType);

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isAddingMarker || !mapRef.current) return;
    
    const rect = mapRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    if (newMarkerName.trim()) {
      const newMarker: UserMarker = {
        id: Date.now(),
        name: newMarkerName,
        type: selectedMarkerType,
        x,
        y,
        icon: getIconForType(selectedMarkerType)
      };
      
      setUserMarkers(prev => [...prev, newMarker]);
      setIsAddingMarker(false);
      setNewMarkerName('');
    }
  };

  const getIconForType = (type: string): React.ComponentType<{ className?: string; }> => {
    const iconMap: Record<string, React.ComponentType<{ className?: string; }>> = {
      office: Building,
      lab: BookOpen,
      classroom: Users,
      facility: Coffee,
      tech: Wifi
    };
    return iconMap[type] || MapPin;
  };

  const deleteMarker = (id: number) => {
    setUserMarkers(prev => prev.filter(marker => marker.id !== id));
    setSelectedLocation(null);
  };

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

        {/* Controls */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {/* Add Marker Button */}
          <Button
            variant={isAddingMarker ? 'destructive' : 'default'}
            onClick={() => {
              setIsAddingMarker(!isAddingMarker);
              setNewMarkerName('');
            }}
            className="text-lg px-6 py-3"
          >
            <Plus className="w-5 h-5 mr-2" />
            {isAddingMarker ? 'İptal' : 'Marker Ekle'}
          </Button>
          
          {/* Filters */}
          <Button
            variant={filterType === 'all' ? 'default' : 'outline'}
            onClick={() => setFilterType('all')}
            className="text-lg px-6 py-3"
          >
            Tümü ({userMarkers.length})
          </Button>
          {Object.entries(locationTypes).map(([type, config]) => {
            const count = userMarkers.filter(m => m.type === type).length;
            return (
              <Button
                key={type}
                variant={filterType === type ? 'default' : 'outline'}
                onClick={() => setFilterType(type)}
                className="text-lg px-6 py-3"
              >
                {config.label} ({count})
              </Button>
            );
          })}
        </div>

        {/* Add Marker Form */}
        {isAddingMarker && (
          <Card className="mb-8 max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-lg">Yeni Marker Ekle</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Marker Adı
                </label>
                <input
                  type="text"
                  value={newMarkerName}
                  onChange={(e) => setNewMarkerName(e.target.value)}
                  placeholder="Örn: Kafeterya, Derslik A101..."
                  className="w-full p-2 border border-border rounded-lg bg-background"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Marker Türü
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(locationTypes).map(([type, config]) => (
                    <Button
                      key={type}
                      variant={selectedMarkerType === type ? 'default' : 'outline'}
                      onClick={() => setSelectedMarkerType(type)}
                      className="text-sm"
                    >
                      {config.label}
                    </Button>
                  ))}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                💡 Marker eklemek için harita üzerinde istediğiniz yere tıklayın
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Interactive Satellite Map */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl text-primary">
                  DEÜ Dokuzçeşmeler Kampüsü - Uydu Görüntüsü
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {isAddingMarker ? 'Marker eklemek için harita üzerinde bir yere tıklayın' : 'Mevcut markerları görüntülemek için harita üzerindeki işaretlere tıklayın'}
                </p>
              </CardHeader>
              <CardContent>
                <div 
                  ref={mapRef}
                  className={cn(
                    "relative aspect-[4/3] rounded-xl overflow-hidden shadow-lg border-2",
                    isAddingMarker ? "cursor-crosshair border-primary" : "border-border"
                  )}
                  onClick={handleMapClick}
                >
                  {/* Satellite Image Background */}
                  <img
                    src={campusImage}
                    alt="DEÜ Dokuzçeşmeler Kampüsü Uydu Görüntüsü"
                    className="absolute inset-0 w-full h-full object-cover"
                    draggable={false}
                  />
                  
                  {/* Overlay for better marker visibility */}
                  <div className="absolute inset-0 bg-black/10" />
                  
                  {/* User Markers */}
                  {filteredLocations.map((location) => {
                    const Icon = location.icon;
                    const isSelected = selectedLocation === location.id;
                    
                    return (
                      <button
                        key={location.id}
                        className={cn(
                          "absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 z-10",
                          "hover:scale-110 focus:scale-110 focus:outline-none",
                          isSelected ? "scale-125 z-20" : ""
                        )}
                        style={{ 
                          left: `${location.x}%`, 
                          top: `${location.y}%` 
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLocation(location.id);
                        }}
                      >
                        <div className={cn(
                          "w-12 h-12 rounded-full shadow-xl flex items-center justify-center border-3 border-white",
                          locationTypes[location.type as keyof typeof locationTypes].color,
                          isSelected ? "ring-4 ring-primary/70" : ""
                        )}>
                          <Icon className="w-6 h-6" />
                        </div>
                        
                        {isSelected && (
                          <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-card/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-xl min-w-[220px] z-30">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-semibold text-sm text-primary">{location.name}</p>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteMarker(location.id);
                                }}
                                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Tür: {locationTypes[location.type as keyof typeof locationTypes].label}
                            </p>
                          </div>
                        )}
                      </button>
                    );
                  })}
                  
                  {/* Campus Info */}
                  <div className="absolute bottom-4 left-4 space-y-1">
                    <Badge variant="outline" className="bg-card/90 backdrop-blur-sm">
                      Dokuz Eylül Üniversitesi
                    </Badge>
                    <Badge variant="outline" className="bg-card/90 backdrop-blur-sm">
                      Dokuzçeşmeler Kampüsü
                    </Badge>
                  </div>
                  
                  {/* Instructions */}
                  {userMarkers.length === 0 && !isAddingMarker && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg p-6 text-center max-w-sm">
                        <MapPin className="w-12 h-12 text-primary mx-auto mb-3" />
                        <p className="text-lg font-medium text-primary mb-2">
                          Henüz marker yok
                        </p>
                        <p className="text-sm text-muted-foreground">
                          "Marker Ekle" butonuna tıklayarak kampüste önemli yerleri işaretlemeye başlayın
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Marker List */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-primary">
                  İşaretlenen Yerler ({filteredLocations.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-96 overflow-y-auto">
                  {filteredLocations.length > 0 ? (
                    filteredLocations.map((location) => {
                      const Icon = location.icon;
                      const isSelected = selectedLocation === location.id;
                      
                      return (
                        <button
                          key={location.id}
                          className={cn(
                            "w-full p-4 border-b border-border hover:bg-muted/50 text-left transition-colors",
                            isSelected ? "bg-primary/10 border-primary/20" : ""
                          )}
                          onClick={() => setSelectedLocation(location.id)}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={cn(
                              "w-10 h-10 rounded-lg flex items-center justify-center",
                              locationTypes[location.type as keyof typeof locationTypes].color
                            )}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm text-foreground truncate">
                                {location.name}
                              </h4>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge 
                                  variant="secondary" 
                                  className="text-xs"
                                >
                                  {locationTypes[location.type as keyof typeof locationTypes].label}
                                </Badge>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteMarker(location.id);
                              }}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive opacity-70 hover:opacity-100"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="p-8 text-center text-muted-foreground">
                      <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">
                        {filterType === 'all' 
                          ? 'Henüz hiç marker eklenmemiş'
                          : `${locationTypes[filterType as keyof typeof locationTypes].label} tipinde marker yok`
                        }
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <Card className="text-center p-4">
                <MapPin className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-xl font-bold text-primary">{userMarkers.length}</div>
                <div className="text-xs text-muted-foreground">Toplam Marker</div>
              </Card>
              <Card className="text-center p-4">
                <Building className="w-8 h-8 text-accent mx-auto mb-2" />
                <div className="text-xl font-bold text-accent">
                  {Object.keys(locationTypes).length}
                </div>
                <div className="text-xs text-muted-foreground">Marker Türü</div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}