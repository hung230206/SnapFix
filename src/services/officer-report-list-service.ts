import { existsSync } from "node:fs";
import path from "node:path";

import type { ConfidenceLevel, Incident, IncidentStatus, Severity } from "@/domain/models";
import type { OfficerReportListItem } from "@/domain/incident/report-list";
import {
  getIncidentStatusPresentation,
  getPriorityPresentation,
} from "@/domain/incident/status";
import {
  DemoAssetRepository,
  DemoIncidentRepository,
  DemoIssueTypeRepository,
  DemoObservationRepository,
} from "@/lib/repositories/DemoRepositories";

export type OfficerReportFilterOption<TValue extends string> = {
  value: TValue;
  label: string;
};

export type OfficerReportListSnapshot = {
  reports: OfficerReportListItem[];
  statusOptions: OfficerReportFilterOption<IncidentStatus>[];
  priorityOptions: OfficerReportFilterOption<Severity>[];
};

const incidentRepository = new DemoIncidentRepository();
const issueTypeRepository = new DemoIssueTypeRepository();
const observationRepository = new DemoObservationRepository();
const assetRepository = new DemoAssetRepository();

const OFFICER_WORKFLOW_STATUSES: IncidentStatus[] = [
  "NEW",
  "VERIFIED",
  "ASSIGNED",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
  "CANCELLED",
];

const PRIORITIES: Severity[] = ["HIGH", "MEDIUM", "LOW"];

const CONFIDENCE_LABELS: Record<ConfidenceLevel, string> = {
  HIGH: "Cao",
  MEDIUM: "Trung bình",
  LOW: "Thấp",
};

function formatCoordinateLocation(incident: Incident): string {
  if (incident.centroidLat === undefined || incident.centroidLng === undefined) {
    return "Chưa có vị trí xác định";
  }

  return `${incident.centroidLat.toFixed(5)}, ${incident.centroidLng.toFixed(5)}`;
}

function resolvePublicAssetUrl(storagePath?: string): string | undefined {
  if (!storagePath?.startsWith("/")) {
    return undefined;
  }

  const publicDirectory = path.resolve(process.cwd(), "public");
  const assetPath = path.resolve(publicDirectory, storagePath.replace(/^\/+/, ""));
  const isInsidePublicDirectory = assetPath.startsWith(`${publicDirectory}${path.sep}`);

  return isInsidePublicDirectory && existsSync(assetPath) ? storagePath : undefined;
}

export class OfficerReportListService {
  async getReportList(): Promise<OfficerReportListSnapshot> {
    const [incidents, issueTypes] = await Promise.all([
      incidentRepository.findAll(),
      issueTypeRepository.findAll(),
    ]);

    const issueTypeNames = new Map(
      issueTypes.map((issueType) => [issueType.code, issueType.nameVi]),
    );

    const reports = await Promise.all(
      incidents.map(async (incident): Promise<OfficerReportListItem> => {
        const observations = await observationRepository.findByIncidentId(incident.id);
        const primaryObservation = [...observations].sort(
          (first, second) =>
            new Date(first.submittedAt).getTime() - new Date(second.submittedAt).getTime(),
        )[0];
        const asset = primaryObservation?.imageAssetId
          ? await assetRepository.findById(primaryObservation.imageAssetId)
          : null;
        const issueType = issueTypeNames.get(incident.issueTypeCode) ?? incident.issueTypeCode;
        const status = getIncidentStatusPresentation(incident.status);
        const priority = getPriorityPresentation(incident.priorityLevel);

        return {
          id: incident.id,
          publicCode: incident.publicCode,
          issueType,
          title: primaryObservation?.title ?? issueType,
          description: primaryObservation?.description,
          location: primaryObservation?.locationText ?? formatCoordinateLocation(incident),
          submittedAt: primaryObservation?.submittedAt ?? incident.createdAt,
          updatedAt: incident.updatedAt,
          thumbnailUrl: resolvePublicAssetUrl(asset?.storagePath),
          confidence: {
            code: incident.confidenceLevel,
            label: CONFIDENCE_LABELS[incident.confidenceLevel],
          },
          reportCount: incident.independentReportCount,
          status: { code: incident.status, ...status },
          priority: { code: incident.priorityLevel, ...priority },
        };
      }),
    );

    return {
      reports,
      statusOptions: OFFICER_WORKFLOW_STATUSES.map((status) => ({
        value: status,
        label: getIncidentStatusPresentation(status).label,
      })),
      priorityOptions: PRIORITIES.map((priority) => ({
        value: priority,
        label: getPriorityPresentation(priority).label,
      })),
    };
  }
}

export const officerReportListService = new OfficerReportListService();
