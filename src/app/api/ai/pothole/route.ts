const ROBOFLOW_API_URL = "https://serverless.roboflow.com";
const ROBOFLOW_WORKSPACE = "dinh-xuan-khanh-inmqn";
const ROBOFLOW_WORKFLOW = "general-segmentation-api-3";
const POTHOLE_CLASS = "Pothole";

export const runtime = "nodejs";

type Detection = {
  class: string;
  confidence: number;
  x: number;
  y: number;
  width: number;
  height: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function roundConfidence(value: number): number {
  return Math.round(value * 1_000_000) / 1_000_000;
}

function extractDetections(value: unknown): Detection[] {
  const detections: Detection[] = [];
  const seen = new Set<string>();

  function visit(current: unknown): void {
    if (Array.isArray(current)) {
      current.forEach(visit);
      return;
    }

    if (!isRecord(current)) {
      return;
    }

    const className = current.class ?? current.class_name;
    const confidence = current.confidence;
    const x = current.x;
    const y = current.y;
    const width = current.width;
    const height = current.height;

    if (
      typeof className === "string" &&
      isFiniteNumber(confidence) &&
      isFiniteNumber(x) &&
      isFiniteNumber(y) &&
      isFiniteNumber(width) &&
      isFiniteNumber(height)
    ) {
      const detection: Detection = {
        class: className,
        confidence: roundConfidence(confidence),
        x,
        y,
        width,
        height,
      };
      const fingerprint = JSON.stringify(detection);

      if (!seen.has(fingerprint)) {
        seen.add(fingerprint);
        detections.push(detection);
      }
    }

    for (const [key, child] of Object.entries(current)) {
      if (key === "image" || key === "rle_mask") {
        continue;
      }

      visit(child);
    }
  }

  visit(value);
  return detections;
}

function errorResponse(message: string, status: number): Response {
  return Response.json({ error: message }, { status });
}

export async function POST(request: Request): Promise<Response> {
  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";
  if (!contentType.startsWith("multipart/form-data")) {
    return errorResponse("Request must use multipart/form-data.", 415);
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return errorResponse("Invalid multipart form data.", 400);
  }

  const image = formData.get("image");
  if (!(image instanceof File) || image.size === 0) {
    return errorResponse('A non-empty file field named "image" is required.', 400);
  }

  if (!image.type.toLowerCase().startsWith("image/")) {
    return errorResponse("The uploaded file must have an image MIME type.", 415);
  }

  if (image.size > 20 * 1024 * 1024) return errorResponse("Image exceeds 20 MB.", 413);

  const apiKey = process.env.ROBOFLOW_API_KEY?.trim();
  if (!apiKey) {
    return errorResponse("Pothole analysis service is not configured.", 500);
  }

  let imageBase64: string;
  try {
    imageBase64 = Buffer.from(await image.arrayBuffer()).toString("base64");
  } catch {
    return errorResponse("The uploaded image could not be read.", 400);
  }

  const workflowUrl = `${ROBOFLOW_API_URL}/${ROBOFLOW_WORKSPACE}/workflows/${ROBOFLOW_WORKFLOW}`;

  let upstreamResponse: Response;
  try {
    upstreamResponse = await fetch(workflowUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        use_cache: true,
        enable_profiling: false,
        inputs: {
          image: {
            type: "base64",
            value: imageBase64,
          },
          classes: POTHOLE_CLASS,
        },
      }),
      cache: "no-store",
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(30000)]),
    });
  } catch {
    return errorResponse("Pothole analysis service is unavailable.", 502);
  }

  if (!upstreamResponse.ok) {
    return errorResponse("Pothole analysis service request failed.", 502);
  }

  let upstreamPayload: unknown;
  try {
    upstreamPayload = await upstreamResponse.json();
  } catch {
    return errorResponse("Pothole analysis service returned an invalid response.", 502);
  }

  if (!isRecord(upstreamPayload) || !("outputs" in upstreamPayload)) {
    return errorResponse("Pothole analysis service returned an invalid response.", 502);
  }

  const detections = extractDetections(upstreamPayload.outputs);

  return Response.json({
    detection_count: detections.length,
    detections,
  });
}
