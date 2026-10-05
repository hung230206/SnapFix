"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { incidentService } from "@/services/incident-service";
import { Incident, IncidentEvent, Observation, ObservationEvidence } from "@/domain/models";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { demoIssueTypes } from "@/lib/repositories/mockData";
import { ArrowLeft, Clock, MapPin, CheckCircle, Upload, ShieldAlert, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function OfficerIncidentDetail({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;
  const router = useRouter();
  
  const [incident, setIncident] = useState<Incident | null>(null);
  const [events, setEvents] = useState<IncidentEvent[]>([]);
  const [obsData, setObsData] = useState<{ obs: Observation, evidence: ObservationEvidence | null }[]>([]);

  const loadData = () => {
    incidentService.getIncident(id).then(setIncident);
    incidentService.getEvents(id).then(setEvents);
    incidentService.getObservationsAndEvidence(id).then(setObsData);
  };

  useEffect(() => {
    loadData();
  }, [id]);

  if (!incident) return <div className="p-8 text-center">Đang tải...</div>;

  const issueName = demoIssueTypes.find(it => it.code === incident.issueTypeCode)?.nameVi || incident.issueTypeCode;
  const primaryObs = obsData[0]?.obs;
  const primaryEvidence = obsData[0]?.evidence;
  const parsedAnswers = primaryObs?.answersJson ? JSON.parse(primaryObs.answersJson) : {};

  const handleStatusChange = async (newStatus: any) => {
    await incidentService.updateStatus(id, newStatus, "u2");
    loadData();
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl pb-20">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-semibold ml-2">Chi tiết sự cố: {incident.publicCode}</h1>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Badge>{incident.status}</Badge>
              <Badge variant="outline" className={
                incident.priorityLevel === "HIGH" ? "text-red-500 border-red-500" :
                incident.priorityLevel === "MEDIUM" ? "text-orange-500 border-orange-500" : "text-green-500 border-green-500"
              }>{incident.priorityLevel}</Badge>
              <Badge variant="secondary">Tin cậy: {incident.confidenceLevel}</Badge>
            </div>
            <CardTitle className="text-2xl">{primaryObs?.title || issueName}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-2">
              <MapPin className="w-4 h-4"/> {incident.centroidLat?.toFixed(5)}, {incident.centroidLng?.toFixed(5)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {primaryObs?.description && (
              <div className="bg-muted p-4 rounded-md mb-4 text-sm">
                {primaryObs.description}
              </div>
            )}
            
            {Object.keys(parsedAnswers).length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold text-sm mb-2 flex items-center"><FileText className="w-4 h-4 mr-2" /> Thông tin bổ sung</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(parsedAnswers).map(([k, v]) => (
                    <div key={k} className="bg-muted/50 p-2 rounded">
                      <div className="text-muted-foreground text-xs">{k}</div>
                      <div className="font-medium">{String(v)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="bg-muted/50 p-3 rounded-md">
              <p className="text-sm font-medium mb-1">Lý do ưu tiên:</p>
              <ul className="list-disc pl-5 text-sm text-muted-foreground">
                {incident.priorityReasons.map((r, idx) => (
                  <li key={idx}>{r}</li>
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
            <p className="text-sm text-muted-foreground mb-4">Số lượt báo cáo độc lập: {incident.independentReportCount}</p>
            
            <div className="space-y-6">
              {obsData.map((d, idx) => (
                <div key={d.obs.id} className="border rounded-md overflow-hidden">
                  <div className="aspect-video bg-muted flex items-center justify-center">
                    <span className="text-muted-foreground">Ảnh đính kèm #{idx + 1}</span>
                  </div>
                  {d.evidence && (
                    <div className="p-4 bg-muted/20 text-sm space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-muted-foreground">Nguồn ảnh: </span>
                          <span className="font-medium">{d.evidence.imageSource === "LIVE_CAMERA" ? "Chụp trực tiếp" : "Tải lên"}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">EXIF GPS: </span>
                          <span className="font-medium">{d.evidence.exifGpsAvailable ? "Có" : "Không"}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Nguồn vị trí: </span>
                          <span className="font-medium">{d.evidence.locationSource === "MANUAL_PIN" ? "Ghim thủ công" : d.evidence.locationSource}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Sai số: </span>
                          <span className="font-medium">{d.evidence.captureDeviceAccuracyMeters ? `±${Math.round(d.evidence.captureDeviceAccuracyMeters)}m` : "N/A"}</span>
                        </div>
                      </div>
                      
                      <div className="pt-2 border-t mt-2">
                        <div className="flex items-start mb-1">
                          <ShieldAlert className="w-4 h-4 mr-2 text-primary shrink-0 mt-0.5" />
                          <div>
                            <div className="font-medium">Trạng thái đối chiếu vị trí: {d.evidence.locationConsistencyStatus}</div>
                            {d.evidence.locationDistanceMeters !== undefined && (
                              <div className="text-xs text-muted-foreground">Khoảng cách tới điểm ghim: {Math.round(d.evidence.locationDistanceMeters)}m</div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="pt-2 border-t mt-2">
                        <span className="font-medium">Độ tin cậy: {d.evidence.evidenceConfidence}</span>
                        <ul className="list-disc pl-5 text-xs text-muted-foreground mt-1">
                          {JSON.parse(d.evidence.evidenceReasonsJson || "[]").map((r: string, i: number) => <li key={`r-${i}`} className="text-green-600">{r}</li>)}
                          {JSON.parse(d.evidence.evidenceWarningsJson || "[]").map((w: string, i: number) => <li key={`w-${i}`} className="text-yellow-600">{w}</li>)}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lịch sử hoạt động</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {events.map(ev => (
                <div key={ev.id} className="flex gap-3">
                  <div className="mt-1"><Clock className="w-4 h-4 text-muted-foreground" /></div>
                  <div>
                    <p className="text-sm font-medium">
                      {ev.type === "CREATED" ? "Sự cố được tạo" :
                       ev.type === "STATUS_CHANGED" ? `Cập nhật trạng thái: ${ev.newStatus}` :
                       ev.type === "OBSERVATION_ADDED" ? "Thêm báo cáo mới" : ev.type}
                    </p>
                    <p className="text-xs text-muted-foreground">{new Date(ev.createdAt).toLocaleString("vi-VN")}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t">
        <div className="container max-w-3xl mx-auto flex gap-3">
          {incident.status === "NEW" && (
            <Button className="flex-1" onClick={() => handleStatusChange("IN_PROGRESS")}>
              Tiếp nhận & Xử lý
            </Button>
          )}
          {incident.status === "IN_PROGRESS" && (
            <Dialog>
              <DialogTrigger className="flex-1 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium h-9 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90">
                <CheckCircle className="w-4 h-4 mr-2" />
                Báo cáo hoàn thành
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Xác nhận hoàn thành</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <div className="border-2 border-dashed p-6 text-center rounded-lg mb-4 text-muted-foreground flex flex-col items-center cursor-pointer hover:bg-muted">
                    <Upload className="w-8 h-8 mb-2" />
                    <span>Tải lên ảnh sau khi xử lý</span>
                  </div>
                  <Button className="w-full" onClick={() => handleStatusChange("RESOLVED")}>Xác nhận & Cập nhật trạng thái</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
          {incident.status === "RESOLVED" && (
            <Button className="flex-1" disabled variant="outline">
              Đang chờ xác nhận từ cộng đồng
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
