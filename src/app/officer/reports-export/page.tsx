import { BarChart3, ClipboardList, FileDown, UsersRound } from "lucide-react";

import {
  OfficerReportExportButton,
  type OfficerExportRow,
} from "@/components/officer/reports/OfficerReportExportButton";
import { getOfficerReportSummary } from "@/services/officer-directory-service";

export const dynamic = "force-dynamic";

export default async function OfficerReportsExportPage() {
  const summary = await getOfficerReportSummary();
  const categoryRows = summary.categorySummaries.filter(
    (category) => category.incidentCount > 0,
  );
  const maxCategoryCount = Math.max(
    1,
    ...categoryRows.map((category) => category.incidentCount),
  );
  const maxStatusCount = Math.max(
    1,
    ...summary.statusSummaries.map((status) => status.count),
  );
  const exportRows: OfficerExportRow[] = [
    {
      group: "Tổng quan",
      label: "Tổng sự cố",
      count: summary.totalIncidents,
    },
    {
      group: "Tổng quan",
      label: "Tổng lượt phản ánh độc lập",
      count: summary.totalIndependentReports,
    },
    ...categoryRows.map((category) => ({
      group: "Loại sự cố",
      label: category.name,
      count: category.incidentCount,
    })),
    ...summary.statusSummaries.map((status) => ({
      group: "Trạng thái",
      label: status.label,
      count: status.count,
    })),
  ];

  return (
    <div className="mx-auto flex max-w-[1600px] flex-col gap-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#087F46]">
            <FileDown className="size-4" aria-hidden="true" />
            Báo cáo tổng hợp
          </p>
          <h1 className="text-[22px] font-bold text-[#111827] md:text-2xl">
            Báo cáo phản ánh
          </h1>
          <p className="mt-1 max-w-3xl text-[13px] leading-5 text-[#6B7280] md:text-sm">
            Số liệu được tổng hợp từ incidents trong repository demo hiện tại.
            File CSV chỉ được tạo cục bộ trong trình duyệt.
          </p>
        </div>
        <OfficerReportExportButton rows={exportRows} />
      </header>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-[#6B7280]">Tổng sự cố</p>
            <ClipboardList className="size-5 text-blue-600" aria-hidden="true" />
          </div>
          <p className="mt-4 text-3xl font-bold text-[#111827]">
            {summary.totalIncidents}
          </p>
        </div>
        <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-[#6B7280]">
              Lượt phản ánh
            </p>
            <UsersRound className="size-5 text-violet-600" aria-hidden="true" />
          </div>
          <p className="mt-4 text-3xl font-bold text-[#111827]">
            {summary.totalIndependentReports}
          </p>
        </div>
        <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-[#6B7280]">
              Loại có dữ liệu
            </p>
            <BarChart3 className="size-5 text-[#087F46]" aria-hidden="true" />
          </div>
          <p className="mt-4 text-3xl font-bold text-[#111827]">
            {categoryRows.length}
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <article className="rounded-[16px] border border-[#E5E7EB] bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,0.02)]">
          <h2 className="font-bold text-[#111827]">Theo loại sự cố</h2>
          <div className="mt-5 space-y-4">
            {categoryRows.map((category) => (
              <div key={category.id}>
                <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                  <span className="min-w-0 break-words text-[#374151]">
                    {category.name}
                  </span>
                  <strong className="shrink-0 text-[#111827]">
                    {category.incidentCount} sự cố · {category.independentReportCount} lượt
                  </strong>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[#F3F4F6]">
                  <div
                    className="h-full rounded-full bg-[#087F46]"
                    style={{
                      width: `${(category.incidentCount / maxCategoryCount) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[16px] border border-[#E5E7EB] bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,0.02)]">
          <h2 className="font-bold text-[#111827]">Theo trạng thái</h2>
          <div className="mt-5 space-y-4">
            {summary.statusSummaries.map((status) => (
              <div key={status.code}>
                <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                  <span className="text-[#374151]">{status.label}</span>
                  <strong className="text-[#111827]">{status.count}</strong>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[#F3F4F6]">
                  <div
                    className="h-full rounded-full bg-blue-600"
                    style={{
                      width: `${(status.count / maxStatusCount) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
