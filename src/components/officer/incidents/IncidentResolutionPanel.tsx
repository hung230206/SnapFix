"use client";

import Image from "next/image";
import { useRef, useState, useTransition, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Loader2,
  Send,
} from "lucide-react";

import { submitIncidentResolutionAction } from "@/app/officer/incidents/[id]/resolution-actions";
import { IncidentAssignmentSummary } from "@/components/officer/incidents/IncidentAssignmentPanel";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ResolutionImageEvidence } from "@/domain/incident/resolution";
import type { IncidentStatus } from "@/domain/models";
import {
  createResolutionImageFile,
  prepareResolutionImage,
  ResolutionImagePreparationError,
} from "@/lib/utils/resolution-image";
import type {
  OfficerIncidentAssignmentSummary,
  OfficerIncidentResolutionSummary,
} from "@/services/officer-incident-detail-service";

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function formatFileSize(sizeBytes: number): string {
  return `${Math.max(1, Math.round(sizeBytes / 1024))} KB`;
}

function ResolutionImagePreview({
  image,
  alt,
}: {
  image: ResolutionImageEvidence | OfficerIncidentResolutionSummary["image"];
  alt: string;
}) {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-[12px] bg-[#F3F4F6]">
      <Image
        src={image.dataUrl}
        alt={alt}
        fill
        unoptimized
        sizes="(min-width: 640px) 480px, calc(100vw - 64px)"
        className="object-contain"
      />
    </div>
  );
}

export function IncidentResolutionPanel({
  incidentId,
  publicCode,
  status,
  assignment,
  resolution,
}: {
  incidentId: string;
  publicCode: string;
  status: IncidentStatus;
  assignment?: OfficerIncidentAssignmentSummary;
  resolution?: OfficerIncidentResolutionSummary;
}) {
  const router = useRouter();
  const submitLockRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [isPreparingImage, setIsPreparingImage] = useState(false);
  const [resultText, setResultText] = useState("");
  const [image, setImage] = useState<ResolutionImageEvidence>();
  const [imageError, setImageError] = useState<string>();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  }>();

  if (status !== "IN_PROGRESS" && status !== "RESOLVED") return null;

  const resultWhitespaceOnly = resultText.length > 0 && !resultText.trim();
  const canSubmit = Boolean(resultText.trim() && image && !imageError && !isPreparingImage);

  async function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0];
    setImage(undefined);
    setImageError(undefined);

    if (!selectedFile) return;

    setIsPreparingImage(true);
    try {
      setImage(await prepareResolutionImage(selectedFile));
    } catch (error) {
      setImageError(
        error instanceof ResolutionImagePreparationError
          ? error.message
          : "Không thể xử lý ảnh đã chọn.",
      );
      if (fileInputRef.current) fileInputRef.current.value = "";
    } finally {
      setIsPreparingImage(false);
    }
  }

  function submitResolution() {
    if (submitLockRef.current || isPending || !canSubmit || !image) return;

    submitLockRef.current = true;
    setFeedback(undefined);

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.set("incidentId", incidentId);
        formData.set("resultText", resultText);
        formData.set("width", String(image.width));
        formData.set("height", String(image.height));
        formData.set("image", createResolutionImageFile(image));
        const result = await submitIncidentResolutionAction(formData);

        if (!result.ok) {
          setFeedback({ type: "error", message: result.message });
          return;
        }

        setConfirmOpen(false);
        setFeedback({ type: "success", message: result.message });
        router.refresh();
      } catch {
        setFeedback({
          type: "error",
          message: "Không thể gửi kết quả xử lý. Vui lòng thử lại.",
        });
      } finally {
        submitLockRef.current = false;
      }
    });
  }

  return (
    <>
      <section className="rounded-[16px] border border-[#D1FAE5] bg-white p-4 shadow-[0_2px_10px_rgba(15,23,42,0.02)] md:p-5">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#E8F7EF] text-[#087F46]">
            <ClipboardCheck className="size-[18px]" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-[16px] font-bold text-[#111827]">Kết quả xử lý</h2>
            <p className="mt-0.5 text-xs leading-5 text-[#6B7280]">
              {status === "IN_PROGRESS"
                ? "Ghi nhận nội dung và ảnh hiện trường sau khi xử lý để cán bộ kiểm tra."
                : "Kết quả đã được gửi và đang chờ cán bộ xác nhận."}
            </p>
          </div>
        </div>

        {status === "RESOLVED" && assignment ? (
          <IncidentAssignmentSummary assignment={assignment} />
        ) : null}

        {status === "IN_PROGRESS" ? (
          <div className="mt-4 border-t border-[#E5E7EB] pt-4">
            <label className="text-sm font-semibold text-[#374151]">
              Nội dung kết quả <span className="text-red-600">*</span>
              <Textarea
                value={resultText}
                maxLength={3000}
                disabled={isPending}
                aria-invalid={resultWhitespaceOnly}
                className="mt-2 min-h-28 resize-y font-normal"
                placeholder="Mô tả công việc đã thực hiện và tình trạng hiện trường sau xử lý."
                onChange={(event) => setResultText(event.target.value)}
              />
              <span
                className={`mt-1.5 block text-xs font-normal ${
                  resultWhitespaceOnly ? "text-red-600" : "text-[#9CA3AF]"
                }`}
              >
                {resultWhitespaceOnly
                  ? "Nội dung không được chỉ chứa khoảng trắng."
                  : `Bắt buộc · ${resultText.length}/3000 ký tự`}
              </span>
            </label>

            <div className="mt-4">
              <p className="text-sm font-semibold text-[#374151]">
                Ảnh sau xử lý <span className="text-red-600">*</span>
              </p>
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={isPending || isPreparingImage}
                aria-invalid={Boolean(imageError)}
                className="mt-2 h-11 cursor-pointer rounded-[10px] file:mr-3 file:text-[#087F46]"
                onChange={handleImageChange}
              />
              <p className="mt-1.5 text-xs leading-5 text-[#9CA3AF]">
                JPEG, PNG hoặc WebP · tối đa 8 MB; ảnh được tối ưu trong trình duyệt.
              </p>

              {isPreparingImage ? (
                <p className="mt-3 flex items-center gap-2 text-xs font-semibold text-[#087F46]">
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Đang tối ưu ảnh...
                </p>
              ) : null}

              {imageError ? (
                <p role="alert" className="mt-2 text-xs font-semibold text-red-600">
                  {imageError}
                </p>
              ) : null}

              {image ? (
                <div className="mt-3 rounded-[12px] border border-[#E5E7EB] p-2">
                  <ResolutionImagePreview
                    image={image}
                    alt={`Ảnh sau xử lý của phản ánh ${publicCode}`}
                  />
                  <p className="mt-2 break-all px-1 text-xs text-[#6B7280]">
                    {image.fileName} · {formatFileSize(image.sizeBytes)}
                  </p>
                </div>
              ) : null}
            </div>

            <Button
              type="button"
              size="lg"
              className="mt-4 h-11 w-full bg-[#087F46] text-white hover:bg-[#06683A] sm:ml-auto sm:flex sm:w-fit sm:px-5"
              disabled={isPending || !canSubmit}
              onClick={() => setConfirmOpen(true)}
            >
              <Send aria-hidden="true" />
              Gửi kết quả xử lý
            </Button>
          </div>
        ) : resolution ? (
          <div className="mt-4 border-t border-[#E5E7EB] pt-4">
            <div className="rounded-[10px] border border-blue-200 bg-blue-50 p-3">
              <p className="flex items-center gap-2 text-sm font-bold text-blue-800">
                <CheckCircle2 className="size-4" aria-hidden="true" />
                Chờ xác nhận
              </p>
              <p className="mt-2 flex items-center gap-2 text-xs text-blue-900">
                <Clock3 className="size-3.5 shrink-0" aria-hidden="true" />
                Gửi lúc {DATE_TIME_FORMATTER.format(new Date(resolution.submittedAt))}
              </p>
            </div>
            <div className="mt-3 rounded-[10px] bg-[#F9FAFB] p-3">
              <p className="text-xs font-semibold text-[#6B7280]">Nội dung kết quả</p>
              <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-[#374151]">
                {resolution.resultText}
              </p>
            </div>
            <div className="mt-3 rounded-[12px] border border-[#E5E7EB] p-2">
              <ResolutionImagePreview
                image={resolution.image}
                alt={`Ảnh sau xử lý của phản ánh ${publicCode}`}
              />
              <p className="mt-2 break-all px-1 text-xs text-[#6B7280]">
                {resolution.image.fileName} · {formatFileSize(resolution.image.sizeBytes)}
              </p>
            </div>
          </div>
        ) : (
          <p className="mt-4 rounded-[10px] border border-dashed border-[#D1D5DB] p-3 text-sm text-[#6B7280]">
            Phản ánh đang chờ xác nhận nhưng phiên dữ liệu này chưa có bằng chứng kết quả.
          </p>
        )}
      </section>

      <Dialog
        open={confirmOpen}
        onOpenChange={(open) => {
          if (!isPending) setConfirmOpen(open);
        }}
      >
        <DialogContent showCloseButton={false} className="max-w-[calc(100%-2rem)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận gửi kết quả</DialogTitle>
            <DialogDescription>
              Xác nhận đã hoàn tất xử lý và gửi kết quả để kiểm tra?
            </DialogDescription>
          </DialogHeader>

          {image ? (
            <div className="max-h-[45vh] overflow-y-auto rounded-[12px] bg-[#F9FAFB] p-3">
              <ResolutionImagePreview
                image={image}
                alt={`Ảnh xem trước kết quả của phản ánh ${publicCode}`}
              />
              <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-[#374151]">
                {resultText.trim()}
              </p>
            </div>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="h-11"
              disabled={isPending}
              onClick={() => setConfirmOpen(false)}
            >
              Quay lại
            </Button>
            <Button
              type="button"
              className="h-11 bg-[#087F46] text-white hover:bg-[#06683A]"
              disabled={isPending || !canSubmit}
              onClick={submitResolution}
            >
              {isPending ? (
                <Loader2 className="animate-spin" aria-hidden="true" />
              ) : (
                <CheckCircle2 aria-hidden="true" />
              )}
              {isPending ? "Đang gửi..." : "Xác nhận gửi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {feedback ? (
        <div
          role={feedback.type === "error" ? "alert" : "status"}
          className={`fixed inset-x-4 bottom-4 z-[70] rounded-[12px] border px-4 py-3 text-sm font-semibold shadow-lg sm:left-auto sm:right-5 sm:max-w-sm ${
            feedback.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {feedback.message}
        </div>
      ) : null}
    </>
  );
}
