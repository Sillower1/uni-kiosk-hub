import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock } from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

export default function AnnouncementsPage() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Duyurular - DEÜ YBS';
  }, []);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('announcements')
        .select('id, title, content, created_at')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setItems(data || []);
      }
      setLoading(false);
    };

    fetchAnnouncements();
  }, []);

  const stats = useMemo(() => ({
    active: items.length,
    upcomingEvents: 0, // Kategoriler/veriler eklenirse güncellenebilir
    urgent: 0 // Acil alanı olmadığı için 0
  }), [items]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4">Duyurular ve Etkinlikler</h1>
          <p className="text-xl text-muted-foreground">
            YBS Bölümü güncel duyuru ve etkinliklerini takip edin
          </p>
        </div>

        {/* Loading / Error / Empty States */}
        {loading && (
          <div className="text-center text-muted-foreground py-12">Yükleniyor...</div>
        )}
        {error && (
          <div className="text-center text-destructive py-12">Duyurular yüklenemedi: {error}</div>
        )}

        {/* Announcements Grid */}
        {!loading && !error && (
          items.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {items.map((a) => (
                <Card key={a.id} className="relative transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-2">
                      <CardTitle className="text-xl font-semibold text-primary pr-4">
                        {a.title}
                      </CardTitle>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(a.created_at).toLocaleDateString('tr-TR')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(a.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>

                    {/* Kategori/Acil bilgileri olmadığı için rozet kaldırıldı; ihtiyaç olursa eklenebilir */}
                    <Badge className="hidden" />
                  </CardHeader>

                  <CardContent>
                    <p className="text-foreground leading-relaxed">
                      {a.content}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-12">Henüz aktif duyuru bulunmuyor.</div>
          )
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <Card className="text-center p-6 bg-gradient-to-br from-primary/10 to-primary/5">
            <h3 className="text-2xl font-bold text-primary">{stats.active}</h3>
            <p className="text-muted-foreground">Aktif Duyuru</p>
          </Card>
          <Card className="text-center p-6 bg-gradient-to-br from-accent/10 to-accent/5">
            <h3 className="text-2xl font-bold text-accent">{stats.upcomingEvents}</h3>
            <p className="text-muted-foreground">Yaklaşan Etkinlik</p>
          </Card>
          <Card className="text-center p-6 bg-gradient-to-br from-destructive/10 to-destructive/5">
            <h3 className="text-2xl font-bold text-destructive">{stats.urgent}</h3>
            <p className="text-muted-foreground">Acil Duyuru</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
