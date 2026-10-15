import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Settings, Users, Database, LayoutTemplate, Share2 } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className="flex flex-col min-h-screen bg-muted/20">
      <header className="border-b bg-background sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Quản trị Hệ thống</h1>
          <nav className="flex items-center gap-4 text-sm">
            <span className="text-primary font-medium">Dashboard</span>
            <Link href="/" className="hover:text-primary">Trang chủ</Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Cấu hình SnapFix</h2>
          <p className="text-muted-foreground">Quản lý danh mục, người dùng và luật định tuyến toàn hệ thống.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:border-primary/50 cursor-pointer transition-colors">
            <CardHeader>
              <Users className="w-8 h-8 text-blue-500 mb-2" />
              <CardTitle>Người dùng & Phân quyền</CardTitle>
              <CardDescription>Quản lý tài khoản Admin, Manager, Officer</CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="hover:border-primary/50 cursor-pointer transition-colors">
            <CardHeader>
              <Database className="w-8 h-8 text-green-500 mb-2" />
              <CardTitle>Loại sự cố</CardTitle>
              <CardDescription>Thêm/sửa danh mục loại sự cố (Ổ gà, Ngập nước...)</CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="hover:border-primary/50 cursor-pointer transition-colors">
            <CardHeader>
              <LayoutTemplate className="w-8 h-8 text-purple-500 mb-2" />
              <CardTitle>Biểu mẫu động (Dynamic Forms)</CardTitle>
              <CardDescription>Cấu hình câu hỏi bổ sung cho từng loại sự cố</CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="hover:border-primary/50 cursor-pointer transition-colors">
            <CardHeader>
              <Share2 className="w-8 h-8 text-orange-500 mb-2" />
              <CardTitle>Luật định tuyến (Routing Rules)</CardTitle>
              <CardDescription>Tự động phân luồng sự cố về đúng đơn vị phụ trách</CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="hover:border-primary/50 cursor-pointer transition-colors">
            <CardHeader>
              <Settings className="w-8 h-8 text-gray-500 mb-2" />
              <CardTitle>Tích hợp AI Adapter</CardTitle>
              <CardDescription>Cấu hình mô hình Gemini/OpenAI cho việc tự động hóa</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </main>
    </div>
  );
}
