"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  IncidentProcessingError,
  officerIncidentProcessingService,
} from "@/services/officer-incident-processing-service";

const startProcessingSchema = z.object({
  incidentId: z.string().trim().min(1).max(100),
  note: z.string().max(1000).optional(),
});

export async function startIncidentProcessingAction(input: unknown) {
  const parsed = startProcessingSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, message: "Thông tin bắt đầu xử lý không hợp lệ." };
  }

  try {
    const result = await officerIncidentProcessingService.startProcessing(parsed.data);

    revalidatePath(`/officer/incidents/${result.incidentId}`);
    revalidatePath("/officer/reports");

    return { ok: true as const, message: "Đã bắt đầu xử lý phản ánh." };
  } catch (error) {
    if (error instanceof IncidentProcessingError) {
      return { ok: false as const, message: error.message };
    }

    console.error("Unable to start incident processing", error);
    return {
      ok: false as const,
      message: "Không thể bắt đầu xử lý phản ánh. Vui lòng thử lại.",
    };
  }
}
