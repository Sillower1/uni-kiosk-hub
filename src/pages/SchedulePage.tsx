import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Filter, GraduationCap, Clock, MapPin, User } from 'lucide-react';

// Sample schedule data with class year information
const scheduleData = {
  '1. Sınıf': [
    { day: 'Pazartesi', time: '09:00-10:30', course: 'Matematik I', instructor: 'Prof. Dr. Ahmet Yılmaz', room: 'D101', type: 'Ders' },
    { day: 'Pazartesi', time: '11:00-12:30', course: 'Bilgisayar Programlama I', instructor: 'Dr. Elif Demir', room: 'Lab1', type: 'Lab' },
    { day: 'Salı', time: '08:30-10:00', course: 'İşletme Giriş', instructor: 'Doç. Dr. Mehmet Kaya', room: 'D102', type: 'Ders' },
    { day: 'Salı', time: '10:30-12:00', course: 'İngilizce I', instructor: 'Öğr. Gör. Sarah Johnson', room: 'D103', type: 'Ders' },
    { day: 'Çarşamba', time: '09:00-10:30', course: 'Genel İktisat', instructor: 'Prof. Dr. Fatma Çelik', room: 'Amfi', type: 'Ders' },
    { day: 'Perşembe', time: '08:30-10:00', course: 'İstatistik I', instructor: 'Dr. Ali Koç', room: 'D104', type: 'Ders' },
    { day: 'Cuma', time: '09:00-10:30', course: 'Bilgisayar Donanımı', instructor: 'Arş. Gör. Deniz Aktaş', room: 'Lab2', type: 'Lab' }
  ],
  '2. Sınıf': [
    { day: 'Pazartesi', time: '10:30-12:00', course: 'Veri Tabanı Yönetimi', instructor: 'Prof. Dr. Hasan Acar', room: 'D201', type: 'Ders' },
    { day: 'Pazartesi', time: '14:00-15:30', course: 'Sistem Analizi', instructor: 'Dr. Emre Yaman', room: 'D202', type: 'Ders' },
    { day: 'Salı', time: '09:30-11:00', course: 'Veri Tabanı Lab', instructor: 'Arş. Gör. Ayşe Özkan', room: 'Lab1', type: 'Lab' },
    { day: 'Salı', time: '13:30-15:00', course: 'Nesne Yönelimli Programlama', instructor: 'Doç. Dr. Zeynep Aslan', room: 'Lab2', type: 'Lab' },
    { day: 'Çarşamba', time: '11:00-12:30', course: 'İşletme Yönetimi', instructor: 'Dr. Murat Öztürk', room: 'D203', type: 'Ders' },
    { day: 'Perşembe', time: '10:00-11:30', course: 'Bilgi Sistemleri Analizi', instructor: 'Doç. Dr. Neslihan Gürel', room: 'D204', type: 'Ders' },
    { day: 'Cuma', time: '11:00-12:30', course: 'Web Programlama', instructor: 'Dr. Burak Ertürk', room: 'Lab3', type: 'Lab' }
  ],
  '3. Sınıf': [
    { day: 'Pazartesi', time: '13:00-14:30', course: 'E-Ticaret', instructor: 'Prof. Dr. Selin Yıldız', room: 'D301', type: 'Ders' },
    { day: 'Pazartesi', time: '15:00-16:30', course: 'Proje Yönetimi', instructor: 'Dr. Can Özdemir', room: 'D302', type: 'Ders' },
    { day: 'Salı', time: '11:30-13:00', course: 'Mobil Programlama', instructor: 'Arş. Gör. Elif Karaca', room: 'Lab1', type: 'Lab' },
    { day: 'Çarşamba', time: '09:30-11:00', course: 'Veri Madenciliği', instructor: 'Doç. Dr. Okan Bilir', room: 'D303', type: 'Ders' },
    { day: 'Çarşamba', time: '14:30-16:00', course: 'Veri Madenciliği Lab', instructor: 'Arş. Gör. Melike Şahin', room: 'Lab2', type: 'Lab' },
    { day: 'Perşembe', time: '13:00-14:30', course: 'İş Süreci Yönetimi', instructor: 'Dr. Arda Tuncer', room: 'D304', type: 'Ders' },
    { day: 'Cuma', time: '10:00-11:30', course: 'Bilgi Güvenliği', instructor: 'Prof. Dr. Leyla Göktaş', room: 'D305', type: 'Ders' }
  ],
  '4. Sınıf': [
    { day: 'Pazartesi', time: '14:30-16:00', course: 'Karar Destek Sistemleri', instructor: 'Prof. Dr. Mustafa Akın', room: 'D401', type: 'Ders' },
    { day: 'Salı', time: '10:30-12:00', course: 'Bitirme Projesi I', instructor: 'Bölüm Öğretim Üyeleri', room: 'D402', type: 'Proje' },
    { day: 'Çarşamba', time: '13:30-15:00', course: 'İleri Veri Tabanı', instructor: 'Dr. Cemre Aydın', room: 'Lab1', type: 'Lab' },
    { day: 'Perşembe', time: '09:00-10:30', course: 'Kurumsal Kaynak Planlaması', instructor: 'Doç. Dr. Kaan Ersoy', room: 'D403', type: 'Ders' },
    { day: 'Perşembe', time: '15:00-16:30', course: 'İş Zekası', instructor: 'Dr. Pınar Yıldırım', room: 'D404', type: 'Ders' },
    { day: 'Cuma', time: '09:30-11:00', course: 'Staj Semineri', instructor: 'Bölüm Öğretim Üyeleri', room: 'Amfi', type: 'Seminer' },
    { day: 'Cuma', time: '14:00-15:30', course: 'Mezuniyet Semineri', instructor: 'Bölüm Öğretim Üyeleri', room: 'Amfi', type: 'Seminer' }
  ]
};

const days = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma'];
const timeSlots = [
  '08:00-09:30', '08:30-10:00', '09:00-10:30', '09:30-11:00', '10:00-11:30', 
  '10:30-12:00', '11:00-12:30', '11:30-13:00', '13:00-14:30', '13:30-15:00', 
  '14:00-15:30', '14:30-16:00', '15:00-16:30'
];

const getTypeColor = (type: string) => {
  switch (type) {
    case 'Lab': return 'bg-accent text-accent-foreground';
    case 'Proje': return 'bg-secondary text-secondary-foreground';
    case 'Seminer': return 'bg-primary-hover text-primary-foreground';
    default: return 'bg-primary text-primary-foreground';
  }
};

export default function SchedulePage() {
  const [selectedClass, setSelectedClass] = useState('1. Sınıf');
  const classYears = Object.keys(scheduleData);

  // Get schedule data for selected class
  const currentSchedule = scheduleData[selectedClass as keyof typeof scheduleData];

  // Create a time-day matrix for table display
  const createScheduleMatrix = () => {
    const matrix: { [key: string]: { [key: string]: any } } = {};
    
    timeSlots.forEach(time => {
      matrix[time] = {};
      days.forEach(day => {
        matrix[time][day] = null;
      });
    });

    currentSchedule.forEach(lesson => {
      if (matrix[lesson.time]) {
        matrix[lesson.time][lesson.day] = lesson;
      }
    });

    return matrix;
  };

  const scheduleMatrix = createScheduleMatrix();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background p-6">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4">Ders Programı</h1>
          <p className="text-xl text-muted-foreground">
            YBS Bölümü sınıf bazlı haftalık ders programı
          </p>
        </div>

        {/* Class Filter */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl text-primary">
              <Filter className="w-6 h-6" />
              Sınıf Seçimi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              {classYears.map((classYear) => (
                <Button
                  key={classYear}
                  variant={selectedClass === classYear ? 'kiosk' : 'outline'}
                  size="xl"
                  onClick={() => setSelectedClass(classYear)}
                  className="h-20 flex flex-col items-center justify-center gap-2"
                >
                  <GraduationCap className="w-8 h-8" />
                  <span className="text-lg font-bold">{classYear}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Schedule Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-primary">
              {selectedClass} Ders Programı
            </CardTitle>
            <p className="text-muted-foreground">
              Haftalık ders saatleri ve sınıf bilgileri
            </p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-32 text-center font-bold text-primary">
                      <Clock className="w-5 h-5 mx-auto mb-1" />
                      Saat
                    </TableHead>
                    {days.map((day) => (
                      <TableHead key={day} className="text-center font-bold text-primary min-w-48">
                        {day}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {timeSlots.map((timeSlot) => (
                    <TableRow key={timeSlot} className="h-24">
                      <TableCell className="font-semibold text-center bg-secondary/30 text-primary">
                        {timeSlot}
                      </TableCell>
                      {days.map((day) => {
                        const lesson = scheduleMatrix[timeSlot]?.[day];
                        return (
                          <TableCell key={`${timeSlot}-${day}`} className="p-2">
                            {lesson ? (
                              <div className="bg-card border border-border rounded-lg p-3 h-full hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-2">
                                  <Badge className={getTypeColor(lesson.type)}>
                                    {lesson.type}
                                  </Badge>
                                </div>
                                <h4 className="font-semibold text-primary text-sm mb-2 leading-tight">
                                  {lesson.course}
                                </h4>
                                <div className="space-y-1 text-xs text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <User className="w-3 h-3" />
                                    <span className="truncate">{lesson.instructor}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    <span>{lesson.room}</span>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="h-full flex items-center justify-center text-muted-foreground/50">
                                <span className="text-xs">Boş</span>
                              </div>
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Class Statistics */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <Card className="text-center p-6">
            <div className="text-3xl font-bold text-primary mb-2">
              {currentSchedule.length}
            </div>
            <div className="text-sm text-muted-foreground">Toplam Ders</div>
          </Card>
          <Card className="text-center p-6">
            <div className="text-3xl font-bold text-accent mb-2">
              {currentSchedule.filter(l => l.type === 'Lab').length}
            </div>
            <div className="text-sm text-muted-foreground">Laboratuvar</div>
          </Card>
          <Card className="text-center p-6">
            <div className="text-3xl font-bold text-secondary-foreground mb-2">
              {currentSchedule.filter(l => l.type === 'Proje' || l.type === 'Seminer').length}
            </div>
            <div className="text-sm text-muted-foreground">Proje/Seminer</div>
          </Card>
          <Card className="text-center p-6">
            <div className="text-3xl font-bold text-primary-hover mb-2">
              {new Set(currentSchedule.map(l => l.room)).size}
            </div>
            <div className="text-sm text-muted-foreground">Farklı Sınıf</div>
          </Card>
        </div>
      </div>
    </div>
  );
}