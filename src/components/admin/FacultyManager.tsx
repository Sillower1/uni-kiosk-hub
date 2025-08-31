import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Edit, Trash2 } from "lucide-react";

interface FacultyMember {
  id: string;
  name: string;
  title: string;
  department: string;
  email: string | null;
  phone: string | null;
  office: string | null;
  image_url: string | null;
}

export const FacultyManager = () => {
  const [facultyMembers, setFacultyMembers] = useState<FacultyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    department: "",
    email: "",
    phone: "",
    office: "",
    image_url: "",
  });

  useEffect(() => {
    fetchFacultyMembers();
  }, []);

  const fetchFacultyMembers = async () => {
    try {
      const { data, error } = await supabase
        .from("faculty_members")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      setFacultyMembers(data || []);
    } catch (error: any) {
      toast.error("Öğretim üyeleri yüklenemedi: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const memberData = {
        ...formData,
        email: formData.email || null,
        phone: formData.phone || null,
        office: formData.office || null,
        image_url: formData.image_url || null,
      };

      if (editingId) {
        const { error } = await supabase
          .from("faculty_members")
          .update(memberData)
          .eq("id", editingId);

        if (error) throw error;
        toast.success("Öğretim üyesi güncellendi");
      } else {
        const { error } = await supabase
          .from("faculty_members")
          .insert(memberData);

        if (error) throw error;
        toast.success("Öğretim üyesi eklendi");
      }

      setIsDialogOpen(false);
      resetForm();
      fetchFacultyMembers();
    } catch (error: any) {
      toast.error("İşlem başarısız: " + error.message);
    }
  };

  const handleEdit = (member: FacultyMember) => {
    setEditingId(member.id);
    setFormData({
      name: member.name,
      title: member.title,
      department: member.department,
      email: member.email || "",
      phone: member.phone || "",
      office: member.office || "",
      image_url: member.image_url || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu öğretim üyesini silmek istediğinizden emin misiniz?")) return;

    try {
      const { error } = await supabase
        .from("faculty_members")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Öğretim üyesi silindi");
      fetchFacultyMembers();
    } catch (error: any) {
      toast.error("Silme işlemi başarısız: " + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      title: "",
      department: "",
      email: "",
      phone: "",
      office: "",
      image_url: "",
    });
    setEditingId(null);
  };

  if (loading) {
    return <div className="text-center py-4">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Öğretim Üyeleri ({facultyMembers.length})</h3>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Yeni Öğretim Üyesi
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Öğretim Üyesi Düzenle" : "Yeni Öğretim Üyesi Ekle"}
              </DialogTitle>
              <DialogDescription>
                Öğretim üyesi bilgilerini girin ve kaydedin
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Ad Soyad</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="title">Unvan</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Prof. Dr., Doç. Dr., Dr. Öğr. Üyesi..."
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="department">Bölüm</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">E-posta</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="ornek@universitesi.edu.tr"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+90 XXX XXX XX XX"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="office">Ofis</Label>
                  <Input
                    id="office"
                    value={formData.office}
                    onChange={(e) => setFormData({ ...formData, office: e.target.value })}
                    placeholder="A-201"
                  />
                </div>
                <div>
                  <Label htmlFor="image_url">Fotoğraf URL</Label>
                  <Input
                    id="image_url"
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
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
              <TableHead>Ad Soyad</TableHead>
              <TableHead>Unvan</TableHead>
              <TableHead>Bölüm</TableHead>
              <TableHead>E-posta</TableHead>
              <TableHead>Telefon</TableHead>
              <TableHead>Ofis</TableHead>
              <TableHead>İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {facultyMembers.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="font-medium">{member.name}</TableCell>
                <TableCell>{member.title}</TableCell>
                <TableCell>{member.department}</TableCell>
                <TableCell>{member.email || "-"}</TableCell>
                <TableCell>{member.phone || "-"}</TableCell>
                <TableCell>{member.office || "-"}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(member)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(member.id)}
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