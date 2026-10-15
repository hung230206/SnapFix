import { randomUUID } from "node:crypto";

import {
  getIncidentReviewTargetStatus,
  type IncidentReviewDecision,
} from "@/domain/incident/review";
import type { IncidentEvent } from "@/domain/models";
import type {
  IIncidentEventRepository,
  IIncidentRepository,
} from "@/lib/repositories/interfaces";
import {
  officerIncidentEventRepository,
  officerIncidentRepository,
} from "@/lib/repositories/officer-demo-repositories";

export type ReviewIncidentInput = {
  incidentId: string;
  decision: IncidentReviewDecision;
  rejectionReason?: string;
};

export type ReviewIncidentResult = {
  incidentId: string;
  status: "VERIFIED" | "CANCELLED";
};

export class IncidentReviewError extends Error {
  constructor(
    message: string,
    readonly code: "NOT_FOUND" | "INVALID_TRANSITION" | "INVALID_REASON",
  ) {
    super(message);
    this.name = "IncidentReviewError";
  }
}

const reviewQueues = new Map<string, Promise<void>>();

async function withIncidentReviewLock<TResult>(
  incidentId: string,
  operation: () => Promise<TResult>,
): Promise<TResult> {
  const previous = reviewQueues.get(incidentId) ?? Promise.resolve();
  let releaseCurrent!: () => void;
  const currentGate = new Promise<void>((resolve) => {
    releaseCurrent = resolve;
  });
  const current = previous.then(() => currentGate);

  reviewQueues.set(incidentId, current);
  await previous;

  try {
    return await operation();
  } finally {
    releaseCurrent();
    if (reviewQueues.get(incidentId) === current) {
      reviewQueues.delete(incidentId);
    }
  }
}

export class OfficerIncidentReviewService {
  constructor(
    private readonly incidents: IIncidentRepository,
    private readonly events: IIncidentEventRepository,
  ) {}

  async reviewIncident(input: ReviewIncidentInput): Promise<ReviewIncidentResult> {
    return withIncidentReviewLock(input.incidentId, async () => {
      const incident = await this.incidents.findById(input.incidentId);

      if (!incident) {
        throw new IncidentReviewError("Không tìm thấy phản ánh cần xử lý.", "NOT_FOUND");
      }

      const targetStatus = getIncidentReviewTargetStatus(incident.status, input.decision);
      if (!targetStatus) {
        throw new IncidentReviewError(
          "Phản ánh này đã được xử lý ở bước tiếp nhận.",
          "INVALID_TRANSITION",
        );
      }

      const rejectionReason = input.rejectionReason?.trim();
      if (input.decision === "REJECT" && !rejectionReason) {
        throw new IncidentReviewError(
          "Vui lòng nhập lý do từ chối phản ánh.",
          "INVALID_REASON",
        );
      }

      const occurredAt = new Date().toISOString();
      const event: IncidentEvent = {
        id: `evt-${randomUUID()}`,
        incidentId: incident.id,
        type: input.decision === "ACCEPT" ? "VERIFIED" : "STATUS_CHANGED",
        oldStatus: incident.status,
        newStatus: targetStatus,
        note:
          input.decision === "ACCEPT"
            ? "Cán bộ đã xác nhận tiếp nhận phản ánh."
            : `Lý do từ chối: ${rejectionReason}`,
        createdAt: occurredAt,
      };

      await this.incidents.save({
        ...incident,
        status: targetStatus,
        updatedAt: occurredAt,
      });
      await this.events.save(event);

      return { incidentId: incident.id, status: targetStatus };
    });
  }
}

export const officerIncidentReviewService = new OfficerIncidentReviewService(
  officerIncidentRepository,
  officerIncidentEventRepository,
);
