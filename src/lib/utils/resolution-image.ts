import {
  isResolutionImageMimeType,
  MAX_RESOLUTION_IMAGE_DIMENSION,
  MAX_RESOLUTION_SOURCE_IMAGE_BYTES,
  MAX_RESOLUTION_STORED_IMAGE_BYTES,
  type ResolutionImageEvidence,
} from "@/domain/incident/resolution";

export class ResolutionImagePreparationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ResolutionImagePreparationError";
  }
}

function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new ResolutionImagePreparationError("Không thể đọc ảnh đã chọn."));
    image.src = source;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new ResolutionImagePreparationError("Không thể xử lý ảnh đã chọn."));
      },
      "image/jpeg",
      quality,
    );
  });
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new ResolutionImagePreparationError("Không thể đọc ảnh đã xử lý."));
    reader.readAsDataURL(blob);
  });
}

export async function prepareResolutionImage(
  file: File,
): Promise<ResolutionImageEvidence> {
  if (!isResolutionImageMimeType(file.type)) {
    throw new ResolutionImagePreparationError(
      "Chỉ chấp nhận ảnh JPEG, PNG hoặc WebP.",
    );
  }

  if (file.size > MAX_RESOLUTION_SOURCE_IMAGE_BYTES) {
    throw new ResolutionImagePreparationError("Ảnh gốc không được vượt quá 8 MB.");
  }

  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await loadImage(objectUrl);
    const scale = Math.min(
      1,
      MAX_RESOLUTION_IMAGE_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight),
    );
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) {
      throw new ResolutionImagePreparationError("Trình duyệt không hỗ trợ xử lý ảnh.");
    }

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);

    let processedBlob: Blob | undefined;
    for (const quality of [0.82, 0.72, 0.62, 0.52, 0.42]) {
      const candidate = await canvasToBlob(canvas, quality);
      processedBlob = candidate;
      if (candidate.size <= MAX_RESOLUTION_STORED_IMAGE_BYTES) break;
    }

    if (!processedBlob || processedBlob.size > MAX_RESOLUTION_STORED_IMAGE_BYTES) {
      throw new ResolutionImagePreparationError(
        "Ảnh quá phức tạp để tối ưu cho bản thử nghiệm. Vui lòng chọn ảnh khác.",
      );
    }

    return {
      fileName: file.name.replace(/\.[^.]+$/, "") + ".jpg",
      mimeType: "image/jpeg",
      sizeBytes: processedBlob.size,
      width,
      height,
      dataUrl: await blobToDataUrl(processedBlob),
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export function createResolutionImageFile(image: ResolutionImageEvidence): File {
  const encoded = image.dataUrl.slice(image.dataUrl.indexOf(",") + 1);
  const binary = window.atob(encoded);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return new File([bytes], image.fileName, { type: image.mimeType });
}
