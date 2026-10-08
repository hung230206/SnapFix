import { randomUUID } from "node:crypto";

import { getIncidentProcessingTargetStatus } from "@/domain/incident/processing";
import type { IncidentEvent } from "@/domain/models";
import type {
  IIncidentEventRepository,
  IIncidentRepository,
} from "@/lib/repositories/interfaces";
import {
  officerIncidentEventRepository,
  officerIncidentRepository,
} from "@/lib/repositories/officer-demo-repositories";

export type StartIncidentProcessingInput = {
  incidentId: string;
  note?: string;
};

export class IncidentProcessingError extends Error {
  constructor(
    message: string,
    readonly code: "NOT_FOUND" | "INVALID_TRANSITION",
  ) {
    super(message);
    this.name = "IncidentProcessingError";
  }
}

const processingQueues = new Map<string, Promise<void>>();

async function withIncidentProcessingLock<TResult>(
  incidentId: string,
  operation: () => Promise<TResult>,
): Promise<TResult> {
  const previous = processingQueues.get(incidentId) ?? Promise.resolve();
  let releaseCurrent!: () => void;
  const currentGate = new Promise<void>((resolve) => {
    releaseCurrent = resolve;
  });
  const current = previous.then(() => currentGate);

  processingQueues.set(incidentId, current);
  await previous;

  try {
    return await operation();
  } finally {
    releaseCurrent();
    if (processingQueues.get(incidentId) === current) {
      processingQueues.delete(incidentId);
    }
  }
}

export class OfficerIncidentProcessingService {
  constructor(
    private readonly incidents: IIncidentRepository,
    private readonly events: IIncidentEventRepository,
  ) {}

  async startProcessing(
    input: StartIncidentProcessingInput,
  ): Promise<{ incidentId: string }> {
    return withIncidentProcessingLock(input.incidentId, async () => {
      const incident = await this.incidents.findById(input.incidentId);
      if (!incident) {
        throw new IncidentProcessingError(
          "Không tìm thấy phản ánh cần bắt đầu xử lý.",
          "NOT_FOUND",
        );
      }

      const targetStatus = getIncidentProcessingTargetStatus(incident.status);
      if (!targetStatus) {
        throw new IncidentProcessingError(
          "Chỉ phản ánh đã phân công mới có thể bắt đầu xử lý.",
          "INVALID_TRANSITION",
        );
      }

      const note = input.note?.trim() || undefined;
      const startedAt = new Date().toISOString();
      const event: IncidentEvent = {
        id: `evt-${randomUUID()}`,
        incidentId: incident.id,
        type: "STATUS_CHANGED",
        oldStatus: incident.status,
        newStatus: targetStatus,
        note,
        metadata: { startedAt },
        createdAt: startedAt,
      };

      await this.incidents.save({
        ...incident,
        status: targetStatus,
        updatedAt: startedAt,
      });
      await this.events.save(event);

      return { incidentId: incident.id };
    });
  }
}

export const officerIncidentProcessingService = new OfficerIncidentProcessingService(
  officerIncidentRepository,
  officerIncidentEventRepository,
);
