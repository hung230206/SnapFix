import type { IncidentStatus, Severity } from "@/domain/models";
import type { IncidentStatusTone } from "@/domain/incident/status";

export type OfficerReportSort = "newest" | "priority";

export type OfficerReportListItem = {
  id: string;
  publicCode: string;
  issueType: string;
  title: string;
  description?: string;
  location: string;
  submittedAt: string;
  updatedAt: string;
  thumbnailUrl?: string;
  confidence: {
    code: "LOW" | "MEDIUM" | "HIGH";
    label: string;
  };
  reportCount: number;
  status: {
    code: IncidentStatus;
    label: string;
    tone: IncidentStatusTone;
  };
  priority: {
    code: Severity;
    label: string;
    tone: IncidentStatusTone;
  };
};

export type OfficerReportListFilters = {
  query: string;
  status: IncidentStatus | "ALL";
  priority: Severity | "ALL";
  sort: OfficerReportSort;
};

const PRIORITY_WEIGHT: Record<Severity, number> = {
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLocaleLowerCase("vi-VN")
    .trim();
}

function matchesSearch(report: OfficerReportListItem, query: string): boolean {
  const normalizedQuery = normalizeSearchText(query);

  if (!normalizedQuery) {
    return true;
  }

  const searchableText = [
    report.publicCode,
    report.issueType,
    report.title,
    report.description,
    report.location,
  ]
    .filter(Boolean)
    .join(" ");

  return normalizeSearchText(searchableText).includes(normalizedQuery);
}

export function filterAndSortOfficerReports(
  reports: OfficerReportListItem[],
  filters: OfficerReportListFilters,
): OfficerReportListItem[] {
  const filteredReports = reports.filter((report) => {
    const matchesStatus = filters.status === "ALL" || report.status.code === filters.status;
    const matchesPriority =
      filters.priority === "ALL" || report.priority.code === filters.priority;

    return matchesStatus && matchesPriority && matchesSearch(report, filters.query);
  });

  return [...filteredReports].sort((first, second) => {
    if (filters.sort === "priority") {
      const priorityDifference =
        PRIORITY_WEIGHT[second.priority.code] - PRIORITY_WEIGHT[first.priority.code];

      if (priorityDifference !== 0) {
        return priorityDifference;
      }
    }

    return new Date(second.submittedAt).getTime() - new Date(first.submittedAt).getTime();
  });
}
