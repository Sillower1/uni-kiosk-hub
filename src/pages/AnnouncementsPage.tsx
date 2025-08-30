import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User } from 'lucide-react';

const announcements = [
  {
    id: 1,
    title: 'Bahar Dönemi Final Sınavları',
    date: '2024-06-10',
    time: '09:00',
    author: 'Prof. Dr. Mehmet Yılmaz',
    category: 'Akademik',
    content: 'Bahar dönemi final sınavları 10 Haziran 2024 tarihinde başlayacaktır. Tüm öğrencilerin sınav programını kontrol etmeleri önemle duyurulur.',
    urgent: true
  },
  {
    id: 2,
    title: 'Mezuniyet Töreni Duyurusu',
    date: '2024-06-15',
    time: '14:00',
    author: 'Dekanlık',
    category: 'Etkinlik',
    content: 'YBS Bölümü mezuniyet töreni 15 Haziran 2024 tarihinde Atatürk Kültür Merkezi\'nde gerçekleştirilecektir.',
    urgent: false
  },
  {
    id: 3,
    title: 'Yaz Okulu Kayıtları',
    date: '2024-06-20',
    time: '10:00',
    author: 'Öğrenci İşleri',
    category: 'Kayıt',
    content: 'Yaz okulu kayıtları 20 Haziran 2024 tarihinde başlayacaktır. Detaylar için öğrenci işleri ile iletişime geçiniz.',
    urgent: false
  },
  {
    id: 4,
    title: 'Proje Sunumları',
    date: '2024-06-08',
    time: '13:30',
    author: 'Dr. Ayşe Demir',
    category: 'Akademik',
    content: 'Bilgi Sistemleri Analizi dersi proje sunumları 8 Haziran 2024 tarihinde yapılacaktır.',
    urgent: true
  },
  {
    id: 5,
    title: 'Kariyer Günleri Etkinliği',
    date: '2024-06-12',
    time: '10:00',
    author: 'Kariyer Merkezi',
    category: 'Etkinlik',
    content: 'YBS öğrencileri için düzenlenen kariyer günleri etkinliği 12 Haziran 2024 tarihinde konferans salonunda gerçekleştirilecektir.',
    urgent: false
  }
];

const getCategoryColor = (category: string) => {
  const colors = {
    'Akademik': 'bg-primary text-primary-foreground',
    'Etkinlik': 'bg-accent text-accent-foreground',
    'Kayıt': 'bg-secondary text-secondary-foreground'
  };
  return colors[category as keyof typeof colors] || 'bg-muted text-muted-foreground';
};

export default function AnnouncementsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4">Duyurular ve Etkinlikler</h1>
          <p className="text-xl text-muted-foreground">
            YBS Bölümü güncel duyuru ve etkinliklerini takip edin
          </p>
        </div>

        {/* Announcements Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {announcements.map((announcement) => (
            <Card 
              key={announcement.id} 
              className={`relative transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${
                announcement.urgent ? 'border-l-4 border-l-destructive shadow-md' : ''
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="text-xl font-semibold text-primary pr-4">
                    {announcement.title}
                  </CardTitle>
                  {announcement.urgent && (
                    <Badge variant="destructive" className="shrink-0">
                      Acil
                    </Badge>
                  )}
                </div>
                
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(announcement.date).toLocaleDateString('tr-TR')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{announcement.time}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>{announcement.author}</span>
                  </div>
                </div>
                
                <Badge className={getCategoryColor(announcement.category)}>
                  {announcement.category}
                </Badge>
              </CardHeader>
              
              <CardContent>
                <p className="text-foreground leading-relaxed">
                  {announcement.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <Card className="text-center p-6 bg-gradient-to-br from-primary/10 to-primary/5">
            <h3 className="text-2xl font-bold text-primary">5</h3>
            <p className="text-muted-foreground">Aktif Duyuru</p>
          </Card>
          <Card className="text-center p-6 bg-gradient-to-br from-accent/10 to-accent/5">
            <h3 className="text-2xl font-bold text-accent">2</h3>
            <p className="text-muted-foreground">Yaklaşan Etkinlik</p>
          </Card>
          <Card className="text-center p-6 bg-gradient-to-br from-destructive/10 to-destructive/5">
            <h3 className="text-2xl font-bold text-destructive">2</h3>
            <p className="text-muted-foreground">Acil Duyuru</p>
          </Card>
        </div>
      </div>
    </div>
  );
}