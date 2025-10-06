import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";

interface FacultyMember {
  id: string;
  name: string;
  title: string;
  department: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  office?: string;
  image_url?: string;
  education?: string;
  specialization?: string;
  category?: string;
  display_order: number;
  category_display_order?: number;
  email_display_order?: number;
  phone_display_order?: number;
  linkedin_display_order?: number;
  office_display_order?: number;
  education_display_order?: number;
  specialization_display_order?: number;
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
      // Fetch faculty members with all display order information
      const { data, error } = await supabase
        .from("faculty_members")
        .select("*")
        .order("display_order", { ascending: true })
        .order("name", { ascending: true });

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

  // Group faculty members by category
  const groupedMembers = facultyMembers.reduce((acc, member) => {
    const category = member.category || "Diğer";
    if (!acc[category]) {
      acc[category] = {
        members: [],
        display_order: member.category_display_order || 999
      };
    }
    acc[category].members.push(member);
    return acc;
  }, {} as Record<string, { members: FacultyMember[], display_order: number }>);

  // Sort categories by category_display_order, then by name
  const sortedCategories = Object.keys(groupedMembers).sort((a, b) => {
    const orderA = groupedMembers[a].display_order;
    const orderB = groupedMembers[b].display_order;
    
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    return a.localeCompare(b);
  });

  // Sort members within each category by their display_order
  sortedCategories.forEach(category => {
    groupedMembers[category].members.sort((a, b) => {
      if (a.display_order !== b.display_order) {
        return a.display_order - b.display_order;
      }
      return a.name.localeCompare(b.name);
    });
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Öğretim Üyeleri</h1>
        <p className="text-muted-foreground">Fakültemizin değerli öğretim üyelerini tanıyın</p>
      </header>

      <main className="space-y-12">
        {sortedCategories.map((category) => (
          <section key={category}>
            <h2 className="text-2xl font-semibold text-foreground mb-6 pb-2 border-b">
              {category}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groupedMembers[category].members.map((member) => (
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
                    {member.title && (
                      <p className="text-center text-sm text-muted-foreground">{member.title}</p>
                    )}
                    {member.department && (
                      <p className="text-center text-base text-foreground font-medium mt-1">{member.department}</p>
                    )}
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {(() => {
                        const fields = [
                          { key: 'office', label: 'Oda', value: member.office, order: member.office_display_order || 0, icon: MapPin },
                          { key: 'email', label: 'E-posta', value: member.email, order: member.email_display_order || 0 },
                          { key: 'phone', label: 'Telefon', value: member.phone, order: member.phone_display_order || 0 },
                          { key: 'linkedin', label: 'LinkedIn', value: member.linkedin, order: member.linkedin_display_order || 0 },
                          { key: 'education', label: 'Eğitim Geçmişi', value: member.education, order: member.education_display_order || 0 },
                          { key: 'specialization', label: 'Araştırma Alanları', value: member.specialization, order: member.specialization_display_order || 0 },
                        ];

                        return fields
                          .filter(field => field.value)
                          .sort((a, b) => a.order - b.order)
                          .map(field => {
                            const Icon = field.icon;
                            return (
                              <div key={field.key} className="text-sm">
                                <div className="flex items-start gap-2">
                                  {Icon && <Icon className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />}
                                  <div className="flex-1">
                                    <span className="font-medium">{field.label}:</span>
                                    <p className="mt-1 text-muted-foreground whitespace-pre-line">{field.value}</p>
                                  </div>
                                </div>
                              </div>
                            );
                          });
                      })()}
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
