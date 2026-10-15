import type { IncidentStatus } from "@/domain/models";
import type { OfficerReportListItem } from "@/domain/incident/report-list";
import type { IncidentStatusTone } from "@/domain/incident/status";
import { officerReportListService } from "@/services/officer-report-list-service";

const CATEGORY_COLORS = [
  "#087F46",
  "#2563EB",
  "#F59E0B",
  "#DC2626",
  "#7C3AED",
  "#0891B2",
  "#DB2777",
  "#6B7280",
];

export type OfficerCategoryStatistic = {
  code: string;
  category: string;
  incidentCount: number;
  independentReportCount: number;
  percentage: number;
  color: string;
  incidents: OfficerReportListItem[];
};

export type OfficerStatusStatistic = {
  code: IncidentStatus;
  label: string;
  tone: IncidentStatusTone;
  incidentCount: number;
  independentReportCount: number;
};

export type OfficerStatistics = {
  totalIncidents: number;
  totalIndependentReports: number;
  categoryCount: number;
  categories: OfficerCategoryStatistic[];
  statuses: OfficerStatusStatistic[];
};

export class OfficerStatisticsService {
  async getStatistics(): Promise<OfficerStatistics> {
    const { reports } = await officerReportListService.getReportList();
    const byCategory = new Map<string, OfficerReportListItem[]>();
    const byStatus = new Map<IncidentStatus, OfficerReportListItem[]>();

    for (const report of reports) {
      const categoryReports = byCategory.get(report.issueType) ?? [];
      categoryReports.push(report);
      byCategory.set(report.issueType, categoryReports);

      const statusReports = byStatus.get(report.status.code) ?? [];
      statusReports.push(report);
      byStatus.set(report.status.code, statusReports);
    }

    const categories = Array.from(byCategory.entries())
      .sort(([categoryA, reportsA], [categoryB, reportsB]) => {
        const countDifference = reportsB.length - reportsA.length;
        return countDifference || categoryA.localeCompare(categoryB, "vi");
      })
      .map(([category, categoryReports], index) => ({
        code: categoryReports[0]?.id ?? category,
        category,
        incidentCount: categoryReports.length,
        independentReportCount: categoryReports.reduce(
          (total, report) => total + report.reportCount,
          0,
        ),
        percentage:
          reports.length > 0
            ? Math.round((categoryReports.length / reports.length) * 100)
            : 0,
        color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
        incidents: categoryReports,
      }));

    const statuses = Array.from(byStatus.entries())
      .map(([code, statusReports]) => ({
        code,
        label: statusReports[0].status.label,
        tone: statusReports[0].status.tone,
        incidentCount: statusReports.length,
        independentReportCount: statusReports.reduce(
          (total, report) => total + report.reportCount,
          0,
        ),
      }))
      .sort(
        (first, second) =>
          second.incidentCount - first.incidentCount ||
          first.label.localeCompare(second.label, "vi"),
      );

    return {
      totalIncidents: reports.length,
      totalIndependentReports: reports.reduce(
        (total, report) => total + report.reportCount,
        0,
      ),
      categoryCount: categories.length,
      categories,
      statuses,
    };
  }
}

export const officerStatisticsService = new OfficerStatisticsService();
