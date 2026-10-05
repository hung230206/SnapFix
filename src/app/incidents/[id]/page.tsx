"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { incidentService } from "@/services/incident-service";
import { Incident, IncidentEvent, Observation } from "@/domain/models";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { demoIssueTypes } from "@/lib/repositories/mockData";
import { ArrowLeft, Clock, MapPin, Image as ImageIcon } from "lucide-react";

export default function CitizenIncidentDetail({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;
  const router = useRouter();
  
  const [incident, setIncident] = useState<Incident | null>(null);
  const [events, setEvents] = useState<IncidentEvent[]>([]);
  const [obsData, setObsData] = useState<{ obs: Observation }[]>([]);

  useEffect(() => {
    incidentService.getIncident(id).then(setIncident);
    incidentService.getEvents(id).then(setEvents);
    incidentService.getObservationsAndEvidence(id).then(setObsData);
  }, [id]);

  if (!incident) return <div className="p-8 text-center">Đang tải...</div>;

  const issueName = demoIssueTypes.find(it => it.code === incident.issueTypeCode)?.nameVi || incident.issueTypeCode;
  const primaryObs = obsData[0]?.obs;

  return (
    <div className="container mx-auto p-4 max-w-3xl pb-32">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="ml-2">
          <h1 className="text-xl font-semibold">Chi tiết sự cố</h1>
          <p className="text-xs text-muted-foreground">{incident.publicCode}</p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Badge variant={
                  incident.status === "RESOLVED" || incident.status === "CLOSED" ? "default" :
                  incident.status === "IN_PROGRESS" ? "secondary" : "outline"
                }>
                  {incident.status}
                </Badge>
                <Badge variant="secondary" className="bg-muted text-muted-foreground">{issueName}</Badge>
              </div>
            </div>
            <CardTitle className="text-2xl leading-tight">{primaryObs?.title || issueName}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-2">
              <MapPin className="w-4 h-4"/> 
              <span className="truncate">Vị trí: {incident.centroidLat?.toFixed(4)}, {incident.centroidLng?.toFixed(4)}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Show primary image placeholder */}
            <div className="aspect-video bg-muted rounded-md mb-4 flex items-center justify-center overflow-hidden border">
              <div className="text-center text-muted-foreground">
                <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <span>Ảnh hiện trường</span>
              </div>
            </div>
            
            {primaryObs?.description && (
              <p className="text-sm mb-4 leading-relaxed">{primaryObs.description}</p>
            )}

            <div className="bg-muted/50 p-3 rounded-md text-sm text-muted-foreground">
              Sự cố này đã được cộng đồng báo cáo độc lập {incident.independentReportCount} lần.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tiến trình xử lý</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {events.map((ev, index) => (
                <div key={ev.id} className="flex gap-4">
                  <div className="mt-1 flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    {index < events.length - 1 && <div className="w-0.5 h-full bg-border my-1"></div>}
                  </div>
                  <div className="pb-4 pt-1">
                    <div className="font-medium text-sm">
                      {ev.type === "CREATED" ? "Sự cố được ghi nhận trên hệ thống" :
                       ev.type === "STATUS_CHANGED" ? `Trạng thái: ${ev.newStatus}` :
                       ev.type === "OBSERVATION_ADDED" ? "Có thêm báo cáo từ cộng đồng" :
                       ev.type === "ASSIGNED" ? "Đã phân công cho đơn vị xử lý" : ev.type}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {new Date(ev.createdAt).toLocaleString("vi-VN")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t">
        <div className="container max-w-3xl mx-auto flex gap-3">
          {incident.status === "RESOLVED" ? (
            <>
              <Button className="flex-1" variant="default" onClick={() => alert("Cảm ơn bạn đã xác nhận!")}>
                Đã khắc phục
              </Button>
              <Button className="flex-1" variant="outline" onClick={() => alert("Cảm ơn bạn đã phản hồi!")}>
                Vẫn còn vấn đề
              </Button>
            </>
          ) : (
            <>
              <Button className="flex-1" variant="outline" onClick={() => alert("Chức năng đang phát triển")}>
                Tôi có ảnh mới
              </Button>
              <Button className="flex-1" variant="default" onClick={() => alert("Đã ghi nhận bạn đồng tình.")}>
                Tôi cũng thấy vấn đề này
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
