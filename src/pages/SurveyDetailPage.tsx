import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

interface Question {
  id: string;
  type: "rating" | "text" | "multiple_choice";
  question: string;
  options?: string[];
  required?: boolean;
}

interface Survey {
  id: string;
  title: string;
  description?: string;
  questions: any;
  expires_at?: string;
}

const SurveyDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchSurvey();
    }
  }, [id]);

  const fetchSurvey = async () => {
    try {
      const { data, error } = await supabase
        .from("surveys")
        .select("*")
        .eq("id", id)
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setSurvey({
          ...data,
          questions: Array.isArray(data.questions) ? data.questions : []
        });
        document.title = `${data.title} - Anket`;
      }
    } catch (error) {
      console.error("Error fetching survey:", error);
      toast({
        title: "Hata", 
        description: "Anket yüklenirken bir hata oluştu.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResponseChange = (questionIndex: number, value: string) => {
    setResponses(prev => ({
      ...prev,
      [questionIndex]: value
    }));
  };

  const handleSubmit = async () => {
    if (!survey) return;

    // Check required questions
    const missingResponses = survey.questions
      .map((q, index) => ({ question: q, index }))
      .filter(({ question, index }) => question.required && (!responses[index] || responses[index].trim() === ""));
    
    if (missingResponses.length > 0) {
      toast({
        title: "Eksik Cevaplar",
        description: "Lütfen tüm zorunlu soruları cevaplayın.",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("survey_responses")
        .insert({
          survey_id: survey.id,
          responses: responses
        });

      if (error) throw error;

      toast({
        title: "Başarılı",
        description: "Anket cevaplarınız kaydedildi. Katılımınız için teşekkürler!"
      });
      
      navigate("/surveys");
    } catch (error) {
      console.error("Error submitting survey:", error);
      toast({
        title: "Hata",
        description: "Cevaplar kaydedilirken bir hata oluştu.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const renderQuestion = (question: Question, questionIndex: number) => {
    const value = responses[questionIndex] || "";

    switch (question.type) {
      case "rating":
        return (
          <RadioGroup 
            value={value} 
            onValueChange={(value) => handleResponseChange(questionIndex, value)}
            className="flex space-x-4"
          >
            {[1, 2, 3, 4, 5].map((rating) => (
              <div key={rating} className="flex items-center space-x-2">
                <RadioGroupItem value={rating.toString()} id={`q${questionIndex}-${rating}`} />
                <Label htmlFor={`q${questionIndex}-${rating}`}>{rating}</Label>
              </div>
            ))}
          </RadioGroup>
        );

      case "multiple_choice":
        return (
          <RadioGroup 
            value={value} 
            onValueChange={(value) => handleResponseChange(questionIndex, value)}
            className="space-y-2"
          >
            {question.options?.map((option, optionIndex) => (
              <div key={optionIndex} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`q${questionIndex}-${optionIndex}`} />
                <Label htmlFor={`q${questionIndex}-${optionIndex}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );

      case "text":
        return (
          <Textarea
            value={value}
            onChange={(e) => handleResponseChange(questionIndex, e.target.value)}
            placeholder="Cevabınızı buraya yazın..."
            className="min-h-[100px]"
          />
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Anket yükleniyor...</div>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Anket bulunamadı.</p>
          <Button onClick={() => navigate("/surveys")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Anketlere Dön
          </Button>
        </div>
      </div>
    );
  }

  if (isExpired(survey.expires_at)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Bu anketin süresi dolmuş.</p>
          <Button onClick={() => navigate("/surveys")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Anketlere Dön
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Button 
        variant="ghost" 
        onClick={() => navigate("/surveys")}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Anketlere Dön
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{survey.title}</CardTitle>
          {survey.description && (
            <p className="text-muted-foreground">{survey.description}</p>
          )}
        </CardHeader>
        
        <CardContent className="space-y-6">
          {survey.questions.map((question, index) => (
            <div key={index} className="space-y-3">
              <Label className="text-base font-medium">
                {index + 1}. {question.question}
                {question.required && <span className="text-destructive ml-1">*</span>}
              </Label>
              {renderQuestion(question, index)}
            </div>
          ))}
          
          <div className="pt-6">
            <Button 
              onClick={handleSubmit} 
              disabled={submitting}
              className="w-full"
            >
              {submitting ? "Kaydediliyor..." : "Anketi Gönder"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SurveyDetailPage;