"use client";

import dynamic from "next/dynamic";

const IncidentLocationMapCanvas = dynamic(
  () => import("@/components/officer/incidents/IncidentLocationMapCanvas"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[260px] items-center justify-center rounded-[12px] bg-[#F3F4F6] text-sm text-[#6B7280]">
        Đang tải bản đồ...
      </div>
    ),
  },
);

export function IncidentLocationMap({
  lat,
  lng,
  label,
}: {
  lat: number;
  lng: number;
  label: string;
}) {
  return <IncidentLocationMapCanvas lat={lat} lng={lng} label={label} />;
}
