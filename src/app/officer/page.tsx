"use client";

import { useEffect, useState } from "react";
import { incidentService } from "@/services/incident-service";
import { Incident } from "@/domain/models";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { AlertCircle, Clock, MapPin } from "lucide-react";
import { demoIssueTypes } from "@/lib/repositories/mockData";

export default function OfficerDashboard() {
  const [incidents, setIncidents] = useState<Incident[]>([]);

  useEffect(() => {
    incidentService.getAllIncidents().then(setIncidents);
  }, []);

  const getStatusColor = (status: string) => {
    switch(status) {
      case "NEW": return "bg-blue-500 hover:bg-blue-600";
      case "IN_PROGRESS": return "bg-amber-500 hover:bg-amber-600";
      case "RESOLVED": return "bg-green-500 hover:bg-green-600";
      default: return "bg-gray-500 hover:bg-gray-600";
    }
  };

  const getPriorityColor = (level: string) => {
    switch(level) {
      case "HIGH": return "text-red-600 border-red-600 bg-red-50";
      case "MEDIUM": return "text-orange-600 border-orange-600 bg-orange-50";
      default: return "text-green-600 border-green-600 bg-green-50";
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Bảng điều khiển Cán bộ</h1>
        <Link href="/">
          <span className="text-sm text-primary hover:underline">Về trang chủ</span>
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-medium">Mới hôm nay</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{incidents.filter(i => i.status === "NEW").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-medium">Đang xử lý</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{incidents.filter(i => i.status === "IN_PROGRESS").length}</div>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-semibold mb-4">Danh sách sự cố</h2>
      <div className="grid gap-4">
        {incidents.map(inc => {
          const issueName = demoIssueTypes.find(it => it.code === inc.issueTypeCode)?.nameVi || inc.issueTypeCode;
          
          return (
            <Link key={inc.id} href={`/officer/incidents/${inc.id}`}>
              <Card className="hover:border-primary transition-colors cursor-pointer">
                <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-mono text-sm font-semibold">{inc.publicCode}</span>
                      <Badge className={`text-white ${getStatusColor(inc.status)}`}>{inc.status}</Badge>
                      <Badge variant="outline" className={getPriorityColor(inc.priorityLevel)}>{inc.priorityLevel}</Badge>
                    </div>
                    <h3 className="font-medium text-lg mb-1">{issueName}</h3>
                    <div className="flex items-center text-sm text-muted-foreground gap-4">
                      <span className="flex items-center gap-1"><MapPin className="w-4 h-4"/> {inc.centroidLat ? `${inc.centroidLat.toFixed(4)}, ${inc.centroidLng?.toFixed(4)}` : "Chưa rõ"}</span>
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4"/> {new Date(inc.createdAt).toLocaleDateString("vi-VN")}</span>
                      <span className="flex items-center gap-1"><AlertCircle className="w-4 h-4"/> {inc.independentReportCount} báo cáo</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  );
}
