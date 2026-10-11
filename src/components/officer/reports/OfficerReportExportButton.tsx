"use client";

import { Download } from "lucide-react";

export type OfficerExportRow = {
  group: string;
  label: string;
  count: number;
};

function escapeCsvValue(value: string | number): string {
  const text = String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

export function OfficerReportExportButton({
  rows,
}: {
  rows: OfficerExportRow[];
}) {
  function exportCsv() {
    const csvRows = [
      ["Nhóm thống kê", "Nội dung", "Số lượng"],
      ...rows.map((row) => [row.group, row.label, row.count]),
    ];
    const csv = `\uFEFF${csvRows
      .map((row) => row.map(escapeCsvValue).join(","))
      .join("\r\n")}`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `snapfix-officer-report-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={exportCsv}
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[12px] bg-[#087F46] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#056638] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F46] focus-visible:ring-offset-2"
    >
      <Download className="size-4" aria-hidden="true" />
      Xuất CSV
    </button>
  );
}
