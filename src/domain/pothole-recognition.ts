export type PotholeRecognition = {
  status: "detected" | "uncertain" | "not_detected" | "unavailable";
  confidence: number | null;
  count: number;
  message: string;
};

export const POTHOLE_CATEGORY = "Ổ gà, hư mặt đường";
export const POTHOLE_THRESHOLD = 0.5;

export function parsePotholeRecognition(payload: unknown): PotholeRecognition {
  if (!payload || typeof payload !== "object" || !("detections" in payload) || !Array.isArray(payload.detections)) throw new Error("Invalid AI response");
  const matches = payload.detections.filter((item: unknown) => {
    if (!item || typeof item !== "object") return false;
    const detection = item as Record<string, unknown>;
    return typeof detection.class === "string" && detection.class.toLowerCase() === "pothole" &&
      typeof detection.confidence === "number" && Number.isFinite(detection.confidence) && detection.confidence >= 0 && detection.confidence <= 1;
  }) as { confidence: number }[];
  if (!matches.length) return { status: "not_detected", confidence: null, count: 0, message: "AI chưa phát hiện ổ gà. Điều này không có nghĩa ảnh không có sự cố. Hãy chọn loại sự cố bạn quan sát được." };
  const confidence = Math.max(...matches.map(item => item.confidence));
  const count = matches.filter(item => item.confidence >= POTHOLE_THRESHOLD).length;
  return { status: count ? "detected" : "uncertain", confidence, count,
    message: count ? `AI phát hiện ${count} vùng có thể là ổ gà. Hãy kiểm tra và xác nhận loại sự cố.` : "Kết quả nhận diện ổ gà chưa đủ chắc chắn. Hãy tự chọn loại sự cố phù hợp." };
}

export function classificationFor(category: string, recognition?: PotholeRecognition) {
  const accepted = recognition?.status === "detected" && category === POTHOLE_CATEGORY;
  return { classificationSource: accepted ? "ai_confirmed" as const : "manual" as const, confidence: accepted ? recognition.confidence : null };
}
