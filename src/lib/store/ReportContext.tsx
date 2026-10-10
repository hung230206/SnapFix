"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type LocationData = {
  type: "gps" | "exif" | "manual";
  lat?: number | null;
  lng?: number | null;
  text: string;
};

export type AnalysisData = {
  category: string;
  severity: "low" | "medium" | "high";
  reason: string;
  confidence: number;
  draft: string;
};

export type Report = {
  id: string;
  image: { file: File | null; previewUrl: string | null };
  location: LocationData;
  capturedAt: string | null;
  analysis: AnalysisData | null;
  editedDraft: string;
  receivingAgency: { name: string; reportUrl: string };
  status: "Đã gửi" | "Cần xử lý" | "Đã phân công" | "Đang xử lý" | "Đã xử lý";
  submittedAt: string | null;
  assignee?: string;
  logs: { action: string; from: string; to: string; actor: string; createdAt: string }[];
};

type ReportContextType = {
  reports: Report[];
  addReport: (report: Report) => void;
  updateReportStatus: (id: string, newStatus: Report["status"], actor: string) => void;
  assignReport: (id: string, assignee: string, actor: string) => void;
};

const ReportContext = createContext<ReportContextType | undefined>(undefined);

// Generate some initial mock data for the Officer dashboard
const generateMockReports = (): Report[] => {
  return [
    {
      id: "#SF20261005001",
      image: { file: null, previewUrl: null },
      location: { type: "gps", lat: 10.0452, lng: 105.7469, text: "Đường Nguyễn Văn Cừ, P. An Hòa" },
      capturedAt: "2026-10-05T09:12:00Z",
      analysis: { category: "Ổ gà", severity: "high", reason: "Mặt đường hỏng nặng", confidence: 0.9, draft: "" },
      editedDraft: "Tôi thấy ổ gà...",
      receivingAgency: { name: "UBND Quận Ninh Kiều", reportUrl: "" },
      status: "Cần xử lý",
      submittedAt: "2026-10-05T09:15:00Z",
      logs: []
    },
    {
      id: "#SF20261005002",
      image: { file: null, previewUrl: null },
      location: { type: "exif", lat: 10.0234, lng: 105.7123, text: "Đường 3/2, P. Hưng Lợi" },
      capturedAt: "2026-10-05T08:45:00Z",
      analysis: { category: "Ngập nước", severity: "medium", reason: "Nước ngập nửa bánh xe", confidence: 0.85, draft: "" },
      editedDraft: "Đường ngập nặng...",
      receivingAgency: { name: "UBND Quận Ninh Kiều", reportUrl: "" },
      status: "Đang xử lý",
      assignee: "Nguyễn Văn A",
      submittedAt: "2026-10-05T08:50:00Z",
      logs: []
    },
    {
      id: "#SF20261005003",
      image: { file: null, previewUrl: null },
      location: { type: "gps", lat: 10.0345, lng: 105.7890, text: "Đường Hai Bà Trưng, P. Tân An" },
      capturedAt: "2026-10-04T14:20:00Z",
      analysis: { category: "Vỉa hè hư hỏng", severity: "medium", reason: "Gạch vỉa hè bong tróc", confidence: 0.8, draft: "" },
      editedDraft: "Vỉa hè bong tróc gây nguy hiểm",
      receivingAgency: { name: "UBND Quận Ninh Kiều", reportUrl: "" },
      status: "Cần xử lý",
      submittedAt: "2026-10-04T14:25:00Z",
      logs: []
    },
    {
      id: "#SF20261005004",
      image: { file: null, previewUrl: null },
      location: { type: "manual", text: "Đường Trần Hưng Đạo, P. An Nghiệp" },
      capturedAt: "2026-10-03T19:55:00Z",
      analysis: { category: "Đèn đường hỏng", severity: "low", reason: "Đèn không sáng", confidence: 0.95, draft: "" },
      editedDraft: "Đèn đường hỏng...",
      receivingAgency: { name: "Đơn vị quản lý chiếu sáng", reportUrl: "" },
      status: "Đã xử lý",
      assignee: "Trần Thị B",
      submittedAt: "2026-10-03T20:00:00Z",
      logs: [
        { action: "Cập nhật trạng thái", from: "Đang xử lý", to: "Đã xử lý", actor: "Trần Thị B", createdAt: "2026-10-04T10:00:00Z" }
      ]
    }
  ];
};

export const ReportProvider = ({ children }: { children: React.ReactNode }) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setReports(generateMockReports());
  }, []);

  const addReport = (report: Report) => {
    setReports((prev) => [report, ...prev]);
  };

  const updateReportStatus = (id: string, newStatus: Report["status"], actor: string) => {
    setReports((prev) => prev.map(r => {
      if (r.id === id) {
        const newLog = {
          action: "Cập nhật trạng thái",
          from: r.status,
          to: newStatus,
          actor,
          createdAt: new Date().toISOString()
        };
        return { ...r, status: newStatus, logs: [newLog, ...r.logs] };
      }
      return r;
    }));
  };

  const assignReport = (id: string, assignee: string, actor: string) => {
     setReports((prev) => prev.map(r => {
      if (r.id === id) {
        const newLog = {
          action: "Phân công",
          from: r.assignee || "Chưa phân công",
          to: assignee,
          actor,
          createdAt: new Date().toISOString()
        };
        return { ...r, assignee, status: "Đã phân công", logs: [newLog, ...r.logs] };
      }
      return r;
    }));
  }

  if (!isClient) return null;

  return (
    <ReportContext.Provider value={{ reports, addReport, updateReportStatus, assignReport }}>
      {children}
    </ReportContext.Provider>
  );
};

export const useReports = () => {
  const context = useContext(ReportContext);
  if (!context) throw new Error("useReports must be used within ReportProvider");
  return context;
};
