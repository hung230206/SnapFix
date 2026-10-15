import type { Incident, IncidentStatus } from "@/domain/models";
import type { IncidentStatusTone } from "@/domain/incident/status";
import {
  getIncidentStatusPresentation,
  getPriorityPresentation,
} from "@/domain/incident/status";
import {
  officerIncidentRepository,
  officerIssueTypeRepository,
  officerObservationRepository,
} from "@/lib/repositories/officer-repositories";

export type DashboardMetricKey =
  | "incidents"
  | "reports"
  | "pending"
  | "processing"
  | "awaitingConfirmation"
  | "completed";

export type DashboardMetric = {
  key: DashboardMetricKey;
  label: string;
  value: number;
  description: string;
  tone: IncidentStatusTone;
};

export type DailyReportPoint = {
  date: string;
  label: string;
  total: number;
};

export type IssueTypeDistributionItem = {
  code: string;
  label: string;
  total: number;
  reportCount: number;
  color: string;
};

export type OfficerIncidentSummary = {
  id: string;
  publicCode: string;
  issueType: string;
  location: string;
  submittedAt: string;
  updatedAt: string;
  reportCount: number;
  status: {
    code: IncidentStatus;
    label: string;
    tone: IncidentStatusTone;
  };
  priority: {
    label: string;
    tone: IncidentStatusTone;
  };
};

export type OfficerMapPoint = {
  id: string;
  publicCode: string;
  issueType: string;
  lat: number;
  lng: number;
  statusLabel: string;
  statusTone: IncidentStatusTone;
};

export type OfficerDashboardSnapshot = {
  totalIncidents: number;
  totalIndependentReports: number;
  metrics: DashboardMetric[];
  dailyReports: DailyReportPoint[];
  issueTypeDistribution: IssueTypeDistributionItem[];
  recentIncidents: OfficerIncidentSummary[];
  mapPoints: OfficerMapPoint[];
};

const ISSUE_TYPE_COLORS = [
  "#087F46",
  "#2563EB",
  "#D97706",
  "#DC2626",
  "#7C3AED",
  "#64748B",
];
const PROCESSING_STATUSES: IncidentStatus[] = [
  "VERIFIED",
  "ASSIGNED",
  "IN_PROGRESS",
];
const COMPLETED_STATUSES: IncidentStatus[] = ["COMMUNITY_VERIFIED", "CLOSED"];

function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatCoordinateLocation(incident: Incident): string {
  if (
    incident.centroidLat === undefined ||
    incident.centroidLng === undefined
  ) {
    return "Chưa có vị trí xác định";
  }
  return `${incident.centroidLat.toFixed(5)}, ${incident.centroidLng.toFixed(5)}`;
}

function buildDailySeries(incidents: Incident[], asOf: Date): DailyReportPoint[] {
  const formatter = new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  });

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(asOf);
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));
    const key = toDateKey(date);

    return {
      date: key,
      label: formatter.format(date),
      total: incidents
        .filter((incident) => toDateKey(new Date(incident.createdAt)) === key)
        .reduce(
          (total, incident) => total + incident.independentReportCount,
          0,
        ),
    };
  });
}

export class OfficerDashboardService {
  async getDashboardSnapshot(
    asOf = new Date(),
  ): Promise<OfficerDashboardSnapshot> {
    const [incidents, issueTypes] = await Promise.all([
      officerIncidentRepository.findAll(),
      officerIssueTypeRepository.findAll(),
    ]);
    const issueTypeNames = new Map(
      issueTypes.map((issueType) => [issueType.code, issueType.nameVi]),
    );
    const totalIndependentReports = incidents.reduce(
      (total, incident) => total + incident.independentReportCount,
      0,
    );
    const sortedIncidents = [...incidents].sort(
      (first, second) =>
        new Date(second.updatedAt).getTime() -
        new Date(first.updatedAt).getTime(),
    );

    const recentIncidents = await Promise.all(
      sortedIncidents.slice(0, 5).map(async (incident) => {
        const observations =
          await officerObservationRepository.findByIncidentId(incident.id);
        const location = observations.find(
          (observation) => observation.locationText,
        )?.locationText;
        const status = getIncidentStatusPresentation(incident.status);
        const priority = getPriorityPresentation(incident.priorityLevel);

        return {
          id: incident.id,
          publicCode: incident.publicCode,
          issueType:
            issueTypeNames.get(incident.issueTypeCode) ?? incident.issueTypeCode,
          location: location ?? formatCoordinateLocation(incident),
          submittedAt: incident.createdAt,
          updatedAt: incident.updatedAt,
          reportCount: incident.independentReportCount,
          status: { code: incident.status, ...status },
          priority,
        } satisfies OfficerIncidentSummary;
      }),
    );

    const issueGroups = incidents.reduce<Map<string, Incident[]>>(
      (groups, incident) => {
        const group = groups.get(incident.issueTypeCode) ?? [];
        group.push(incident);
        groups.set(incident.issueTypeCode, group);
        return groups;
      },
      new Map(),
    );
    const issueTypeDistribution = [...issueGroups.entries()]
      .map(([code, matchingIncidents], index) => ({
        code,
        label: issueTypeNames.get(code) ?? code,
        total: matchingIncidents.length,
        reportCount: matchingIncidents.reduce(
          (total, incident) => total + incident.independentReportCount,
          0,
        ),
        color: ISSUE_TYPE_COLORS[index % ISSUE_TYPE_COLORS.length],
      }))
      .sort((first, second) => second.total - first.total);

    const mapPoints = incidents.flatMap((incident): OfficerMapPoint[] => {
      if (
        incident.centroidLat === undefined ||
        incident.centroidLng === undefined
      ) {
        return [];
      }
      const status = getIncidentStatusPresentation(incident.status);
      return [
        {
          id: incident.id,
          publicCode: incident.publicCode,
          issueType:
            issueTypeNames.get(incident.issueTypeCode) ?? incident.issueTypeCode,
          lat: incident.centroidLat,
          lng: incident.centroidLng,
          statusLabel: status.label,
          statusTone: status.tone,
        },
      ];
    });

    const metrics: DashboardMetric[] = [
      {
        key: "incidents",
        label: "Tổng sự cố",
        value: incidents.length,
        description: "Số Incident riêng biệt",
        tone: "neutral",
      },
      {
        key: "reports",
        label: "Lượt phản ánh",
        value: totalIndependentReports,
        description: "Tổng lượt báo độc lập",
        tone: "neutral",
      },
      {
        key: "pending",
        label: getIncidentStatusPresentation("NEW").label,
        value: incidents.filter((incident) => incident.status === "NEW").length,
        description: "Cần cán bộ kiểm tra",
        tone: "warning",
      },
      {
        key: "processing",
        label: "Đang trong quy trình",
        value: incidents.filter((incident) =>
          PROCESSING_STATUSES.includes(incident.status),
        ).length,
        description: "Đã tiếp nhận, phân công hoặc xử lý",
        tone: "info",
      },
      {
        key: "awaitingConfirmation",
        label: getIncidentStatusPresentation("RESOLVED").label,
        value: incidents.filter((incident) => incident.status === "RESOLVED")
          .length,
        description: "Đang chờ kiểm tra kết quả",
        tone: "info",
      },
      {
        key: "completed",
        label: getIncidentStatusPresentation("CLOSED").label,
        value: incidents.filter((incident) =>
          COMPLETED_STATUSES.includes(incident.status),
        ).length,
        description: "Đã kết thúc quy trình xử lý",
        tone: "success",
      },
    ];

    return {
      totalIncidents: incidents.length,
      totalIndependentReports,
      metrics,
      dailyReports: buildDailySeries(incidents, asOf),
      issueTypeDistribution,
      recentIncidents,
      mapPoints,
    };
  }
}

export const officerDashboardService = new OfficerDashboardService();
