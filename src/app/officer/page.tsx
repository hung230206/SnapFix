"use client";

import React, { useState, useEffect } from "react";
import { 
  FileText, AlertTriangle, Clock, CheckCircle2, ChevronDown, 
  MapPin, ArrowRight, MoreHorizontal 
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function OfficerDashboard() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const kpis = [
    { label: "Tổng phản ánh", value: 128, change: "+12%", changeText: "so với tuần trước", icon: FileText, color: "text-blue-600", bg: "bg-blue-100" },
    { label: "Cần xử lý", value: 32, change: "+8%", changeText: "đang chờ phân công", icon: AlertTriangle, color: "text-red-600", bg: "bg-red-100" },
    { label: "Đang xử lý", value: 54, change: "+5%", changeText: "đã phân công", icon: Clock, color: "text-orange-600", bg: "bg-orange-100" },
    { label: "Đã xử lý", value: 36, change: "+20%", changeText: "hoàn thành", icon: CheckCircle2, color: "text-green-600", bg: "bg-green-100" }
  ];

  const lineData = [
    { name: "29/09", count: 8 },
    { name: "30/09", count: 12 },
    { name: "01/10", count: 17 },
    { name: "02/10", count: 22 },
    { name: "03/10", count: 30 },
    { name: "04/10", count: 19 },
    { name: "05/10", count: 34 }
  ];

  const pieData = [
    { name: "Ổ gà, hư mặt đường", value: 42, color: "#EF4444" },
    { name: "Ngập nước", value: 28, color: "#3B82F6" },
    { name: "Đèn đường hỏng", value: 20, color: "#EAB308" },
    { name: "Vỉa hè hư hỏng", value: 18, color: "#F97316" },
    { name: "Khác", value: 20, color: "#9CA3AF" }
  ];

  const recentReports = [
    { id: "#SF20261005001", category: "Ổ gà, hư mặt đường", address: "Đường Nguyễn Văn Cừ, P. An Hòa", date: "05/10 09:12", status: "Cần xử lý", priority: "Cao", color: "text-red-600 bg-red-100" },
    { id: "#SF20261005002", category: "Ngập nước", address: "Đường 3/2, P. Hưng Lợi", date: "05/10 08:45", status: "Đang xử lý", priority: "Trung bình", color: "text-orange-600 bg-orange-100" },
    { id: "#SF20261005003", category: "Vỉa hè hư hỏng", address: "Đường Hai Bà Trưng, P. Tân An", date: "05/10 08:20", status: "Cần xử lý", priority: "Trung bình", color: "text-red-600 bg-red-100" },
    { id: "#SF20261005004", category: "Đèn đường hỏng", address: "Đường Trần Hưng Đạo, P. An Nghiệp", date: "05/10 07:55", status: "Đã xử lý", priority: "Thấp", color: "text-green-600 bg-green-100" }
  ];

  return (
    <div className="flex flex-col gap-6 max-w-[1600px] mx-auto">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] md:text-2xl font-bold text-[#111827]">Tổng quan</h1>
          <p className="text-[13px] md:text-sm text-[#6B7280] mt-1">Tình hình tiếp nhận và xử lý phản ánh sự cố hạ tầng trên địa bàn quận Ninh Kiều</p>
        </div>
        <button className="flex items-center gap-2 bg-white border border-[#E5E7EB] px-4 py-2.5 rounded-[12px] text-sm font-medium text-[#111827] shadow-[0_2px_4px_rgba(0,0,0,0.02)] self-start md:self-auto">
          Hôm nay (05/10/2026) <ChevronDown className="w-4 h-4 text-gray-500" />
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
              <div className="mt-2 text-[11px] md:text-[12px]">
                <span className="text-[#087F46] font-bold">{kpi.change}</span>
                <span className="text-[#6B7280] ml-1">{kpi.changeText}</span>
              </div>
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
            <button className="text-[13px] font-medium text-[#6B7280] flex items-center gap-1">
              7 ngày qua <ChevronDown className="w-4 h-4" />
            </button>
          </div>
          <div className="h-[250px] md:h-[300px] w-full">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
                  />
                  <Line type="monotone" dataKey="count" stroke="#087F46" strokeWidth={3} dot={{ r: 4, fill: '#087F46', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* DOUGHNUT CHART */}
        <div className="bg-white p-5 rounded-[16px] border border-[#E5E7EB] shadow-[0_2px_10px_rgba(15,23,42,0.02)] flex flex-col">
          <h3 className="font-bold text-[#111827] text-[15px] mb-2">Tỷ lệ theo loại sự cố</h3>
          <div className="relative h-[200px] w-full flex items-center justify-center">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value" stroke="none">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            )}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-[#111827]">128</span>
              <span className="text-[11px] text-[#6B7280]">phản ánh</span>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-2.5">
            {pieData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-[13px]">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-[#4B5563] truncate max-w-[140px]">{item.name}</span>
                </div>
                <span className="font-semibold text-[#111827]">{item.value} <span className="font-normal text-[#9CA3AF] ml-1">({((item.value/128)*100).toFixed(1)}%)</span></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MAP & LIST (Desktop Layout: 2 cols, Mobile Layout: Stacked) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* RECENT REPORTS LIST */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex justify-between items-end">
            <h3 className="font-bold text-[#111827] text-[17px]">Danh sách phản ánh mới nhất</h3>
            <button className="text-[13px] font-semibold text-[#087F46] hover:underline flex items-center gap-1">
              Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          
          {/* DESKTOP TABLE */}
          <div className="hidden md:block bg-white border border-[#E5E7EB] rounded-[16px] shadow-[0_2px_10px_rgba(15,23,42,0.02)] overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F9FAFB] text-[#6B7280] font-medium border-b border-[#E5E7EB]">
                <tr>
                  <th className="px-5 py-4 font-semibold w-10">□</th>
                  <th className="px-5 py-4 font-semibold">Mã & Hình ảnh</th>
                  <th className="px-5 py-4 font-semibold">Loại sự cố & Địa điểm</th>
                  <th className="px-5 py-4 font-semibold">Trạng thái</th>
                  <th className="px-5 py-4 font-semibold">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {recentReports.map((report, idx) => (
                  <tr key={idx} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="px-5 py-4"><input type="checkbox" className="rounded border-gray-300 text-[#087F46] focus:ring-[#087F46]" /></td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg shrink-0 overflow-hidden">
                           <div className="w-full h-full bg-gray-200 flex items-center justify-center text-[10px] text-gray-400">IMG</div>
                        </div>
                        <span className="font-semibold text-[#111827]">{report.id}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-bold text-[#111827] mb-1">{report.category}</p>
                      <p className="text-xs text-[#6B7280] truncate max-w-[200px]">{report.address}</p>
                      <p className="text-[11px] text-[#9CA3AF] mt-0.5">{report.date}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${report.color}`}>
                        {report.status}
                      </span>
                      <p className="text-[11px] text-[#6B7280] mt-1 font-medium">Ưu tiên: {report.priority}</p>
                    </td>
                    <td className="px-5 py-4">
                      <button className="text-[#087F46] font-semibold text-[13px] hover:underline bg-[#E8F7EF] px-3 py-1.5 rounded-lg">Xem chi tiết</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARDS */}
          <div className="md:hidden flex flex-col gap-3">
            {recentReports.map((report, idx) => (
              <div key={idx} className="bg-white border border-[#E5E7EB] rounded-[16px] p-4 shadow-[0_2px_10px_rgba(15,23,42,0.02)] flex gap-3">
                <div className="w-[72px] h-[72px] bg-gray-200 rounded-xl shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-bold text-[#111827] text-[14px] truncate pr-2">{report.category}</p>
                    <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${report.color}`}>
                      {report.status}
                    </span>
                  </div>
                  <p className="text-[12px] font-medium text-[#6B7280]">{report.id}</p>
                  <p className="text-[12px] text-[#6B7280] truncate mt-1 flex items-center gap-1"><MapPin className="w-3 h-3" />{report.address}</p>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-[11px] text-[#9CA3AF] font-medium">{report.date}</p>
                    <button className="text-[#087F46] font-bold text-[12px]">Chi tiết →</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* MAP PLACEHOLDER / PROCESSING PANEL */}
        <div className="flex flex-col gap-4">
          <h3 className="font-bold text-[#111827] text-[17px] mb-[-4px]">Bản đồ sự cố</h3>
          <div className="bg-white p-2 rounded-[16px] border border-[#E5E7EB] shadow-[0_2px_10px_rgba(15,23,42,0.02)] h-[250px] relative overflow-hidden flex flex-col">
            {/* Filter */}
            <div className="absolute top-4 left-4 right-4 z-10 flex justify-between">
              <div className="bg-white px-3 py-1.5 rounded-[10px] text-xs font-bold shadow-sm border border-gray-200 flex items-center gap-1">
                Tất cả loại sự cố <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
              </div>
            </div>
            
            {/* Mock Map Background */}
            <div className="flex-1 bg-[#E8F0FE] rounded-[12px] flex items-center justify-center relative">
               {/* Grid pattern to simulate map */}
               <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
               <span className="text-[#94A3B8] font-semibold text-sm z-10 bg-white/80 px-3 py-1 rounded-full">Ninh Kiều, Cần Thơ</span>
               
               {/* Mock Markers */}
               <div className="absolute top-[30%] left-[40%] w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-md z-10"></div>
               <div className="absolute top-[50%] left-[60%] w-4 h-4 bg-orange-500 rounded-full border-2 border-white shadow-md z-10"></div>
               <div className="absolute top-[70%] left-[30%] w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-md z-10"></div>
               
               <div className="absolute bottom-3 right-3 flex flex-col gap-1 z-10">
                 <button className="w-7 h-7 bg-white rounded-md shadow flex items-center justify-center font-bold text-gray-600">+</button>
                 <button className="w-7 h-7 bg-white rounded-md shadow flex items-center justify-center font-bold text-gray-600">−</button>
               </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-[16px] border border-[#E5E7EB] shadow-[0_2px_10px_rgba(15,23,42,0.02)] mt-2">
            <h3 className="font-bold text-[#111827] text-[15px] mb-3">Chú giải bản đồ</h3>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-[13px] font-medium text-[#4B5563]">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div> Cần xử lý</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-500"></div> Đang xử lý</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500"></div> Đã xử lý</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div> Khác</div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
