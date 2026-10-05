import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BarChart3, Settings, ClipboardList } from "lucide-react";

export default function ManagerDashboard() {
  return (
    <div className="flex flex-col min-h-screen bg-muted/20">
      <header className="border-b bg-background sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Quản lý Đơn vị</h1>
          <nav className="flex items-center gap-4 text-sm">
            <span className="text-primary font-medium">Dashboard</span>
            <Link href="/" className="hover:text-primary">Trang chủ</Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Tổng quan sở/ngành</h2>
          <p className="text-muted-foreground">Theo dõi hiệu suất và phân công công việc.</p>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center"><ClipboardList className="w-4 h-4 mr-2"/> Cần phân công</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold text-orange-500">12</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center"><Users className="w-4 h-4 mr-2"/> Cán bộ đang xử lý</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold">4</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center"><BarChart3 className="w-4 h-4 mr-2"/> Hoàn thành tuần</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold text-green-500">86</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center"><Settings className="w-4 h-4 mr-2"/> Tỷ lệ SLA</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold">92%</div></CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Công việc chậm trễ</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Các sự cố vượt quá thời gian xử lý cam kết.</p>
              <div className="space-y-3">
                <div className="p-3 border rounded flex justify-between items-center">
                  <div>
                    <div className="font-medium">SF-00101: Ổ gà Nguyễn Văn Cừ</div>
                    <div className="text-xs text-red-500 mt-1">Trễ 2 ngày</div>
                  </div>
                  <Button size="sm" variant="outline">Hối thúc</Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Hiệu suất cán bộ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center p-2 hover:bg-muted rounded">
                  <span>Trần Thị B</span>
                  <span className="font-medium text-green-600">Đã xong 12</span>
                </div>
                <div className="flex justify-between items-center p-2 hover:bg-muted rounded">
                  <span>Nguyễn Văn C</span>
                  <span className="font-medium text-orange-600">Đang xử lý 8</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
