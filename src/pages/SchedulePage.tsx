import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Filter, GraduationCap, Clock, MapPin, User } from 'lucide-react';

interface Course {
  id: string;
  course_name: string;
  course_code: string;
  instructor: string;
  class_level: number;
  day_of_week: string;
  start_time: string; // HH:MM[:SS]
  end_time: string;   // HH:MM[:SS]
  room: string | null;
}

const DAY_ORDER = ['Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi','Pazar'];
const toHM = (t: string) => (t || '').slice(0,5);

export default function SchedulePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);

  useEffect(() => { document.title = 'Ders Programı - DEÜ YBS'; }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('class_level', { ascending: true })
        .order('day_of_week', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) setError(error.message);
      else setCourses(data || []);
      setLoading(false);
    };
    fetchCourses();
  }, []);

  const classYears = useMemo(() => {
    const levels = Array.from(new Set(courses.map(c => c.class_level))).sort((a,b) => a - b);
    return levels.length ? levels : [1,2,3,4];
  }, [courses]);

  useEffect(() => {
    if (selectedClass === null && classYears.length) {
      setSelectedClass(classYears[0]);
    }
  }, [classYears, selectedClass]);

  const filtered = useMemo(() => courses.filter(c => selectedClass ? c.class_level === selectedClass : true), [courses, selectedClass]);

  const days = useMemo(() => {
    const uniqueDays = Array.from(new Set(filtered.map(c => c.day_of_week)));
    return uniqueDays.length ? uniqueDays.sort((a,b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b)) : DAY_ORDER.slice(0,5);
  }, [filtered]);

  const timeSlots = useMemo(() => {
    const slots = Array.from(new Set(filtered.map(c => `${toHM(c.start_time)}-${toHM(c.end_time)}`)));
    return slots.sort((a,b) => a.localeCompare(b));
  }, [filtered]);

  const scheduleMatrix = useMemo(() => {
    const matrix: Record<string, Record<string, Course | null>> = {};
    timeSlots.forEach(slot => {
      matrix[slot] = {} as Record<string, Course | null>;
      days.forEach(day => { matrix[slot][day] = null; });
    });
    filtered.forEach(c => {
      const slot = `${toHM(c.start_time)}-${toHM(c.end_time)}`;
      if (!matrix[slot]) {
        matrix[slot] = {} as Record<string, Course | null>;
        days.forEach(day => { matrix[slot][day] = null; });
      }
      if (days.includes(c.day_of_week)) {
        matrix[slot][c.day_of_week] = c;
      }
    });
    return matrix;
  }, [filtered, days, timeSlots]);

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

        {loading && (
          <div className="text-center text-muted-foreground py-12">Yükleniyor...</div>
        )}
        {error && (
          <div className="text-center text-destructive py-12">Ders programı yüklenemedi: {error}</div>
        )}

        {!loading && !error && (
          <>
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
                  {classYears.map((lvl) => (
                    <Button
                      key={lvl}
                      variant={selectedClass === lvl ? 'kiosk' : 'outline'}
                      size="xl"
                      onClick={() => setSelectedClass(lvl)}
                      className="h-20 flex flex-col items-center justify-center gap-2"
                    >
                      <GraduationCap className="w-8 h-8" />
                      <span className="text-lg font-bold">{lvl}. Sınıf</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Schedule Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-primary">
                  {selectedClass ?? '-'}. Sınıf Ders Programı
                </CardTitle>
                <p className="text-muted-foreground">
                  Haftalık ders saatleri ve sınıf bilgileri
                </p>
              </CardHeader>
              <CardContent>
                {timeSlots.length === 0 ? (
                  <div className="text-center text-muted-foreground py-12">Bu sınıf için ders bulunamadı.</div>
                ) : (
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
                        {timeSlots.map((slot) => (
                          <TableRow key={slot} className="h-24">
                            <TableCell className="font-semibold text-center bg-secondary/30 text-primary">
                              {slot}
                            </TableCell>
                            {days.map((day) => {
                              const lesson = scheduleMatrix[slot]?.[day] as Course | null;
                              return (
                                <TableCell key={`${slot}-${day}`} className="p-2">
                                  {lesson ? (
                                    <div className="bg-card border border-border rounded-lg p-3 h-full hover:shadow-md transition-shadow">
                                      <h4 className="font-semibold text-primary text-sm mb-2 leading-tight">
                                        {lesson.course_name} ({lesson.course_code})
                                      </h4>
                                      <div className="space-y-1 text-xs text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                          <User className="w-3 h-3" />
                                          <span className="truncate">{lesson.instructor}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <MapPin className="w-3 h-3" />
                                          <span>{lesson.room || '-'}</span>
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
                )}
              </CardContent>
            </Card>

            {/* Class Statistics */}
            <div className="grid grid-cols-4 gap-4 mt-6">
              <Card className="text-center p-6">
                <div className="text-3xl font-bold text-primary mb-2">
                  {filtered.length}
                </div>
                <div className="text-sm text-muted-foreground">Toplam Ders</div>
              </Card>
              <Card className="text-center p-6">
                <div className="text-3xl font-bold text-accent mb-2">
                  {new Set(filtered.filter(l => (l.room || '').toLowerCase().includes('lab')).map(l => l.id)).size}
                </div>
                <div className="text-sm text-muted-foreground">Laboratuvar</div>
              </Card>
              <Card className="text-center p-6">
                <div className="text-3xl font-bold text-secondary-foreground mb-2">
                  {new Set(filtered.map(l => l.room || '-')).size}
                </div>
                <div className="text-sm text-muted-foreground">Farklı Sınıf</div>
              </Card>
              <Card className="text-center p-6">
                <div className="text-3xl font-bold text-primary-hover mb-2">
                  {new Set(filtered.map(l => l.instructor)).size}
                </div>
                <div className="text-sm text-muted-foreground">Öğretim Görevlisi</div>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
