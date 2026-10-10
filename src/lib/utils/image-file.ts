export const MAX_IMAGE_BYTES = 20 * 1024 * 1024;

// Mobile file providers can omit the MIME type or return application/octet-stream.
// Inspect the file bytes rather than rejecting a photo based on that metadata.
export async function prepareImageFile(file: File): Promise<File> {
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error(`Ảnh có dung lượng ${(file.size / 1024 / 1024).toFixed(1)} MB. Vui lòng chọn ảnh tối đa 20 MB.`);
  }
  if (!file.size) throw new Error("Tệp ảnh trống. Vui lòng chọn lại ảnh.");

  const bytes = new Uint8Array(await file.slice(0, 32).arrayBuffer());
  const starts = (...signature: number[]) => signature.every((value, index) => bytes[index] === value);
  const text = (start: number, end: number) => String.fromCharCode(...bytes.slice(start, end));
  let mime = "";
  if (starts(0xff, 0xd8, 0xff)) mime = "image/jpeg";
  else if (starts(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) mime = "image/png";
  else if (["GIF87a", "GIF89a"].includes(text(0, 6))) mime = "image/gif";
  else if (text(0, 4) === "RIFF" && text(8, 12) === "WEBP") mime = "image/webp";
  else if (text(0, 2) === "BM") mime = "image/bmp";
  else if (text(4, 8) === "ftyp") {
    const brands = [text(8, 12), text(16, 20), text(20, 24), text(24, 28), text(28, 32)];
    if (brands.some(brand => ["avif", "avis"].includes(brand))) mime = "image/avif";
    else if (brands.some(brand => ["heic", "heix", "hevc", "hevx"].includes(brand))) mime = "image/heic";
    else if (brands.some(brand => ["mif1", "msf1"].includes(brand))) mime = "image/heif";
  }
  if (!mime && file.type.startsWith("image/")) mime = file.type;
  if (!mime && /\.(heic|heif)$/i.test(file.name)) mime = "image/heic";
  if (!mime) throw new Error("Không nhận diện được định dạng ảnh. Vui lòng chọn ảnh JPG, PNG, WebP hoặc xuất ảnh từ thư viện rồi thử lại.");
  return mime === file.type ? file : new File([file], file.name, { type: mime, lastModified: file.lastModified });
}

export function isHeicFile(file: File) {
  // Trust a recognized JPEG/PNG/etc. signature even if an export kept its old name.
  if (/^image\/(jpeg|png|webp|gif|bmp|avif)$/i.test(file.type)) return false;
  return /heic|heif/i.test(file.type) || /\.(heic|heif)$/i.test(file.name);
}

export async function toDisplayable(file: File): Promise<File> {
  if (!isHeicFile(file)) return file;
  try {
    // Browser-only and loaded on demand, so SSR and ordinary JPEG uploads stay light.
    const { default: heic2any } = await import("heic2any");
    const output = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.85 });
    const blob = Array.isArray(output) ? output[0] : output;
    if (!blob?.size) throw new Error("Empty conversion result");
    const name = file.name.replace(/\.[^.]+$/, "") || "photo";
    return new File([blob], `${name}.jpg`, { type: "image/jpeg", lastModified: file.lastModified });
  } catch {
    throw new Error("Chưa chuyển được ảnh HEIC/HEIF này sang JPEG. Hãy thử lại hoặc xuất ảnh thành JPG từ điện thoại rồi chọn lại.");
  }
}

export function imageDisplayError(mime: string) {
  return /heic|heif/i.test(mime)
    ? "Ảnh HEIC/HEIF này chưa hiển thị được trên trình duyệt đang dùng. Hãy xuất ảnh thành JPG hoặc PNG rồi chọn lại. Đây không phải lỗi dung lượng."
    : "Trình duyệt không hiển thị được ảnh này. Tệp có thể bị lỗi hoặc dùng định dạng chưa hỗ trợ; hãy thử ảnh JPG hoặc PNG.";
}
