"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Camera, Clock, AlertCircle, FileText } from "lucide-react";
import { demoIncidents, demoObservations, demoIssueTypes } from "@/lib/repositories/mockData";
import { getPendingSyncObservations } from "@/lib/offline/idb";

export default function CitizenDashboard() {
  const [offlineDrafts, setOfflineDrafts] = useState<any[]>([]);
  
  useEffect(() => {
    // Get pending or draft reports
    getPendingSyncObservations().then(setOfflineDrafts);
  }, []);

  // Filter observations for "u1" (our mock citizen)
  const myObservations = demoObservations.filter(o => o.reporterId === "u1");
  
  // Get corresponding incidents
  const myIncidents = myObservations.map(obs => {
    const inc = demoIncidents.find(i => i.id === obs.incidentId);
    return { obs, inc };
  }).filter(item => item.inc);

  const inProgress = myIncidents.filter(i => i.inc?.status === "IN_PROGRESS" || i.inc?.status === "ASSIGNED" || i.inc?.status === "VERIFIED");
  const completed = myIncidents.filter(i => i.inc?.status === "RESOLVED" || i.inc?.status === "CLOSED");

  return (
    <div className="flex flex-col min-h-[100dvh] bg-muted/20">
      <header className="border-b bg-background sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/">
              <Button variant="ghost" size="icon" className="mr-2">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-semibold">Cá nhân</h1>
          </div>
          <Link href="/report/new">
            <Button size="sm">Phản ánh mới</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6 max-w-3xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{myIncidents.length}</div>
              <div className="text-xs text-muted-foreground mt-1">Đã gửi</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-500">{inProgress.length}</div>
              <div className="text-xs text-muted-foreground mt-1">Đang xử lý</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-500">{completed.length}</div>
              <div className="text-xs text-muted-foreground mt-1">Hoàn thành</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-500">{offlineDrafts.length}</div>
              <div className="text-xs text-muted-foreground mt-1">Bản nháp offline</div>
            </CardContent>
          </Card>
        </div>

        {offlineDrafts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-3 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 text-blue-500" />
              Chưa đồng bộ ({offlineDrafts.length})
            </h2>
            <div className="space-y-3">
              {offlineDrafts.map(draft => (
                <Card key={draft.localId} className="border-blue-200 bg-blue-50/50">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">Phản ánh ngày {new Date(draft.capturedAt || Date.now()).toLocaleDateString("vi-VN")}</p>
                      <p className="text-xs text-muted-foreground">Đang chờ mạng để gửi đi</p>
                    </div>
                    <Link href={`/report/review?id=${draft.localId}`}>
                      <Button size="sm" variant="outline">Tiếp tục</Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div>
          <h2 className="text-lg font-semibold mb-4">Phản ánh của tôi</h2>
          {myIncidents.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground bg-background rounded-lg border border-dashed">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>Bạn chưa gửi phản ánh nào.</p>
              <Link href="/report/new">
                <Button variant="link" className="mt-2">Bắt đầu ngay</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {myIncidents.map(({ obs, inc }) => {
                const issueName = demoIssueTypes.find(it => it.code === inc!.issueTypeCode)?.nameVi || inc!.issueTypeCode;
                return (
                  <Link key={obs.id} href={`/incidents/${inc!.id}`} className="block transition-transform active:scale-[0.98]">
                    <Card className="hover:border-primary/50 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold">{obs.title || issueName}</h3>
                          <Badge variant={
                            inc!.status === "RESOLVED" || inc!.status === "CLOSED" ? "default" :
                            inc!.status === "IN_PROGRESS" ? "secondary" : "outline"
                          }>
                            {inc!.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-3">
                          <div className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {new Date(obs.createdAt).toLocaleDateString("vi-VN")}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {inc!.publicCode}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
