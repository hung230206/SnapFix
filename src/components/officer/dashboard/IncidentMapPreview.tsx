import { MapPin } from "lucide-react";

import type { IncidentStatusTone } from "@/domain/incident/status";
import type { OfficerMapPoint } from "@/services/officer-dashboard-service";

const MARKER_CLASSES: Record<IncidentStatusTone, string> = {
  neutral: "bg-slate-500",
  info: "bg-blue-500",
  warning: "bg-amber-500",
  success: "bg-emerald-500",
  danger: "bg-red-500",
  muted: "bg-gray-400",
};

function normalize(value: number, minimum: number, maximum: number): number {
  if (minimum === maximum) return 50;
  return 16 + ((value - minimum) / (maximum - minimum)) * 68;
}

export function IncidentMapPreview({ points }: { points: OfficerMapPoint[] }) {
  const latitudes = points.map((point) => point.lat);
  const longitudes = points.map((point) => point.lng);
  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLng = Math.min(...longitudes);
  const maxLng = Math.max(...longitudes);

  return (
    <article>
      <div className="mb-4">
        <h2 className="text-[17px] font-bold text-[#111827]">Preview bản đồ</h2>
        <p className="mt-1 text-xs text-[#9CA3AF]">
          Vị trí các sự cố có tọa độ
        </p>
      </div>
      <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-2 shadow-[0_2px_10px_rgba(15,23,42,0.02)]">
        <div className="relative h-[310px] overflow-hidden rounded-[12px] bg-[#E8F0EA]">
          <div
            className="absolute inset-0 opacity-70"
            style={{
              backgroundImage:
                "linear-gradient(#CBD5E1 1px, transparent 1px), linear-gradient(90deg, #CBD5E1 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
          {points.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-[#64748B]">
              <MapPin className="mb-2 size-8" aria-hidden="true" />
              <span className="text-sm font-medium">Chưa có tọa độ</span>
            </div>
          ) : (
            points.map((point) => (
              <span
                key={point.id}
                className={`absolute z-10 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white shadow-md ${MARKER_CLASSES[point.statusTone]}`}
                style={{
                  left: `${normalize(point.lng, minLng, maxLng)}%`,
                  top: `${100 - normalize(point.lat, minLat, maxLat)}%`,
                }}
                title={`${point.publicCode} · ${point.issueType} · ${point.statusLabel}`}
              />
            ))
          )}
        </div>
      </div>
    </article>
  );
}
