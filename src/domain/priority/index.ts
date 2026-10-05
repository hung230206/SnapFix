import { Incident, Severity } from "../models";

export function calculatePriority(
  baseSeverity: Severity,
  createdAt: string,
  independentReportCount: number
): { score: number, level: Severity, reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  // Base severity
  if (baseSeverity === "HIGH") { score += 5; reasons.push("Mức độ nghiêm trọng cao"); }
  else if (baseSeverity === "MEDIUM") { score += 3; reasons.push("Mức độ nghiêm trọng trung bình"); }
  else { score += 1; reasons.push("Mức độ nghiêm trọng thấp"); }

  // Age
  const ageMs = new Date().getTime() - new Date(createdAt).getTime();
  const ageDays = ageMs / (1000 * 60 * 60 * 24);
  
  if (ageDays >= 14) { score += 3; reasons.push("Tồn đọng quá 14 ngày"); }
  else if (ageDays >= 7) { score += 2; reasons.push("Tồn đọng quá 7 ngày"); }
  else if (ageDays >= 3) { score += 1; reasons.push("Tồn đọng quá 3 ngày"); }

  // Reports
  if (independentReportCount >= 10) { score += 3; reasons.push("Rất nhiều người báo cáo (10+)"); }
  else if (independentReportCount >= 5) { score += 2; reasons.push("Nhiều người báo cáo (5+)"); }
  else if (independentReportCount >= 3) { score += 1; reasons.push("Nhiều người báo cáo (3+)"); }

  let level: Severity = "LOW";
  if (score >= 7) level = "HIGH";
  else if (score >= 4) level = "MEDIUM";

  return { score, level, reasons };
}
