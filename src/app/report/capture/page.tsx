"use client";

import { useRouter } from "next/navigation";
import { CameraCapture, LocationSample } from "@/components/camera/CameraCapture";
import { saveDraftObservation } from "@/lib/offline/idb";

export default function CapturePage() {
  const router = useRouter();

  const handleCapture = async (blob: Blob, location?: LocationSample) => {
    const localId = "draft_" + Math.random().toString(36).substring(7);
    
    await saveDraftObservation({
      localId,
      imageBlob: blob,
      source: "LIVE_CAMERA",
      capturedAt: location?.capturedAt ? new Date(location.capturedAt).toISOString() : new Date().toISOString(),
      captureDeviceLat: location?.lat,
      captureDeviceLng: location?.lng,
      captureDeviceAccuracyMeters: location?.accuracyMeters,
      syncStatus: "DRAFT"
    });

    router.push(`/report/review?id=${localId}`);
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="h-[100dvh] w-full bg-black">
      <CameraCapture onCapture={handleCapture} onCancel={handleCancel} />
    </div>
  );
}
