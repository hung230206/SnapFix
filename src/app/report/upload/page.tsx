"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Image as ImageIcon, Loader2 } from "lucide-react";
import exifr from "exifr";
import { saveDraftObservation } from "@/lib/offline/idb";
import Link from "next/link";

export default function UploadPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      let exifLat, exifLng, capturedAt, exifGpsAvailable = false;
      try {
        const exif = await exifr.parse(file);
        if (exif?.latitude && exif?.longitude) {
          exifLat = exif.latitude;
          exifLng = exif.longitude;
          exifGpsAvailable = true;
        }
        if (exif?.DateTimeOriginal) {
          capturedAt = new Date(exif.DateTimeOriginal).toISOString();
        }
      } catch (err) {
        console.error("EXIF parsing failed", err);
      }

      const localId = "draft_" + Math.random().toString(36).substring(7);
      await saveDraftObservation({
        localId,
        imageBlob: file,
        source: "FILE_UPLOAD",
        capturedAt: capturedAt || new Date().toISOString(),
        exifLat,
        exifLng,
        exifGpsAvailable,
        syncStatus: "DRAFT"
      });

      router.push(`/report/review?id=${localId}`);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <div className="flex items-center mb-6">
        <Link href="/report/new">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="ml-2">
          <h1 className="text-xl font-semibold">Tải ảnh lên</h1>
          <p className="text-xs text-muted-foreground">Bước 1/4</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6 flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => document.getElementById('file-upload')?.click()}
        >
          {loading ? (
            <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
          ) : (
            <ImageIcon className="w-10 h-10 text-muted-foreground mb-4" />
          )}
          <p className="text-center font-medium mb-1">
            {loading ? "Đang xử lý ảnh..." : "Nhấn để chọn ảnh từ thư viện"}
          </p>
          <p className="text-center text-sm text-muted-foreground">
            Hỗ trợ JPG, PNG, HEIC
          </p>
          <Input 
            id="file-upload"
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={handleFile}
            disabled={loading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
