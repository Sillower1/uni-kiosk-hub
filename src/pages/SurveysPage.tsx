import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock } from "lucide-react";

interface Survey {
  id: string;
  title: string;
  description?: string;
  questions: any;
  is_active: boolean;
  expires_at?: string;
  created_at: string;
}

const SurveysPage = () => {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Anketler";
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    try {
      const { data, error } = await supabase
        .from("surveys")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSurveys(data || []);
    } catch (error) {
      console.error("Error fetching surveys:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
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
        <h1 className="text-3xl font-bold text-foreground mb-2">Anketler</h1>
        <p className="text-muted-foreground">Aktif anketleri görüntüleyin ve katılım sağlayın</p>
      </header>

      <main>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {surveys.map((survey) => (
            <Card key={survey.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <CardTitle className="text-xl">{survey.title}</CardTitle>
                  <div className="flex flex-col gap-2">
                    <Badge variant={isExpired(survey.expires_at) ? "destructive" : "default"}>
                      {isExpired(survey.expires_at) ? "Süresi Dolmuş" : "Aktif"}
                    </Badge>
                  </div>
                </div>
                {survey.description && (
                  <p className="text-muted-foreground">{survey.description}</p>
                )}
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Oluşturulma: {formatDate(survey.created_at)}</span>
                  </div>
                  
                  {survey.expires_at && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>Son Tarih: {formatDate(survey.expires_at)}</span>
                    </div>
                  )}
                  
                  <div className="text-sm">
                    <span className="font-medium">Soru Sayısı:</span> {Array.isArray(survey.questions) ? survey.questions.length : 0}
                  </div>
                  
                  {!isExpired(survey.expires_at) && (
                    <div className="pt-4">
                      <button 
                        onClick={() => window.location.href = `/surveys/${survey.id}`}
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium transition-colors"
                      >
                        Anketi Görüntüle
                      </button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {surveys.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Şu anda aktif anket bulunmamaktadır.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default SurveysPage;