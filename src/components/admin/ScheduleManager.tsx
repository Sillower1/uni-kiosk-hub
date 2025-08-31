import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Edit, Trash2 } from "lucide-react";

interface Course {
  id: string;
  course_name: string;
  course_code: string;
  instructor: string;
  class_level: number;
  day_of_week: string;
  start_time: string;
  end_time: string;
  room: string;
}

const DAYS = [
  { value: "Pazartesi", label: "Pazartesi" },
  { value: "Salı", label: "Salı" },
  { value: "Çarşamba", label: "Çarşamba" },
  { value: "Perşembe", label: "Perşembe" },
  { value: "Cuma", label: "Cuma" },
  { value: "Cumartesi", label: "Cumartesi" },
  { value: "Pazar", label: "Pazar" },
];

export const ScheduleManager = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    course_name: "",
    course_code: "",
    instructor: "",
    class_level: 1,
    day_of_week: "",
    start_time: "",
    end_time: "",
    room: "",
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("class_level", { ascending: true })
        .order("day_of_week", { ascending: true })
        .order("start_time", { ascending: true });

      if (error) throw error;
      setCourses(data || []);
    } catch (error: any) {
      toast.error("Dersler yüklenemedi: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        const { error } = await supabase
          .from("courses")
          .update(formData)
          .eq("id", editingId);

        if (error) throw error;
        toast.success("Ders güncellendi");
      } else {
        const { error } = await supabase
          .from("courses")
          .insert(formData);

        if (error) throw error;
        toast.success("Ders eklendi");
      }

      setIsDialogOpen(false);
      resetForm();
      fetchCourses();
    } catch (error: any) {
      toast.error("İşlem başarısız: " + error.message);
    }
  };

  const handleEdit = (course: Course) => {
    setEditingId(course.id);
    setFormData({
      course_name: course.course_name,
      course_code: course.course_code,
      instructor: course.instructor,
      class_level: course.class_level,
      day_of_week: course.day_of_week,
      start_time: course.start_time,
      end_time: course.end_time,
      room: course.room || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu dersi silmek istediğinizden emin misiniz?")) return;

    try {
      const { error } = await supabase
        .from("courses")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Ders silindi");
      fetchCourses();
    } catch (error: any) {
      toast.error("Silme işlemi başarısız: " + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      course_name: "",
      course_code: "",
      instructor: "",
      class_level: 1,
      day_of_week: "",
      start_time: "",
      end_time: "",
      room: "",
    });
    setEditingId(null);
  };

  if (loading) {
    return <div className="text-center py-4">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Dersler ({courses.length})</h3>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Yeni Ders
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Ders Düzenle" : "Yeni Ders Ekle"}
              </DialogTitle>
              <DialogDescription>
                Ders bilgilerini girin ve kaydedin
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="course_name">Ders Adı</Label>
                  <Input
                    id="course_name"
                    value={formData.course_name}
                    onChange={(e) => setFormData({ ...formData, course_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="course_code">Ders Kodu</Label>
                  <Input
                    id="course_code"
                    value={formData.course_code}
                    onChange={(e) => setFormData({ ...formData, course_code: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="instructor">Öğretim Görevlisi</Label>
                  <Input
                    id="instructor"
                    value={formData.instructor}
                    onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="class_level">Sınıf</Label>
                  <Select value={formData.class_level.toString()} onValueChange={(value) => setFormData({ ...formData, class_level: parseInt(value) })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1. Sınıf</SelectItem>
                      <SelectItem value="2">2. Sınıf</SelectItem>
                      <SelectItem value="3">3. Sınıf</SelectItem>
                      <SelectItem value="4">4. Sınıf</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="day_of_week">Gün</Label>
                <Select value={formData.day_of_week} onValueChange={(value) => setFormData({ ...formData, day_of_week: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Gün seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS.map((day) => (
                      <SelectItem key={day.value} value={day.value}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_time">Başlangıç Saati</Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="end_time">Bitiş Saati</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="room">Derslik</Label>
                <Input
                  id="room"
                  value={formData.room}
                  onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                  placeholder="Örn: A-101"
                />
              </div>
              <Button type="submit" className="w-full">
                {editingId ? "Güncelle" : "Ekle"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ders Adı</TableHead>
              <TableHead>Kod</TableHead>
              <TableHead>Öğretim Görevlisi</TableHead>
              <TableHead>Sınıf</TableHead>
              <TableHead>Gün</TableHead>
              <TableHead>Saat</TableHead>
              <TableHead>Derslik</TableHead>
              <TableHead>İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.map((course) => (
              <TableRow key={course.id}>
                <TableCell className="font-medium">{course.course_name}</TableCell>
                <TableCell>{course.course_code}</TableCell>
                <TableCell>{course.instructor}</TableCell>
                <TableCell>{course.class_level}. Sınıf</TableCell>
                <TableCell>{course.day_of_week}</TableCell>
                <TableCell>{course.start_time} - {course.end_time}</TableCell>
                <TableCell>{course.room || "-"}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(course)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(course.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};