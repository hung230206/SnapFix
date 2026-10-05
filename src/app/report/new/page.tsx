import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Camera, Upload, ArrowLeft } from "lucide-react";

export default function NewReportPage() {
  return (
    <div className="container mx-auto p-4 max-w-md">
      <div className="flex items-center mb-6">
        <Link href="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-semibold ml-2">Tạo phản ánh</h1>
      </div>

      <div className="grid gap-4">
        <Link href="/report/capture" className="block">
          <Card className="hover:bg-muted/50 transition-colors h-full">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Camera className="w-5 h-5 mr-2 text-primary" />
                Chụp ảnh trực tiếp
              </CardTitle>
              <CardDescription>
                Sử dụng camera để chụp hiện trạng. Vị trí sẽ được lấy tự động để tăng độ tin cậy.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/report/upload" className="block">
          <Card className="hover:bg-muted/50 transition-colors h-full">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="w-5 h-5 mr-2 text-primary" />
                Tải ảnh có sẵn
              </CardTitle>
              <CardDescription>
                Tải ảnh từ thư viện. Vị trí có thể được trích xuất từ dữ liệu ảnh (nếu có).
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}
