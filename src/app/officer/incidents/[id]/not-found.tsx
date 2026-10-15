import Link from "next/link";
import { ArrowLeft, FileQuestion } from "lucide-react";

export default function OfficerIncidentNotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl items-center justify-center px-4 py-10">
      <section className="w-full rounded-[20px] border border-dashed border-[#D1D5DB] bg-white px-6 py-12 text-center shadow-[0_2px_10px_rgba(15,23,42,0.02)]">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#F3F4F6] text-[#6B7280]">
          <FileQuestion className="size-7" aria-hidden="true" />
        </span>
        <h1 className="mt-5 text-xl font-bold text-[#111827]">Không tìm thấy phản ánh</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#6B7280]">
          Mã phản ánh không tồn tại hoặc dữ liệu mô phỏng hiện không còn khả dụng.
        </p>
        <Link
          href="/officer/reports"
          className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] bg-[#087F46] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#056638] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F46] focus-visible:ring-offset-2"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Quay lại danh sách
        </Link>
      </section>
    </div>
  );
}
