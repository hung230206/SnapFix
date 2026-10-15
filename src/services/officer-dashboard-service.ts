import type { Incident, IncidentStatus } from "@/domain/models";
import type { IncidentStatusTone } from "@/domain/incident/status";
import {
  getIncidentStatusPresentation,
  getPriorityPresentation,
} from "@/domain/incident/status";
import {
  DemoIncidentRepository,
  DemoIssueTypeRepository,
  DemoObservationRepository,
} from "@/lib/repositories/DemoRepositories";

export type DashboardMetricKey =
  | "total"
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
  metrics: DashboardMetric[];
  dailyReports: DailyReportPoint[];
  issueTypeDistribution: IssueTypeDistributionItem[];
  recentIncidents: OfficerIncidentSummary[];
  mapPoints: OfficerMapPoint[];
};

const incidentRepository = new DemoIncidentRepository();
const issueTypeRepository = new DemoIssueTypeRepository();
const observationRepository = new DemoObservationRepository();

const ISSUE_TYPE_COLORS = ["#087F46", "#2563EB", "#D97706", "#DC2626", "#7C3AED", "#64748B"];
const PROCESSING_STATUSES: IncidentStatus[] = ["VERIFIED", "ASSIGNED", "IN_PROGRESS"];
const COMPLETED_STATUSES: IncidentStatus[] = ["COMMUNITY_VERIFIED", "CLOSED"];

function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatCoordinateLocation(incident: Incident): string {
  if (incident.centroidLat === undefined || incident.centroidLng === undefined) {
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
      total: incidents.filter((incident) => toDateKey(new Date(incident.createdAt)) === key).length,
    };
  });
}

export class OfficerDashboardService {
  async getDashboardSnapshot(asOf = new Date()): Promise<OfficerDashboardSnapshot> {
    const [incidents, issueTypes] = await Promise.all([
      incidentRepository.findAll(),
      issueTypeRepository.findAll(),
    ]);

    const issueTypeNames = new Map(issueTypes.map((issueType) => [issueType.code, issueType.nameVi]));
    const sortedIncidents = [...incidents].sort(
      (first, second) => new Date(second.updatedAt).getTime() - new Date(first.updatedAt).getTime(),
    );

    const recentIncidents = await Promise.all(
      sortedIncidents.slice(0, 5).map(async (incident): Promise<OfficerIncidentSummary> => {
        const observations = await observationRepository.findByIncidentId(incident.id);
        const location = observations.find((observation) => observation.locationText)?.locationText;
        const status = getIncidentStatusPresentation(incident.status);
        const priority = getPriorityPresentation(incident.priorityLevel);

        return {
          id: incident.id,
          publicCode: incident.publicCode,
          issueType: issueTypeNames.get(incident.issueTypeCode) ?? incident.issueTypeCode,
          location: location ?? formatCoordinateLocation(incident),
          submittedAt: incident.createdAt,
          updatedAt: incident.updatedAt,
          reportCount: incident.independentReportCount,
          status: { code: incident.status, ...status },
          priority,
        };
      }),
    );

    const issueCounts = incidents.reduce<Map<string, number>>((counts, incident) => {
      counts.set(incident.issueTypeCode, (counts.get(incident.issueTypeCode) ?? 0) + 1);
      return counts;
    }, new Map());

    const issueTypeDistribution = [...issueCounts.entries()]
      .map(([code, total], index) => ({
        code,
        label: issueTypeNames.get(code) ?? code,
        total,
        color: ISSUE_TYPE_COLORS[index % ISSUE_TYPE_COLORS.length],
      }))
      .sort((first, second) => second.total - first.total);

    const mapPoints = incidents.flatMap((incident): OfficerMapPoint[] => {
      if (incident.centroidLat === undefined || incident.centroidLng === undefined) {
        return [];
      }

      const status = getIncidentStatusPresentation(incident.status);
      return [
        {
          id: incident.id,
          publicCode: incident.publicCode,
          issueType: issueTypeNames.get(incident.issueTypeCode) ?? incident.issueTypeCode,
          lat: incident.centroidLat,
          lng: incident.centroidLng,
          statusLabel: status.label,
          statusTone: status.tone,
        },
      ];
    });

    const metrics: DashboardMetric[] = [
      {
        key: "total",
        label: "Tổng phản ánh",
        value: incidents.length,
        description: "Tất cả sự cố đang được theo dõi",
        tone: "neutral",
      },
      {
        key: "pending",
        label: "Chờ duyệt",
        value: incidents.filter((incident) => incident.status === "NEW").length,
        description: "Cần cán bộ kiểm tra",
        tone: "warning",
      },
      {
        key: "processing",
        label: "Đang xử lý",
        value: incidents.filter((incident) => PROCESSING_STATUSES.includes(incident.status)).length,
        description: "Đã tiếp nhận hoặc đang thực hiện",
        tone: "info",
      },
      {
        key: "awaitingConfirmation",
        label: "Chờ xác nhận",
        value: incidents.filter((incident) => incident.status === "RESOLVED").length,
        description: "Đang chờ kiểm tra kết quả",
        tone: "info",
      },
      {
        key: "completed",
        label: "Đã hoàn thành",
        value: incidents.filter((incident) => COMPLETED_STATUSES.includes(incident.status)).length,
        description: "Đã kết thúc quy trình xử lý",
        tone: "success",
      },
    ];

    return {
      totalIncidents: incidents.length,
      metrics,
      dailyReports: buildDailySeries(incidents, asOf),
      issueTypeDistribution,
      recentIncidents,
      mapPoints,
    };
  }
}

export const officerDashboardService = new OfficerDashboardService();
