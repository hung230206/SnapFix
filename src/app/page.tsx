import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Camera, Activity, AlertTriangle, ArrowRight } from "lucide-react";
import { demoIncidents } from "@/lib/repositories/mockData";

export default function HomePage() {
  const totalIncidents = demoIncidents.length + 126; // Fake some volume for demo
  const inProgress = demoIncidents.filter(i => i.status === "IN_PROGRESS").length + 36;
  const resolved = demoIncidents.filter(i => i.status === "RESOLVED" || i.status === "CLOSED").length + 76;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <header className="border-b bg-background sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold">SnapFix CT</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/" className="text-primary">Trang chủ</Link>
            <Link href="/map" className="hover:text-primary transition-colors">Bản đồ sự cố</Link>
            <Link href="/dashboard" className="hover:text-primary transition-colors">Cá nhân</Link>
            <Link href="/officer" className="hover:text-primary transition-colors">Dành cho Cán bộ</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/report/new">
              <Button size="sm" className="hidden sm:inline-flex">Phản ánh sự cố</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="bg-muted/30 py-20">
          <div className="container mx-auto px-4 text-center max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
              Thấy sự cố.<br className="md:hidden" /> Chụp ảnh.<br className="md:hidden" /> Theo dõi đến khi xử lý.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              SnapFix CT giúp người dân gửi phản ánh có ảnh, vị trí và thông tin đầy đủ, đồng thời giúp đơn vị xử lý quản lý sự cố trên một hệ thống thống nhất.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/report/new" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-8">
                  <Camera className="w-5 h-5 mr-2" />
                  Phản ánh sự cố
                </Button>
              </Link>
              <Link href="/map" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg h-14 px-8">
                  <MapPin className="w-5 h-5 mr-2" />
                  Xem bản đồ
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* 3 Steps */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto text-xl font-bold">1</div>
                <h3 className="text-xl font-semibold">Gửi bằng chứng</h3>
                <p className="text-muted-foreground">Ảnh thực tế + vị trí chính xác + thông tin mô tả chi tiết.</p>
              </div>
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto text-xl font-bold">2</div>
                <h3 className="text-xl font-semibold">SnapFix chuẩn hóa</h3>
                <p className="text-muted-foreground">Kiểm tra tính nhất quán vị trí, tìm sự cố trùng lặp, tạo Incident gom nhóm.</p>
              </div>
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto text-xl font-bold">3</div>
                <h3 className="text-xl font-semibold">Theo dõi xử lý</h3>
                <p className="text-muted-foreground">Cán bộ tiếp nhận, cập nhật tiến độ và người dân theo dõi trạng thái minh bạch.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="bg-primary text-primary-foreground py-16">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm opacity-80 mb-6 font-medium">DỮ LIỆU MINH HỌA TRONG PROTOTYPE</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div>
                <div className="text-4xl font-bold mb-2">{totalIncidents}</div>
                <div className="text-sm opacity-90">Sự cố ghi nhận</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">{inProgress}</div>
                <div className="text-sm opacity-90">Đang xử lý</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">{resolved}</div>
                <div className="text-sm opacity-90">Đã hoàn thành</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">15</div>
                <div className="text-sm opacity-90">Cần xác minh</div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <AlertTriangle className="w-10 h-10 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Hệ thống bằng chứng đáng tin cậy</h2>
            <p className="text-muted-foreground">
              Ảnh và vị trí được ghi nhận như bằng chứng (Evidence). Nếu thiết bị thiếu GPS, bạn vẫn có thể chọn vị trí trên bản đồ. SnapFix tự động đối chiếu khoảng cách và hiển thị rõ mức độ tin cậy thay vì loại bỏ phản ánh một cách máy móc.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-zinc-900 text-zinc-400 py-8 text-center text-sm">
        <p>SnapFix CT - Prototype Hệ thống quản lý sự cố đô thị thông minh</p>
      </footer>
      
      {/* Mobile Sticky CTA */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-background border-t shadow-lg z-50">
        <Link href="/report/new">
          <Button size="lg" className="w-full text-base">
            <Camera className="w-5 h-5 mr-2" /> Phản ánh sự cố ngay
          </Button>
        </Link>
      </div>
    </div>
  );
}
