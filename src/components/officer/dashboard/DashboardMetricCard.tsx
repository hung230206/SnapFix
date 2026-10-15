import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  FileCheck2,
  FileText,
} from "lucide-react";

import type { DashboardMetric, DashboardMetricKey } from "@/services/officer-dashboard-service";

const METRIC_STYLES: Record<DashboardMetricKey, { icon: typeof FileText; iconClass: string; iconBackground: string }> = {
  total: { icon: FileText, iconClass: "text-blue-600", iconBackground: "bg-blue-100" },
  pending: { icon: AlertTriangle, iconClass: "text-red-600", iconBackground: "bg-red-100" },
  processing: { icon: Clock3, iconClass: "text-amber-600", iconBackground: "bg-amber-100" },
  awaitingConfirmation: { icon: FileCheck2, iconClass: "text-violet-600", iconBackground: "bg-violet-100" },
  completed: { icon: CheckCircle2, iconClass: "text-emerald-600", iconBackground: "bg-emerald-100" },
};

export function DashboardMetricCard({ metric }: { metric: DashboardMetric }) {
  const style = METRIC_STYLES[metric.key];
  const Icon = style.icon;

  return (
    <article className="flex min-h-36 flex-col justify-between rounded-[16px] border border-[#E5E7EB] bg-white p-4 shadow-[0_2px_10px_rgba(15,23,42,0.02)] md:p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] font-semibold leading-5 text-[#6B7280] md:text-sm">
          {metric.label}
        </p>
        <span className={`flex size-9 shrink-0 items-center justify-center rounded-full ${style.iconBackground}`}>
          <Icon className={`size-[18px] ${style.iconClass}`} aria-hidden="true" />
        </span>
      </div>
      <div>
        <p className="text-3xl font-bold tracking-tight text-[#111827]">{metric.value}</p>
        <p className="mt-1 text-[11px] leading-4 text-[#9CA3AF] md:text-xs">
          {metric.description}
        </p>
      </div>
    </article>
  );
}
