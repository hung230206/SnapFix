"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BarChart3,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  Files,
  Layers3,
  MapPin,
} from "lucide-react";

import type { IncidentStatusTone } from "@/domain/incident/status";
import type {
  OfficerCategoryStatistic,
  OfficerStatistics,
} from "@/services/officer-statistics-service";

const TONE_CLASSES: Record<IncidentStatusTone, string> = {
  neutral: "bg-slate-50 text-slate-700 ring-slate-600/20",
  info: "bg-blue-50 text-blue-700 ring-blue-600/20",
  warning: "bg-amber-50 text-amber-700 ring-amber-600/20",
  success: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  danger: "bg-red-50 text-red-700 ring-red-600/20",
  muted: "bg-gray-50 text-gray-600 ring-gray-600/20",
};

function CategoryButton({
  statistic,
  selected,
  onSelect,
}: {
  statistic: OfficerCategoryStatistic;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`min-h-24 min-w-0 rounded-[16px] border p-4 text-left transition-colors ${
        selected
          ? "border-[#087F46] bg-[#E8F7EF]"
          : "border-[#E5E7EB] bg-white hover:border-[#087F46]/40"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="break-words text-sm font-semibold text-[#374151]">
            {statistic.category}
          </p>
          <p className="mt-2 text-2xl font-bold text-[#111827]">
            {statistic.incidentCount}
            <span className="ml-1 text-xs font-medium text-[#6B7280]">
              sự cố
            </span>
          </p>
          <p className="mt-1 text-xs text-[#6B7280]">
            {statistic.independentReportCount} lượt phản ánh · {statistic.percentage}%
          </p>
        </div>
        <ChevronRight className="size-4 shrink-0 text-[#087F46]" />
      </div>
    </button>
  );
}

export function OfficerStatisticsView({
  statistics,
}: {
  statistics: OfficerStatistics;
}) {
  const [selectedCode, setSelectedCode] = useState(
    statistics.categories[0]?.code ?? "",
  );
  const selected =
    statistics.categories.find((category) => category.code === selectedCode) ??
    statistics.categories[0] ??
    null;

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6">
      <header>
        <div className="flex items-center gap-2 text-sm font-medium text-[#087F46]">
          <BarChart3 className="size-4" /> Thống kê phản ánh
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#111827] md:text-3xl">
          Thống kê sự cố và lượt phản ánh
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#6B7280]">
          Số liệu lấy từ cùng repository với Dashboard, Danh sách, Bản đồ và
          luồng xử lý của cán bộ.
        </p>
      </header>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          {
            label: "Tổng sự cố",
            value: statistics.totalIncidents,
            icon: ClipboardList,
          },
          {
            label: "Lượt phản ánh",
            value: statistics.totalIndependentReports,
            icon: Files,
          },
          {
            label: "Loại có dữ liệu",
            value: statistics.categoryCount,
            icon: Layers3,
          },
          {
            label: "Sự cố thuộc loại chọn",
            value: selected?.incidentCount ?? 0,
            icon: BarChart3,
          },
        ].map(({ label, value, icon: CardIcon }) => {
          return (
            <article
              key={label}
              className="rounded-[16px] border border-[#E5E7EB] bg-white p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-[#6B7280]">{label}</p>
                <CardIcon className="size-5 text-[#087F46]" />
              </div>
              <p className="mt-4 text-3xl font-bold text-[#111827]">{value}</p>
            </article>
          );
        })}
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <article className="min-w-0 rounded-[16px] border border-[#E5E7EB] bg-white p-5 lg:col-span-2">
          <h2 className="font-bold text-[#111827]">Số sự cố theo loại</h2>
          <div className="mt-5 h-[310px] min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={statistics.categories} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="category"
                  width={130}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip />
                <Bar dataKey="incidentCount" name="Sự cố" radius={[0, 6, 6, 0]}>
                  {statistics.categories.map((category) => (
                    <Cell key={category.code} fill={category.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rounded-[16px] border border-[#E5E7EB] bg-white p-5">
          <h2 className="font-bold text-[#111827]">Theo trạng thái</h2>
          <div className="mt-4 space-y-3">
            {statistics.statuses.map((status) => (
              <div
                key={status.code}
                className="rounded-[12px] border border-[#E5E7EB] p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${TONE_CLASSES[status.tone]}`}
                  >
                    {status.label}
                  </span>
                  <strong>{status.incidentCount} sự cố</strong>
                </div>
                <p className="mt-2 text-xs text-[#6B7280]">
                  {status.independentReportCount} lượt phản ánh
                </p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {statistics.categories.map((category) => (
          <CategoryButton
            key={category.code}
            statistic={category}
            selected={category.code === selected?.code}
            onSelect={() => setSelectedCode(category.code)}
          />
        ))}
      </section>

      {selected ? (
        <section className="rounded-[16px] border border-[#E5E7EB] bg-white p-5">
          <div className="border-b border-[#E5E7EB] pb-4">
            <h2 className="text-lg font-bold text-[#111827]">
              {selected.category}
            </h2>
            <p className="mt-1 text-sm text-[#6B7280]">
              {selected.incidentCount} sự cố · {selected.independentReportCount} lượt phản ánh
            </p>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            {selected.incidents.map((incident) => (
              <Link
                key={incident.id}
                href={`/officer/incidents/${incident.id}`}
                className="min-w-0 rounded-[14px] border border-[#E5E7EB] bg-[#F9FAFB] p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="font-bold text-[#111827]">{incident.publicCode}</p>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${TONE_CLASSES[incident.status.tone]}`}
                  >
                    {incident.status.label}
                  </span>
                </div>
                <p className="mt-3 line-clamp-2 text-sm text-[#374151]">
                  {incident.description ?? incident.title}
                </p>
                <div className="mt-4 space-y-2 text-xs text-[#6B7280]">
                  <p className="flex items-start gap-2">
                    <MapPin className="mt-0.5 size-3.5 shrink-0" />
                    <span className="break-words">{incident.location}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <CalendarDays className="size-3.5" />
                    {new Date(incident.submittedAt).toLocaleString("vi-VN")}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
