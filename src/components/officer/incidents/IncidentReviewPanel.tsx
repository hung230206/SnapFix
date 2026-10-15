"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, CircleCheck, Info, Loader2, XCircle } from "lucide-react";

import { reviewIncidentAction } from "@/app/officer/incidents/[id]/actions";
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

type ReviewFeedback = {
  type: "success" | "error";
  message: string;
};

export function IncidentReviewPanel({
  incidentId,
  status,
}: {
  incidentId: string;
  status: IncidentStatus;
}) {
  const router = useRouter();
  const submitLockRef = useRef(false);
  const [isPending, startTransition] = useTransition();
  const [acceptOpen, setAcceptOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [feedback, setFeedback] = useState<ReviewFeedback>();

  const trimmedReason = rejectionReason.trim();

  function submitReview(decision: "ACCEPT" | "REJECT") {
    if (submitLockRef.current || isPending) return;

    if (decision === "REJECT" && !trimmedReason) {
      setFeedback({ type: "error", message: "Vui lòng nhập lý do từ chối phản ánh." });
      return;
    }

    submitLockRef.current = true;
    setFeedback(undefined);

    startTransition(async () => {
      try {
        const result = await reviewIncidentAction({
          incidentId,
          decision,
          rejectionReason: decision === "REJECT" ? trimmedReason : undefined,
        });

        if (!result.ok) {
          setFeedback({ type: "error", message: result.message });
          return;
        }

        setAcceptOpen(false);
        setRejectOpen(false);
        setRejectionReason("");
        setFeedback({ type: "success", message: result.message });
        router.refresh();
      } catch {
        setFeedback({
          type: "error",
          message: "Không thể cập nhật phản ánh. Vui lòng thử lại.",
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
            <CircleCheck className="size-[18px]" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-[16px] font-bold text-[#111827]">Xử lý phản ánh</h2>
            <p className="mt-0.5 text-xs leading-5 text-[#6B7280]">
              AI chỉ cung cấp thông tin tham khảo. Cán bộ là người quyết định tiếp nhận hoặc từ chối.
            </p>
          </div>
        </div>

        {status === "NEW" ? (
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Button
              type="button"
              size="lg"
              className="h-11 bg-[#087F46] text-white hover:bg-[#06683A]"
              disabled={isPending}
              onClick={() => setAcceptOpen(true)}
            >
              <CheckCircle2 aria-hidden="true" />
              Tiếp nhận
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="lg"
              className="h-11 border border-red-200"
              disabled={isPending}
              onClick={() => setRejectOpen(true)}
            >
              <XCircle aria-hidden="true" />
              Từ chối
            </Button>
          </div>
        ) : (
          <div className="mt-4 flex items-start gap-2 rounded-[10px] bg-[#F9FAFB] p-3 text-sm leading-6 text-[#6B7280]">
            <Info className="mt-1 size-4 shrink-0 text-[#087F46]" aria-hidden="true" />
            <p>Phản ánh này đã được xử lý ở bước tiếp nhận.</p>
          </div>
        )}
      </section>

      <Dialog
        open={acceptOpen}
        onOpenChange={(open) => {
          if (!isPending) setAcceptOpen(open);
        }}
      >
        <DialogContent showCloseButton={false} className="max-w-[calc(100%-2rem)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận tiếp nhận</DialogTitle>
            <DialogDescription>
              Xác nhận tiếp nhận phản ánh này? Trạng thái sẽ chuyển sang “Đã tiếp nhận”.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="h-10"
              disabled={isPending}
              onClick={() => setAcceptOpen(false)}
            >
              Quay lại
            </Button>
            <Button
              type="button"
              className="h-10 bg-[#087F46] text-white hover:bg-[#06683A]"
              disabled={isPending}
              onClick={() => submitReview("ACCEPT")}
            >
              {isPending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
              {isPending ? "Đang xử lý..." : "Xác nhận tiếp nhận"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={rejectOpen}
        onOpenChange={(open) => {
          if (!isPending) setRejectOpen(open);
        }}
      >
        <DialogContent showCloseButton={false} className="max-w-[calc(100%-2rem)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Từ chối phản ánh</DialogTitle>
            <DialogDescription>
              Nhập lý do để người gửi biết vì sao phản ánh chưa được tiếp nhận.
            </DialogDescription>
          </DialogHeader>

          <div>
            <label htmlFor="officer-rejection-reason" className="text-sm font-semibold text-[#374151]">
              Lý do từ chối <span className="text-red-600">*</span>
            </label>
            <Textarea
              id="officer-rejection-reason"
              className="mt-2 min-h-28 resize-y"
              value={rejectionReason}
              maxLength={1000}
              disabled={isPending}
              aria-invalid={rejectionReason.length > 0 && !trimmedReason}
              placeholder="Ví dụ: Hình ảnh hoặc vị trí chưa đủ để xác minh sự cố..."
              onChange={(event) => setRejectionReason(event.target.value)}
            />
            <div className="mt-1.5 flex items-start justify-between gap-3 text-xs">
              <span className={!trimmedReason ? "text-red-600" : "text-[#6B7280]"}>
                {!trimmedReason ? "Vui lòng nhập lý do hợp lệ." : "Lý do sẽ được lưu trong lịch sử."}
              </span>
              <span className="shrink-0 text-[#9CA3AF]">{rejectionReason.length}/1000</span>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="h-10"
              disabled={isPending}
              onClick={() => setRejectOpen(false)}
            >
              Quay lại
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="h-10"
              disabled={isPending || !trimmedReason}
              onClick={() => submitReview("REJECT")}
            >
              {isPending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
              {isPending ? "Đang xử lý..." : "Xác nhận từ chối"}
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
