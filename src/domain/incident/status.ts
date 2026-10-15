import type { IncidentStatus, Severity } from "@/domain/models";

export type IncidentStatusTone =
  | "neutral"
  | "info"
  | "warning"
  | "success"
  | "danger"
  | "muted";

export type IncidentStatusPresentation = {
  label: string;
  tone: IncidentStatusTone;
};

const INCIDENT_STATUS_PRESENTATION = {
  NEW: { label: "Chờ duyệt", tone: "warning" },
  VERIFIED: { label: "Đã tiếp nhận", tone: "info" },
  ASSIGNED: { label: "Đã phân công", tone: "info" },
  IN_PROGRESS: { label: "Đang xử lý", tone: "warning" },
  RESOLVED: { label: "Chờ xác nhận", tone: "info" },
  CLOSED: { label: "Đã hoàn thành", tone: "success" },
  CANCELLED: { label: "Từ chối", tone: "danger" },
  COMMUNITY_VERIFIED: { label: "Đã được xác nhận", tone: "success" },
  DUPLICATE: { label: "Phản ánh trùng", tone: "muted" },
  UNROUTED: { label: "Chưa định tuyến", tone: "danger" },
} as const satisfies Record<IncidentStatus, IncidentStatusPresentation>;

const PRIORITY_PRESENTATION = {
  HIGH: { label: "Cao", tone: "danger" },
  MEDIUM: { label: "Trung bình", tone: "warning" },
  LOW: { label: "Thấp", tone: "success" },
} as const satisfies Record<Severity, { label: string; tone: IncidentStatusTone }>;

export function getIncidentStatusPresentation(
  status: IncidentStatus,
): IncidentStatusPresentation {
  return INCIDENT_STATUS_PRESENTATION[status];
}

export function getIncidentStatusLabel(status: IncidentStatus): string {
  return getIncidentStatusPresentation(status).label;
}

export function getPriorityPresentation(priority: Severity) {
  return PRIORITY_PRESENTATION[priority];
}
