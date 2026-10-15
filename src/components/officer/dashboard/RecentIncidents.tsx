import { ArrowRight, MapPin } from "lucide-react";
import Link from "next/link";

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

function StatusBadge({ label, tone }: { label: string; tone: IncidentStatusTone }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${TONE_CLASSES[tone]}`}
    >
      {label}
    </span>
  );
}

export function RecentIncidents({
  incidents,
}: {
  incidents: OfficerIncidentSummary[];
}) {
  return (
    <article className="min-w-0">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-[17px] font-bold text-[#111827]">
            Sự cố gần đây
          </h2>
          <p className="mt-1 text-xs text-[#9CA3AF]">
            Sắp xếp theo lần cập nhật mới nhất
          </p>
        </div>
        <Link
          href="/officer/reports"
          className="flex shrink-0 items-center gap-1 text-[13px] font-semibold text-[#087F46]"
        >
          Xem tất cả <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
      </div>
      <div className="flex flex-col gap-3">
        {incidents.map((incident) => (
          <Link
            key={incident.id}
            href={`/officer/incidents/${incident.id}`}
            className="rounded-[16px] border border-[#E5E7EB] bg-white p-4 shadow-[0_2px_10px_rgba(15,23,42,0.02)] transition-colors hover:bg-[#F9FAFB]"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-bold text-[#111827]">
                  {incident.issueType}
                </p>
                <p className="mt-1 text-xs text-[#6B7280]">
                  {incident.publicCode} · {incident.reportCount} lượt phản ánh
                </p>
              </div>
              <StatusBadge
                label={incident.status.label}
                tone={incident.status.tone}
              />
            </div>
            <p className="mt-3 flex min-w-0 items-start gap-1.5 text-xs text-[#6B7280]">
              <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
              <span className="break-words">{incident.location}</span>
            </p>
          </Link>
        ))}
      </div>
    </article>
  );
}
