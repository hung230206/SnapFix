import { CalendarDays } from "lucide-react";

import { DashboardCharts } from "@/components/officer/dashboard/DashboardCharts";
import { DashboardMetricCard } from "@/components/officer/dashboard/DashboardMetricCard";
import { IncidentMapPreview } from "@/components/officer/dashboard/IncidentMapPreview";
import { RecentIncidents } from "@/components/officer/dashboard/RecentIncidents";
import { officerDashboardService } from "@/services/officer-dashboard-service";

export default async function OfficerDashboardPage() {
  const dashboard = await officerDashboardService.getDashboardSnapshot();

  return (
    <div className="mx-auto flex max-w-[1600px] flex-col gap-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#087F46]">
            Không gian làm việc của cán bộ
          </p>
          <h1 className="text-[22px] font-bold text-[#111827] md:text-2xl">
            Tổng quan tiếp nhận
          </h1>
          <p className="mt-1 max-w-3xl text-[13px] leading-5 text-[#6B7280] md:text-sm">
            Theo dõi tình hình phản ánh và tiến độ xử lý trong giao diện mô phỏng
            dành cho đơn vị tiếp nhận.
          </p>
        </div>

        <div className="flex min-h-11 items-center gap-2 self-start rounded-[12px] border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm font-medium text-[#374151] shadow-[0_2px_4px_rgba(0,0,0,0.02)] md:self-auto">
          <CalendarDays className="size-4 text-[#087F46]" aria-hidden="true" />
          <span>7 ngày gần nhất</span>
        </div>
      </section>

      <section aria-label="Chỉ số tổng quan" className="grid grid-cols-2 gap-4 xl:grid-cols-5">
        {dashboard.metrics.map((metric) => (
          <DashboardMetricCard key={metric.key} metric={metric} />
        ))}
      </section>

      <DashboardCharts
        dailyReports={dashboard.dailyReports}
        issueTypeDistribution={dashboard.issueTypeDistribution}
        totalIncidents={dashboard.totalIncidents}
      />

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <RecentIncidents incidents={dashboard.recentIncidents} />
        <IncidentMapPreview points={dashboard.mapPoints} />
      </section>

      <p className="rounded-[12px] border border-[#D1FAE5] bg-[#ECFDF5] px-4 py-3 text-xs leading-5 text-[#166534]">
        Dữ liệu trên dashboard hiện là dữ liệu mô phỏng. AI và hệ thống chỉ hỗ trợ
        tổng hợp thông tin; cán bộ vẫn là người quyết định các bước nghiệp vụ.
      </p>
    </div>
  );
}
