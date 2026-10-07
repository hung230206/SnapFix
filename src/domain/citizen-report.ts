export type ReportStatus = "Đã chuẩn bị" | "Đã mở kênh tiếp nhận" | "Đang xử lý" | "Đã xử lý";

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
  receivingChannel?: {
    name: string;
    reportUrl: string;
  };
  status: ReportStatus;
  statusSource: "system" | "user";
  createdAt: string;
  updatedAt: string;
  channelOpenedAt?: string;
}
