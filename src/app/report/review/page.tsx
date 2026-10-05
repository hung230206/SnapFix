"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getDraftObservation, saveDraftObservation } from "@/lib/offline/idb";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { demoIssueTypes, demoQuestions, demoQuestionOptions } from "@/lib/repositories/mockData";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { aiAssistant } from "@/lib/ai/adapter";

function ReviewContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const router = useRouter();

  const [draft, setDraft] = useState<any>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [issueType, setIssueType] = useState<string>("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (id) {
      getDraftObservation(id).then(data => {
        if (data) {
          setDraft(data);
          setImageUrl(URL.createObjectURL(data.imageBlob));
          if (data.issueTypeCode) setIssueType(data.issueTypeCode);
          if (data.title) setTitle(data.title);
          if (data.description) setDescription(data.description);
          if (data.answers) setAnswers(data.answers);
        }
      });
    }
  }, [id]);

  if (!draft) {
    return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto w-8 h-8" /></div>;
  }

  const handleAiSuggestTitle = async () => {
    setAiLoading(true);
    try {
      const suggested = await aiAssistant.suggestReportTitle({ issueTypeCode: issueType });
      setTitle(suggested);
    } finally {
      setAiLoading(false);
    }
  };

  const handleAiSuggestDescription = async () => {
    setAiLoading(true);
    try {
      const suggested = await aiAssistant.draftDescription({ issueTypeCode: issueType, answers });
      setDescription(suggested);
    } finally {
      setAiLoading(false);
    }
  };

  const activeQuestions = demoQuestions.filter(q => q.issueTypeCode === issueType);

  const handleNext = async () => {
    if (!issueType || !title || !description) return;
    
    // Save locally
    const updatedDraft = { 
      ...draft, 
      issueTypeCode: issueType, 
      title, 
      description,
      answers 
    };
    await saveDraftObservation(updatedDraft);

    router.push(`/report/location?id=${id}`);
  };

  return (
    <div className="container mx-auto p-4 max-w-md pb-24">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="ml-2">
          <h1 className="text-xl font-semibold">Thông tin sự cố</h1>
          <p className="text-xs text-muted-foreground">Bước 2/4</p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card className="overflow-hidden">
          {imageUrl && <img src={imageUrl} alt="Draft" className="w-full h-48 object-cover" />}
        </Card>

        <div className="space-y-3">
          <Label>Loại sự cố <span className="text-red-500">*</span></Label>
          <Select value={issueType} onValueChange={(val) => setIssueType(val || "")}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn loại sự cố" />
            </SelectTrigger>
            <SelectContent>
              {demoIssueTypes.map(it => (
                <SelectItem key={it.code} value={it.code}>{it.nameVi}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Tiêu đề phản ánh <span className="text-red-500">*</span></Label>
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-blue-600" onClick={handleAiSuggestTitle} disabled={aiLoading || !issueType}>
              <Sparkles className="w-3 h-3 mr-1" /> AI viết
            </Button>
          </div>
          <Input 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            placeholder="Ví dụ: Ổ gà lớn giữa làn đường"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Mô tả chi tiết <span className="text-red-500">*</span></Label>
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-blue-600" onClick={handleAiSuggestDescription} disabled={aiLoading || !issueType}>
              <Sparkles className="w-3 h-3 mr-1" /> AI soạn
            </Button>
          </div>
          <Textarea 
            value={description} 
            onChange={e => setDescription(e.target.value)} 
            placeholder="Mô tả cụ thể tình trạng..."
            rows={4}
          />
        </div>

        {activeQuestions.length > 0 && (
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="font-semibold text-sm mb-2">Thông tin bổ sung</h3>
              {activeQuestions.map(q => {
                const options = demoQuestionOptions.filter(o => o.questionId === q.id);
                return (
                  <div key={q.id} className="space-y-2">
                    <Label className="text-sm">{q.labelVi} {q.required && <span className="text-red-500">*</span>}</Label>
                    {q.inputType === "SINGLE_SELECT" ? (
                      <Select 
                        value={answers[q.id] || ""} 
                        onValueChange={val => setAnswers(prev => ({...prev, [q.id]: val || ""}))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn..." />
                        </SelectTrigger>
                        <SelectContent>
                          {options.map(o => (
                            <SelectItem key={o.id} value={o.value}>{o.labelVi}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : q.inputType === "NUMBER" ? (
                      <Input 
                        type="number" 
                        value={answers[q.id] || ""} 
                        onChange={e => setAnswers(prev => ({...prev, [q.id]: e.target.value}))} 
                      />
                    ) : (
                      <Input 
                        value={answers[q.id] || ""} 
                        onChange={e => setAnswers(prev => ({...prev, [q.id]: e.target.value}))} 
                      />
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t">
        <div className="container max-w-md mx-auto">
          <Button 
            className="w-full" 
            size="lg" 
            disabled={!issueType || !title || !description}
            onClick={handleNext}
          >
            Tiếp tục
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ReviewPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ReviewContent />
    </Suspense>
  );
}
