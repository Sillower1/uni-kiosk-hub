import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin } from "lucide-react";

interface FacultyMember {
  id: string;
  name: string;
  title: string;
  department: string;
  email?: string;
  phone?: string;
  office?: string;
  image_url?: string;
}

const FacultyPage = () => {
  const [facultyMembers, setFacultyMembers] = useState<FacultyMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Öğretim Üyeleri";
    fetchFacultyMembers();
  }, []);

  const fetchFacultyMembers = async () => {
    try {
      const { data, error } = await supabase
        .from("faculty_members")
        .select("*")
        .order("name");

      if (error) throw error;
      setFacultyMembers(data || []);
    } catch (error) {
      console.error("Error fetching faculty members:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Öğretim Üyeleri</h1>
        <p className="text-muted-foreground">Fakültemizin değerli öğretim üyelerini tanıyın</p>
      </header>

      <main>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {facultyMembers.map((member) => (
            <Card key={member.id} className="overflow-hidden">
              <CardHeader className="pb-4">
                {member.image_url && (
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden bg-muted">
                    <img
                      src={member.image_url}
                      alt={`${member.name} fotoğrafı`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardTitle className="text-center text-lg">{member.name}</CardTitle>
                <p className="text-center text-sm text-muted-foreground">{member.title}</p>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="text-sm">
                    <span className="font-medium">Bölüm:</span> {member.department}
                  </div>
                  
                  {member.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <a href={`mailto:${member.email}`} className="text-primary hover:underline">
                        {member.email}
                      </a>
                    </div>
                  )}
                  
                  {member.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{member.phone}</span>
                    </div>
                  )}
                  
                  {member.office && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{member.office}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {facultyMembers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Henüz öğretim üyesi bilgisi bulunmamaktadır.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default FacultyPage;