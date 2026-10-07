import { existsSync } from "node:fs";
import path from "node:path";

import type {
  ConfidenceLevel,
  IncidentEvent,
  IncidentEventType,
  LocationSource,
  Observation,
  ObservationEvidence,
  ObservationSource,
} from "@/domain/models";
import type { IncidentStatusTone } from "@/domain/incident/status";
import {
  getIncidentStatusPresentation,
  getPriorityPresentation,
} from "@/domain/incident/status";
import {
  DemoAssetRepository,
  DemoIncidentEventRepository,
  DemoIncidentRepository,
  DemoIssueQuestionOptionRepository,
  DemoIssueQuestionRepository,
  DemoIssueTypeRepository,
  DemoObservationEvidenceRepository,
  DemoObservationRepository,
} from "@/lib/repositories/DemoRepositories";

export type IncidentDetailMetadataItem = {
  label: string;
  value: string;
};

export type IncidentDetailTimelineItem = {
  id: string;
  label: string;
  description?: string;
  occurredAt: string;
  tone: IncidentStatusTone;
};

export type OfficerIncidentDetail = {
  id: string;
  publicCode: string;
  issueType: string;
  title: string;
  description?: string;
  submittedAt: string;
  capturedAt?: string;
  imageUrl?: string;
  status: {
    label: string;
    tone: IncidentStatusTone;
  };
  priority: {
    label: string;
    tone: IncidentStatusTone;
    score: number;
    reasons: string[];
  };
  aiSupport: {
    classification: string;
    confidence: string;
  };
  location: {
    address: string;
    lat?: number;
    lng?: number;
    mapAvailable: boolean;
    mapUnavailableReason?: string;
  };
  observationMetadata: IncidentDetailMetadataItem[];
  supplementalAnswers: IncidentDetailMetadataItem[];
  evidence?: {
    confidence: string;
    reasons: string[];
    warnings: string[];
  };
  reportCount: number;
  relatedReportCount: number;
  timeline: IncidentDetailTimelineItem[];
};

const incidentRepository = new DemoIncidentRepository();
const issueTypeRepository = new DemoIssueTypeRepository();
const observationRepository = new DemoObservationRepository();
const observationEvidenceRepository = new DemoObservationEvidenceRepository();
const assetRepository = new DemoAssetRepository();
const eventRepository = new DemoIncidentEventRepository();
const questionRepository = new DemoIssueQuestionRepository();
const questionOptionRepository = new DemoIssueQuestionOptionRepository();

const CONFIDENCE_LABELS: Record<ConfidenceLevel, string> = {
  HIGH: "Cao",
  MEDIUM: "Trung bình",
  LOW: "Thấp",
};

const OBSERVATION_SOURCE_LABELS: Record<ObservationSource, string> = {
  LIVE_CAMERA: "Chụp trực tiếp",
  FILE_UPLOAD: "Ảnh tải lên",
  OFFLINE_CAPTURE: "Chụp ngoại tuyến",
};

const LOCATION_SOURCE_LABELS: Record<LocationSource, string> = {
  LIVE_DEVICE: "GPS thiết bị",
  EXIF: "GPS từ ảnh",
  MANUAL_PIN: "Ghim thủ công",
  ADDRESS_GEOCODED: "Từ địa chỉ",
};

const EVENT_LABELS: Record<IncidentEventType, string> = {
  CREATED: "Phản ánh được tạo",
  OBSERVATION_ADDED: "Thêm lượt phản ánh liên quan",
  VERIFIED: "Phản ánh được tiếp nhận",
  ASSIGNED: "Phản ánh được phân công",
  STATUS_CHANGED: "Trạng thái được cập nhật",
  NOTE_ADDED: "Thêm ghi chú xử lý",
  PRIORITY_CHANGED: "Mức độ ưu tiên được cập nhật",
  RESOLUTION_UPLOADED: "Đã bổ sung kết quả xử lý",
  COMMUNITY_CONFIRMED: "Kết quả được cộng đồng xác nhận",
  CLOSED: "Phản ánh đã hoàn thành",
};

const CAN_THO_PROTOTYPE_BOUNDS = {
  minLat: 9.85,
  maxLat: 10.35,
  minLng: 105.45,
  maxLng: 106,
};

function resolvePublicAssetUrl(storagePath?: string): string | undefined {
  if (!storagePath?.startsWith("/")) {
    return undefined;
  }

  const publicDirectory = path.resolve(process.cwd(), "public");
  const assetPath = path.resolve(publicDirectory, storagePath.replace(/^\/+/, ""));
  const isInsidePublicDirectory = assetPath.startsWith(`${publicDirectory}${path.sep}`);

  return isInsidePublicDirectory && existsSync(assetPath) ? storagePath : undefined;
}

function isWithinCanThoPrototypeArea(lat: number, lng: number): boolean {
  return (
    lat >= CAN_THO_PROTOTYPE_BOUNDS.minLat &&
    lat <= CAN_THO_PROTOTYPE_BOUNDS.maxLat &&
    lng >= CAN_THO_PROTOTYPE_BOUNDS.minLng &&
    lng <= CAN_THO_PROTOTYPE_BOUNDS.maxLng
  );
}

function safeParseStringArray(value?: string): string[] {
  if (!value) return [];

  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

function safeParseAnswers(value?: string): Record<string, unknown> {
  if (!value) return {};

  try {
    const parsed: unknown = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

function formatAnswerValue(value: unknown): string {
  if (Array.isArray(value)) {
    return value.map((item) => String(item)).join(", ");
  }

  if (typeof value === "boolean") {
    return value ? "Có" : "Không";
  }

  return String(value);
}

function buildObservationMetadata(
  observation?: Observation,
  evidence?: ObservationEvidence | null,
): IncidentDetailMetadataItem[] {
  if (!observation) return [];

  const metadata: IncidentDetailMetadataItem[] = [
    { label: "Nguồn ảnh", value: OBSERVATION_SOURCE_LABELS[observation.source] },
    { label: "Nguồn vị trí", value: LOCATION_SOURCE_LABELS[observation.locationSource] },
  ];

  if (observation.accuracyMeters !== undefined) {
    metadata.push({
      label: "Độ chính xác GPS",
      value: `±${Math.round(observation.accuracyMeters)} m`,
    });
  }

  if (evidence) {
    metadata.push(
      { label: "EXIF", value: evidence.exifAvailable ? "Có" : "Không" },
      { label: "EXIF GPS", value: evidence.exifGpsAvailable ? "Có" : "Không" },
    );
  }

  if (observation.staleEvidence) {
    metadata.push({ label: "Tình trạng bằng chứng", value: "Cần kiểm tra lại" });
  }

  return metadata;
}

function buildTimelineItem(event: IncidentEvent): IncidentDetailTimelineItem {
  const status = event.newStatus
    ? getIncidentStatusPresentation(event.newStatus)
    : undefined;

  return {
    id: event.id,
    label:
      event.type === "STATUS_CHANGED" && status
        ? `Cập nhật trạng thái: ${status.label}`
        : EVENT_LABELS[event.type],
    description: event.note,
    occurredAt: event.createdAt,
    tone: status?.tone ?? (event.type === "CREATED" ? "success" : "neutral"),
  };
}

export class OfficerIncidentDetailService {
  async getIncidentDetail(id: string): Promise<OfficerIncidentDetail | null> {
    const incident = await incidentRepository.findById(id);

    if (!incident) {
      return null;
    }

    const [issueType, observations, events, questions] = await Promise.all([
      issueTypeRepository.findByCode(incident.issueTypeCode),
      observationRepository.findByIncidentId(incident.id),
      eventRepository.findByIncidentId(incident.id),
      questionRepository.findByIssueTypeCode(incident.issueTypeCode),
    ]);

    const primaryObservation = [...observations].sort(
      (first, second) =>
        new Date(first.submittedAt).getTime() - new Date(second.submittedAt).getTime(),
    )[0];
    const primaryEvidence = primaryObservation?.evidenceId
      ? await observationEvidenceRepository.findById(primaryObservation.evidenceId)
      : null;
    const assetId = primaryObservation?.publicImageAssetId ?? primaryObservation?.imageAssetId;
    const asset = assetId ? await assetRepository.findById(assetId) : null;
    const issueTypeLabel = issueType?.nameVi ?? incident.issueTypeCode;
    const status = getIncidentStatusPresentation(incident.status);
    const priority = getPriorityPresentation(incident.priorityLevel);
    const answers = safeParseAnswers(primaryObservation?.answersJson);

    const questionOptions = await Promise.all(
      questions.map(async (question) => ({
        question,
        options: await questionOptionRepository.findByQuestionId(question.id),
      })),
    );
    const supplementalAnswers = Object.entries(answers).map(([questionId, value]) => {
      const questionData = questionOptions.find((item) => item.question.id === questionId);
      const rawValue = formatAnswerValue(value);
      const optionLabel = questionData?.options.find((option) => option.value === rawValue)?.labelVi;

      return {
        label: questionData?.question.labelVi ?? questionId,
        value: optionLabel ?? rawValue,
      };
    });

    const lat = incident.centroidLat;
    const lng = incident.centroidLng;
    const hasCoordinates = lat !== undefined && lng !== undefined;
    const mapAvailable = hasCoordinates && isWithinCanThoPrototypeArea(lat, lng);

    return {
      id: incident.id,
      publicCode: incident.publicCode,
      issueType: issueTypeLabel,
      title: primaryObservation?.title ?? issueTypeLabel,
      description: primaryObservation?.description,
      submittedAt: primaryObservation?.submittedAt ?? incident.createdAt,
      capturedAt: primaryObservation?.capturedAt,
      imageUrl: resolvePublicAssetUrl(asset?.storagePath),
      status,
      priority: {
        ...priority,
        score: incident.priorityScore,
        reasons: incident.priorityReasons,
      },
      aiSupport: {
        classification: issueTypeLabel,
        confidence: CONFIDENCE_LABELS[incident.confidenceLevel],
      },
      location: {
        address: primaryObservation?.locationText ?? "Chưa có địa chỉ/khu vực chi tiết",
        lat,
        lng,
        mapAvailable,
        mapUnavailableReason: !hasCoordinates
          ? "Phản ánh chưa có tọa độ để hiển thị trên bản đồ."
          : !mapAvailable
            ? "Tọa độ dữ liệu mô phỏng chưa đồng bộ với khu vực Cần Thơ nên bản đồ không được hiển thị để tránh gây nhầm lẫn."
            : undefined,
      },
      observationMetadata: buildObservationMetadata(primaryObservation, primaryEvidence),
      supplementalAnswers,
      evidence: primaryEvidence
        ? {
            confidence: CONFIDENCE_LABELS[primaryEvidence.evidenceConfidence],
            reasons: safeParseStringArray(primaryEvidence.evidenceReasonsJson),
            warnings: safeParseStringArray(primaryEvidence.evidenceWarningsJson),
          }
        : undefined,
      reportCount: incident.independentReportCount,
      relatedReportCount: Math.max(0, incident.independentReportCount - 1),
      timeline: [...events]
        .sort(
          (first, second) =>
            new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime(),
        )
        .map(buildTimelineItem),
    };
  }
}

export const officerIncidentDetailService = new OfficerIncidentDetailService();
