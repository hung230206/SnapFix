"use client";

import React, { useState, useEffect } from "react";
import { 
  FileText, AlertTriangle, Clock, CheckCircle2, ChevronDown, 
  MapPin, ArrowRight 
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useReports } from "@/lib/store/ReportContext";
import { format, parseISO } from "date-fns";

export default function OfficerDashboard() {
  const { reports } = useReports();
  const [mounted, setMounted] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  useEffect(() => setMounted(true), []);

  // Calculate KPIs
  const total = reports.length;
  const pending = reports.filter(r => r.status === "Cần xử lý" || r.status === "Đã gửi").length;
  const processing = reports.filter(r => r.status === "Đang xử lý" || r.status === "Đã phân công").length;
  const resolved = reports.filter(r => r.status === "Đã xử lý").length;

  const kpis = [
    { label: "Tổng phản ánh", value: total, change: "+12%", changeText: "so với tuần trước", icon: FileText, color: "text-blue-600", bg: "bg-blue-100" },
    { label: "Cần xử lý", value: pending, change: "+8%", changeText: "đang chờ phân công", icon: AlertTriangle, color: "text-red-600", bg: "bg-red-100" },
    { label: "Đang xử lý", value: processing, change: "+5%", changeText: "đã phân công", icon: Clock, color: "text-orange-600", bg: "bg-orange-100" },
    { label: "Đã xử lý", value: resolved, change: "+20%", changeText: "hoàn thành", icon: CheckCircle2, color: "text-green-600", bg: "bg-green-100" }
  ];

  // Dynamic Line Chart (group by date)
  const lineDataMap: Record<string, number> = {};
  reports.forEach(r => {
    if (r.submittedAt) {
      const dateStr = format(parseISO(r.submittedAt), "dd/MM");
      lineDataMap[dateStr] = (lineDataMap[dateStr] || 0) + 1;
    }
  });
  
  // Sort dates
  const lineData = Object.keys(lineDataMap).sort().map(k => ({ name: k, count: lineDataMap[k] }));

  // Dynamic Pie Chart
  const pieDataMap: Record<string, number> = {};
  reports.forEach(r => {
    const cat = r.analysis?.category || "Khác";
    pieDataMap[cat] = (pieDataMap[cat] || 0) + 1;
  });

  const categoryColors: Record<string, string> = {
    "Ổ gà": "#EF4444",
    "Ổ gà, hư mặt đường": "#EF4444",
    "Ngập nước": "#3B82F6",
    "Đèn đường hỏng": "#EAB308",
    "Vỉa hè hư hỏng": "#F97316",
    "Khác": "#9CA3AF"
  };

  const pieData = Object.keys(pieDataMap).map(k => ({
    name: k,
    value: pieDataMap[k],
    color: categoryColors[k] || "#9CA3AF"
  }));

  const getStatusColor = (status: string) => {
    if (status === "Cần xử lý" || status === "Đã gửi") return "text-red-600 bg-red-100";
    if (status === "Đang xử lý" || status === "Đã phân công") return "text-orange-600 bg-orange-100";
    if (status === "Đã xử lý") return "text-green-600 bg-green-100";
    return "text-blue-600 bg-blue-100";
  };

  // Markers
  const markers = reports.filter(r => r.location.lat && r.location.lng).map(r => ({
    lat: r.location.lat!,
    lng: r.location.lng!,
    color: r.status === "Cần xử lý" || r.status === "Đã gửi" ? "bg-red-500" : 
           r.status === "Đang xử lý" || r.status === "Đã phân công" ? "bg-orange-500" : "bg-green-500"
  }));

  return (
    <div className="flex flex-col gap-6 max-w-[1600px] mx-auto">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] md:text-2xl font-bold text-[#111827]">Tổng quan</h1>
          <p className="text-[13px] md:text-sm text-[#6B7280] mt-1">Tình hình tiếp nhận và xử lý phản ánh sự cố hạ tầng trên địa bàn quận Ninh Kiều</p>
        </div>
        <button className="flex items-center gap-2 bg-white border border-[#E5E7EB] px-4 py-2.5 rounded-[12px] text-sm font-medium text-[#111827] shadow-[0_2px_4px_rgba(0,0,0,0.02)] self-start md:self-auto">
          Hôm nay <ChevronDown className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="bg-white p-4 md:p-5 rounded-[16px] border border-[#E5E7EB] shadow-[0_2px_10px_rgba(15,23,42,0.02)] flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <p className="text-[13px] md:text-sm font-semibold text-[#6B7280]">{kpi.label}</p>
              <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center ${kpi.bg}`}>
                <kpi.icon className={`w-4 h-4 md:w-5 md:h-5 ${kpi.color}`} />
              </div>
            </div>
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-[#111827]">{kpi.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LINE CHART */}
        <div className="lg:col-span-2 bg-white p-5 rounded-[16px] border border-[#E5E7EB] shadow-[0_2px_10px_rgba(15,23,42,0.02)]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-[#111827] text-[15px]">Số lượng phản ánh theo ngày</h3>
          </div>
          <div className="h-[250px] md:h-[300px] w-full">
            {mounted && lineData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                  <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} />
                  <Line type="monotone" dataKey="count" stroke="#087F46" strokeWidth={3} dot={{ r: 4, fill: '#087F46', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : <p className="text-gray-400 text-center mt-20">Chưa có đủ dữ liệu</p>}
          </div>
        </div>

        {/* DOUGHNUT CHART */}
        <div className="bg-white p-5 rounded-[16px] border border-[#E5E7EB] shadow-[0_2px_10px_rgba(15,23,42,0.02)] flex flex-col">
          <h3 className="font-bold text-[#111827] text-[15px] mb-2">Tỷ lệ theo loại sự cố</h3>
          <div className="relative h-[200px] w-full flex items-center justify-center">
            {mounted && total > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value" stroke="none">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-gray-400">Không có dữ liệu</p>}
            {total > 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-[#111827]">{total}</span>
                <span className="text-[11px] text-[#6B7280]">phản ánh</span>
              </div>
            )}
          </div>
          <div className="mt-4 flex flex-col gap-2.5">
            {pieData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-[13px]">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-[#4B5563] truncate max-w-[140px]">{item.name}</span>
                </div>
                <span className="font-semibold text-[#111827]">{item.value} <span className="font-normal text-[#9CA3AF] ml-1">({((item.value/total)*100).toFixed(1)}%)</span></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MAP & LIST */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* RECENT REPORTS */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex justify-between items-end">
            <h3 className="font-bold text-[#111827] text-[17px]">Danh sách phản ánh mới nhất</h3>
            <button className="text-[13px] font-semibold text-[#087F46] hover:underline flex items-center gap-1">
              Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          
          <div className="hidden md:block bg-white border border-[#E5E7EB] rounded-[16px] shadow-[0_2px_10px_rgba(15,23,42,0.02)] overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F9FAFB] text-[#6B7280] font-medium border-b border-[#E5E7EB]">
                <tr>
                  <th className="px-5 py-4 font-semibold w-10">□</th>
                  <th className="px-5 py-4 font-semibold">Mã & Hình ảnh</th>
                  <th className="px-5 py-4 font-semibold">Loại sự cố & Địa điểm</th>
                  <th className="px-5 py-4 font-semibold">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {reports.slice(0, 5).map((report, idx) => (
                  <tr 
                    key={idx} 
                    className="hover:bg-[#F9FAFB] transition-colors cursor-pointer"
                    onClick={() => setSelectedReportId(report.id)}
                  >
                    <td className="px-5 py-4" onClick={e => e.stopPropagation()}><input type="checkbox" className="rounded border-gray-300 text-[#087F46] focus:ring-[#087F46]" /></td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {report.image?.previewUrl ? (
                          <img src={report.image.previewUrl} className="w-12 h-12 rounded-lg object-cover" alt="" />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-[10px] text-gray-400">IMG</div>
                        )}
                        <span className="font-semibold text-[#111827]">{report.id}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-bold text-[#111827] mb-1">{report.analysis?.category}</p>
                      <p className="text-xs text-[#6B7280] truncate max-w-[200px]">{report.location.text}</p>
                      <p className="text-[11px] text-[#9CA3AF] mt-0.5">{new Date(report.submittedAt || "").toLocaleString("vi-VN")}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(report.status)}`}>
                        {report.status === "Đã gửi" ? "Cần xử lý" : report.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden flex flex-col gap-3">
            {reports.slice(0, 5).map((report, idx) => (
              <div 
                key={idx} 
                className="bg-white border border-[#E5E7EB] rounded-[16px] p-4 shadow-[0_2px_10px_rgba(15,23,42,0.02)] flex gap-3 cursor-pointer"
                onClick={() => setSelectedReportId(report.id)}
              >
                {report.image?.previewUrl ? (
                    <img src={report.image.previewUrl} className="w-[72px] h-[72px] rounded-xl object-cover shrink-0" alt="" />
                ) : (
                    <div className="w-[72px] h-[72px] bg-gray-200 rounded-xl shrink-0"></div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-bold text-[#111827] text-[14px] truncate pr-2">{report.analysis?.category}</p>
                    <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusColor(report.status)}`}>
                      {report.status === "Đã gửi" ? "Cần xử lý" : report.status}
                    </span>
                  </div>
                  <p className="text-[12px] font-medium text-[#6B7280]">{report.id}</p>
                  <p className="text-[12px] text-[#6B7280] truncate mt-1 flex items-center gap-1"><MapPin className="w-3 h-3" />{report.location.text}</p>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* MAP */}
        <div className="flex flex-col gap-4">
          <h3 className="font-bold text-[#111827] text-[17px] mb-[-4px]">Bản đồ sự cố</h3>
          <div className="bg-white p-2 rounded-[16px] border border-[#E5E7EB] shadow-[0_2px_10px_rgba(15,23,42,0.02)] h-[250px] relative overflow-hidden flex flex-col">
            <div className="absolute top-4 left-4 right-4 z-10 flex justify-between">
              <div className="bg-white px-3 py-1.5 rounded-[10px] text-xs font-bold shadow-sm border border-gray-200 flex items-center gap-1">
                Tất cả loại sự cố <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
              </div>
            </div>
            
            <div className="flex-1 bg-[#E8F0FE] rounded-[12px] flex items-center justify-center relative overflow-hidden">
               <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
               <span className="text-[#94A3B8] font-semibold text-sm z-10 bg-white/80 px-3 py-1 rounded-full">Ninh Kiều, Cần Thơ</span>
               
               {/* Plot dynamic markers on mock map */}
               {markers.map((m, i) => (
                 <div key={i} className={`absolute w-3.5 h-3.5 ${m.color} rounded-full border-2 border-white shadow-md z-10`} style={{
                   top: `${(Math.abs(m.lat * 100) % 80) + 10}%`,
                   left: `${(Math.abs(m.lng * 100) % 80) + 10}%`
                 }}></div>
               ))}
               
               <div className="absolute bottom-3 right-3 flex flex-col gap-1 z-10">
                 <button className="w-7 h-7 bg-white rounded-md shadow flex items-center justify-center font-bold text-gray-600">+</button>
                 <button className="w-7 h-7 bg-white rounded-md shadow flex items-center justify-center font-bold text-gray-600">−</button>
               </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* REPORT DETAIL MODAL */}
      {selectedReportId && (
        <ReportDetailModal 
          reportId={selectedReportId} 
          onClose={() => setSelectedReportId(null)} 
        />
      )}
    </div>
  );
}

function ReportDetailModal({ reportId, onClose }: { reportId: string, onClose: () => void }) {
  const { reports, updateReportStatus } = useReports();
  const report = reports.find(r => r.id === reportId);
  const [newStatus, setNewStatus] = useState<string>("");

  if (!report) return null;

  const handleUpdateStatus = () => {
    if (newStatus && newStatus !== report.status) {
      updateReportStatus(report.id, newStatus as any, "Cán bộ tiếp nhận");
    }
  };

  const statusColors: Record<string, string> = {
    "Cần xử lý": "bg-red-100 text-red-700",
    "Đã gửi": "bg-red-100 text-red-700",
    "Đã phân công": "bg-orange-100 text-orange-700",
    "Đang xử lý": "bg-orange-100 text-orange-700",
    "Đã xử lý": "bg-green-100 text-green-700"
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[24px] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#E5E7EB] flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Chi tiết phản ánh</h2>
            <p className="text-sm text-gray-500">{report.id}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-white rounded-full border border-gray-200 hover:bg-gray-100 text-gray-600 font-bold">✕</button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/2 flex flex-col gap-4">
            {report.image.previewUrl ? (
              <img src={report.image.previewUrl} alt="Sự cố" className="w-full h-48 object-cover rounded-xl border border-gray-200" />
            ) : (
              <div className="w-full h-48 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">Không có ảnh</div>
            )}
            
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
               <p className="text-xs text-gray-500 mb-1">Loại sự cố</p>
               <p className="font-bold text-gray-900">{report.analysis?.category}</p>
               
               <p className="text-xs text-gray-500 mt-3 mb-1">Mức độ cảnh báo</p>
               <p className="font-bold text-gray-900">{report.analysis?.severity === 'high' ? 'Cao' : report.analysis?.severity === 'medium' ? 'Trung bình' : 'Thấp'}</p>

               <p className="text-xs text-gray-500 mt-3 mb-1">Vị trí</p>
               <p className="font-semibold text-gray-900">{report.location.text}</p>
               {report.location.lat && <p className="text-xs text-gray-400">({report.location.lat.toFixed(4)}, {report.location.lng?.toFixed(4)})</p>}
            </div>
          </div>

          <div className="w-full md:w-1/2 flex flex-col gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Nội dung phản ánh từ người dân</p>
              <div className="bg-white border border-gray-200 p-3 rounded-xl text-sm text-gray-700 whitespace-pre-wrap max-h-40 overflow-y-auto">
                {report.editedDraft}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
              <p className="text-xs text-blue-600 font-bold mb-2 uppercase tracking-wide">Cập nhật trạng thái</p>
              <div className="flex gap-2 mb-3">
                <span className={`px-2 py-1 rounded-md text-xs font-bold ${statusColors[report.status] || 'bg-gray-100'}`}>
                  Hiện tại: {report.status === "Đã gửi" ? "Cần xử lý" : report.status}
                </span>
              </div>
              <select 
                className="w-full p-2 border border-blue-200 rounded-lg text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newStatus}
                onChange={e => setNewStatus(e.target.value)}
              >
                <option value="">-- Chọn trạng thái mới --</option>
                <option value="Cần xử lý">Cần xử lý</option>
                <option value="Đã phân công">Đã phân công (Chuyển đơn vị)</option>
                <option value="Đang xử lý">Đang xử lý (Ra hiện trường)</option>
                <option value="Đã xử lý">Đã xử lý (Hoàn thành)</option>
              </select>
              <button 
                onClick={handleUpdateStatus}
                disabled={!newStatus || newStatus === report.status}
                className="w-full bg-[#087F46] disabled:bg-gray-300 text-white font-bold py-2 rounded-lg text-sm"
              >
                Lưu trạng thái
              </button>
            </div>

            {report.logs && report.logs.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-2">Nhật ký xử lý</p>
                <div className="flex flex-col gap-2 max-h-24 overflow-y-auto">
                  {report.logs.map((log, i) => (
                    <div key={i} className="text-xs bg-gray-50 p-2 rounded-lg border border-gray-100">
                      <p className="text-gray-500">{new Date(log.createdAt).toLocaleString('vi-VN')} - <b>{log.actor}</b></p>
                      <p className="text-gray-800">Chuyển: {log.from === "Đã gửi" ? "Cần xử lý" : log.from} ➔ <b>{log.to}</b></p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
