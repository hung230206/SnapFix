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
        <p className="mt-1 text-xs text-[#9CA3AF]">Vị trí các phản ánh có tọa độ</p>
      </div>

      <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-2 shadow-[0_2px_10px_rgba(15,23,42,0.02)]">
        <div
          className="relative h-[310px] overflow-hidden rounded-[12px] bg-[#E8F0EA]"
          aria-label={`Bản đồ mô phỏng có ${points.length} vị trí phản ánh`}
          role="img"
        >
          <div
            className="absolute inset-0 opacity-70"
            style={{
              backgroundImage:
                "linear-gradient(#CBD5E1 1px, transparent 1px), linear-gradient(90deg, #CBD5E1 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
          <div className="absolute left-4 top-4 z-10 rounded-[10px] border border-white/80 bg-white/90 px-3 py-2 text-xs font-semibold text-[#374151] shadow-sm backdrop-blur-sm">
            Khu vực mô phỏng
          </div>

          {points.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-[#64748B]">
              <MapPin className="mb-2 size-8" aria-hidden="true" />
              <span className="text-sm font-medium">Chưa có tọa độ để hiển thị</span>
            </div>
          ) : (
            points.map((point) => {
              const left = normalize(point.lng, minLng, maxLng);
              const top = 100 - normalize(point.lat, minLat, maxLat);

              return (
                <span
                  key={point.id}
                  className={`group absolute z-10 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white shadow-md ${MARKER_CLASSES[point.statusTone]}`}
                  style={{ left: `${left}%`, top: `${top}%` }}
                  title={`${point.publicCode} · ${point.issueType} · ${point.statusLabel}`}
                >
                  <span className="sr-only">
                    {point.publicCode}, {point.issueType}, {point.statusLabel}
                  </span>
                </span>
              );
            })
          )}

          <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-wrap gap-2 rounded-[10px] bg-white/90 p-2 text-[10px] text-[#4B5563] shadow-sm backdrop-blur-sm">
            <span className="flex items-center gap-1"><i className="size-2 rounded-full bg-amber-500" /> Chờ duyệt/đang xử lý</span>
            <span className="flex items-center gap-1"><i className="size-2 rounded-full bg-blue-500" /> Đã tiếp nhận/chờ xác nhận</span>
            <span className="flex items-center gap-1"><i className="size-2 rounded-full bg-emerald-500" /> Hoàn thành</span>
            <span className="flex items-center gap-1"><i className="size-2 rounded-full bg-red-500" /> Cần chú ý</span>
          </div>
        </div>
      </div>
    </article>
  );
}
