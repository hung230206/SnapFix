"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  FileSearch,
  ImageIcon,
  MapPin,
  RotateCcw,
  Search,
  UsersRound,
} from "lucide-react";

import type { IncidentStatus, Severity } from "@/domain/models";
import type { IncidentStatusTone } from "@/domain/incident/status";
import {
  filterAndSortOfficerReports,
  type OfficerReportListItem,
  type OfficerReportSort,
} from "@/domain/incident/report-list";
import type { OfficerReportFilterOption } from "@/services/officer-report-list-service";

type OfficerReportListProps = {
  reports: OfficerReportListItem[];
  statusOptions: OfficerReportFilterOption<IncidentStatus>[];
  priorityOptions: OfficerReportFilterOption<Severity>[];
};

const TONE_CLASSES: Record<IncidentStatusTone, string> = {
  neutral: "bg-slate-100 text-slate-700",
  info: "bg-blue-100 text-blue-700",
  warning: "bg-amber-100 text-amber-700",
  success: "bg-emerald-100 text-emerald-700",
  danger: "bg-red-100 text-red-700",
  muted: "bg-gray-100 text-gray-600",
};

const DATE_FORMATTER = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function StatusBadge({ label, tone }: { label: string; tone: IncidentStatusTone }) {
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${TONE_CLASSES[tone]}`}
    >
      {label}
    </span>
  );
}

function ReportThumbnail({ report }: { report: OfficerReportListItem }) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <div className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-[12px] bg-[#E8F7EF] text-[#087F46]">
      <ImageIcon className="size-5" aria-hidden="true" />
      {report.thumbnailUrl && !imageFailed ? (
        <Image
          src={report.thumbnailUrl}
          alt={`Ảnh phản ánh ${report.publicCode}`}
          fill
          sizes="64px"
          className="object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : null}
    </div>
  );
}

function ReportMeta({ report }: { report: OfficerReportListItem }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#6B7280]">
      <span>AI tin cậy: {report.confidence.label}</span>
      {report.reportCount > 1 ? (
        <span className="inline-flex items-center gap-1 font-medium text-[#4B5563]">
          <UsersRound className="size-3" aria-hidden="true" />
          {report.reportCount} lượt phản ánh
        </span>
      ) : null}
    </div>
  );
}

export function OfficerReportList({
  reports,
  statusOptions,
  priorityOptions,
}: OfficerReportListProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<IncidentStatus | "ALL">("ALL");
  const [priority, setPriority] = useState<Severity | "ALL">("ALL");
  const [sort, setSort] = useState<OfficerReportSort>("newest");

  const visibleReports = useMemo(
    () => filterAndSortOfficerReports(reports, { query, status, priority, sort }),
    [priority, query, reports, sort, status],
  );

  const hasActiveFilters = query !== "" || status !== "ALL" || priority !== "ALL";

  function resetFilters() {
    setQuery("");
    setStatus("ALL");
    setPriority("ALL");
    setSort("newest");
  }

  return (
    <section aria-label="Danh sách phản ánh" className="min-w-0">
      <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-4 shadow-[0_2px_10px_rgba(15,23,42,0.02)] md:p-5">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(260px,1fr)_180px_170px_190px]">
          <label className="relative block">
            <span className="sr-only">Tìm kiếm phản ánh</span>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#9CA3AF]"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm mã, nội dung, vị trí..."
              className="min-h-11 w-full rounded-[10px] border border-[#D1D5DB] bg-white py-2 pl-10 pr-3 text-sm text-[#111827] outline-none transition focus:border-[#087F46] focus:ring-2 focus:ring-[#087F46]/15"
            />
          </label>

          <label>
            <span className="sr-only">Lọc theo trạng thái</span>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as IncidentStatus | "ALL")}
              className="min-h-11 w-full rounded-[10px] border border-[#D1D5DB] bg-white px-3 text-sm text-[#374151] outline-none transition focus:border-[#087F46] focus:ring-2 focus:ring-[#087F46]/15"
            >
              <option value="ALL">Tất cả trạng thái</option>
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="sr-only">Lọc theo mức độ ưu tiên</span>
            <select
              value={priority}
              onChange={(event) => setPriority(event.target.value as Severity | "ALL")}
              className="min-h-11 w-full rounded-[10px] border border-[#D1D5DB] bg-white px-3 text-sm text-[#374151] outline-none transition focus:border-[#087F46] focus:ring-2 focus:ring-[#087F46]/15"
            >
              <option value="ALL">Tất cả ưu tiên</option>
              {priorityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  Ưu tiên {option.label.toLocaleLowerCase("vi-VN")}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="sr-only">Sắp xếp danh sách</span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as OfficerReportSort)}
              className="min-h-11 w-full rounded-[10px] border border-[#D1D5DB] bg-white px-3 text-sm text-[#374151] outline-none transition focus:border-[#087F46] focus:ring-2 focus:ring-[#087F46]/15"
            >
              <option value="newest">Mới nhất trước</option>
              <option value="priority">Ưu tiên cao trước</option>
            </select>
          </label>
        </div>

        <div className="mt-4 flex min-h-7 flex-wrap items-center justify-between gap-3 border-t border-[#F3F4F6] pt-4">
          <p aria-live="polite" className="text-sm text-[#6B7280]">
            Hiển thị <strong className="text-[#111827]">{visibleReports.length}</strong>/{reports.length} phản ánh
          </p>
          {hasActiveFilters || sort !== "newest" ? (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm font-semibold text-[#087F46] transition-colors hover:bg-[#E8F7EF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F46]"
            >
              <RotateCcw className="size-3.5" aria-hidden="true" />
              Đặt lại bộ lọc
            </button>
          ) : null}
        </div>
      </div>

      {visibleReports.length === 0 ? (
        <div className="mt-4 flex min-h-64 flex-col items-center justify-center rounded-[16px] border border-dashed border-[#D1D5DB] bg-white px-5 py-10 text-center">
          <span className="mb-4 flex size-12 items-center justify-center rounded-full bg-[#F3F4F6] text-[#6B7280]">
            <FileSearch className="size-6" aria-hidden="true" />
          </span>
          <h2 className="text-base font-bold text-[#111827]">Không tìm thấy phản ánh</h2>
          <p className="mt-1 max-w-sm text-sm leading-5 text-[#6B7280]">
            Thử thay đổi từ khóa hoặc bộ lọc để xem các phản ánh khác.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-4 min-h-10 rounded-[10px] bg-[#087F46] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#056638] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F46] focus-visible:ring-offset-2"
          >
            Xóa bộ lọc
          </button>
        </div>
      ) : (
        <>
          <div className="mt-4 hidden overflow-hidden rounded-[16px] border border-[#E5E7EB] bg-white shadow-[0_2px_10px_rgba(15,23,42,0.02)] lg:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-left text-sm">
                <thead className="border-b border-[#E5E7EB] bg-[#F9FAFB] text-xs text-[#6B7280]">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Phản ánh</th>
                    <th className="px-5 py-4 font-semibold">Khu vực / vị trí</th>
                    <th className="px-5 py-4 font-semibold">Thời gian gửi</th>
                    <th className="px-5 py-4 font-semibold">Ưu tiên</th>
                    <th className="px-5 py-4 font-semibold">Trạng thái</th>
                    <th className="px-5 py-4 text-right font-semibold">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {visibleReports.map((report) => (
                    <tr key={report.id} className="transition-colors hover:bg-[#F9FAFB]">
                      <td className="max-w-[330px] px-5 py-4">
                        <div className="flex items-center gap-3">
                          <ReportThumbnail report={report} />
                          <div className="min-w-0">
                            <Link
                              href={`/officer/incidents/${report.id}`}
                              className="font-bold text-[#111827] hover:text-[#087F46] focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F46]"
                            >
                              {report.publicCode}
                            </Link>
                            <p className="mt-0.5 truncate font-medium text-[#374151]">{report.title}</p>
                            <p className="mt-1 text-xs text-[#6B7280]">{report.issueType}</p>
                            <div className="mt-1.5">
                              <ReportMeta report={report} />
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="max-w-[240px] px-5 py-4">
                        <p className="flex items-start gap-1.5 text-xs leading-5 text-[#6B7280]">
                          <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                          <span>{report.location}</span>
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-xs text-[#6B7280]">
                        {DATE_FORMATTER.format(new Date(report.submittedAt))}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge label={report.priority.label} tone={report.priority.tone} />
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge label={report.status.label} tone={report.status.tone} />
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/officer/incidents/${report.id}`}
                          className="inline-flex min-h-9 items-center gap-1 rounded-lg px-3 text-sm font-semibold text-[#087F46] transition-colors hover:bg-[#E8F7EF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F46]"
                        >
                          Xem chi tiết
                          <ArrowRight className="size-3.5" aria-hidden="true" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 lg:hidden">
            {visibleReports.map((report) => (
              <Link
                key={report.id}
                href={`/officer/incidents/${report.id}`}
                className="rounded-[16px] border border-[#E5E7EB] bg-white p-4 shadow-[0_2px_10px_rgba(15,23,42,0.02)] transition-transform active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F46]"
              >
                <div className="flex items-start gap-3">
                  <ReportThumbnail report={report} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[#111827]">{report.publicCode}</p>
                        <p className="mt-0.5 line-clamp-2 text-sm font-semibold text-[#374151]">
                          {report.title}
                        </p>
                      </div>
                      <StatusBadge label={report.status.label} tone={report.status.tone} />
                    </div>
                    <p className="mt-1 text-xs text-[#6B7280]">{report.issueType}</p>
                  </div>
                </div>

                <p className="mt-3 flex items-start gap-1.5 text-xs leading-5 text-[#6B7280]">
                  <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                  <span>{report.location}</span>
                </p>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#F3F4F6] pt-3">
                  <span className="text-[11px] text-[#9CA3AF]">
                    {DATE_FORMATTER.format(new Date(report.submittedAt))}
                  </span>
                  <StatusBadge label={report.priority.label} tone={report.priority.tone} />
                </div>
                <div className="mt-2">
                  <ReportMeta report={report} />
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
