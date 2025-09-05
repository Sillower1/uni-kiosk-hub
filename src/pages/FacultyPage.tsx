import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";

interface FacultyMember {
  id: string;
  name: string;
  title: string;
  department: string;
  office?: string;
  image_url?: string;
  education?: string;
  research_areas?: string;
  position?: string;
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
      // Use the security function to get only public faculty information
      const { data, error } = await supabase
        .rpc("get_public_faculty_members") as { data: FacultyMember[] | null, error: any };

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

  // Group faculty members by department
  const groupedFaculty = facultyMembers.reduce((acc, member) => {
    if (!acc[member.department]) {
      acc[member.department] = [];
    }
    acc[member.department].push(member);
    return acc;
  }, {} as Record<string, FacultyMember[]>);

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 text-center">
        <div className="bg-primary text-primary-foreground py-6 px-4 rounded-lg mb-8">
          <h1 className="text-4xl font-bold mb-2">Akademik Kadro</h1>
        </div>
      </header>

      <main className="space-y-12">
        {Object.entries(groupedFaculty).map(([department, members]) => (
          <section key={department}>
            <div className="bg-primary text-primary-foreground py-4 px-6 rounded-lg mb-8">
              <h2 className="text-2xl font-bold">{department}</h2>
            </div>
            
            <div className="space-y-8">
              {members.map((member) => (
                <Card key={member.id} className="overflow-hidden">
                  <CardContent className="p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                      {/* Photo Column */}
                      <div className="lg:col-span-1">
                        {member.image_url ? (
                          <div className="w-48 h-56 mx-auto rounded-lg overflow-hidden bg-muted">
                            <img
                              src={member.image_url}
                              alt={`${member.name} fotoğrafı`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-48 h-56 mx-auto rounded-lg bg-muted flex items-center justify-center">
                            <span className="text-muted-foreground">Fotoğraf Yok</span>
                          </div>
                        )}
                      </div>

                      {/* Basic Info Column */}
                      <div className="lg:col-span-1 space-y-4">
                        <div>
                          <h3 className="text-xl font-bold text-primary mb-1">{member.name}</h3>
                          {member.position && (
                            <p className="text-lg font-semibold text-foreground mb-2">{member.position}</p>
                          )}
                          <p className="text-sm text-muted-foreground">{member.title}</p>
                        </div>

                        {member.office && (
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <span><strong>Ofis:</strong> {member.office}</span>
                          </div>
                        )}

                        <div className="text-xs text-muted-foreground p-3 bg-muted/50 rounded">
                          İletişim bilgileri için bölüm sekreterliğine başvurunuz.
                        </div>
                      </div>

                      {/* Education Column */}
                      <div className="lg:col-span-1">
                        <h4 className="text-lg font-semibold text-primary mb-3">Eğitim:</h4>
                        {member.education ? (
                          <div className="text-sm space-y-2">
                            {member.education.split('\n').map((edu, index) => (
                              <p key={index} className="text-muted-foreground">• {edu}</p>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">Eğitim bilgisi bulunmamaktadır.</p>
                        )}
                      </div>

                      {/* Research Areas Column */}
                      <div className="lg:col-span-1">
                        <h4 className="text-lg font-semibold text-primary mb-3">Araştırma Alanları:</h4>
                        {member.research_areas ? (
                          <div className="text-sm space-y-2">
                            {member.research_areas.split('\n').map((area, index) => (
                              <p key={index} className="text-muted-foreground">• {area}</p>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">Araştırma alanı bilgisi bulunmamaktadır.</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ))}

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