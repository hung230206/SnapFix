"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getDraftObservation, saveDraftObservation } from "@/lib/offline/idb";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Loader2, Info } from "lucide-react";
import dynamic from "next/dynamic";
import { calculateLocationConsistency } from "@/domain/location/consistency";

const MapPicker = dynamic(() => import("@/components/map/ManualLocationPicker"), { ssr: false, loading: () => <div className="h-[50vh] flex items-center justify-center border bg-muted rounded-md"><Loader2 className="animate-spin text-primary" /></div> });

function LocationContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const router = useRouter();

  const [draft, setDraft] = useState<any>(null);
  const [selectedLocation, setSelectedLocation] = useState<{lat: number, lng: number} | null>(null);
  const [consistency, setConsistency] = useState<{status: string, distanceMeters?: number} | null>(null);

  useEffect(() => {
    if (id) {
      getDraftObservation(id).then(data => {
        if (data) {
          setDraft(data);
          const initialLat = data.reportedLat || data.exifLat || data.captureDeviceLat;
          const initialLng = data.reportedLng || data.exifLng || data.captureDeviceLng;
          if (initialLat && initialLng) {
            setSelectedLocation({ lat: initialLat, lng: initialLng });
          }
        }
      });
    }
  }, [id]);

  useEffect(() => {
    if (draft && selectedLocation) {
      const result = calculateLocationConsistency(
        draft.exifGpsAvailable ? draft.exifLat : draft.captureDeviceLat,
        draft.exifGpsAvailable ? draft.exifLng : draft.captureDeviceLng,
        draft.captureDeviceAccuracyMeters,
        selectedLocation.lat,
        selectedLocation.lng
      );
      setConsistency(result);
    }
  }, [draft, selectedLocation]);

  if (!draft) return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto w-8 h-8" /></div>;

  const handleNext = async () => {
    if (!selectedLocation) return;
    const updatedDraft = { 
      ...draft, 
      reportedLat: selectedLocation.lat, 
      reportedLng: selectedLocation.lng,
      locationSource: "MANUAL_PIN" 
    };
    await saveDraftObservation(updatedDraft);
    router.push(`/report/duplicate?id=${id}`);
  };

  return (
    <div className="container mx-auto p-4 max-w-md pb-24">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="ml-2">
          <h1 className="text-xl font-semibold">Vị trí sự cố</h1>
          <p className="text-xs text-muted-foreground">Bước 3/4</p>
        </div>
      </div>

      <p className="text-muted-foreground mb-4 text-sm">Chạm vào bản đồ để điều chỉnh vị trí sự cố.</p>

      <MapPicker 
        initialLat={selectedLocation?.lat} 
        initialLng={selectedLocation?.lng} 
        onSelect={(lat, lng) => setSelectedLocation({lat, lng})} 
      />

      {consistency && (
        <div className="mt-4">
          {consistency.status === "STRONG_MATCH" && (
            <div className="p-3 bg-green-50 text-green-700 text-sm rounded-md flex items-start">
              <Info className="w-5 h-5 mr-2 shrink-0" />
              <span>Vị trí khớp với ảnh gốc (cách {Math.round(consistency.distanceMeters || 0)}m).</span>
            </div>
          )}
          {consistency.status === "ACCEPTABLE_MATCH" && (
            <div className="p-3 bg-blue-50 text-blue-700 text-sm rounded-md flex items-start">
              <Info className="w-5 h-5 mr-2 shrink-0" />
              <span>Vị trí tương đối khớp với ảnh gốc (cách {Math.round(consistency.distanceMeters || 0)}m).</span>
            </div>
          )}
          {consistency.status === "MISMATCH" && (
            <div className="p-3 bg-yellow-50 text-yellow-700 text-sm rounded-md flex items-start">
              <Info className="w-5 h-5 mr-2 shrink-0" />
              <span>Vị trí bạn chọn cách xa điểm chụp ảnh gốc ({Math.round(consistency.distanceMeters || 0)}m). Bằng chứng sẽ bị giảm độ tin cậy.</span>
            </div>
          )}
          {consistency.status === "INSUFFICIENT_EVIDENCE" && (
            <div className="p-3 bg-muted text-muted-foreground text-sm rounded-md flex items-start">
              <Info className="w-5 h-5 mr-2 shrink-0" />
              <span>Ảnh không có dữ liệu GPS. Sẽ sử dụng điểm bạn chọn trên bản đồ.</span>
            </div>
          )}
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t">
        <div className="container max-w-md mx-auto">
          <Button 
            className="w-full" 
            size="lg" 
            disabled={!selectedLocation}
            onClick={handleNext}
          >
            Tiếp tục
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function LocationPage() {
  return <Suspense fallback={<div>Loading...</div>}><LocationContent /></Suspense>;
}
