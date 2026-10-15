"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  IncidentCompletionError,
  officerIncidentCompletionService,
} from "@/services/officer-incident-completion-service";

const confirmCompletionSchema = z.object({
  incidentId: z.string().trim().min(1).max(100),
});

export async function confirmIncidentCompletionAction(input: unknown) {
  const parsed = confirmCompletionSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, message: "Thông tin xác nhận hoàn thành không hợp lệ." };
  }

  try {
    const result = await officerIncidentCompletionService.confirmCompletion(parsed.data);

    revalidatePath(`/officer/incidents/${result.incidentId}`);
    revalidatePath("/officer/reports");

    return { ok: true as const, message: "Đã xác nhận hoàn thành phản ánh." };
  } catch (error) {
    if (error instanceof IncidentCompletionError) {
      return { ok: false as const, message: error.message };
    }

    console.error("Unable to confirm incident completion", error);
    return {
      ok: false as const,
      message: "Không thể xác nhận hoàn thành phản ánh. Vui lòng thử lại.",
    };
  }
}
