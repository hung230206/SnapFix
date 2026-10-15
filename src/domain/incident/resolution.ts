import type { IncidentStatus } from "@/domain/models";

export const RESOLUTION_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type ResolutionImageMimeType = (typeof RESOLUTION_IMAGE_MIME_TYPES)[number];

export const MAX_RESOLUTION_SOURCE_IMAGE_BYTES = 8 * 1024 * 1024;
export const MAX_RESOLUTION_STORED_IMAGE_BYTES = 500 * 1024;
export const MAX_RESOLUTION_IMAGE_DIMENSION = 1600;

export type ResolutionImageEvidence = {
  fileName: string;
  mimeType: ResolutionImageMimeType;
  sizeBytes: number;
  width: number;
  height: number;
  dataUrl: string;
};

export type IncidentResolution = {
  id: string;
  incidentId: string;
  resultText: string;
  image: ResolutionImageEvidence;
  submittedAt: string;
};

export function getIncidentResolutionTargetStatus(
  currentStatus: IncidentStatus,
): Extract<IncidentStatus, "RESOLVED"> | null {
  return currentStatus === "IN_PROGRESS" ? "RESOLVED" : null;
}

export function isResolutionImageMimeType(
  value: string,
): value is ResolutionImageMimeType {
  return RESOLUTION_IMAGE_MIME_TYPES.includes(value as ResolutionImageMimeType);
}
