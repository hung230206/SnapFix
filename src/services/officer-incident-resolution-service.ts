import { randomUUID } from "node:crypto";

import {
  getIncidentResolutionTargetStatus,
  isResolutionImageMimeType,
  MAX_RESOLUTION_STORED_IMAGE_BYTES,
  type IncidentResolution,
  type ResolutionImageEvidence,
} from "@/domain/incident/resolution";
import type { IncidentEvent } from "@/domain/models";
import type { IOfficerResolutionRepository } from "@/lib/repositories/OfficerResolutionRepository";
import type {
  IIncidentEventRepository,
  IIncidentRepository,
} from "@/lib/repositories/interfaces";
import {
  officerIncidentEventRepository,
  officerIncidentRepository,
  officerResolutionRepository,
} from "@/lib/repositories/officer-demo-repositories";

export type SubmitIncidentResolutionInput = {
  incidentId: string;
  resultText: string;
  image: ResolutionImageEvidence;
};

export class IncidentResolutionError extends Error {
  constructor(
    message: string,
    readonly code:
      | "NOT_FOUND"
      | "INVALID_TRANSITION"
      | "INVALID_RESULT"
      | "INVALID_IMAGE",
  ) {
    super(message);
    this.name = "IncidentResolutionError";
  }
}

const resolutionQueues = new Map<string, Promise<void>>();

async function withIncidentResolutionLock<TResult>(
  incidentId: string,
  operation: () => Promise<TResult>,
): Promise<TResult> {
  const previous = resolutionQueues.get(incidentId) ?? Promise.resolve();
  let releaseCurrent!: () => void;
  const currentGate = new Promise<void>((resolve) => {
    releaseCurrent = resolve;
  });
  const current = previous.then(() => currentGate);

  resolutionQueues.set(incidentId, current);
  await previous;

  try {
    return await operation();
  } finally {
    releaseCurrent();
    if (resolutionQueues.get(incidentId) === current) {
      resolutionQueues.delete(incidentId);
    }
  }
}

function hasExpectedImageSignature(image: ResolutionImageEvidence): boolean {
  const prefix = `data:${image.mimeType};base64,`;
  if (!image.dataUrl.startsWith(prefix)) return false;

  const encoded = image.dataUrl.slice(prefix.length);
  if (!encoded || !/^[A-Za-z0-9+/]+={0,2}$/.test(encoded)) return false;

  const bytes = Buffer.from(encoded, "base64");
  if (bytes.length !== image.sizeBytes || bytes.length > MAX_RESOLUTION_STORED_IMAGE_BYTES) {
    return false;
  }

  if (image.mimeType === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  if (image.mimeType === "image/png") {
    return bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  }

  return (
    bytes.subarray(0, 4).toString("ascii") === "RIFF" &&
    bytes.subarray(8, 12).toString("ascii") === "WEBP"
  );
}

export class OfficerIncidentResolutionService {
  constructor(
    private readonly incidents: IIncidentRepository,
    private readonly events: IIncidentEventRepository,
    private readonly resolutions: IOfficerResolutionRepository,
  ) {}

  async submitResolution(
    input: SubmitIncidentResolutionInput,
  ): Promise<{ incidentId: string }> {
    return withIncidentResolutionLock(input.incidentId, async () => {
      const incident = await this.incidents.findById(input.incidentId);
      if (!incident) {
        throw new IncidentResolutionError(
          "Không tìm thấy phản ánh cần ghi nhận kết quả.",
          "NOT_FOUND",
        );
      }

      const targetStatus = getIncidentResolutionTargetStatus(incident.status);
      if (!targetStatus) {
        throw new IncidentResolutionError(
          "Chỉ phản ánh đang xử lý mới có thể gửi kết quả.",
          "INVALID_TRANSITION",
        );
      }

      const resultText = input.resultText.trim();
      if (!resultText) {
        throw new IncidentResolutionError(
          "Vui lòng nhập nội dung kết quả xử lý.",
          "INVALID_RESULT",
        );
      }

      if (
        !isResolutionImageMimeType(input.image.mimeType) ||
        input.image.width < 1 ||
        input.image.height < 1 ||
        !hasExpectedImageSignature(input.image)
      ) {
        throw new IncidentResolutionError(
          "Ảnh sau xử lý không hợp lệ.",
          "INVALID_IMAGE",
        );
      }

      const submittedAt = new Date().toISOString();
      const resolution: IncidentResolution = {
        id: `resolution-${randomUUID()}`,
        incidentId: incident.id,
        resultText,
        image: input.image,
        submittedAt,
      };
      const event: IncidentEvent = {
        id: `evt-${randomUUID()}`,
        incidentId: incident.id,
        type: "RESOLUTION_UPLOADED",
        oldStatus: incident.status,
        newStatus: targetStatus,
        note: resultText,
        metadata: {
          resolutionId: resolution.id,
          submittedAt,
          imageFileName: input.image.fileName,
          imageMimeType: input.image.mimeType,
          imageSizeBytes: input.image.sizeBytes,
        },
        createdAt: submittedAt,
      };

      await this.resolutions.save(resolution);
      await this.incidents.save({
        ...incident,
        status: targetStatus,
        resolvedAt: submittedAt,
        updatedAt: submittedAt,
      });
      await this.events.save(event);

      return { incidentId: incident.id };
    });
  }
}

export const officerIncidentResolutionService = new OfficerIncidentResolutionService(
  officerIncidentRepository,
  officerIncidentEventRepository,
  officerResolutionRepository,
);
