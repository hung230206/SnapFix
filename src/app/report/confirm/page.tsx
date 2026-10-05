"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getDraftObservation, saveDraftObservation } from "@/lib/offline/idb";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Loader2, MapPin, AlertTriangle, ShieldCheck } from "lucide-react";
import { demoIssueTypes } from "@/lib/repositories/mockData";
import { calculateEvidenceConfidence } from "@/domain/confidence";
import { calculateLocationConsistency } from "@/domain/location/consistency";

function ConfirmContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const router = useRouter();

  const [draft, setDraft] = useState<any>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [evidenceResult, setEvidenceResult] = useState<any>(null);

  useEffect(() => {
    if (id) {
      getDraftObservation(id).then(data => {
        if (data) {
          setDraft(data);
          setImageUrl(URL.createObjectURL(data.imageBlob));
          
          const consistency = calculateLocationConsistency(
            data.exifGpsAvailable ? data.exifLat : data.captureDeviceLat,
            data.exifGpsAvailable ? data.exifLng : data.captureDeviceLng,
            data.captureDeviceAccuracyMeters,
            data.reportedLat,
            data.reportedLng
          );
          
          const confidence = calculateEvidenceConfidence({
            imageSource: data.source,
            imageCapturedAt: data.capturedAt,
            captureDeviceAccuracyMeters: data.captureDeviceAccuracyMeters,
            exifGpsAvailable: data.exifGpsAvailable,
            locationConsistencyStatus: consistency.status
          });
          
          setEvidenceResult({ consistency, confidence });
        }
      });
    }
  }, [id]);

  if (!draft || !evidenceResult) return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto w-8 h-8" /></div>;

  const issueName = demoIssueTypes.find(i => i.code === draft.issueTypeCode)?.nameVi || draft.issueTypeCode;

  const handleSubmit = async () => {
    setLoading(true);
    // Usually submit to API here. For now we save as PENDING_SYNC
    const updatedDraft = { ...draft, syncStatus: "PENDING_SYNC" };
    await saveDraftObservation(updatedDraft);
    
    // Simulate API delay
    setTimeout(() => {
      router.push("/report/success");
    }, 1000);
  };

  return (
    <div className="container mx-auto p-4 max-w-md pb-24">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="ml-2">
          <h1 className="text-xl font-semibold">Xác nhận phản ánh</h1>
          <p className="text-xs text-muted-foreground">Bước 4/4</p>
        </div>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardContent className="p-4">
            <h2 className="font-semibold text-lg mb-1">{draft.title}</h2>
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-muted px-2 py-1 rounded text-xs font-medium">{issueName}</span>
            </div>
            
            <div className="flex gap-4">
              <img src={imageUrl} className="w-24 h-24 object-cover rounded-md" />
              <div className="flex-1 text-sm text-muted-foreground">
                <p className="line-clamp-3">{draft.description}</p>
                <div className="mt-2 flex items-center gap-1 text-xs">
                  <MapPin className="w-3 h-3" />
                  {draft.reportedLat?.toFixed(4)}, {draft.reportedLng?.toFixed(4)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className={`w-5 h-5 ${evidenceResult.confidence.level === 'HIGH' ? 'text-green-500' : evidenceResult.confidence.level === 'MEDIUM' ? 'text-yellow-500' : 'text-red-500'}`} />
              <h3 className="font-semibold text-sm">Độ tin cậy bằng chứng: {
                evidenceResult.confidence.level === 'HIGH' ? 'Cao' :
                evidenceResult.confidence.level === 'MEDIUM' ? 'Trung bình' : 'Cần kiểm tra'
              }</h3>
            </div>
            <ul className="text-xs space-y-1 text-muted-foreground ml-7">
              {evidenceResult.confidence.reasons.map((r: string, i: number) => (
                <li key={i} className="text-green-600">✓ {r}</li>
              ))}
              {evidenceResult.confidence.warnings.map((w: string, i: number) => (
                <li key={i} className="text-yellow-600">⚠ {w}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
        
        {/* Contact info placeholder */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-sm mb-2">Thông tin liên hệ</h3>
            <p className="text-xs text-muted-foreground">Họ tên: Nguyễn Văn A (Ẩn danh với cộng đồng)</p>
            <p className="text-xs text-muted-foreground">SĐT: 0901234567</p>
          </CardContent>
        </Card>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t">
        <div className="container max-w-md mx-auto">
          <Button 
            className="w-full" 
            size="lg" 
            disabled={loading}
            onClick={handleSubmit}
          >
            {loading ? <Loader2 className="animate-spin mr-2" /> : null}
            Gửi phản ánh
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ConfirmContent />
    </Suspense>
  );
}
