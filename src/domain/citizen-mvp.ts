import type { CitizenReport } from "./citizen-report";

export function demoPriority(count: number) {
  return count >= 5 ? "HIGH" : count >= 3 ? "MEDIUM" : "LOW";
}

// A transparent prototype rule, not image recognition or a danger assessment.
export function prepareSubmission(report: CitizenReport, submitted: CitizenReport[]): CitizenReport {
  const existing = submitted.find(item => item.id === report.id);
  if (existing) return existing;
  const now = new Date().toISOString();
  const { lat, lng } = report.location;
  const valid = (a: number | undefined, b: number | undefined) =>
    a !== undefined && b !== undefined && Number.isFinite(a) && Number.isFinite(b) && Math.abs(a) <= 90 && Math.abs(b) <= 180;
  const rad = (n: number) => n * Math.PI / 180;
  let nearest: CitizenReport | undefined;
  let distance = 30;
  for (const other of submitted) {
    if (!other.submission || other.category !== report.category || report.category === "Khác / không nhận diện được") continue;
    if (Date.parse(now) - Date.parse(other.submission.submittedAt) > 7 * 86400000) continue;
    const point = other.location;
    if (!valid(lat, lng) || !valid(point.lat, point.lng)) continue;
    const a = Math.sin(rad(point.lat! - lat!) / 2) ** 2 + Math.cos(rad(lat!)) * Math.cos(rad(point.lat!)) * Math.sin(rad(point.lng! - lng!) / 2) ** 2;
    const meters = 6371000 * 2 * Math.asin(Math.sqrt(Math.min(1, a)));
    if (meters <= distance) { nearest = other; distance = meters; }
  }
  const incidentId = nearest?.submission?.incidentId ?? `SF-${report.id}`;
  const reportCount = submitted.filter(item => item.submission?.incidentId === incidentId).length + 1;
  return { ...report, status: "Chờ duyệt", statusSource: "system", submission: {
    incidentId, submittedAt: now, workflowStatus: "NEW", confidence: null, classificationSource: "manual",
    reportCount, priority: demoPriority(reportCount),
    priorityReason: "Quy tắc demo theo lượt phản ánh: 1–2 thấp, 3–4 trung bình, từ 5 cao. Không đánh giá mức nguy hiểm từ ảnh.",
  } };
}

export function currentSubmission(report: CitizenReport, submitted: CitizenReport[]): CitizenReport {
  const saved = submitted.find(item => item.id === report.id);
  if (!saved?.submission) return report;
  const reportCount = submitted.filter(item => item.submission?.incidentId === saved.submission!.incidentId).length;
  return { ...saved, submission: { ...saved.submission, reportCount, priority: demoPriority(reportCount) } };
}
