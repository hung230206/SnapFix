import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";

import type { IncidentStatusTone } from "@/domain/incident/status";
import type { OfficerIncidentSummary } from "@/services/officer-dashboard-service";

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
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${TONE_CLASSES[tone]}`}>
      {label}
    </span>
  );
}

export function RecentIncidents({ incidents }: { incidents: OfficerIncidentSummary[] }) {
  return (
    <article className="min-w-0">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-[17px] font-bold text-[#111827]">Phản ánh gần đây</h2>
          <p className="mt-1 text-xs text-[#9CA3AF]">Sắp xếp theo lần cập nhật mới nhất</p>
        </div>
        <span className="flex shrink-0 items-center gap-1 text-[13px] font-semibold text-[#087F46]">
          Danh sách đầy đủ <ArrowRight className="size-3.5" aria-hidden="true" />
        </span>
      </div>

      {incidents.length === 0 ? (
        <div className="rounded-[16px] border border-dashed border-[#D1D5DB] bg-white p-10 text-center text-sm text-[#6B7280]">
          Chưa có phản ánh để hiển thị.
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-[16px] border border-[#E5E7EB] bg-white shadow-[0_2px_10px_rgba(15,23,42,0.02)] md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[780px] text-left text-sm">
                <thead className="border-b border-[#E5E7EB] bg-[#F9FAFB] text-xs text-[#6B7280]">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Mã phản ánh</th>
                    <th className="px-5 py-4 font-semibold">Sự cố và vị trí</th>
                    <th className="px-5 py-4 font-semibold">Thời gian</th>
                    <th className="px-5 py-4 font-semibold">Trạng thái</th>
                    <th className="px-5 py-4 font-semibold">Ưu tiên</th>
                    <th className="px-5 py-4 text-right font-semibold">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {incidents.map((incident) => (
                    <tr key={incident.id} className="transition-colors hover:bg-[#F9FAFB]">
                      <td className="px-5 py-4 font-semibold text-[#111827]">{incident.publicCode}</td>
                      <td className="max-w-[280px] px-5 py-4">
                        <p className="font-semibold text-[#111827]">{incident.issueType}</p>
                        <p className="mt-1 flex items-center gap-1 truncate text-xs text-[#6B7280]">
                          <MapPin className="size-3 shrink-0" aria-hidden="true" />
                          {incident.location}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-xs text-[#6B7280]">
                        {DATE_FORMATTER.format(new Date(incident.submittedAt))}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge label={incident.status.label} tone={incident.status.tone} />
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge label={incident.priority.label} tone={incident.priority.tone} />
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/officer/incidents/${incident.id}`}
                          className="inline-flex min-h-9 items-center rounded-lg px-3 text-sm font-semibold text-[#087F46] transition-colors hover:bg-[#E8F7EF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F46]"
                        >
                          Xem
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col gap-3 md:hidden">
            {incidents.map((incident) => (
              <Link
                key={incident.id}
                href={`/officer/incidents/${incident.id}`}
                className="rounded-[16px] border border-[#E5E7EB] bg-white p-4 shadow-[0_2px_10px_rgba(15,23,42,0.02)] transition-transform active:scale-[0.99]"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-[#111827]">{incident.issueType}</p>
                    <p className="mt-0.5 text-xs font-medium text-[#6B7280]">{incident.publicCode}</p>
                  </div>
                  <StatusBadge label={incident.status.label} tone={incident.status.tone} />
                </div>
                <p className="flex items-start gap-1.5 text-xs leading-5 text-[#6B7280]">
                  <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                  <span>{incident.location}</span>
                </p>
                <div className="mt-3 flex items-center justify-between gap-3 border-t border-[#F3F4F6] pt-3 text-xs">
                  <span className="text-[#9CA3AF]">{DATE_FORMATTER.format(new Date(incident.submittedAt))}</span>
                  <StatusBadge label={incident.priority.label} tone={incident.priority.tone} />
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </article>
  );
}
