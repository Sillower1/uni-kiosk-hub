import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Clock, MapPin, User } from 'lucide-react';

const sampleSchedule = {
  'Pazartesi': [
    { time: '09:00-10:30', course: 'Veri Tabanı Yönetimi', instructor: 'Prof. Dr. Ahmet Yılmaz', room: 'D201', type: 'Ders' },
    { time: '11:00-12:30', course: 'Sistem Analizi', instructor: 'Dr. Elif Demir', room: 'D202', type: 'Ders' },
    { time: '14:00-15:30', course: 'İstatistik', instructor: 'Doç. Dr. Mehmet Kaya', room: 'D203', type: 'Ders' }
  ],
  'Salı': [
    { time: '08:30-10:00', course: 'Programlama Laboratuvarı', instructor: 'Arş. Gör. Ayşe Özkan', room: 'Lab1', type: 'Lab' },
    { time: '10:30-12:00', course: 'İşletme Yönetimi', instructor: 'Prof. Dr. Fatma Çelik', room: 'Amfi', type: 'Ders' },
    { time: '13:30-15:00', course: 'Proje Yönetimi', instructor: 'Dr. Ali Koç', room: 'D201', type: 'Ders' }
  ],
  'Çarşamba': [
    { time: '09:30-11:00', course: 'E-Ticaret', instructor: 'Doç. Dr. Zeynep Aslan', room: 'D204', type: 'Ders' },
    { time: '11:30-13:00', course: 'Bilgi Sistemleri Analizi', instructor: 'Dr. Murat Öztürk', room: 'D202', type: 'Ders' },
    { time: '14:30-16:00', course: 'Veri Madenciliği Lab', instructor: 'Arş. Gör. Selin Yıldız', room: 'Lab2', type: 'Lab' }
  ],
  'Perşembe': [
    { time: '08:00-09:30', course: 'Karar Destek Sistemleri', instructor: 'Prof. Dr. Hasan Acar', room: 'D203', type: 'Ders' },
    { time: '10:00-11:30', course: 'Mobil Programlama', instructor: 'Dr. Emre Yaman', room: 'Lab1', type: 'Lab' },
    { time: '13:00-14:30', course: 'İş Süreci Yönetimi', instructor: 'Doç. Dr. Neslihan Gürel', room: 'D201', type: 'Ders' }
  ],
  'Cuma': [
    { time: '09:00-10:30', course: 'Bilgi Güvenliği', instructor: 'Dr. Burak Ertürk', room: 'D204', type: 'Ders' },
    { time: '11:00-12:30', course: 'Web Programlama', instructor: 'Arş. Gör. Deniz Aktaş', room: 'Lab2', type: 'Lab' },
    { time: '14:00-15:30', course: 'Seminer', instructor: 'Bölüm Öğretim Üyeleri', room: 'Amfi', type: 'Seminer' }
  ]
};

const days = Object.keys(sampleSchedule);

const getTypeColor = (type: string) => {
  switch (type) {
    case 'Lab': return 'bg-accent text-accent-foreground';
    case 'Seminer': return 'bg-secondary text-secondary-foreground';
    default: return 'bg-primary text-primary-foreground';
  }
};

export default function SchedulePage() {
  const [currentWeek, setCurrentWeek] = useState(0);
  const [selectedDay, setSelectedDay] = useState('Pazartesi');

  const getCurrentWeekDates = () => {
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 1 + (currentWeek * 7)));
    
    return days.map((_, index) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + index);
      return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' });
    });
  };

  const weekDates = getCurrentWeekDates();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4">Ders Programı</h1>
          <p className="text-xl text-muted-foreground">
            YBS Bölümü haftalık ders programı ve sınıf bilgileri
          </p>
        </div>

        {/* Week Navigation */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentWeek(prev => prev - 1)}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="w-5 h-5" />
                Önceki Hafta
              </Button>
              
              <div className="text-center">
                <CardTitle className="text-2xl text-primary">
                  Hafta {currentWeek === 0 ? '(Bu Hafta)' : currentWeek > 0 ? `+${currentWeek}` : currentWeek}
                </CardTitle>
                <p className="text-muted-foreground mt-1">
                  {weekDates[0]} - {weekDates[4]}
                </p>
              </div>
              
              <Button
                variant="outline"
                onClick={() => setCurrentWeek(prev => prev + 1)}
                className="flex items-center gap-2"
              >
                Sonraki Hafta
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Day Selection */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-primary mb-4">Günler</h3>
            {days.map((day, index) => (
              <Button
                key={day}
                variant={selectedDay === day ? 'default' : 'outline'}
                onClick={() => setSelectedDay(day)}
                className="w-full justify-between p-4 h-auto"
              >
                <div className="text-left">
                  <div className="font-medium">{day}</div>
                  <div className="text-xs opacity-75">{weekDates[index]}</div>
                </div>
                <Badge variant="secondary" className="ml-2">
                  {sampleSchedule[day as keyof typeof sampleSchedule].length}
                </Badge>
              </Button>
            ))}
          </div>

          {/* Selected Day Schedule */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-primary">
                  {selectedDay} Ders Programı
                </CardTitle>
                <p className="text-muted-foreground">
                  {weekDates[days.indexOf(selectedDay)]} tarihli dersler
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {sampleSchedule[selectedDay as keyof typeof sampleSchedule].map((lesson, index) => (
                  <Card key={index} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          {lesson.time}
                        </div>
                        <Badge className={getTypeColor(lesson.type)}>
                          {lesson.type}
                        </Badge>
                      </div>
                    </div>
                    
                    <h4 className="text-lg font-semibold text-primary mb-2">
                      {lesson.course}
                    </h4>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="w-4 h-4" />
                        {lesson.instructor}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        {lesson.room}
                      </div>
                    </div>
                  </Card>
                ))}
                
                {sampleSchedule[selectedDay as keyof typeof sampleSchedule].length === 0 && (
                  <div className="text-center py-12">
                    <Clock className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
                    <p className="text-xl text-muted-foreground">
                      Bu gün için ders bulunmamaktadır
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Quick Stats for Selected Day */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <Card className="text-center p-4">
                <div className="text-2xl font-bold text-primary">
                  {sampleSchedule[selectedDay as keyof typeof sampleSchedule].length}
                </div>
                <div className="text-sm text-muted-foreground">Toplam Ders</div>
              </Card>
              <Card className="text-center p-4">
                <div className="text-2xl font-bold text-accent">
                  {sampleSchedule[selectedDay as keyof typeof sampleSchedule].filter(l => l.type === 'Lab').length}
                </div>
                <div className="text-sm text-muted-foreground">Laboratuvar</div>
              </Card>
              <Card className="text-center p-4">
                <div className="text-2xl font-bold text-secondary-foreground">
                  {new Set(sampleSchedule[selectedDay as keyof typeof sampleSchedule].map(l => l.room)).size}
                </div>
                <div className="text-sm text-muted-foreground">Farklı Sınıf</div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}