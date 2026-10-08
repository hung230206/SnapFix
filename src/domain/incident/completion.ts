import type { IncidentStatus } from "@/domain/models";

export function getIncidentCompletionTargetStatus(
  currentStatus: IncidentStatus,
): Extract<IncidentStatus, "CLOSED"> | null {
  return currentStatus === "RESOLVED" ? "CLOSED" : null;
}
