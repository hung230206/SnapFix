"use client";

import { useState } from "react";
import {
  Bell,
  CheckCircle2,
  Mail,
  MonitorCog,
  Save,
  Settings,
  ShieldCheck,
} from "lucide-react";

import type { OfficerUserSummary } from "@/services/officer-directory-service";

export function OfficerSettingsView({
  officer,
}: {
  officer: OfficerUserSummary | null;
}) {
  const [inAppNotifications, setInAppNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [compactView, setCompactView] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <header>
        <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#087F46]">
          <Settings className="size-4" aria-hidden="true" /> Tùy chọn cá nhân
        </p>
        <h1 className="text-[22px] font-bold text-[#111827] md:text-2xl">
          Cài đặt cán bộ
        </h1>
        <p className="mt-1 text-sm text-[#6B7280]">
          Các thay đổi chỉ tồn tại trong phiên giao diện prototype hiện tại.
        </p>
      </header>

      <section className="rounded-[16px] border border-[#E5E7EB] bg-white p-5 md:p-6">
        <div className="flex items-center gap-3 border-b border-[#E5E7EB] pb-4">
          <div className="flex size-11 items-center justify-center rounded-full bg-[#E8F7EF] text-[#087F46]">
            <ShieldCheck className="size-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="font-bold text-[#111827]">Thông tin tài khoản</h2>
            <p className="text-xs text-[#6B7280]">
              Dữ liệu read-only từ repository demo
            </p>
          </div>
        </div>
        {officer ? (
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            {[
              ["Họ và tên", officer.displayName],
              ["Vai trò", officer.roleLabel],
              ["Email", officer.email ?? "Chưa có email"],
              ["Đơn vị", officer.department ?? "Chưa gán đơn vị"],
            ].map(([label, value]) => (
              <label key={label} className="text-sm font-semibold text-[#374151]">
                {label}
                <input
                  readOnly
                  value={value}
                  className="mt-2 min-h-11 w-full rounded-[10px] border border-[#D1D5DB] bg-[#F9FAFB] px-3 text-sm font-normal text-[#6B7280]"
                />
              </label>
            ))}
          </div>
        ) : (
          <p className="mt-5 text-sm text-[#6B7280]">
            Chưa có hồ sơ cán bộ trong dữ liệu demo.
          </p>
        )}
      </section>

      <section className="rounded-[16px] border border-[#E5E7EB] bg-white p-5 md:p-6">
        <h2 className="font-bold text-[#111827]">Thông báo và hiển thị</h2>
        <div className="mt-3 divide-y divide-[#F3F4F6]">
          {[
            {
              label: "Thông báo trong ứng dụng",
              description: "Hiển thị cập nhật trong giao diện cán bộ.",
              checked: inAppNotifications,
              setChecked: setInAppNotifications,
              icon: Bell,
            },
            {
              label: "Thông báo qua email",
              description: "Tùy chọn UI; chưa có dịch vụ gửi email thật.",
              checked: emailNotifications,
              setChecked: setEmailNotifications,
              icon: Mail,
            },
            {
              label: "Chế độ hiển thị gọn",
              description: "Giảm khoảng cách giữa các hàng dữ liệu.",
              checked: compactView,
              setChecked: setCompactView,
              icon: MonitorCog,
            },
          ].map((option) => {
            const Icon = option.icon;
            return (
              <label
                key={option.label}
                className="flex min-h-20 cursor-pointer items-center justify-between gap-4 py-4"
              >
                <span className="flex min-w-0 items-start gap-3">
                  <Icon className="mt-0.5 size-5 shrink-0 text-[#087F46]" />
                  <span>
                    <span className="block text-sm font-semibold text-[#111827]">
                      {option.label}
                    </span>
                    <span className="mt-1 block text-xs text-[#6B7280]">
                      {option.description}
                    </span>
                  </span>
                </span>
                <input
                  type="checkbox"
                  checked={option.checked}
                  onChange={(event) => {
                    option.setChecked(event.target.checked);
                    setSaved(false);
                  }}
                  className="size-5 shrink-0 accent-[#087F46]"
                />
              </label>
            );
          })}
        </div>
        <div className="mt-4 flex flex-col items-start justify-between gap-3 border-t border-[#E5E7EB] pt-5 sm:flex-row sm:items-center">
          <p className="text-xs text-[#6B7280]" aria-live="polite">
            {saved ? (
              <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700">
                <CheckCircle2 className="size-4" /> Đã lưu trong phiên này
              </span>
            ) : (
              "Chưa lưu thay đổi trong phiên giao diện."
            )}
          </p>
          <button
            type="button"
            onClick={() => setSaved(true)}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[12px] bg-[#087F46] px-4 py-2.5 text-sm font-semibold text-white sm:w-auto"
          >
            <Save className="size-4" /> Lưu tùy chọn
          </button>
        </div>
      </section>
    </div>
  );
}
