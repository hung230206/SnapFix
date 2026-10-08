import type { IncidentStatus } from "@/domain/models";

export type IncidentReviewDecision = "ACCEPT" | "REJECT";

const REVIEW_TARGET_STATUS: Record<
  IncidentReviewDecision,
  Extract<IncidentStatus, "VERIFIED" | "CANCELLED">
> = {
  ACCEPT: "VERIFIED",
  REJECT: "CANCELLED",
};

export function isIncidentReviewable(status: IncidentStatus): boolean {
  return status === "NEW";
}

export function getIncidentReviewTargetStatus(
  currentStatus: IncidentStatus,
  decision: IncidentReviewDecision,
): Extract<IncidentStatus, "VERIFIED" | "CANCELLED"> | null {
  return isIncidentReviewable(currentStatus) ? REVIEW_TARGET_STATUS[decision] : null;
}
