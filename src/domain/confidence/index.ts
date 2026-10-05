import { ObservationEvidence, ConfidenceLevel } from "../models";

export function calculateEvidenceConfidence(ev: Partial<ObservationEvidence>): { level: ConfidenceLevel, reasons: string[], warnings: string[] } {
  let score = 0;
  const reasons: string[] = [];
  const warnings: string[] = [];

  // Source and accuracy
  if (ev.imageSource === "LIVE_CAMERA" || ev.imageSource === "OFFLINE_CAPTURE") {
    score += 2;
    reasons.push("Chụp trực tiếp bằng ứng dụng SnapFix");
    
    if (ev.captureDeviceAccuracyMeters && ev.captureDeviceAccuracyMeters <= 30) {
      score += 4;
      reasons.push(`Vị trí thiết bị chính xác (±${Math.round(ev.captureDeviceAccuracyMeters)}m)`);
    } else if (ev.captureDeviceAccuracyMeters && ev.captureDeviceAccuracyMeters <= 100) {
      score += 3;
      reasons.push(`Vị trí thiết bị tương đối (±${Math.round(ev.captureDeviceAccuracyMeters)}m)`);
    } else {
      score += 1;
      warnings.push("Chụp trực tiếp nhưng vị trí GPS kém chính xác");
    }
  } else if (ev.imageSource === "FILE_UPLOAD") {
    score += 1;
    reasons.push("Ảnh được tải lên từ thư viện");
    
    if (ev.exifGpsAvailable) {
      score += 2;
      reasons.push("Vị trí từ metadata ảnh (EXIF)");
    } else {
      warnings.push("Ảnh không có dữ liệu định vị (EXIF GPS)");
    }
  }

  // Location consistency
  if (ev.locationConsistencyStatus === "STRONG_MATCH") {
    score += 3;
    reasons.push("Vị trí người dùng chọn khớp hoàn toàn với vị trí chụp ảnh");
  } else if (ev.locationConsistencyStatus === "ACCEPTABLE_MATCH") {
    score += 1;
    reasons.push("Vị trí người dùng chọn tương đối khớp với vị trí chụp ảnh");
  } else if (ev.locationConsistencyStatus === "MISMATCH") {
    score -= 2;
    warnings.push("Vị trí người dùng chọn KHÔNG KHỚP với vị trí trong ảnh");
  } else if (ev.locationConsistencyStatus === "INSUFFICIENT_EVIDENCE") {
    reasons.push("Vị trí được ghim thủ công (không có nguồn đối chiếu)");
  }

  // Freshness
  if (ev.imageCapturedAt) {
    const ageMs = new Date().getTime() - new Date(ev.imageCapturedAt).getTime();
    const ageHours = ageMs / (1000 * 60 * 60);
    const ageDays = ageHours / 24;
    
    if (ageHours <= 24) {
      score += 2;
      reasons.push("Ảnh mới chụp trong vòng 24 giờ");
    } else if (ageDays <= 7) {
      score += 1;
      reasons.push("Ảnh chụp trong tuần qua");
    } else {
      warnings.push(`Ảnh đã cũ (chụp ${Math.floor(ageDays)} ngày trước)`);
    }
  } else {
    warnings.push("Ảnh không có thời gian chụp (hoặc bị ẩn)");
  }

  let level: ConfidenceLevel = "LOW";
  if (score >= 8) level = "HIGH";
  else if (score >= 4) level = "MEDIUM";

  return { level, reasons, warnings };
}
