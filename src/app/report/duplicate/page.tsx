"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getDraftObservation, saveDraftObservation } from "@/lib/offline/idb";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Loader2, MapPin, Search, AlertCircle } from "lucide-react";
import { findDuplicateCandidate } from "@/domain/incident/matching";
import { demoIncidents, demoIssueTypes } from "@/lib/repositories/mockData";
import Link from "next/link";

function DuplicateContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const router = useRouter();

  const [draft, setDraft] = useState<any>(null);
  const [duplicate, setDuplicate] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      getDraftObservation(id).then(data => {
        if (data) {
          setDraft(data);
          
          // Run duplicate check
          if (data.reportedLat && data.reportedLng && data.issueTypeCode) {
            const match = findDuplicateCandidate(
              demoIncidents,
              data.reportedLat, 
              data.reportedLng, 
              data.issueTypeCode
            );
            
            if (match) {
              const incident = demoIncidents.find(i => i.id === match.incidentId);
              setDuplicate({ ...incident, distanceMeters: match.distanceMeters });
            }
          }
          setLoading(false);
        }
      });
    }
  }, [id]);

  if (loading || !draft) {
    return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto w-8 h-8 text-primary" /></div>;
  }

  const handleNext = async (attachIncidentId?: string) => {
    const updatedDraft = { ...draft };
    if (attachIncidentId) {
      updatedDraft.incidentId = attachIncidentId;
    }
    await saveDraftObservation(updatedDraft);
    router.push(`/report/confirm?id=${id}`);
  };

  if (!duplicate) {
    // If no duplicate found, automatically proceed to next step
    // But since this is a React effect, doing it in render is bad.
    // We'll show a quick success message then auto-forward.
    setTimeout(() => {
      handleNext();
    }, 500);

    return (
      <div className="container mx-auto p-8 text-center max-w-md">
        <Search className="w-12 h-12 mx-auto text-primary mb-4" />
        <h2 className="text-lg font-semibold">Đang kiểm tra dữ liệu...</h2>
        <p className="text-sm text-muted-foreground">Đang xác minh sự cố mới.</p>
      </div>
    );
  }

  const issueName = demoIssueTypes.find(i => i.code === duplicate.issueTypeCode)?.nameVi || duplicate.issueTypeCode;

  return (
    <div className="container mx-auto p-4 max-w-md pb-24">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="ml-2">
          <h1 className="text-xl font-semibold">Sự cố có thể đã được báo</h1>
        </div>
      </div>

      <div className="bg-orange-50 text-orange-800 p-4 rounded-lg mb-6 flex items-start">
        <AlertCircle className="w-5 h-5 mr-3 shrink-0 mt-0.5" />
        <div className="text-sm">
          Hệ thống phát hiện một sự cố tương tự đang được xử lý ở rất gần vị trí bạn chọn.
        </div>
      </div>

      <Card className="mb-6 border-orange-200">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-lg">{issueName}</h3>
            <span className="text-xs font-medium bg-secondary px-2 py-1 rounded">{duplicate.status}</span>
          </div>
          <div className="text-sm text-muted-foreground space-y-1">
            <p className="flex items-center"><MapPin className="w-4 h-4 mr-2" /> Cách bạn {Math.round(duplicate.distanceMeters)} mét</p>
            <p>Đã có {duplicate.independentReportCount} người báo cáo</p>
            <p>Mã sự cố: {duplicate.publicCode}</p>
          </div>
          
          <Link href={`/incidents/${duplicate.id}`} target="_blank" className="text-primary text-sm font-medium mt-3 inline-block">
            Xem chi tiết sự cố này ↗
          </Link>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <Button 
          className="w-full" 
          size="lg" 
          onClick={() => handleNext(duplicate.id)}
        >
          Đúng, đây là sự cố tôi muốn báo
        </Button>
        <Button 
          className="w-full" 
          variant="outline"
          size="lg" 
          onClick={() => handleNext()}
        >
          Không, đây là một sự cố khác
        </Button>
      </div>
      
      <p className="text-xs text-center text-muted-foreground mt-6">
        Ảnh và mô tả của bạn vẫn sẽ được ghi nhận để bổ sung bằng chứng cho sự cố.
      </p>
    </div>
  );
}

export default function DuplicatePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center"><Loader2 className="animate-spin mx-auto" /></div>}>
      <DuplicateContent />
    </Suspense>
  );
}
