"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  FileText,
  MapPin,
  ShieldAlert,
} from "lucide-react";

import { updateOfficerIncidentStatusAction } from "@/app/officer/incidents/[id]/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type {
  Incident,
  IncidentEvent,
  IncidentStatus,
  Observation,
  ObservationEvidence,
} from "@/domain/models";
import {
  getIncidentStatusLabel,
  getIncidentStatusPresentation,
} from "@/domain/incident/status";

type ObservationWithEvidence = {
  obs: Observation;
  evidence: ObservationEvidence | null;
};

function parseAnswers(value?: string): Record<string, unknown> {
  if (!value) return {};
  try {
    const parsed: unknown = JSON.parse(value);
    return parsed && typeof parsed === "object"
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

export function OfficerIncidentDetailView({
  incident,
  events,
  observations,
  issueName,
}: {
  incident: Incident;
  events: IncidentEvent[];
  observations: ObservationWithEvidence[];
  issueName: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const primaryObservation = observations[0]?.obs;
  const answers = parseAnswers(primaryObservation?.answersJson);
  const status = getIncidentStatusPresentation(incident.status);

  function updateStatus(newStatus: IncidentStatus) {
    setError(null);
    startTransition(async () => {
      const result = await updateOfficerIncidentStatusAction(
        incident.id,
        newStatus,
      );
      if (!result.ok) {
        setError(result.message);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="container mx-auto max-w-3xl p-4 pb-24">
      <div className="mb-6 flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/officer/reports")}
          aria-label="Quay lại danh sách"
        >
          <ArrowLeft className="size-5" />
        </Button>
        <h1 className="ml-2 text-xl font-semibold">
          Chi tiết sự cố: {incident.publicCode}
        </h1>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge>{status.label}</Badge>
              <Badge variant="outline">Ưu tiên: {incident.priorityLevel}</Badge>
              <Badge variant="secondary">
                Tin cậy: {incident.confidenceLevel}
              </Badge>
            </div>
            <CardTitle className="text-2xl">
              {primaryObservation?.title || issueName}
            </CardTitle>
            <CardDescription className="mt-2 flex items-center gap-2">
              <MapPin className="size-4" />
              {incident.centroidLat !== undefined &&
              incident.centroidLng !== undefined
                ? `${incident.centroidLat.toFixed(5)}, ${incident.centroidLng.toFixed(5)}`
                : "Chưa có tọa độ"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {primaryObservation?.description ? (
              <div className="mb-4 rounded-md bg-muted p-4 text-sm">
                {primaryObservation.description}
              </div>
            ) : null}
            {Object.keys(answers).length > 0 ? (
              <div className="mb-4">
                <h2 className="mb-2 flex items-center text-sm font-semibold">
                  <FileText className="mr-2 size-4" /> Thông tin bổ sung
                </h2>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {Object.entries(answers).map(([key, value]) => (
                    <div key={key} className="rounded bg-muted/50 p-2 text-sm">
                      <div className="text-xs text-muted-foreground">{key}</div>
                      <div className="font-medium">{String(value)}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            <div className="rounded-md bg-muted/50 p-3">
              <p className="mb-1 text-sm font-medium">Lý do ưu tiên:</p>
              <ul className="list-disc pl-5 text-sm text-muted-foreground">
                {incident.priorityReasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nguồn bằng chứng</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Số lượt phản ánh độc lập: {incident.independentReportCount}
            </p>
            {observations.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Chưa có Observation chi tiết trong dữ liệu demo.
              </p>
            ) : (
              <div className="space-y-4">
                {observations.map(({ obs, evidence }, index) => (
                  <div key={obs.id} className="overflow-hidden rounded-md border">
                    <div className="flex aspect-video items-center justify-center bg-muted text-sm text-muted-foreground">
                      Ảnh đính kèm #{index + 1}
                    </div>
                    {evidence ? (
                      <div className="space-y-2 bg-muted/20 p-4 text-sm">
                        <p>
                          Nguồn ảnh: <strong>{evidence.imageSource}</strong>
                        </p>
                        <p className="flex items-start gap-2">
                          <ShieldAlert className="mt-0.5 size-4 shrink-0" />
                          Đối chiếu vị trí: {evidence.locationConsistencyStatus}
                        </p>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lịch sử hoạt động</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {events.map((event) => (
                <div key={event.id} className="flex gap-3">
                  <Clock className="mt-1 size-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      {event.type === "CREATED"
                        ? "Sự cố được tạo"
                        : event.newStatus
                          ? `Chuyển sang ${getIncidentStatusLabel(event.newStatus)}`
                          : event.type}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(event.createdAt).toLocaleString("vi-VN")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t bg-background p-4">
        <div className="container mx-auto flex max-w-3xl flex-col gap-2 sm:flex-row">
          {incident.status === "NEW" ? (
            <Button
              className="min-h-11 flex-1"
              disabled={pending}
              onClick={() => updateStatus("VERIFIED")}
            >
              {pending ? "Đang cập nhật..." : "Tiếp nhận phản ánh"}
            </Button>
          ) : null}
          {incident.status === "IN_PROGRESS" ? (
            <Button
              className="min-h-11 flex-1"
              disabled={pending}
              onClick={() => updateStatus("RESOLVED")}
            >
              <CheckCircle className="mr-2 size-4" />
              {pending ? "Đang cập nhật..." : "Ghi nhận đã xử lý"}
            </Button>
          ) : null}
          {incident.status !== "NEW" && incident.status !== "IN_PROGRESS" ? (
            <Button className="min-h-11 flex-1" disabled variant="outline">
              Trạng thái hiện tại: {status.label}
            </Button>
          ) : null}
          {error ? (
            <p className="text-sm font-medium text-red-600" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
