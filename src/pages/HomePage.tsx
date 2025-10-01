import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  Camera, 
  Megaphone, 
  Map, 
  Calendar, 
  Users, 
  ClipboardList,
  GraduationCap,
  Clock,
  MapPin,
  Settings
} from 'lucide-react';

const quickActions = [
  { id: 'photo', label: 'Hatıra Fotoğrafı Çek', icon: Camera, path: '/photo', color: 'bg-gradient-to-br from-primary to-primary-hover' },
  { id: 'announcements', label: 'Duyuruları Görüntüle', icon: Megaphone, path: '/announcements', color: 'bg-gradient-to-br from-accent to-accent-hover' },
  { id: 'schedule', label: 'Ders Programı', icon: Calendar, path: '/schedule', color: 'bg-gradient-to-br from-secondary-hover to-primary/20' }
];

const stats = [
  { label: 'Aktif Öğrenci', value: '650+', icon: GraduationCap },
  { label: 'Öğretim Üyesi', value: '23', icon: Users },
  { label: 'Mezun Sayımız', value: '2000', icon: Clock },
  { label: 'Kampüs Alanı', value: '2.5km²', icon: MapPin }
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-primary via-primary-hover to-accent text-white py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center gap-8">
            {/* Sol Logo */}
            <div className="hidden lg:block flex-shrink-0">
              <img 
                src="/deu.png" 
                alt="DEÜ Logo" 
                className="h-32 w-32 object-contain"
              />
            </div>

            {/* Orta Yazı */}
            <div className="text-center">
              <h1 className="text-5xl font-bold mb-4">
                Dokuz Eylül Üniversitesi
              </h1>
              <h2 className="text-3xl font-semibold mb-6 opacity-90">
                Yönetim Bilişim Sistemleri
              </h2>
              <p className="text-xl opacity-80 max-w-2xl mx-auto">
                İnteraktif kiosk sistemimize hoş geldiniz. Bölümümüz hakkında bilgi alın, 
                duyuruları takip edin ve hatıra fotoğraflarınızı çekin.
              </p>
            </div>

            {/* Sağ Logo */}
            <div className="hidden lg:block flex-shrink-0">
              <img 
                src="/deu-ybs-logo.png" 
                alt="DEÜ YBS Logo" 
                className="h-32 w-32 object-contain"
              />
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-32 h-32 bg-white rounded-full blur-xl"></div>
          <div className="absolute bottom-20 right-10 w-24 h-24 bg-white rounded-full blur-lg"></div>
          <div className="absolute top-40 right-20 w-16 h-16 bg-white rounded-full blur-md"></div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Quick Actions */}
        <section className="mb-12">
          <h3 className="text-3xl font-bold text-primary mb-8 text-center">
            Hızlı İşlemler
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Card 
                  key={action.id}
                  className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-2"
                  onClick={() => navigate(action.path)}
                >
                  <CardContent className="p-8 text-center">
                    <div className={`w-20 h-20 rounded-full ${action.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-10 h-10 text-white" />
                    </div>
                    <h4 className="text-xl font-semibold text-primary mb-2">
                      {action.label}
                    </h4>
                    <Button 
                      variant="outline"
                      className="mt-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    >
                      Başla
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Statistics */}
        <section className="mb-12">
          <h3 className="text-3xl font-bold text-primary mb-8 text-center">
            Bölümümüz Hakkında
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow duration-200">
                  <Icon className="w-12 h-12 text-accent mx-auto mb-4" />
                  <div className="text-3xl font-bold text-primary mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Features Grid */}
        <section>
          <h3 className="text-3xl font-bold text-primary mb-8 text-center">
            Kiosk Özellikleri
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-6 hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
              <Map className="w-12 h-12 text-accent mb-4" />
              <h4 className="text-lg font-semibold text-primary mb-2">Kampüs Haritası</h4>
              <p className="text-muted-foreground">Derslikler ve ofislerin konumlarını keşfedin</p>
            </Card>
            
            <Card className="p-6 hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
              <Calendar className="w-12 h-12 text-accent mb-4" />
              <h4 className="text-lg font-semibold text-primary mb-2">Ders Programları</h4>
              <p className="text-muted-foreground">Haftalık ders programlarını görüntüleyin</p>
            </Card>
            
            <Card className="p-6 hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
              <ClipboardList className="w-12 h-12 text-accent mb-4" />
              <h4 className="text-lg font-semibold text-primary mb-2">Anket ve Geri Bildirim</h4>
              <p className="text-muted-foreground">Görüşlerinizi bizimle paylaşın</p>
            </Card>
          </div>
        </section>
      </div>
      
      {/* Admin Panel Access Button */}
      <div className="fixed bottom-4 right-4">
        <Button
          onClick={() => navigate("/admin-login")}
          variant="outline"
          size="sm"
          className="opacity-60 hover:opacity-100 transition-opacity"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}