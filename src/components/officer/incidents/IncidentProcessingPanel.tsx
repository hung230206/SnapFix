"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Activity, CheckCircle2, Clock3, Loader2, PlayCircle } from "lucide-react";

import { startIncidentProcessingAction } from "@/app/officer/incidents/[id]/processing-actions";
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
import { Textarea } from "@/components/ui/textarea";
import type { IncidentStatus } from "@/domain/models";
import type {
  OfficerIncidentAssignmentSummary,
  OfficerIncidentProcessingSummary,
} from "@/services/officer-incident-detail-service";

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function IncidentProcessingPanel({
  incidentId,
  status,
  assignment,
  processing,
}: {
  incidentId: string;
  status: IncidentStatus;
  assignment?: OfficerIncidentAssignmentSummary;
  processing?: OfficerIncidentProcessingSummary;
}) {
  const router = useRouter();
  const submitLockRef = useRef(false);
  const [isPending, startTransition] = useTransition();
  const [note, setNote] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  }>();

  if (status !== "ASSIGNED" && status !== "IN_PROGRESS") return null;

  function submitStartProcessing() {
    if (submitLockRef.current || isPending) return;

    submitLockRef.current = true;
    setFeedback(undefined);

    startTransition(async () => {
      try {
        const result = await startIncidentProcessingAction({
          incidentId,
          note: note.trim() || undefined,
        });

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
          message: "Không thể bắt đầu xử lý phản ánh. Vui lòng thử lại.",
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
            <Activity className="size-[18px]" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-[16px] font-bold text-[#111827]">Tiến độ xử lý</h2>
            <p className="mt-0.5 text-xs leading-5 text-[#6B7280]">
              {status === "ASSIGNED"
                ? "Xác nhận khi đội phụ trách bắt đầu triển khai xử lý."
                : "Phản ánh đang được đội phụ trách xử lý."}
            </p>
          </div>
        </div>

        {assignment ? (
          <IncidentAssignmentSummary assignment={assignment} />
        ) : (
          <p className="mt-4 rounded-[10px] border border-dashed border-[#D1D5DB] p-3 text-sm text-[#6B7280]">
            Chưa có thông tin phân công trong dữ liệu hiện tại.
          </p>
        )}

        {status === "ASSIGNED" ? (
          <div className="mt-4 border-t border-[#E5E7EB] pt-4">
            <label className="text-sm font-semibold text-[#374151]">
              Ghi chú bắt đầu xử lý
              <Textarea
                value={note}
                maxLength={1000}
                disabled={isPending}
                className="mt-2 min-h-24 resize-y font-normal"
                placeholder="Ví dụ: Đội đã tiếp cận hiện trường và bắt đầu xử lý."
                onChange={(event) => setNote(event.target.value)}
              />
              <span className="mt-1.5 block text-xs font-normal text-[#9CA3AF]">
                Không bắt buộc · {note.length}/1000 ký tự
              </span>
            </label>

            <Button
              type="button"
              size="lg"
              className="mt-4 h-11 w-full bg-[#087F46] text-white hover:bg-[#06683A] sm:ml-auto sm:flex sm:w-fit sm:px-5"
              disabled={isPending}
              onClick={() => setConfirmOpen(true)}
            >
              <PlayCircle aria-hidden="true" />
              Bắt đầu xử lý
            </Button>
          </div>
        ) : (
          <div className="mt-4 rounded-[10px] border border-amber-200 bg-amber-50 p-3">
            <p className="flex items-center gap-2 text-sm font-bold text-amber-800">
              <Activity className="size-4" aria-hidden="true" />
              Đang xử lý
            </p>
            <div className="mt-2 flex items-start gap-2 text-xs leading-5 text-amber-900">
              <Clock3 className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
              <p>
                {processing
                  ? `Bắt đầu lúc ${DATE_TIME_FORMATTER.format(new Date(processing.startedAt))}`
                  : "Dữ liệu hiện có chưa ghi nhận thời gian bắt đầu xử lý."}
              </p>
            </div>
            {processing?.note ? (
              <p className="mt-2 break-words border-t border-amber-200 pt-2 text-xs leading-5 text-amber-900">
                {processing.note}
              </p>
            ) : null}
          </div>
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
            <DialogTitle>Xác nhận bắt đầu xử lý</DialogTitle>
            <DialogDescription>
              Xác nhận bắt đầu xử lý phản ánh này? Trạng thái sẽ chuyển sang “Đang xử lý”.
            </DialogDescription>
          </DialogHeader>

          {note.trim() ? (
            <div className="rounded-[10px] bg-[#F9FAFB] p-3 text-sm leading-6 text-[#374151]">
              <p className="text-xs font-semibold text-[#6B7280]">Ghi chú</p>
              <p className="mt-1 break-words">{note.trim()}</p>
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
              disabled={isPending}
              onClick={submitStartProcessing}
            >
              {isPending ? <Loader2 className="animate-spin" aria-hidden="true" /> : <CheckCircle2 aria-hidden="true" />}
              {isPending ? "Đang cập nhật..." : "Xác nhận bắt đầu"}
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
