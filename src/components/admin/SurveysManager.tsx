import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Eye, X, FileText } from "lucide-react";
import { SurveyResponsesViewer } from "./SurveyResponsesViewer";

interface Survey {
  id: string;
  title: string;
  description: string;
  questions: any;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

export const SurveysManager = () => {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingResponses, setViewingResponses] = useState<Survey | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    questions: [{ question: "", type: "text", options: [], required: false }],
    is_active: true,
    expires_at: "",
  });

  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    try {
      const { data, error } = await supabase
        .from("surveys")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSurveys(data || []);
    } catch (error: any) {
      toast.error("Anketler yüklenemedi: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Kullanıcı bulunamadı");

      const surveyData = {
        ...formData,
        expires_at: formData.expires_at || null,
      };

      if (editingId) {
        const { error } = await supabase
          .from("surveys")
          .update(surveyData)
          .eq("id", editingId);

        if (error) throw error;
        toast.success("Anket güncellendi");
      } else {
        const { error } = await supabase
          .from("surveys")
          .insert({
            ...surveyData,
            created_by: user.id,
          });

        if (error) throw error;
        toast.success("Anket eklendi");
      }

      setIsDialogOpen(false);
      resetForm();
      fetchSurveys();
    } catch (error: any) {
      toast.error("İşlem başarısız: " + error.message);
    }
  };

  const handleEdit = (survey: Survey) => {
    setEditingId(survey.id);
    setFormData({
      title: survey.title,
      description: survey.description || "",
      questions: Array.isArray(survey.questions) ? survey.questions : [{ question: "", type: "text", options: [], required: false }],
      is_active: survey.is_active,
      expires_at: survey.expires_at ? survey.expires_at.split('T')[0] : "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu anketi silmek istediğinizden emin misiniz?")) return;

    try {
      const { error } = await supabase
        .from("surveys")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Anket silindi");
      fetchSurveys();
    } catch (error: any) {
      toast.error("Silme işlemi başarısız: " + error.message);
    }
  };

  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [...formData.questions, { question: "", type: "text", options: [], required: false }]
    });
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const newQuestions = [...formData.questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    
    // Reset options when type changes
    if (field === 'type' && value !== 'multiple_choice') {
      newQuestions[index].options = [];
    } else if (field === 'type' && value === 'multiple_choice' && !newQuestions[index].options?.length) {
      newQuestions[index].options = [''];
    }
    
    setFormData({ ...formData, questions: newQuestions });
  };

  const addOption = (questionIndex: number) => {
    const newQuestions = [...formData.questions];
    newQuestions[questionIndex].options = [...(newQuestions[questionIndex].options || []), ''];
    setFormData({ ...formData, questions: newQuestions });
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const newQuestions = [...formData.questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setFormData({ ...formData, questions: newQuestions });
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const newQuestions = [...formData.questions];
    newQuestions[questionIndex].options = newQuestions[questionIndex].options.filter((_, i) => i !== optionIndex);
    setFormData({ ...formData, questions: newQuestions });
  };

  const removeQuestion = (index: number) => {
    const newQuestions = formData.questions.filter((_, i) => i !== index);
    setFormData({ ...formData, questions: newQuestions });
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      questions: [{ question: "", type: "text", options: [], required: false }],
      is_active: true,
      expires_at: "",
    });
    setEditingId(null);
  };

  if (loading) {
    return <div className="text-center py-4">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Anketler ({surveys.length})</h3>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Yeni Anket
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Anket Düzenle" : "Yeni Anket Ekle"}
              </DialogTitle>
              <DialogDescription>
                Anket bilgilerini ve sorularını girin
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Anket Başlığı</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Açıklama</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="expires_at">Son Tarih</Label>
                <Input
                  id="expires_at"
                  type="date"
                  value={formData.expires_at}
                  onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                />
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Sorular</Label>
                  <Button type="button" onClick={addQuestion} size="sm">
                    Soru Ekle
                  </Button>
                </div>
                
                {formData.questions.map((question, index) => (
                  <div key={index} className="border p-4 rounded space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Soru {index + 1}</span>
                      {formData.questions.length > 1 && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeQuestion(index)}
                        >
                          Sil
                        </Button>
                      )}
                    </div>
                    
                    <div>
                      <Label>Soru Metni</Label>
                      <Input
                        placeholder="Soruyu yazın"
                        value={question.question}
                        onChange={(e) => updateQuestion(index, "question", e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <Label>Cevap Türü</Label>
                      <Select
                        value={question.type}
                        onValueChange={(value) => updateQuestion(index, "type", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Cevap türünü seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Açık Uçlu</SelectItem>
                          <SelectItem value="rating">1-5 Puan</SelectItem>
                          <SelectItem value="multiple_choice">Çoktan Seçmeli</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {question.type === 'multiple_choice' && (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label>Seçenekler</Label>
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => addOption(index)}
                          >
                            Seçenek Ekle
                          </Button>
                        </div>
                        {(question.options || []).map((option, optionIndex) => (
                          <div key={optionIndex} className="flex gap-2">
                            <Input
                              placeholder={`Seçenek ${optionIndex + 1}`}
                              value={option}
                              onChange={(e) => updateOption(index, optionIndex, e.target.value)}
                              required
                            />
                            {question.options && question.options.length > 1 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeOption(index, optionIndex)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`required-${index}`}
                        checked={question.required}
                        onCheckedChange={(checked) => updateQuestion(index, "required", checked)}
                      />
                      <Label htmlFor={`required-${index}`}>Zorunlu Soru</Label>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Aktif</Label>
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
              <TableHead>Başlık</TableHead>
              <TableHead>Açıklama</TableHead>
              <TableHead>Soru Sayısı</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead>Son Tarih</TableHead>
              <TableHead>İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {surveys.map((survey) => (
              <TableRow key={survey.id}>
                <TableCell className="font-medium">{survey.title}</TableCell>
                <TableCell className="max-w-xs truncate">{survey.description}</TableCell>
                <TableCell>{Array.isArray(survey.questions) ? survey.questions.length : 0}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    survey.is_active 
                      ? "bg-green-100 text-green-800" 
                      : "bg-gray-100 text-gray-800"
                  }`}>
                    {survey.is_active ? "Aktif" : "Pasif"}
                  </span>
                </TableCell>
                <TableCell>
                  {survey.expires_at 
                    ? new Date(survey.expires_at).toLocaleDateString("tr-TR")
                    : "Belirsiz"
                  }
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewingResponses(survey)}
                      title="Cevapları Görüntüle"
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(survey)}
                      title="Düzenle"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(survey.id)}
                      title="Sil"
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

      {viewingResponses && (
        <SurveyResponsesViewer
          survey={viewingResponses}
          isOpen={!!viewingResponses}
          onClose={() => setViewingResponses(null)}
        />
      )}
    </div>
  );
};