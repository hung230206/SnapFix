"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, List, Map as MapIcon, BarChart2, Layers, 
  Users, FileText, Settings, LogOut, Bell, Search, Menu, X, Camera, ShieldCheck
} from "lucide-react";

export default function OfficerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navItems = [
    { label: "Tổng quan", href: "/officer", icon: Home },
    { label: "Danh sách", href: "/officer/reports", icon: List },
    { label: "Bản đồ", href: "/officer/map", icon: MapIcon },
    { label: "Thống kê", href: "/officer/statistics", icon: BarChart2 },
    { label: "Loại sự cố", href: "/officer/categories", icon: Layers },
    { label: "Người dùng", href: "/officer/users", icon: Users },
    { label: "Báo cáo", href: "/officer/reports-export", icon: FileText },
    { label: "Cài đặt", href: "/officer/settings", icon: Settings },
  ];

  const mainNavItems = navItems.slice(0, 3);

  return (
    <div className="min-h-screen bg-[#F5F7F8] flex flex-col md:flex-row">
      
      {/* --------------------------------------------------- */}
      {/* MOBILE DRAWER OVERLAY */}
      {/* --------------------------------------------------- */}
      {drawerOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* MOBILE DRAWER */}
      <div className={`fixed inset-y-0 left-0 w-[260px] bg-white z-50 transform transition-transform duration-300 md:hidden flex flex-col shadow-xl ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b border-[#E5E7EB] flex justify-between items-center bg-[#087F46] text-white">
          <div>
            <h2 className="font-bold text-lg leading-tight">SnapFix CT</h2>
            <p className="text-xs opacity-80">UBND Quận Ninh Kiều</p>
          </div>
          <button onClick={() => setDrawerOpen(false)} className="p-2 text-white/80 rounded-full hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                onClick={() => setDrawerOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-sm font-medium transition-colors ${isActive ? 'bg-[#E8F7EF] text-[#087F46]' : 'text-[#6B7280] hover:bg-gray-100 hover:text-gray-900'}`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-[#E5E7EB]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#087F46] flex items-center justify-center text-white font-bold">A</div>
            <div>
              <p className="text-sm font-bold text-gray-900">Nguyễn Văn A</p>
              <p className="text-xs text-gray-500">Cán bộ tiếp nhận</p>
            </div>
          </div>
          <Link href="/" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-[12px]">
            <LogOut className="w-5 h-5" />
            Đăng xuất
          </Link>
        </div>
      </div>

      {/* --------------------------------------------------- */}
      {/* DESKTOP SIDEBAR */}
      {/* --------------------------------------------------- */}
      <aside className="hidden md:flex flex-col w-[240px] bg-[#056638] text-white fixed inset-y-0 left-0 z-20 shadow-xl">
        <div className="p-6">
          <h2 className="font-bold text-xl leading-tight tracking-tight">SnapFix CT</h2>
          <p className="text-xs text-green-200 mt-1">Hệ thống tiếp nhận phản ánh</p>
        </div>
        <nav className="flex-1 overflow-y-auto px-4 flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center gap-3 px-3 py-3 rounded-[12px] text-[14px] font-medium transition-colors ${isActive ? 'bg-[#087F46] text-white shadow-sm' : 'text-green-100 hover:bg-[#087F46]/50 hover:text-white'}`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'opacity-100' : 'opacity-70'}`} />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 mt-auto">
          <div className="bg-[#087F46] rounded-[16px] p-4 flex flex-col gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white text-[#056638] flex items-center justify-center font-bold text-sm shrink-0">A</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">Nguyễn Văn A</p>
                <p className="text-[11px] text-green-200 truncate">Cán bộ tiếp nhận</p>
              </div>
            </div>
            <Link href="/" className="flex items-center gap-2 text-[13px] text-green-100 hover:text-white transition-colors">
              <LogOut className="w-4 h-4" />
              Đăng xuất
            </Link>
          </div>
        </div>
      </aside>

      {/* --------------------------------------------------- */}
      {/* MAIN CONTENT AREA */}
      {/* --------------------------------------------------- */}
      <div className="flex-1 flex flex-col md:ml-[240px] pb-[70px] md:pb-0 min-h-screen">
        
        {/* MOBILE HEADER */}
        <header className="md:hidden bg-white border-b border-[#E5E7EB] sticky top-0 z-30 px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#E8F7EF] rounded-[8px] flex items-center justify-center">
              <Camera className="w-5 h-5 text-[#087F46]" />
            </div>
            <span className="font-bold text-[#087F46] text-lg">SnapFix CT</span>
          </div>
          <div className="flex items-center gap-1">
            <button className="p-2 text-gray-500 rounded-full hover:bg-gray-100 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            <button onClick={() => setDrawerOpen(true)} className="p-2 text-gray-500 rounded-full hover:bg-gray-100">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </header>

        {/* DESKTOP HEADER */}
        <header className="hidden md:flex bg-white h-16 border-b border-[#E5E7EB] items-center justify-between px-8 sticky top-0 z-10 shadow-[0_2px_10px_rgba(15,23,42,0.02)]">
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Tìm kiếm phản ánh (mã, địa điểm, loại sự cố, người gửi...)" 
                className="w-full bg-[#F5F7F8] border-none rounded-[12px] py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#087F46]/20 transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <button className="text-gray-500 hover:text-gray-900 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white">3</span>
            </button>
            <div className="flex items-center gap-3 border-l border-gray-200 pl-6">
              <div className="text-right hidden lg:block">
                <p className="text-[13px] font-bold text-[#111827]">UBND Quận Ninh Kiều</p>
                <p className="text-[11px] text-[#6B7280]">Cơ quan tiếp nhận</p>
              </div>
              <div className="w-9 h-9 bg-[#F5F7F8] rounded-full flex items-center justify-center border border-[#E5E7EB]">
                <ShieldCheck className="w-5 h-5 text-[#087F46]" />
              </div>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* --------------------------------------------------- */}
      {/* MOBILE BOTTOM NAV */}
      {/* --------------------------------------------------- */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E7EB] flex justify-around items-center h-[70px] z-30 pb-safe shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        {mainNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 w-full h-full ${isActive ? 'text-[#087F46]' : 'text-[#6B7280]'}`}
            >
              <item.icon className={`w-6 h-6 ${isActive ? 'fill-[#E8F7EF]' : ''}`} />
              <span className="text-[11px] font-medium">{item.label}</span>
            </Link>
          )
        })}
        <Link 
          href="/officer/statistics"
          className={`flex flex-col items-center justify-center gap-1 w-full h-full ${pathname === '/officer/statistics' ? 'text-[#087F46]' : 'text-[#6B7280]'}`}
        >
          <BarChart2 className={`w-6 h-6 ${pathname === '/officer/statistics' ? 'fill-[#E8F7EF]' : ''}`} />
          <span className="text-[11px] font-medium">Thống kê</span>
        </Link>
        <button 
          onClick={() => setDrawerOpen(true)}
          className="flex flex-col items-center justify-center gap-1 w-full h-full text-[#6B7280]"
        >
          <Menu className="w-6 h-6" />
          <span className="text-[11px] font-medium">Menu</span>
        </button>
      </div>

    </div>
  );
}
