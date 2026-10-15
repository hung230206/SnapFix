"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { MAX_RESOLUTION_STORED_IMAGE_BYTES } from "@/domain/incident/resolution";
import {
  IncidentResolutionError,
  officerIncidentResolutionService,
} from "@/services/officer-incident-resolution-service";

const submitResolutionSchema = z.object({
  incidentId: z.string().trim().min(1).max(100),
  resultText: z.string().max(3000),
  width: z.coerce.number().int().positive().max(10_000),
  height: z.coerce.number().int().positive().max(10_000),
});

const imageMimeTypeSchema = z.enum(["image/jpeg", "image/png", "image/webp"]);

export async function submitIncidentResolutionAction(formData: FormData) {
  const imageFile = formData.get("image");
  const parsed = submitResolutionSchema.safeParse({
    incidentId: formData.get("incidentId"),
    resultText: formData.get("resultText"),
    width: formData.get("width"),
    height: formData.get("height"),
  });
  const parsedMimeType =
    imageFile instanceof File ? imageMimeTypeSchema.safeParse(imageFile.type) : null;

  if (!parsed.success) {
    return { ok: false as const, message: "Thông tin kết quả xử lý không hợp lệ." };
  }
  if (
    !(imageFile instanceof File) ||
    !parsedMimeType?.success ||
    imageFile.name.length > 255 ||
    imageFile.size < 1 ||
    imageFile.size > MAX_RESOLUTION_STORED_IMAGE_BYTES
  ) {
    return { ok: false as const, message: "Ảnh sau xử lý không hợp lệ." };
  }

  try {
    const imageBytes = Buffer.from(await imageFile.arrayBuffer());
    const result = await officerIncidentResolutionService.submitResolution({
      incidentId: parsed.data.incidentId,
      resultText: parsed.data.resultText,
      image: {
        fileName: imageFile.name,
        mimeType: parsedMimeType.data,
        sizeBytes: imageBytes.length,
        width: parsed.data.width,
        height: parsed.data.height,
        dataUrl: `data:${parsedMimeType.data};base64,${imageBytes.toString("base64")}`,
      },
    });

    revalidatePath(`/officer/incidents/${result.incidentId}`);
    revalidatePath("/officer/reports");

    return { ok: true as const, message: "Đã gửi kết quả xử lý để kiểm tra." };
  } catch (error) {
    if (error instanceof IncidentResolutionError) {
      return { ok: false as const, message: error.message };
    }

    console.error("Unable to submit incident resolution", error);
    return {
      ok: false as const,
      message: "Không thể gửi kết quả xử lý. Vui lòng thử lại.",
    };
  }
}
