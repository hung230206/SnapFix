import Image from "next/image";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  Bot,
  Camera,
  Clock3,
  FileText,
  ImageIcon,
  Info,
  MapPin,
  Sparkles,
  UsersRound,
} from "lucide-react";

import { IncidentLocationMap } from "@/components/officer/incidents/IncidentLocationMap";
import { IncidentAssignmentPanel } from "@/components/officer/incidents/IncidentAssignmentPanel";
import { IncidentReviewPanel } from "@/components/officer/incidents/IncidentReviewPanel";
import { IncidentProcessingPanel } from "@/components/officer/incidents/IncidentProcessingPanel";
import { IncidentResolutionPanel } from "@/components/officer/incidents/IncidentResolutionPanel";
import type { IncidentStatusTone } from "@/domain/incident/status";
import type { OfficerIncidentDetail } from "@/services/officer-incident-detail-service";
import type { OfficerIncidentAssignmentOptions } from "@/services/officer-incident-assignment-service";

const TONE_CLASSES: Record<IncidentStatusTone, string> = {
  neutral: "bg-slate-100 text-slate-700",
  info: "bg-blue-100 text-blue-700",
  warning: "bg-amber-100 text-amber-700",
  success: "bg-emerald-100 text-emerald-700",
  danger: "bg-red-100 text-red-700",
  muted: "bg-gray-100 text-gray-600",
};

const TIMELINE_DOT_CLASSES: Record<IncidentStatusTone, string> = {
  neutral: "bg-slate-400",
  info: "bg-blue-500",
  warning: "bg-amber-500",
  success: "bg-emerald-500",
  danger: "bg-red-500",
  muted: "bg-gray-400",
};

const DATE_FORMATTER = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function DetailBadge({ label, tone }: { label: string; tone: IncidentStatusTone }) {
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${TONE_CLASSES[tone]}`}
    >
      {label}
    </span>
  );
}

function SectionCard({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description?: string;
  icon: typeof FileText;
  children: React.ReactNode;
}) {
  return (
    <section className="min-w-0 rounded-[16px] border border-[#E5E7EB] bg-white p-4 shadow-[0_2px_10px_rgba(15,23,42,0.02)] md:p-5">
      <div className="mb-4 flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#E8F7EF] text-[#087F46]">
          <Icon className="size-[18px]" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 className="text-[16px] font-bold text-[#111827]">{title}</h2>
          {description ? (
            <p className="mt-0.5 text-xs leading-5 text-[#9CA3AF]">{description}</p>
          ) : null}
        </div>
      </div>
      {children}
    </section>
  );
}

export function IncidentDetailView({
  incident,
  assignmentOptions,
}: {
  incident: OfficerIncidentDetail;
  assignmentOptions: OfficerIncidentAssignmentOptions;
}) {
  const hasCoordinates = incident.location.lat !== undefined && incident.location.lng !== undefined;

  return (
    <div className="mx-auto flex max-w-[1600px] min-w-0 flex-col gap-5 md:gap-6">
      <Link
        href="/officer/reports"
        className="inline-flex min-h-10 w-fit items-center gap-2 rounded-[10px] px-2 text-sm font-semibold text-[#087F46] transition-colors hover:bg-[#E8F7EF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F46]"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Quay lại danh sách
      </Link>

      <header className="rounded-[16px] border border-[#E5E7EB] bg-white p-4 shadow-[0_2px_10px_rgba(15,23,42,0.02)] md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold tracking-wide text-[#087F46]">
                {incident.publicCode}
              </span>
              <DetailBadge label={incident.status.label} tone={incident.status.tone} />
              <DetailBadge
                label={`Ưu tiên ${incident.priority.label.toLocaleLowerCase("vi-VN")}`}
                tone={incident.priority.tone}
              />
            </div>
            <h1 className="mt-3 break-words text-[22px] font-bold leading-tight text-[#111827] md:text-2xl">
              {incident.title}
            </h1>
            <p className="mt-1 text-sm font-medium text-[#6B7280]">{incident.issueType}</p>
          </div>

          <div className="flex shrink-0 items-center gap-2 rounded-[10px] bg-[#F9FAFB] px-3 py-2 text-xs text-[#6B7280]">
            <Clock3 className="size-4 text-[#087F46]" aria-hidden="true" />
            <span>Gửi lúc {DATE_FORMATTER.format(new Date(incident.submittedAt))}</span>
          </div>
        </div>
      </header>

      <div className="flex w-full flex-col gap-5 xl:ml-auto xl:max-w-[520px]">
        <IncidentReviewPanel incidentId={incident.id} status={incident.status.code} />
        {incident.status.code === "VERIFIED" ? (
          <IncidentAssignmentPanel
            incidentId={incident.id}
            status={incident.status.code}
            assignment={incident.assignment}
            options={assignmentOptions}
          />
        ) : null}
        <IncidentProcessingPanel
          incidentId={incident.id}
          status={incident.status.code}
          assignment={incident.assignment}
          processing={incident.processing}
        />
        <IncidentResolutionPanel
          incidentId={incident.id}
          publicCode={incident.publicCode}
          status={incident.status.code}
          assignment={incident.assignment}
          resolution={incident.resolution}
        />
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(330px,0.85fr)] xl:items-start">
        <div className="flex min-w-0 flex-col gap-5">
          <SectionCard
            title="Hình ảnh sự cố"
            description="Ảnh chính được gửi cùng phản ánh"
            icon={Camera}
          >
            <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-[12px] bg-[#F3F4F6] text-[#9CA3AF]">
              {incident.imageUrl ? (
                <Image
                  src={incident.imageUrl}
                  alt={`Hình ảnh phản ánh ${incident.publicCode}`}
                  fill
                  sizes="(min-width: 1280px) 60vw, 100vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-center">
                  <ImageIcon className="size-9" aria-hidden="true" />
                  <span className="text-sm font-medium">Ảnh hiện không khả dụng</span>
                </div>
              )}
            </div>
          </SectionCard>

          <SectionCard
            title="Nội dung phản ánh"
            description="Thông tin người dân cung cấp tại thời điểm gửi"
            icon={FileText}
          >
            {incident.description ? (
              <p className="rounded-[12px] bg-[#F9FAFB] p-4 text-sm leading-6 text-[#374151]">
                {incident.description}
              </p>
            ) : (
              <p className="rounded-[12px] border border-dashed border-[#D1D5DB] p-4 text-sm text-[#6B7280]">
                Phản ánh chưa có nội dung mô tả chi tiết.
              </p>
            )}

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-[10px] border border-[#E5E7EB] p-3">
                <p className="text-xs text-[#9CA3AF]">Thời gian gửi</p>
                <p className="mt-1 text-sm font-semibold text-[#374151]">
                  {DATE_FORMATTER.format(new Date(incident.submittedAt))}
                </p>
              </div>
              {incident.capturedAt ? (
                <div className="rounded-[10px] border border-[#E5E7EB] p-3">
                  <p className="text-xs text-[#9CA3AF]">Thời gian ghi nhận</p>
                  <p className="mt-1 text-sm font-semibold text-[#374151]">
                    {DATE_FORMATTER.format(new Date(incident.capturedAt))}
                  </p>
                </div>
              ) : null}
            </div>

            {incident.observationMetadata.length > 0 ? (
              <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {incident.observationMetadata.map((item) => (
                  <div key={item.label} className="rounded-[10px] bg-[#F9FAFB] px-3 py-2.5">
                    <dt className="text-xs text-[#9CA3AF]">{item.label}</dt>
                    <dd className="mt-0.5 text-sm font-semibold text-[#374151]">{item.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}

            {incident.supplementalAnswers.length > 0 ? (
              <div className="mt-5 border-t border-[#E5E7EB] pt-4">
                <h3 className="text-sm font-bold text-[#111827]">Thông tin bổ sung</h3>
                <dl className="mt-3 space-y-3">
                  {incident.supplementalAnswers.map((item) => (
                    <div key={item.label} className="rounded-[10px] bg-[#F9FAFB] p-3">
                      <dt className="text-xs leading-5 text-[#6B7280]">{item.label}</dt>
                      <dd className="mt-0.5 text-sm font-semibold text-[#111827]">{item.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : null}
          </SectionCard>

          <SectionCard
            title="Thông tin vị trí"
            description="Dữ liệu vị trí gắn với phản ánh"
            icon={MapPin}
          >
            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-[10px] bg-[#F9FAFB] p-3 sm:col-span-2">
                <p className="text-xs text-[#9CA3AF]">Địa chỉ / khu vực</p>
                <p className="mt-1 break-words text-sm font-semibold text-[#374151]">
                  {incident.location.address}
                </p>
              </div>
              {hasCoordinates ? (
                <>
                  <div className="rounded-[10px] bg-[#F9FAFB] p-3">
                    <p className="text-xs text-[#9CA3AF]">Vĩ độ</p>
                    <p className="mt-1 font-mono text-sm font-semibold text-[#374151]">
                      {incident.location.lat?.toFixed(6)}
                    </p>
                  </div>
                  <div className="rounded-[10px] bg-[#F9FAFB] p-3">
                    <p className="text-xs text-[#9CA3AF]">Kinh độ</p>
                    <p className="mt-1 font-mono text-sm font-semibold text-[#374151]">
                      {incident.location.lng?.toFixed(6)}
                    </p>
                  </div>
                </>
              ) : null}
            </div>

            {incident.location.mapAvailable && hasCoordinates ? (
              <IncidentLocationMap
                lat={incident.location.lat as number}
                lng={incident.location.lng as number}
                label={`${incident.publicCode} · ${incident.issueType}`}
              />
            ) : (
              <div className="flex min-h-40 flex-col items-center justify-center rounded-[12px] border border-dashed border-[#D1D5DB] bg-[#F9FAFB] px-5 py-8 text-center">
                <MapPin className="size-7 text-[#9CA3AF]" aria-hidden="true" />
                <p className="mt-2 max-w-lg text-sm leading-6 text-[#6B7280]">
                  {incident.location.mapUnavailableReason}
                </p>
              </div>
            )}
          </SectionCard>
        </div>

        <aside className="flex min-w-0 flex-col gap-5">
          <SectionCard
            title="AI hỗ trợ"
            description="Thông tin gợi ý để cán bộ tham khảo, không thay thế quyết định nghiệp vụ"
            icon={Bot}
          >
            <dl className="space-y-3">
              <div className="rounded-[10px] bg-[#F9FAFB] p-3">
                <dt className="text-xs text-[#9CA3AF]">Loại sự cố</dt>
                <dd className="mt-1 text-sm font-bold text-[#111827]">
                  {incident.aiSupport.classification}
                </dd>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-[10px] bg-[#F9FAFB] p-3">
                  <dt className="text-xs text-[#9CA3AF]">Độ tin cậy</dt>
                  <dd className="mt-1 text-sm font-bold text-[#111827]">
                    {incident.aiSupport.confidence}
                  </dd>
                </div>
                <div className="rounded-[10px] bg-[#F9FAFB] p-3">
                  <dt className="text-xs text-[#9CA3AF]">Ưu tiên đề xuất</dt>
                  <dd className="mt-1">
                    <DetailBadge label={incident.priority.label} tone={incident.priority.tone} />
                  </dd>
                </div>
              </div>
            </dl>

            {incident.priority.reasons.length > 0 ? (
              <div className="mt-4 rounded-[10px] border border-[#FEF3C7] bg-[#FFFBEB] p-3">
                <p className="flex items-center gap-2 text-xs font-bold text-[#92400E]">
                  <Sparkles className="size-3.5" aria-hidden="true" />
                  Lý do đề xuất · điểm {incident.priority.score}
                </p>
                <ul className="mt-2 space-y-1.5 text-xs leading-5 text-[#78350F]">
                  {incident.priority.reasons.map((reason) => (
                    <li key={reason} className="flex items-start gap-2">
                      <span className="mt-2 size-1 shrink-0 rounded-full bg-[#D97706]" />
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {incident.evidence ? (
              <div className="mt-4 rounded-[10px] border border-[#DBEAFE] bg-[#EFF6FF] p-3 text-xs text-[#1E40AF]">
                Độ tin cậy bằng chứng: <strong>{incident.evidence.confidence}</strong>
              </div>
            ) : null}
          </SectionCard>

          <SectionCard
            title="Phản ánh liên quan"
            description="Số lượt báo cáo độc lập đang được nhóm vào cùng sự cố"
            icon={UsersRound}
          >
            <div className="flex items-end justify-between gap-4 rounded-[12px] bg-[#F9FAFB] p-4">
              <div>
                <p className="text-3xl font-bold text-[#111827]">{incident.reportCount}</p>
                <p className="mt-1 text-xs text-[#6B7280]">Tổng lượt phản ánh</p>
              </div>
              <span className="rounded-full bg-[#E8F7EF] px-3 py-1 text-xs font-semibold text-[#087F46]">
                {incident.relatedReportCount} lượt liên quan khác
              </span>
            </div>
            <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-[#6B7280]">
              <Info className="mt-0.5 size-3.5 shrink-0 text-[#087F46]" aria-hidden="true" />
              Đây là số lượt báo cáo độc lập trong domain hiện có, không phải kết luận tự động về phản ánh trùng.
            </p>
          </SectionCard>

          <SectionCard
            title="Lịch sử trạng thái"
            description="Các sự kiện hiện có trong dữ liệu phản ánh"
            icon={Clock3}
          >
            {incident.timeline.length > 0 ? (
              <ol className="space-y-0">
                {incident.timeline.map((event, index) => (
                  <li key={event.id} className="relative flex gap-3 pb-5 last:pb-0">
                    {index < incident.timeline.length - 1 ? (
                      <span className="absolute left-[7px] top-4 h-[calc(100%-8px)] w-px bg-[#E5E7EB]" />
                    ) : null}
                    <span
                      className={`relative mt-1.5 size-[15px] shrink-0 rounded-full border-[3px] border-white shadow-sm ${TIMELINE_DOT_CLASSES[event.tone]}`}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#374151]">{event.label}</p>
                      {event.description ? (
                        <p className="mt-1 break-words text-xs leading-5 text-[#6B7280]">
                          {event.description}
                        </p>
                      ) : null}
                      <time className="mt-1 block text-[11px] text-[#9CA3AF]">
                        {DATE_FORMATTER.format(new Date(event.occurredAt))}
                      </time>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="rounded-[10px] border border-dashed border-[#D1D5DB] p-4 text-sm text-[#6B7280]">
                <p className="font-semibold text-[#374151]">Trạng thái hiện tại: {incident.status.label}</p>
                <p className="mt-1 text-xs">Chưa có sự kiện lịch sử bổ sung trong dữ liệu.</p>
              </div>
            )}
          </SectionCard>

          {incident.evidence?.warnings.length ? (
            <div className="flex gap-3 rounded-[12px] border border-[#FDE68A] bg-[#FFFBEB] p-4 text-xs leading-5 text-[#92400E]">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <div>
                <p className="font-bold">Lưu ý về bằng chứng</p>
                <ul className="mt-1 list-disc space-y-1 pl-4">
                  {incident.evidence.warnings.map((warning) => (
                    <li key={warning}>{warning}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
