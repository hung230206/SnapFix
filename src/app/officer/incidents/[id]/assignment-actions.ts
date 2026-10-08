"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  IncidentAssignmentError,
  officerIncidentAssignmentService,
} from "@/services/officer-incident-assignment-service";

const assignIncidentSchema = z.object({
  incidentId: z.string().trim().min(1).max(100),
  teamId: z.string().trim().min(1).max(100),
  officerId: z.string().max(100).optional(),
  deadline: z.string().max(10).optional(),
  note: z.string().max(1000).optional(),
});

export async function assignIncidentAction(input: unknown) {
  const parsed = assignIncidentSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, message: "Thông tin phân công không hợp lệ." };
  }

  try {
    const result = await officerIncidentAssignmentService.assignIncident(parsed.data);

    revalidatePath(`/officer/incidents/${result.incidentId}`);
    revalidatePath("/officer/reports");

    return { ok: true as const, message: "Đã phân công xử lý phản ánh." };
  } catch (error) {
    if (error instanceof IncidentAssignmentError) {
      return { ok: false as const, message: error.message };
    }

    console.error("Unable to assign incident", error);
    return {
      ok: false as const,
      message: "Không thể phân công phản ánh. Vui lòng thử lại.",
    };
  }
}
