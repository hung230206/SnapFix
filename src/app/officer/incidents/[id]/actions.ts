"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  IncidentReviewError,
  officerIncidentReviewService,
} from "@/services/officer-incident-review-service";

const reviewIncidentSchema = z.object({
  incidentId: z.string().trim().min(1).max(100),
  decision: z.enum(["ACCEPT", "REJECT"]),
  rejectionReason: z.string().max(1000).optional(),
});

export async function reviewIncidentAction(input: unknown) {
  const parsed = reviewIncidentSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, message: "Thông tin xử lý không hợp lệ." };
  }

  try {
    const result = await officerIncidentReviewService.reviewIncident(parsed.data);

    revalidatePath(`/officer/incidents/${result.incidentId}`);
    revalidatePath("/officer/reports");

    return {
      ok: true as const,
      message:
        result.status === "VERIFIED"
          ? "Đã tiếp nhận phản ánh."
          : "Đã từ chối phản ánh.",
    };
  } catch (error) {
    if (error instanceof IncidentReviewError) {
      return { ok: false as const, message: error.message };
    }

    console.error("Unable to review incident", error);
    return {
      ok: false as const,
      message: "Không thể cập nhật phản ánh. Vui lòng thử lại.",
    };
  }
}
