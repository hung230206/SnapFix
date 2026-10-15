import type { Incident, IncidentStatus, Severity, UserRole } from "@/domain/models";
import { getIncidentStatusPresentation } from "@/domain/incident/status";
import {
  officerDepartmentRepository,
  officerIncidentRepository,
  officerIssueTypeRepository,
  officerObservationRepository,
  officerUserRepository,
} from "@/lib/repositories/officer-repositories";

const ROLE_LABELS: Record<UserRole, string> = {
  CITIZEN: "Công dân",
  OFFICER: "Cán bộ tiếp nhận",
  MANAGER: "Quản lý",
  ADMIN: "Quản trị viên",
};

const SEVERITY_LABELS: Record<Severity, string> = {
  HIGH: "Cao",
  MEDIUM: "Trung bình",
  LOW: "Thấp",
};

export type OfficerCategorySummary = {
  id: string;
  code: string;
  name: string;
  active: boolean;
  defaultSeverity: Severity;
  defaultSeverityLabel: string;
  emergencyWarning?: string;
  incidentCount: number;
  independentReportCount: number;
};

export type OfficerUserSummary = {
  id: string;
  displayName: string;
  email?: string;
  role: UserRole;
  roleLabel: string;
  department?: string;
  submittedReportCount: number;
  assignedIncidentCount: number;
};

export type OfficerStatusSummary = {
  code: IncidentStatus;
  label: string;
  count: number;
  independentReportCount: number;
};

export type OfficerReportSummary = {
  totalIncidents: number;
  totalIndependentReports: number;
  categorySummaries: OfficerCategorySummary[];
  statusSummaries: OfficerStatusSummary[];
};

function summarizeCategories(
  incidents: Incident[],
  issueTypes: Awaited<ReturnType<typeof officerIssueTypeRepository.findAll>>,
): OfficerCategorySummary[] {
  return issueTypes
    .map((issueType) => {
      const matchingIncidents = incidents.filter(
        (incident) => incident.issueTypeCode === issueType.code,
      );
      const defaultSeverity = issueType.defaultSeverity ?? "LOW";

      return {
        id: issueType.id,
        code: issueType.code,
        name: issueType.nameVi,
        active: issueType.active,
        defaultSeverity,
        defaultSeverityLabel: SEVERITY_LABELS[defaultSeverity],
        emergencyWarning: issueType.emergencyWarning,
        incidentCount: matchingIncidents.length,
        independentReportCount: matchingIncidents.reduce(
          (total, incident) => total + incident.independentReportCount,
          0,
        ),
      };
    })
    .sort(
      (first, second) =>
        second.incidentCount - first.incidentCount ||
        first.name.localeCompare(second.name, "vi"),
    );
}

export async function getOfficerCategorySummaries(): Promise<
  OfficerCategorySummary[]
> {
  const [incidents, issueTypes] = await Promise.all([
    officerIncidentRepository.findAll(),
    officerIssueTypeRepository.findAll(),
  ]);
  return summarizeCategories(incidents, issueTypes);
}

export async function getOfficerUserSummaries(): Promise<OfficerUserSummary[]> {
  const [users, departments, incidents] = await Promise.all([
    officerUserRepository.findAll(),
    officerDepartmentRepository.findAll(),
    officerIncidentRepository.findAll(),
  ]);
  const observations = (
    await Promise.all(
      incidents.map((incident) =>
        officerObservationRepository.findByIncidentId(incident.id),
      ),
    )
  ).flat();
  const departmentNames = new Map(
    departments.map((department) => [department.id, department.name]),
  );

  return users.map((user) => ({
    id: user.id,
    displayName: user.displayName,
    email: user.email,
    role: user.role,
    roleLabel: ROLE_LABELS[user.role],
    department: user.departmentId
      ? departmentNames.get(user.departmentId)
      : undefined,
    submittedReportCount: observations.filter(
      (observation) => observation.reporterId === user.id,
    ).length,
    assignedIncidentCount: incidents.filter(
      (incident) => incident.assignedOfficerId === user.id,
    ).length,
  }));
}

export async function getOfficerReportSummary(): Promise<OfficerReportSummary> {
  const [incidents, issueTypes] = await Promise.all([
    officerIncidentRepository.findAll(),
    officerIssueTypeRepository.findAll(),
  ]);
  const byStatus = new Map<IncidentStatus, Incident[]>();

  for (const incident of incidents) {
    const group = byStatus.get(incident.status) ?? [];
    group.push(incident);
    byStatus.set(incident.status, group);
  }

  const statusSummaries = Array.from(byStatus.entries())
    .map(([code, matchingIncidents]) => ({
      code,
      count: matchingIncidents.length,
      independentReportCount: matchingIncidents.reduce(
        (total, incident) => total + incident.independentReportCount,
        0,
      ),
      label: getIncidentStatusPresentation(code).label,
    }))
    .sort(
      (first, second) =>
        second.count - first.count ||
        first.label.localeCompare(second.label, "vi"),
    );

  return {
    totalIncidents: incidents.length,
    totalIndependentReports: incidents.reduce(
      (total, incident) => total + incident.independentReportCount,
      0,
    ),
    categorySummaries: summarizeCategories(incidents, issueTypes),
    statusSummaries,
  };
}

export async function getOfficerProfile() {
  return (
    (await getOfficerUserSummaries()).find(
      (user) => user.role === "OFFICER",
    ) ?? null
  );
}
