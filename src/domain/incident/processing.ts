import type { IncidentStatus } from "@/domain/models";

export function getIncidentProcessingTargetStatus(
  currentStatus: IncidentStatus,
): Extract<IncidentStatus, "IN_PROGRESS"> | null {
  return currentStatus === "ASSIGNED" ? "IN_PROGRESS" : null;
}
