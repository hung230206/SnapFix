"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

import type { OfficerMapIncident } from "@/services/officer-map-service";

const IncidentMapViewer = dynamic(
  () => import("@/components/officer/map/OfficerIncidentMapViewer"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[480px] items-center justify-center bg-[#F3F4F6] text-[#087F46]">
        <Loader2 className="size-7 animate-spin" aria-label="Đang tải bản đồ" />
      </div>
    ),
  },
);

export function OfficerMapPanel({ incidents }: { incidents: OfficerMapIncident[] }) {
  return (
    <div className="h-[70vh] min-h-[480px] w-full overflow-hidden rounded-[16px] border border-[#E5E7EB] bg-white shadow-[0_2px_10px_rgba(15,23,42,0.02)]">
      <IncidentMapViewer incidents={incidents} />
    </div>
  );
}
