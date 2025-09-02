import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Download, Eye, X } from "lucide-react";
import * as XLSX from 'xlsx';

interface Survey {
  id: string;
  title: string;
  questions: any[];
}

interface SurveyResponse {
  id: string;
  user_id: string | null;
  responses: any;
  submitted_at: string;
}

interface SurveyResponsesViewerProps {
  survey: Survey;
  isOpen: boolean;
  onClose: () => void;
}

export const SurveyResponsesViewer = ({ survey, isOpen, onClose }: SurveyResponsesViewerProps) => {
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && survey) {
      fetchResponses();
    }
  }, [isOpen, survey]);

  const fetchResponses = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("survey_responses")
        .select("*")
        .eq("survey_id", survey.id)
        .order("submitted_at", { ascending: false });

      if (error) throw error;
      setResponses(data || []);
    } catch (error: any) {
      toast.error("Cevaplar yüklenemedi: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    if (!responses.length) {
      toast.error("İndirilecek cevap bulunamadı");
      return;
    }

    // Prepare data for Excel
    const excelData = responses.map((response) => {
      const row: any = {
        "Kullanıcı ID": response.user_id || "Anonim",
        "Gönderim Tarihi": new Date(response.submitted_at).toLocaleString("tr-TR"),
      };

          // Add question responses
          if (Array.isArray(survey.questions)) {
            survey.questions.forEach((question, index) => {
              const responseValue = response.responses[index];
              let displayValue = responseValue;

              if (question.type === 'rating') {
                displayValue = `${responseValue}/5`;
              } else if (question.type === 'multiple_choice') {
                displayValue = responseValue;
              }

              row[`Soru ${index + 1}: ${question.question}`] = displayValue || "Cevapsız";
            });
          }

      return row;
    });

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Auto-size columns
    const colWidths = Object.keys(excelData[0] || {}).map(key => ({
      wch: Math.max(key.length, 15)
    }));
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, "Anket Cevapları");

    // Generate filename with survey title and date
    const filename = `${survey.title.replace(/[^a-z0-9]/gi, '_')}_cevaplari_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    XLSX.writeFile(wb, filename);
    toast.success("Excel dosyası indirildi");
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
          <div className="text-center py-8">Yükleniyor...</div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Anket Cevapları: {survey.title}</span>
            <div className="flex gap-2">
              <Button onClick={exportToExcel} size="sm" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Excel İndir
              </Button>
              <Button onClick={onClose} variant="outline" size="sm">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
          <DialogDescription>
            Toplam {responses.length} cevap alındı
          </DialogDescription>
        </DialogHeader>

        {responses.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Bu ankete henüz cevap verilmemiş
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kullanıcı</TableHead>
                  <TableHead>Gönderim Tarihi</TableHead>
                  {Array.isArray(survey.questions) && survey.questions.map((question, index) => (
                    <TableHead key={index} className="min-w-[200px]">
                      Soru {index + 1}: {question.question}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {responses.map((response) => (
                  <TableRow key={response.id}>
                    <TableCell>{response.user_id || "Anonim"}</TableCell>
                    <TableCell>
                      {new Date(response.submitted_at).toLocaleString("tr-TR")}
                    </TableCell>
                    {Array.isArray(survey.questions) && survey.questions.map((question, index) => {
                      const responseValue = response.responses[index];
                      let displayValue = responseValue;

                      if (question.type === 'rating') {
                        displayValue = `${responseValue}/5`;
                      } else if (question.type === 'multiple_choice') {
                        displayValue = responseValue;
                      }

                      return (
                        <TableCell key={index} className="max-w-xs">
                          <div className="truncate" title={displayValue}>
                            {displayValue || "Cevapsız"}
                          </div>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};