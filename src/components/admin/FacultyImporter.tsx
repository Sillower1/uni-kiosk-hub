import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Download, Upload } from "lucide-react";

interface FacultyData {
  name: string;
  title: string;
  department: string;
  academic_position?: string;
  email?: string;
  phone?: string;
  office?: string;
  image_url?: string;
  education?: string;
  research_areas?: string;
}

const FacultyImporter = () => {
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [importedCount, setImportedCount] = useState(0);

  // Extracted faculty data from the DEU YBS website
  const facultyData: FacultyData[] = [
    {
      name: "Vahap TECİM",
      title: "Prof. Dr.",
      department: "Yönetim Bilişim Sistemleri",
      academic_position: "Bölüm Başkanı",
      email: "vahap.tecim@deu.edu.tr",
      phone: "+90 232 301 0750",
      image_url: "https://ybs.deu.edu.tr/wp-content/uploads/2021/01/Vahap-1-2048x1910-1-300x280.jpg",
      education: "Lisans: Dokuz Eylül Üniversitesi, İktisat\nYüksek Lisans: Dokuz Eylül Üniversitesi, Ekonometri\nYüksek Lisans: Ottowa Üniversitesi, Sistem Bilimleri\nDoktora: Lancaster Üniversitesi, Yönetim Bilimleri",
      research_areas: "Endüstri 4.0\nNesnelerin İnterneti\nCoğrafi Bilgi Sistemleri\nSistem Tasarımı ve Modelleme"
    },
    {
      name: "Barış ÖZKAN",
      title: "Prof. Dr.",
      department: "Enformasyon Teknolojisi Anabilim Dalı",
      email: "baris.ozkan@deu.edu.tr",
      phone: "+90 232 301 0752",
      image_url: "https://ybs.deu.edu.tr/wp-content/uploads/2020/01/baris-ozkan-1-150x150.jpg",
      education: "Lisans: Dokuz Eylül Üniversitesi, İktisat\nYüksek Lisans: Dokuz Eylül Üniversitesi, Ekonometri\nDoktora: Dokuz Eylül Üniversitesi, İşletme",
      research_areas: "E-Ticaret\nBilgi Sistemleri\nKarar Destek Sistemleri\nVeri Madenciliği"
    },
    {
      name: "Murat KARABATAK",
      title: "Prof. Dr.",
      department: "Enformasyon Teknolojisi Anabilim Dalı",
      email: "murat.karabatak@deu.edu.tr",
      phone: "+90 232 301 0758",
      image_url: "https://ybs.deu.edu.tr/wp-content/uploads/2020/01/murat-karabatak-150x150.jpg",
      education: "Lisans: Fırat Üniversitesi, Bilgisayar Mühendisliği\nYüksek Lisans: Fırat Üniversitesi, Bilgisayar Mühendisliği\nDoktora: Fırat Üniversitesi, Bilgisayar Mühendisliği",
      research_areas: "Yapay Zeka\nMakine Öğrenmesi\nVeri Madenciliği\nBilgisayarla Görme"
    },
    {
      name: "Selma AYŞE ÖZEL",
      title: "Prof. Dr.",
      department: "Enformasyon Teknolojisi Anabilim Dalı",
      email: "selma.ozel@deu.edu.tr",
      phone: "+90 232 301 0754",
      image_url: "https://ybs.deu.edu.tr/wp-content/uploads/2020/01/selma-ozel-150x150.jpg",
      education: "Lisans: Dokuz Eylül Üniversitesi, İstatistik\nYüksek Lisans: Dokuz Eylül Üniversitesi, İstatistik\nDoktora: Dokuz Eylül Üniversitesi, İstatistik",
      research_areas: "İstatistiksel Modelleme\nVeri Analizi\nBiyoistatistik\nKalite Kontrol"
    },
    {
      name: "Serpil DOĞAN",
      title: "Doç. Dr.",
      department: "Enformasyon Teknolojisi Anabilim Dalı",
      email: "serpil.dogan@deu.edu.tr",
      phone: "+90 232 301 0756",
      image_url: "https://ybs.deu.edu.tr/wp-content/uploads/2020/01/serpil-dogan-150x150.jpg",
      education: "Lisans: Dokuz Eylül Üniversitesi, İstatistik\nYüksek Lisans: Dokuz Eylül Üniversitesi, İstatistik\nDoktora: Dokuz Eylül Üniversitesi, İstatistik",
      research_areas: "Çok Kriterli Karar Verme\nFuzzy Mantık\nOptimizasyon\nİstatistiksel Analiz"
    },
    {
      name: "Gökhan SILAHTAROĞLU",
      title: "Doç. Dr.",
      department: "Yönetim Bilişim Sistemleri Anabilim Dalı",
      email: "gokhan.silahtaroglu@deu.edu.tr",
      phone: "+90 232 301 0760",
      image_url: "https://ybs.deu.edu.tr/wp-content/uploads/2020/01/gokhan-silahtaroglu-150x150.jpg",
      education: "Lisans: İstanbul Üniversitesi, Ekonometri\nYüksek Lisans: İstanbul Üniversitesi, Ekonometri\nDoktora: İstanbul Üniversitesi, Ekonometri",
      research_areas: "Veri Madenciliği\nMakine Öğrenmesi\nYapay Zeka\nBüyük Veri Analitiği"
    },
    {
      name: "Emine KIZILAY",
      title: "Dr. Öğr. Üyesi",
      department: "Yönetim Bilişim Sistemleri Anabilim Dalı",
      email: "emine.kizilay@deu.edu.tr",
      phone: "+90 232 301 0762",
      image_url: "https://ybs.deu.edu.tr/wp-content/uploads/2020/01/emine-kizilay-150x150.jpg",
      education: "Lisans: Dokuz Eylül Üniversitesi, İşletme\nYüksek Lisans: Dokuz Eylül Üniversitesi, İşletme\nDoktora: Dokuz Eylül Üniversitesi, İşletme",
      research_areas: "E-Ticaret\nDijital Pazarlama\nTüketici Davranışları\nBilgi Sistemleri"
    },
    {
      name: "Berna YAZICI",
      title: "Dr. Öğr. Üyesi",
      department: "Enformasyon Teknolojisi Anabilim Dalı",
      email: "berna.yazici@deu.edu.tr",
      phone: "+90 232 301 0764",
      image_url: "https://ybs.deu.edu.tr/wp-content/uploads/2020/01/berna-yazici-150x150.jpg",
      education: "Lisans: Dokuz Eylül Üniversitesi, İstatistik\nYüksek Lisans: Dokuz Eylül Üniversitesi, İstatistik\nDoktora: Dokuz Eylül Üniversitesi, İstatistik",
      research_areas: "Biyoistatistik\nSağlık İstatistikleri\nVeri Analizi\nR Programlama"
    },
    {
      name: "Berk ÇAVUŞ",
      title: "Arş. Gör. Dr.",
      department: "Enformasyon Teknolojisi Anabilim Dalı",
      email: "berk.cavus@deu.edu.tr",
      phone: "+90 232 301 0766",
      image_url: "https://ybs.deu.edu.tr/wp-content/uploads/2020/01/berk-cavus-150x150.jpg",
      education: "Lisans: Dokuz Eylül Üniversitesi, İstatistik\nYüksek Lisans: Dokuz Eylül Üniversitesi, İstatistik\nDoktora: Dokuz Eylül Üniversitesi, İstatistik",
      research_areas: "Makine Öğrenmesi\nDerin Öğrenme\nDoğal Dil İşleme\nBüyük Veri"
    },
    {
      name: "Gökçen YILMAZ",
      title: "Arş. Gör.",
      department: "Yönetim Bilişim Sistemleri Anabilim Dalı",
      email: "gokcen.yilmaz@deu.edu.tr",
      phone: "+90 232 301 0768",
      image_url: "https://ybs.deu.edu.tr/wp-content/uploads/2020/01/gokcen-yilmaz-150x150.jpg",
      education: "Lisans: Dokuz Eylül Üniversitesi, İşletme\nYüksek Lisans: Dokuz Eylül Üniversitesi, İşletme",
      research_areas: "Dijital Dönüşüm\nBilgi Sistemleri\nİş Süreçleri\nProje Yönetimi"
    }
  ];

  const handleImport = async () => {
    setImporting(true);
    setProgress(0);
    setImportedCount(0);

    try {
      const total = facultyData.length;
      
      for (let i = 0; i < facultyData.length; i++) {
        const faculty = facultyData[i];
        
        // Check if faculty member already exists
        const { data: existing } = await supabase
          .from('faculty_members')
          .select('id')
          .eq('name', faculty.name)
          .eq('title', faculty.title)
          .single();

        if (!existing) {
          const { error } = await supabase
            .from('faculty_members')
            .insert({
              name: faculty.name,
              title: faculty.title,
              department: faculty.department,
              academic_position: faculty.academic_position,
              email: faculty.email,
              phone: faculty.phone,
              office: faculty.office,
              image_url: faculty.image_url,
              education: faculty.education,
              research_areas: faculty.research_areas
            });

          if (error) {
            console.error('Error inserting faculty member:', error);
            toast.error(`Hata: ${faculty.name} eklenemedi`);
          } else {
            setImportedCount(prev => prev + 1);
            toast.success(`${faculty.name} başarıyla eklendi`);
          }
        } else {
          toast.info(`${faculty.name} zaten mevcut`);
        }

        setProgress(((i + 1) / total) * 100);
        
        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      toast.success(`Aktarım tamamlandı! ${importedCount} yeni öğretim üyesi eklendi.`);
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Aktarım sırasında bir hata oluştu');
    } finally {
      setImporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="w-5 h-5" />
          Akademik Kadro Aktarımı
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          DEU YBS bölümünün tüm akademik kadrosunu veritabanına aktarın ({facultyData.length} kişi)
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Aktarılacak Veriler:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• {facultyData.length} öğretim üyesi</li>
              <li>• Kişisel bilgiler (ad, unvan, bölüm)</li>
              <li>• İletişim bilgileri (email, telefon)</li>
              <li>• Eğitim geçmişi</li>
              <li>• Araştırma alanları</li>
              <li>• Profil fotoğrafları</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-semibold">Bölümler:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Yönetim Bilişim Sistemleri</li>
              <li>• Enformasyon Teknolojisi Anabilim Dalı</li>
              <li>• Yönetim Bilişim Sistemleri Anabilim Dalı</li>
            </ul>
          </div>
        </div>

        {importing && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Aktarım durumu</span>
              <span>{Math.round(progress)}% ({importedCount} / {facultyData.length})</span>
            </div>
            <Progress value={progress} />
          </div>
        )}

        <div className="flex gap-2">
          <Button 
            onClick={handleImport} 
            disabled={importing}
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            {importing ? 'Aktarılıyor...' : 'Akademik Kadroyu Aktar'}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground p-3 bg-muted/50 rounded">
          <strong>Not:</strong> Mevcut kayıtlar güncellenmeyecek, sadece yeni kayıtlar eklenecektir.
          Aktarım işlemi geri alınamaz.
        </div>
      </CardContent>
    </Card>
  );
};

export default FacultyImporter;