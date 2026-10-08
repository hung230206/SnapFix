import { randomUUID } from "node:crypto";

import {
  getIncidentAssignmentTargetStatus,
  getOfficerLocalDate,
  validateAssignmentDeadline,
} from "@/domain/incident/assignment";
import type { IncidentEvent } from "@/domain/models";
import {
  DemoDepartmentRepository,
  DemoUserRepository,
} from "@/lib/repositories/DemoRepositories";
import type {
  IIncidentEventRepository,
  IIncidentRepository,
} from "@/lib/repositories/interfaces";
import {
  officerIncidentEventRepository,
  officerIncidentRepository,
} from "@/lib/repositories/officer-demo-repositories";

export type AssignmentTeamOption = {
  id: string;
  name: string;
};

export type AssignmentOfficerOption = {
  id: string;
  name: string;
  departmentId: string;
};

export type OfficerIncidentAssignmentOptions = {
  teams: AssignmentTeamOption[];
  officers: AssignmentOfficerOption[];
  minimumDeadline: string;
};

export type AssignIncidentInput = {
  incidentId: string;
  teamId: string;
  officerId?: string;
  deadline?: string;
  note?: string;
};

export class IncidentAssignmentError extends Error {
  constructor(
    message: string,
    readonly code:
      | "NOT_FOUND"
      | "INVALID_TRANSITION"
      | "INVALID_TEAM"
      | "INVALID_OFFICER"
      | "INVALID_DEADLINE"
      | "INVALID_NOTE",
  ) {
    super(message);
    this.name = "IncidentAssignmentError";
  }
}

const assignmentQueues = new Map<string, Promise<void>>();

async function withIncidentAssignmentLock<TResult>(
  incidentId: string,
  operation: () => Promise<TResult>,
): Promise<TResult> {
  const previous = assignmentQueues.get(incidentId) ?? Promise.resolve();
  let releaseCurrent!: () => void;
  const currentGate = new Promise<void>((resolve) => {
    releaseCurrent = resolve;
  });
  const current = previous.then(() => currentGate);

  assignmentQueues.set(incidentId, current);
  await previous;

  try {
    return await operation();
  } finally {
    releaseCurrent();
    if (assignmentQueues.get(incidentId) === current) {
      assignmentQueues.delete(incidentId);
    }
  }
}

export class OfficerIncidentAssignmentService {
  private readonly departments = new DemoDepartmentRepository();
  private readonly users = new DemoUserRepository();

  constructor(
    private readonly incidents: IIncidentRepository,
    private readonly events: IIncidentEventRepository,
  ) {}

  async getAssignmentOptions(): Promise<OfficerIncidentAssignmentOptions> {
    const [departments, users] = await Promise.all([
      this.departments.findAll(),
      this.users.findAll(),
    ]);

    return {
      teams: departments
        .filter((department) => department.active)
        .map((department) => ({ id: department.id, name: department.name })),
      officers: users
        .filter(
          (user): user is typeof user & { departmentId: string } =>
            user.role === "OFFICER" && Boolean(user.departmentId),
        )
        .map((user) => ({
          id: user.id,
          name: user.displayName,
          departmentId: user.departmentId,
        })),
      minimumDeadline: getOfficerLocalDate(),
    };
  }

  async assignIncident(input: AssignIncidentInput): Promise<{ incidentId: string }> {
    return withIncidentAssignmentLock(input.incidentId, async () => {
      const incident = await this.incidents.findById(input.incidentId);
      if (!incident) {
        throw new IncidentAssignmentError(
          "Không tìm thấy phản ánh cần phân công.",
          "NOT_FOUND",
        );
      }

      const targetStatus = getIncidentAssignmentTargetStatus(incident.status);
      if (!targetStatus) {
        throw new IncidentAssignmentError(
          "Chỉ phản ánh đã tiếp nhận mới có thể được phân công.",
          "INVALID_TRANSITION",
        );
      }

      const teamId = input.teamId.trim();
      const team = teamId ? await this.departments.findById(teamId) : null;
      if (!team?.active) {
        throw new IncidentAssignmentError(
          "Vui lòng chọn đội phụ trách hợp lệ.",
          "INVALID_TEAM",
        );
      }

      const officerId = input.officerId?.trim() || undefined;
      const officer = officerId ? await this.users.findById(officerId) : null;
      if (
        officerId &&
        (!officer || officer.role !== "OFFICER" || officer.departmentId !== team.id)
      ) {
        throw new IncidentAssignmentError(
          "Người phụ trách không thuộc đội đã chọn.",
          "INVALID_OFFICER",
        );
      }

      const deadline = input.deadline?.trim() || undefined;
      const deadlineValidation = validateAssignmentDeadline(deadline);
      if (deadlineValidation === "INVALID") {
        throw new IncidentAssignmentError(
          "Hạn xử lý không hợp lệ.",
          "INVALID_DEADLINE",
        );
      }
      if (deadlineValidation === "PAST") {
        throw new IncidentAssignmentError(
          "Hạn xử lý không được ở trong quá khứ.",
          "INVALID_DEADLINE",
        );
      }

      const note = input.note?.trim();
      if (input.note && !note) {
        throw new IncidentAssignmentError(
          "Ghi chú không được chỉ chứa khoảng trắng.",
          "INVALID_NOTE",
        );
      }

      const assignedAt = new Date().toISOString();
      const event: IncidentEvent = {
        id: `evt-${randomUUID()}`,
        incidentId: incident.id,
        type: "ASSIGNED",
        oldStatus: incident.status,
        newStatus: targetStatus,
        note,
        metadata: {
          departmentId: team.id,
          departmentName: team.name,
          ...(officer
            ? { officerId: officer.id, officerName: officer.displayName }
            : {}),
          ...(deadline ? { deadline } : {}),
        },
        createdAt: assignedAt,
      };

      await this.incidents.save({
        ...incident,
        status: targetStatus,
        assignedDepartmentId: team.id,
        assignedOfficerId: officer?.id,
        updatedAt: assignedAt,
      });
      await this.events.save(event);

      return { incidentId: incident.id };
    });
  }
}

export const officerIncidentAssignmentService = new OfficerIncidentAssignmentService(
  officerIncidentRepository,
  officerIncidentEventRepository,
);
