export type ReportStatus = "Đã chuẩn bị" | "Chờ duyệt" | "Đã mở kênh tiếp nhận" | "Đang xử lý" | "Đã xử lý";

export interface CitizenReport {
  id: string;
  category: string;
  severity: "low" | "medium" | "high";
  imageBlob: Blob;
  location: {
    type: "gps" | "exif" | "manual";
    lat?: number;
    lng?: number;
    text: string;
  };
  capturedAt: string;
  originalDraft: string;
  editedDraft: string;
  receivingDepartment?: {
    id: string;
    name: string;
  };
  receivingChannel?: {
    name: string;
    reportUrl: string;
  };
  status: ReportStatus;
  statusSource: "system" | "user";
  createdAt: string;
  updatedAt: string;
  channelOpenedAt?: string;
  submission?: {
    incidentId: string;
    submittedAt: string;
    workflowStatus: "NEW";
    confidence: number | null;
    classificationSource: "manual";
    reportCount: number;
    priority: "LOW" | "MEDIUM" | "HIGH";
    priorityReason: string;
  };
}
