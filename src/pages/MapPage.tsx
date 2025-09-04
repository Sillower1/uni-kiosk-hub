import { useState } from 'react';
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

const mapLocations = [
  { id: 1, name: 'YBS Bölüm Başkanlığı', type: 'office', floor: '3', room: '301', icon: Building, x: 20, y: 15 },
  { id: 2, name: 'Bilgisayar Laboratuvarı 1', type: 'lab', floor: '2', room: '201', icon: BookOpen, x: 15, y: 30 },
  { id: 3, name: 'Bilgisayar Laboratuvarı 2', type: 'lab', floor: '2', room: '202', icon: BookOpen, x: 25, y: 30 },
  { id: 4, name: 'Amfi Derslik', type: 'classroom', floor: '1', room: '101', icon: Users, x: 50, y: 25 },
  { id: 5, name: 'Öğretim Üyesi Ofisleri', type: 'office', floor: '3', room: '302-310', icon: Users, x: 30, y: 15 },
  { id: 6, name: 'Kafeterya', type: 'facility', floor: '1', room: '-', icon: Coffee, x: 70, y: 50 },
  { id: 7, name: 'Otopark', type: 'facility', floor: 'Dış', room: '-', icon: Car, x: 80, y: 80 },
  { id: 8, name: 'WiFi Erişim Noktası', type: 'tech', floor: 'Tüm', room: '-', icon: Wifi, x: 40, y: 40 },
  { id: 9, name: 'Yazıcı/Fotokopi', type: 'tech', floor: '2', room: '205', icon: Printer, x: 35, y: 35 }
];

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

  const filteredLocations = filterType === 'all' 
    ? mapLocations 
    : mapLocations.filter(loc => loc.type === filterType);

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
                <div className="relative aspect-[4/3] bg-gradient-to-br from-muted/30 to-secondary/20 rounded-xl border-2 border-dashed border-muted-foreground/20 overflow-hidden">
                  {/* Map Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
                  
                  {/* Building Outline */}
                  <div className="absolute top-4 left-4 right-4 bottom-4 border-4 border-primary/30 rounded-lg bg-card/50" />
                  
                  {/* Location Pins */}
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
                        onClick={() => setSelectedLocation(location.id)}
                      >
                        <div className={cn(
                          "w-12 h-12 rounded-full shadow-lg flex items-center justify-center border-2 border-white",
                          locationTypes[location.type as keyof typeof locationTypes].color,
                          isSelected ? "ring-4 ring-primary/50" : ""
                        )}>
                          <Icon className="w-6 h-6" />
                        </div>
                        
                        {isSelected && (
                          <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-card border border-border rounded-lg p-2 shadow-lg min-w-[200px] z-30">
                            <p className="font-semibold text-sm text-primary">{location.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Kat: {location.floor} {location.room !== '-' && `• Oda: ${location.room}`}
                            </p>
                          </div>
                        )}
                      </button>
                    );
                  })}
                  
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
                <div className="max-h-96 overflow-y-auto">
                  {filteredLocations.map((location) => {
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
                              <span className="text-xs text-muted-foreground">
                                Kat {location.floor}
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
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
                <div className="text-xl font-bold text-accent">{mapLocations.length}</div>
                <div className="text-xs text-muted-foreground">Konum</div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}