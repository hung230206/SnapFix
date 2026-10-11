import {
  AlertTriangle,
  CheckCircle2,
  Layers3,
  ShieldAlert,
} from "lucide-react";

import { getOfficerCategorySummaries } from "@/services/officer-directory-service";

const SEVERITY_CLASSES = {
  HIGH: "bg-red-50 text-red-700",
  MEDIUM: "bg-amber-50 text-amber-700",
  LOW: "bg-emerald-50 text-emerald-700",
} as const;

export const dynamic = "force-dynamic";

export default async function OfficerCategoriesPage() {
  const categories = await getOfficerCategorySummaries();
  const categoriesWithReports = categories.filter(
    (category) => category.incidentCount > 0,
  ).length;

  return (
    <div className="mx-auto flex max-w-[1600px] flex-col gap-6">
      <header>
        <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#087F46]">
          <Layers3 className="size-4" aria-hidden="true" />
          Danh mục phản ánh
        </p>
        <h1 className="text-[22px] font-bold text-[#111827] md:text-2xl">
          Loại sự cố
        </h1>
        <p className="mt-1 max-w-3xl text-[13px] leading-5 text-[#6B7280] md:text-sm">
          Danh mục read-only lấy từ cấu hình domain hiện có; số lượng được tính
          trực tiếp từ các sự cố demo.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-5">
          <p className="text-sm font-semibold text-[#6B7280]">Tổng loại sự cố</p>
          <p className="mt-3 text-3xl font-bold text-[#111827]">
            {categories.length}
          </p>
        </div>
        <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-5">
          <p className="text-sm font-semibold text-[#6B7280]">Đang hoạt động</p>
          <p className="mt-3 text-3xl font-bold text-[#111827]">
            {categories.filter((category) => category.active).length}
          </p>
        </div>
        <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-5">
          <p className="text-sm font-semibold text-[#6B7280]">Có sự cố</p>
          <p className="mt-3 text-3xl font-bold text-[#111827]">
            {categoriesWithReports}
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {categories.map((category) => (
          <article
            key={category.id}
            className="min-w-0 rounded-[16px] border border-[#E5E7EB] bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,0.02)]"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold tracking-wide text-[#087F46]">
                  {category.code}
                </p>
                <h2 className="mt-1 break-words text-lg font-bold text-[#111827]">
                  {category.name}
                </h2>
              </div>
              <span className="shrink-0 rounded-full bg-[#E8F7EF] px-3 py-1 text-sm font-bold text-[#087F46]">
                {category.incidentCount} sự cố · {category.independentReportCount} lượt
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                <CheckCircle2 className="size-3.5" aria-hidden="true" />
                {category.active ? "Đang hoạt động" : "Tạm ngưng"}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${SEVERITY_CLASSES[category.defaultSeverity]}`}
              >
                <AlertTriangle className="size-3.5" aria-hidden="true" />
                Mặc định: {category.defaultSeverityLabel}
              </span>
            </div>

            {category.emergencyWarning ? (
              <p className="mt-4 flex items-start gap-2 rounded-[12px] bg-red-50 p-3 text-xs leading-5 text-red-700">
                <ShieldAlert
                  className="mt-0.5 size-4 shrink-0"
                  aria-hidden="true"
                />
                {category.emergencyWarning}
              </p>
            ) : (
              <p className="mt-4 text-xs leading-5 text-[#6B7280]">
                Chưa có cảnh báo khẩn cấp riêng cho loại sự cố này.
              </p>
            )}
          </article>
        ))}
      </section>
    </div>
  );
}
