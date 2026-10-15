import { MapPinned } from "lucide-react";

import { OfficerMapPanel } from "@/components/officer/map/OfficerMapPanel";
import { officerMapService } from "@/services/officer-map-service";

export const dynamic = "force-dynamic";

export default async function OfficerMapPage() {
  const incidents = await officerMapService.getMapIncidents();

  return (
    <div className="mx-auto flex max-w-[1600px] flex-col gap-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#087F46]">
            <MapPinned className="size-4" aria-hidden="true" />
            Bản đồ phản ánh
          </p>
          <h1 className="text-[22px] font-bold text-[#111827] md:text-2xl">
            Vị trí các sự cố
          </h1>
          <p className="mt-1 max-w-3xl text-[13px] leading-5 text-[#6B7280] md:text-sm">
            Dữ liệu bản đồ OpenStreetMap phục vụ giao diện mô phỏng. Chọn marker
            để xem mã, loại, trạng thái và mức ưu tiên của phản ánh.
          </p>
        </div>
        <div className="self-start rounded-[12px] border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm font-semibold text-[#374151] md:self-auto">
          {incidents.length} sự cố có tọa độ
        </div>
      </header>

      <OfficerMapPanel incidents={incidents} />
    </div>
  );
}
