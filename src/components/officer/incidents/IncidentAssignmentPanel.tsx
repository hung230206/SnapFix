"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Loader2,
  UserRound,
} from "lucide-react";

import { assignIncidentAction } from "@/app/officer/incidents/[id]/assignment-actions";
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
import type { IncidentStatus } from "@/domain/models";
import type {
  OfficerIncidentAssignmentOptions,
} from "@/services/officer-incident-assignment-service";
import type { OfficerIncidentAssignmentSummary } from "@/services/officer-incident-detail-service";

const DATE_FORMATTER = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function formatDeadline(deadline: string): string {
  return DATE_FORMATTER.format(new Date(`${deadline}T00:00:00Z`));
}

export function IncidentAssignmentSummary({
  assignment,
}: {
  assignment: OfficerIncidentAssignmentSummary;
}) {
  return (
    <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div className="rounded-[10px] bg-[#F9FAFB] p-3">
        <dt className="flex items-center gap-2 text-xs text-[#6B7280]">
          <Building2 className="size-3.5 text-[#087F46]" aria-hidden="true" />
          Đội phụ trách
        </dt>
        <dd className="mt-1 text-sm font-bold text-[#111827]">{assignment.teamName}</dd>
      </div>
      <div className="rounded-[10px] bg-[#F9FAFB] p-3">
        <dt className="flex items-center gap-2 text-xs text-[#6B7280]">
          <UserRound className="size-3.5 text-[#087F46]" aria-hidden="true" />
          Người phụ trách
        </dt>
        <dd className="mt-1 text-sm font-bold text-[#111827]">
          {assignment.officerName ?? "Chưa chỉ định"}
        </dd>
      </div>
      <div className="rounded-[10px] bg-[#F9FAFB] p-3">
        <dt className="flex items-center gap-2 text-xs text-[#6B7280]">
          <CalendarDays className="size-3.5 text-[#087F46]" aria-hidden="true" />
          Hạn xử lý
        </dt>
        <dd className="mt-1 text-sm font-bold text-[#111827]">
          {assignment.deadline ? formatDeadline(assignment.deadline) : "Chưa đặt hạn"}
        </dd>
      </div>
      <div className="rounded-[10px] bg-[#F9FAFB] p-3">
        <dt className="text-xs text-[#6B7280]">Thời gian phân công</dt>
        <dd className="mt-1 text-sm font-bold text-[#111827]">
          {DATE_TIME_FORMATTER.format(new Date(assignment.assignedAt))}
        </dd>
      </div>
      {assignment.note ? (
        <div className="rounded-[10px] bg-[#F9FAFB] p-3 sm:col-span-2">
          <dt className="text-xs text-[#6B7280]">Ghi chú phân công</dt>
          <dd className="mt-1 break-words text-sm leading-6 text-[#374151]">
            {assignment.note}
          </dd>
        </div>
      ) : null}
    </dl>
  );
}

export function IncidentAssignmentPanel({
  incidentId,
  status,
  assignment,
  options,
}: {
  incidentId: string;
  status: IncidentStatus;
  assignment?: OfficerIncidentAssignmentSummary;
  options: OfficerIncidentAssignmentOptions;
}) {
  const router = useRouter();
  const submitLockRef = useRef(false);
  const [isPending, startTransition] = useTransition();
  const [teamId, setTeamId] = useState("");
  const [officerId, setOfficerId] = useState("");
  const [deadline, setDeadline] = useState("");
  const [note, setNote] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  }>();

  const availableOfficers = useMemo(
    () => options.officers.filter((officer) => officer.departmentId === teamId),
    [options.officers, teamId],
  );
  const selectedTeam = options.teams.find((team) => team.id === teamId);
  const selectedOfficer = availableOfficers.find((officer) => officer.id === officerId);
  const deadlineInvalid = Boolean(deadline && deadline < options.minimumDeadline);
  const noteWhitespaceOnly = note.length > 0 && !note.trim();
  const canSubmit = Boolean(teamId) && !deadlineInvalid && !noteWhitespaceOnly;

  if (status !== "VERIFIED" && !assignment) return null;

  function submitAssignment() {
    if (submitLockRef.current || isPending || !canSubmit) return;

    submitLockRef.current = true;
    setFeedback(undefined);

    startTransition(async () => {
      try {
        const result = await assignIncidentAction({
          incidentId,
          teamId,
          officerId: officerId || undefined,
          deadline: deadline || undefined,
          note: note.length > 0 ? note : undefined,
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
          message: "Không thể phân công phản ánh. Vui lòng thử lại.",
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
            <h2 className="text-[16px] font-bold text-[#111827]">Phân công xử lý</h2>
            <p className="mt-0.5 text-xs leading-5 text-[#6B7280]">
              {status === "VERIFIED"
                ? "Chọn đơn vị phụ trách và hạn xử lý phù hợp cho phản ánh."
                : "Thông tin phân công hiện tại của phản ánh."}
            </p>
          </div>
        </div>

        {status === "VERIFIED" ? (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="min-w-0 text-sm font-semibold text-[#374151]">
              Đội phụ trách <span className="text-red-600">*</span>
              <select
                value={teamId}
                disabled={isPending}
                aria-invalid={!teamId}
                onChange={(event) => {
                  setTeamId(event.target.value);
                  setOfficerId("");
                }}
                className="mt-2 min-h-11 w-full rounded-[10px] border border-[#D1D5DB] bg-white px-3 text-sm font-normal text-[#374151] outline-none transition focus:border-[#087F46] focus:ring-2 focus:ring-[#087F46]/15 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="">Chọn đội phụ trách</option>
                {options.teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
              {!teamId ? (
                <span className="mt-1.5 block text-xs font-normal text-red-600">
                  Vui lòng chọn đội phụ trách.
                </span>
              ) : null}
            </label>

            <label className="min-w-0 text-sm font-semibold text-[#374151]">
              Người phụ trách
              <select
                value={officerId}
                disabled={isPending || !teamId || availableOfficers.length === 0}
                onChange={(event) => setOfficerId(event.target.value)}
                className="mt-2 min-h-11 w-full rounded-[10px] border border-[#D1D5DB] bg-white px-3 text-sm font-normal text-[#374151] outline-none transition focus:border-[#087F46] focus:ring-2 focus:ring-[#087F46]/15 disabled:cursor-not-allowed disabled:bg-[#F9FAFB] disabled:opacity-70"
              >
                <option value="">
                  {teamId && availableOfficers.length === 0
                    ? "Chưa có cán bộ phù hợp"
                    : "Không chỉ định"}
                </option>
                {availableOfficers.map((officer) => (
                  <option key={officer.id} value={officer.id}>
                    {officer.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="min-w-0 text-sm font-semibold text-[#374151]">
              Hạn xử lý
              <Input
                type="date"
                value={deadline}
                min={options.minimumDeadline}
                disabled={isPending}
                aria-invalid={deadlineInvalid}
                className="mt-2 h-11 rounded-[10px]"
                onChange={(event) => setDeadline(event.target.value)}
              />
              {deadlineInvalid ? (
                <span className="mt-1.5 block text-xs font-normal text-red-600">
                  Hạn xử lý không được ở trong quá khứ.
                </span>
              ) : null}
            </label>

            <label className="min-w-0 text-sm font-semibold text-[#374151] sm:col-span-2">
              Ghi chú phân công
              <Textarea
                value={note}
                maxLength={1000}
                disabled={isPending}
                aria-invalid={noteWhitespaceOnly}
                className="mt-2 min-h-24 resize-y font-normal"
                placeholder="Thông tin cần lưu ý cho đội xử lý (không bắt buộc)"
                onChange={(event) => setNote(event.target.value)}
              />
              <span
                className={`mt-1.5 block text-xs font-normal ${
                  noteWhitespaceOnly ? "text-red-600" : "text-[#9CA3AF]"
                }`}
              >
                {noteWhitespaceOnly
                  ? "Ghi chú không được chỉ chứa khoảng trắng."
                  : `${note.length}/1000 ký tự`}
              </span>
            </label>

            <Button
              type="button"
              size="lg"
              className="h-11 bg-[#087F46] text-white hover:bg-[#06683A] sm:col-span-2 sm:justify-self-end sm:px-5"
              disabled={isPending || !canSubmit}
              onClick={() => setConfirmOpen(true)}
            >
              <ClipboardCheck aria-hidden="true" />
              Phân công xử lý
            </Button>
          </div>
        ) : assignment ? (
          <IncidentAssignmentSummary assignment={assignment} />
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
            <DialogTitle>Xác nhận phân công</DialogTitle>
            <DialogDescription>
              Phản ánh sẽ chuyển sang trạng thái “Đã phân công”.
            </DialogDescription>
          </DialogHeader>

          <dl className="space-y-2 rounded-[10px] bg-[#F9FAFB] p-3 text-sm">
            <div className="flex items-start justify-between gap-4">
              <dt className="text-[#6B7280]">Đội phụ trách</dt>
              <dd className="text-right font-semibold text-[#111827]">{selectedTeam?.name}</dd>
            </div>
            <div className="flex items-start justify-between gap-4">
              <dt className="text-[#6B7280]">Người phụ trách</dt>
              <dd className="text-right font-semibold text-[#111827]">
                {selectedOfficer?.name ?? "Không chỉ định"}
              </dd>
            </div>
            <div className="flex items-start justify-between gap-4">
              <dt className="text-[#6B7280]">Hạn xử lý</dt>
              <dd className="text-right font-semibold text-[#111827]">
                {deadline ? formatDeadline(deadline) : "Chưa đặt hạn"}
              </dd>
            </div>
          </dl>

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
              onClick={submitAssignment}
            >
              {isPending ? <Loader2 className="animate-spin" aria-hidden="true" /> : <CheckCircle2 aria-hidden="true" />}
              {isPending ? "Đang phân công..." : "Xác nhận phân công"}
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
