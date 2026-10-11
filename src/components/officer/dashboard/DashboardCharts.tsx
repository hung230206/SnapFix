"use client";

import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type {
  DailyReportPoint,
  IssueTypeDistributionItem,
} from "@/services/officer-dashboard-service";

export function DashboardCharts({
  dailyReports,
  issueTypeDistribution,
  totalIncidents,
  totalIndependentReports,
}: {
  dailyReports: DailyReportPoint[];
  issueTypeDistribution: IssueTypeDistributionItem[];
  totalIncidents: number;
  totalIndependentReports: number;
}) {
  return (
    <section
      aria-label="Biểu đồ tổng quan"
      className="grid grid-cols-1 gap-6 lg:grid-cols-3"
    >
      <article className="rounded-[16px] border border-[#E5E7EB] bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,0.02)] lg:col-span-2">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[15px] font-bold text-[#111827]">
              Lượt phản ánh trong 7 ngày
            </h2>
            <p className="mt-1 text-xs text-[#9CA3AF]">
              Tổng independentReportCount theo ngày tạo sự cố
            </p>
          </div>
          <span className="rounded-full bg-[#E8F7EF] px-3 py-1 text-xs font-semibold text-[#087F46]">
            {totalIndependentReports} lượt
          </span>
        </div>
        <div className="h-[260px] min-w-0 md:h-[300px]">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <LineChart
              data={dailyReports}
              margin={{ top: 8, right: 10, left: -24, bottom: 0 }}
            >
              <CartesianGrid
                stroke="#E5E7EB"
                strokeDasharray="3 3"
                vertical={false}
              />
              <XAxis dataKey="label" axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
              <Tooltip formatter={(value) => [`${value} lượt`, "Phản ánh"]} />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#087F46"
                strokeWidth={3}
                dot={{ r: 4, fill: "#087F46", stroke: "#FFFFFF" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className="flex flex-col rounded-[16px] border border-[#E5E7EB] bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,0.02)]">
        <h2 className="text-[15px] font-bold text-[#111827]">
          Theo loại sự cố
        </h2>
        <p className="mt-1 text-xs text-[#9CA3AF]">
          Tỷ trọng trên số Incident riêng biệt
        </p>
        <div className="relative h-[210px] min-w-0">
          {issueTypeDistribution.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <PieChart>
                  <Pie
                    data={issueTypeDistribution}
                    dataKey="total"
                    nameKey="label"
                    innerRadius={58}
                    outerRadius={82}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {issueTypeDistribution.map((item) => (
                      <Cell key={item.code} fill={item.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value} sự cố`, "Số lượng"]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-[#111827]">
                  {totalIncidents}
                </span>
                <span className="text-[11px] text-[#6B7280]">sự cố</span>
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-[#9CA3AF]">
              Chưa có dữ liệu
            </div>
          )}
        </div>
        <ul className="mt-auto space-y-2.5">
          {issueTypeDistribution.map((item) => (
            <li
              key={item.code}
              className="flex items-center justify-between gap-3 text-[13px]"
            >
              <span className="flex min-w-0 items-center gap-2 text-[#4B5563]">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="truncate">{item.label}</span>
              </span>
              <span className="shrink-0 font-semibold text-[#111827]">
                {item.total} sự cố · {item.reportCount} lượt
              </span>
            </li>
          ))}
        </ul>
      </article>
    </section>
  );
}
