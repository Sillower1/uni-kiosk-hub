import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { LogOut, Users, Calendar, MessageSquare, ClipboardList } from "lucide-react";
import { AnnouncementsManager } from "@/components/admin/AnnouncementsManager";
import { ScheduleManager } from "@/components/admin/ScheduleManager";
import { SurveysManager } from "@/components/admin/SurveysManager";
import { FacultyManager } from "@/components/admin/FacultyManager";

const AdminPage = () => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/admin-login");
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (error || profile?.role !== "admin") {
        toast.error("Bu sayfaya erişim yetkiniz yok");
        navigate("/");
        return;
      }

      setIsAdmin(true);
    } catch (error) {
      toast.error("Erişim kontrolü başarısız");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Çıkış yapıldı");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">Admin Paneli</h1>
          <Button onClick={handleLogout} variant="outline" size="sm">
            <LogOut className="h-4 w-4 mr-2" />
            Çıkış Yap
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="announcements" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="announcements" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Duyurular
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Ders Programı
            </TabsTrigger>
            <TabsTrigger value="surveys" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Anketler
            </TabsTrigger>
            <TabsTrigger value="faculty" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Öğretim Üyeleri
            </TabsTrigger>
          </TabsList>

          <TabsContent value="announcements">
            <Card>
              <CardHeader>
                <CardTitle>Duyuru Yönetimi</CardTitle>
                <CardDescription>
                  Duyurular ekleyin, düzenleyin ve yönetin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AnnouncementsManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule">
            <Card>
              <CardHeader>
                <CardTitle>Ders Programı Yönetimi</CardTitle>
                <CardDescription>
                  Ders programını düzenleyin ve güncelleyin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScheduleManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="surveys">
            <Card>
              <CardHeader>
                <CardTitle>Anket Yönetimi</CardTitle>
                <CardDescription>
                  Anket oluşturun ve yönetin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SurveysManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="faculty">
            <Card>
              <CardHeader>
                <CardTitle>Öğretim Üyesi Yönetimi</CardTitle>
                <CardDescription>
                  Öğretim üyesi bilgilerini ekleyin ve düzenleyin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FacultyManager />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminPage;