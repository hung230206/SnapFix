"use server";

import { revalidatePath } from "next/cache";

import type { IncidentStatus } from "@/domain/models";
import { officerIncidentService } from "@/services/officer-incident-service";

const VALID_STATUSES = new Set<IncidentStatus>([
  "NEW",
  "VERIFIED",
  "ASSIGNED",
  "IN_PROGRESS",
  "RESOLVED",
  "COMMUNITY_VERIFIED",
  "CLOSED",
  "CANCELLED",
  "DUPLICATE",
  "UNROUTED",
]);

export async function updateOfficerIncidentStatusAction(
  incidentId: string,
  newStatus: IncidentStatus,
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!incidentId || !VALID_STATUSES.has(newStatus)) {
    return { ok: false, message: "Trạng thái cập nhật không hợp lệ." };
  }

  try {
    await officerIncidentService.updateStatus(
      incidentId,
      newStatus,
      "u2",
      "Cập nhật từ giao diện cán bộ mô phỏng",
    );
    for (const path of [
      "/officer",
      "/officer/reports",
      "/officer/map",
      "/officer/statistics",
      "/officer/categories",
      "/officer/reports-export",
      `/officer/incidents/${incidentId}`,
    ]) {
      revalidatePath(path);
    }
    return { ok: true };
  } catch {
    return { ok: false, message: "Không thể cập nhật trạng thái lúc này." };
  }
}
