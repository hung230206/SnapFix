import { ClipboardList } from "lucide-react";

import { OfficerReportList } from "@/components/officer/reports/OfficerReportList";
import { officerReportListService } from "@/services/officer-report-list-service";

export default async function OfficerReportsPage() {
  const reportList = await officerReportListService.getReportList();

  return (
    <div className="mx-auto flex max-w-[1600px] flex-col gap-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#087F46]">
            Quản lý phản ánh
          </p>
          <h1 className="text-[22px] font-bold text-[#111827] md:text-2xl">
            Danh sách phản ánh
          </h1>
          <p className="mt-1 max-w-3xl text-[13px] leading-5 text-[#6B7280] md:text-sm">
            Tra cứu, lọc và mở thông tin chi tiết các phản ánh đang được đơn vị mô phỏng tiếp nhận.
          </p>
        </div>

        <div className="flex min-h-11 items-center gap-2 self-start rounded-[12px] border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm font-medium text-[#374151] shadow-[0_2px_4px_rgba(0,0,0,0.02)] md:self-auto">
          <ClipboardList className="size-4 text-[#087F46]" aria-hidden="true" />
          <span>{reportList.reports.length} phản ánh</span>
        </div>
      </section>

      <OfficerReportList
        reports={reportList.reports}
        statusOptions={reportList.statusOptions}
        priorityOptions={reportList.priorityOptions}
      />
    </div>
  );
}
