"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { MapPin, AlertTriangle, RefreshCcw } from "lucide-react";

export type LocationSample = {
  lat: number;
  lng: number;
  accuracyMeters: number;
  capturedAt: number;
};

interface CameraCaptureProps {
  onCapture: (blob: Blob, location?: LocationSample) => void;
  onCancel: () => void;
}

export function CameraCapture({ onCapture, onCancel }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [locations, setLocations] = useState<LocationSample[]>([]);
  const [geoError, setGeoError] = useState<string>("");

  useEffect(() => {
    let localStream: MediaStream | null = null;
    // Start camera
    navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" } }
    }).then(s => {
      localStream = s;
      setStream(s);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
      }
    }).catch(e => {
      console.error("Camera error:", e);
    });

    // Watch position
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setLocations(prev => [
          ...prev, 
          {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracyMeters: pos.coords.accuracy,
            capturedAt: pos.timestamp
          }
        ].slice(-10)); // Keep last 10
      },
      (err) => {
        setGeoError("Không lấy được vị trí");
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
    );

    return () => {
      if (localStream) {
        localStream.getTracks().forEach(t => t.stop());
      }
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(video, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const bestLocation = [...locations].sort((a, b) => a.accuracyMeters - b.accuracyMeters)[0];
          onCapture(blob, bestLocation);
        }
      }, "image/jpeg", 0.8);
    }
  };

  const latestLocation = locations[locations.length - 1];

  return (
    <div className="relative h-[100dvh] flex flex-col bg-black text-white w-full">
      <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-zinc-900">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Geo status overlay */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          <div className="bg-black/50 p-2 rounded-lg backdrop-blur-sm text-sm flex items-center">
            {latestLocation ? (
              <>
                <MapPin className="w-4 h-4 text-green-400 mr-2" />
                Vị trí tốt ±{Math.round(latestLocation.accuracyMeters)}m
              </>
            ) : geoError ? (
              <>
                <AlertTriangle className="w-4 h-4 text-yellow-400 mr-2" />
                {geoError}
              </>
            ) : (
              <>
                <RefreshCcw className="w-4 h-4 animate-spin mr-2" />
                Đang tìm vị trí...
              </>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 pb-10 bg-black flex justify-between items-center z-10">
        <Button variant="ghost" onClick={onCancel} className="text-white hover:bg-white/20">
          Hủy
        </Button>
        <button 
          onClick={handleCapture}
          className="w-16 h-16 rounded-full bg-white border-4 border-gray-300 flex items-center justify-center active:bg-gray-200 transition-colors"
        >
          <div className="w-14 h-14 rounded-full border-2 border-black"></div>
        </button>
        <div className="w-16"></div> {/* Spacer */}
      </div>
    </div>
  );
}
