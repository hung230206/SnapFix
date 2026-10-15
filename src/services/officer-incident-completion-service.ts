import { randomUUID } from "node:crypto";

import { getIncidentCompletionTargetStatus } from "@/domain/incident/completion";
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

export type ConfirmIncidentCompletionInput = {
  incidentId: string;
};

export class IncidentCompletionError extends Error {
  constructor(
    message: string,
    readonly code: "NOT_FOUND" | "INVALID_TRANSITION" | "MISSING_RESOLUTION",
  ) {
    super(message);
    this.name = "IncidentCompletionError";
  }
}

const completionQueues = new Map<string, Promise<void>>();

async function withIncidentCompletionLock<TResult>(
  incidentId: string,
  operation: () => Promise<TResult>,
): Promise<TResult> {
  const previous = completionQueues.get(incidentId) ?? Promise.resolve();
  let releaseCurrent!: () => void;
  const currentGate = new Promise<void>((resolve) => {
    releaseCurrent = resolve;
  });
  const current = previous.then(() => currentGate);

  completionQueues.set(incidentId, current);
  await previous;

  try {
    return await operation();
  } finally {
    releaseCurrent();
    if (completionQueues.get(incidentId) === current) {
      completionQueues.delete(incidentId);
    }
  }
}

export class OfficerIncidentCompletionService {
  constructor(
    private readonly incidents: IIncidentRepository,
    private readonly events: IIncidentEventRepository,
    private readonly resolutions: IOfficerResolutionRepository,
  ) {}

  async confirmCompletion(
    input: ConfirmIncidentCompletionInput,
  ): Promise<{ incidentId: string }> {
    return withIncidentCompletionLock(input.incidentId, async () => {
      const incident = await this.incidents.findById(input.incidentId);
      if (!incident) {
        throw new IncidentCompletionError(
          "Không tìm thấy phản ánh cần xác nhận hoàn thành.",
          "NOT_FOUND",
        );
      }

      const targetStatus = getIncidentCompletionTargetStatus(incident.status);
      if (!targetStatus) {
        throw new IncidentCompletionError(
          "Chỉ phản ánh đang chờ xác nhận mới có thể được đóng.",
          "INVALID_TRANSITION",
        );
      }

      const resolution = await this.resolutions.findByIncidentId(incident.id);
      if (!resolution) {
        throw new IncidentCompletionError(
          "Chưa có kết quả xử lý để xác nhận hoàn thành.",
          "MISSING_RESOLUTION",
        );
      }

      const confirmedAt = new Date().toISOString();
      const event: IncidentEvent = {
        id: `evt-${randomUUID()}`,
        incidentId: incident.id,
        type: "CLOSED",
        oldStatus: incident.status,
        newStatus: targetStatus,
        note: "Cán bộ đã xác nhận kết quả xử lý và hoàn thành phản ánh.",
        metadata: {
          confirmedAt,
          resolutionId: resolution.id,
        },
        createdAt: confirmedAt,
      };

      await this.incidents.save({
        ...incident,
        status: targetStatus,
        closedAt: confirmedAt,
        updatedAt: confirmedAt,
      });
      await this.events.save(event);

      return { incidentId: incident.id };
    });
  }
}

export const officerIncidentCompletionService = new OfficerIncidentCompletionService(
  officerIncidentRepository,
  officerIncidentEventRepository,
  officerResolutionRepository,
);
