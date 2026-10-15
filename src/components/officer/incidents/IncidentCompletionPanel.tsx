"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  ImageIcon,
  Loader2,
  ShieldCheck,
} from "lucide-react";

import { confirmIncidentCompletionAction } from "@/app/officer/incidents/[id]/completion-actions";
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
import type { IncidentStatus } from "@/domain/models";
import type {
  OfficerIncidentAssignmentSummary,
  OfficerIncidentCompletionSummary,
  OfficerIncidentProcessingSummary,
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

export function IncidentCompletionPanel({
  incidentId,
  publicCode,
  status,
  assignment,
  processing,
  resolution,
  completion,
}: {
  incidentId: string;
  publicCode: string;
  status: IncidentStatus;
  assignment?: OfficerIncidentAssignmentSummary;
  processing?: OfficerIncidentProcessingSummary;
  resolution?: OfficerIncidentResolutionSummary;
  completion?: OfficerIncidentCompletionSummary;
}) {
  const router = useRouter();
  const submitLockRef = useRef(false);
  const [isPending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  }>();

  if (status !== "RESOLVED" && status !== "CLOSED") return null;

  function submitCompletion() {
    if (submitLockRef.current || isPending || !resolution) return;

    submitLockRef.current = true;
    setFeedback(undefined);

    startTransition(async () => {
      try {
        const result = await confirmIncidentCompletionAction({ incidentId });

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
          message: "Không thể xác nhận hoàn thành phản ánh. Vui lòng thử lại.",
        });
      } finally {
        submitLockRef.current = false;
      }
    });
  }

  return (
    <>
      <section className="min-w-0 rounded-[16px] border border-[#D1FAE5] bg-white p-4 shadow-[0_2px_10px_rgba(15,23,42,0.02)] md:p-5">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#E8F7EF] text-[#087F46]">
            <ClipboardCheck className="size-[18px]" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-[16px] font-bold text-[#111827]">
              Xác nhận kết quả xử lý
            </h2>
            <p className="mt-0.5 text-xs leading-5 text-[#6B7280]">
              {status === "RESOLVED"
                ? "Kiểm tra kết quả và bằng chứng trước khi đóng phản ánh."
                : "Kết quả xử lý đã được cán bộ xác nhận."}
            </p>
          </div>
        </div>

        {status === "CLOSED" ? (
          <div className="mt-4 rounded-[10px] border border-emerald-200 bg-emerald-50 p-3">
            <p className="flex items-center gap-2 text-sm font-bold text-emerald-800">
              <ShieldCheck className="size-4" aria-hidden="true" />
              Đã hoàn thành
            </p>
            <p className="mt-2 flex items-center gap-2 text-xs text-emerald-900">
              <Clock3 className="size-3.5 shrink-0" aria-hidden="true" />
              {completion
                ? `Xác nhận lúc ${DATE_TIME_FORMATTER.format(new Date(completion.confirmedAt))}`
                : "Dữ liệu hiện có chưa ghi nhận thời gian xác nhận."}
            </p>
          </div>
        ) : null}

        {assignment ? (
          <IncidentAssignmentSummary assignment={assignment} />
        ) : (
          <p className="mt-4 rounded-[10px] border border-dashed border-[#D1D5DB] p-3 text-sm text-[#6B7280]">
            Chưa có thông tin đội hoặc người phụ trách trong dữ liệu hiện tại.
          </p>
        )}

        <dl className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-[10px] bg-[#F9FAFB] p-3">
            <dt className="text-xs text-[#6B7280]">Bắt đầu xử lý</dt>
            <dd className="mt-1 text-sm font-bold text-[#111827]">
              {processing
                ? DATE_TIME_FORMATTER.format(new Date(processing.startedAt))
                : "Chưa có dữ liệu"}
            </dd>
          </div>
          <div className="rounded-[10px] bg-[#F9FAFB] p-3">
            <dt className="text-xs text-[#6B7280]">Gửi kết quả</dt>
            <dd className="mt-1 text-sm font-bold text-[#111827]">
              {resolution
                ? DATE_TIME_FORMATTER.format(new Date(resolution.submittedAt))
                : "Chưa có dữ liệu"}
            </dd>
          </div>
        </dl>

        {resolution ? (
          <div className="mt-4 border-t border-[#E5E7EB] pt-4">
            <div className="rounded-[10px] bg-[#F9FAFB] p-3">
              <p className="text-xs font-semibold text-[#6B7280]">Kết quả xử lý</p>
              <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-[#374151]">
                {resolution.resultText}
              </p>
            </div>
            <div className="mt-3 min-w-0 rounded-[12px] border border-[#E5E7EB] p-2">
              <div className="relative aspect-video w-full overflow-hidden rounded-[10px] bg-[#F3F4F6]">
                <Image
                  src={resolution.image.dataUrl}
                  alt={`Ảnh sau xử lý của phản ánh ${publicCode}`}
                  fill
                  unoptimized
                  sizes="(min-width: 640px) 480px, calc(100vw - 64px)"
                  className="object-contain"
                />
              </div>
              <p className="mt-2 break-all px-1 text-xs text-[#6B7280]">
                {resolution.image.fileName} · {formatFileSize(resolution.image.sizeBytes)}
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-4 flex items-start gap-2 rounded-[10px] border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            <ImageIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            Chưa có kết quả và ảnh sau xử lý để xác nhận.
          </div>
        )}

        {status === "RESOLVED" ? (
          <Button
            type="button"
            size="lg"
            className="mt-4 h-11 w-full bg-[#087F46] text-white hover:bg-[#06683A] sm:ml-auto sm:flex sm:w-fit sm:px-5"
            disabled={isPending || !resolution}
            onClick={() => setConfirmOpen(true)}
          >
            <CheckCircle2 aria-hidden="true" />
            Xác nhận hoàn thành
          </Button>
        ) : null}
      </section>

      <Dialog
        open={confirmOpen}
        onOpenChange={(open) => {
          if (!isPending) setConfirmOpen(open);
        }}
      >
        <DialogContent showCloseButton={false} className="max-w-[calc(100%-2rem)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận hoàn thành</DialogTitle>
            <DialogDescription>
              Xác nhận kết quả xử lý và đóng phản ánh này?
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-[10px] bg-[#F9FAFB] p-3 text-sm leading-6 text-[#374151]">
            Sau khi xác nhận, phản ánh sẽ chuyển sang trạng thái “Đã hoàn thành” và không còn
            action xử lý tiếp.
          </div>

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
              disabled={isPending || !resolution}
              onClick={submitCompletion}
            >
              {isPending ? (
                <Loader2 className="animate-spin" aria-hidden="true" />
              ) : (
                <CheckCircle2 aria-hidden="true" />
              )}
              {isPending ? "Đang xác nhận..." : "Xác nhận hoàn thành"}
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
