import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function SuccessPage() {
  return (
    <div className="container mx-auto p-4 max-w-md h-[100dvh] flex flex-col justify-center items-center text-center">
      <CheckCircle2 className="w-20 h-20 text-green-500 mb-6" />
      <h1 className="text-2xl font-bold mb-2">Gửi phản ánh thành công</h1>
      <p className="text-muted-foreground mb-8">
        Cảm ơn bạn đã báo cáo sự cố. Cơ quan chức năng sẽ tiếp nhận và xử lý trong thời gian sớm nhất.
      </p>

      <div className="flex flex-col gap-3 w-full">
        <Link href="/" className="w-full">
          <Button className="w-full">Về trang chủ</Button>
        </Link>
        <Link href="/report/new" className="w-full">
          <Button variant="outline" className="w-full">Gửi phản ánh mới</Button>
        </Link>
      </div>
    </div>
  );
}
