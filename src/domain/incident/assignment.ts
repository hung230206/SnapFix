import type { IncidentStatus } from "@/domain/models";

const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const OFFICER_TIME_ZONE = "Asia/Ho_Chi_Minh";

export type AssignmentDeadlineValidation = "INVALID" | "PAST" | null;

export function getIncidentAssignmentTargetStatus(
  currentStatus: IncidentStatus,
): Extract<IncidentStatus, "ASSIGNED"> | null {
  return currentStatus === "VERIFIED" ? "ASSIGNED" : null;
}

export function getOfficerLocalDate(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: OFFICER_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return `${values.year}-${values.month}-${values.day}`;
}

export function validateAssignmentDeadline(
  deadline: string | undefined,
  now = new Date(),
): AssignmentDeadlineValidation {
  if (!deadline) return null;

  const match = DATE_ONLY_PATTERN.exec(deadline);
  if (!match) return "INVALID";

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  const isValidDate =
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day;

  if (!isValidDate) return "INVALID";

  return deadline < getOfficerLocalDate(now) ? "PAST" : null;
}
