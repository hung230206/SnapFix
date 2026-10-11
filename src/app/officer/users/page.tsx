import { Building2, Mail, ShieldCheck, UserRound, Users } from "lucide-react";

import { getOfficerUserSummaries } from "@/services/officer-directory-service";

const ROLE_CLASSES = {
  CITIZEN: "bg-blue-50 text-blue-700",
  OFFICER: "bg-emerald-50 text-emerald-700",
  MANAGER: "bg-violet-100 text-violet-700",
  ADMIN: "bg-slate-100 text-slate-700",
} as const;

export const dynamic = "force-dynamic";

export default async function OfficerUsersPage() {
  const users = await getOfficerUserSummaries();

  return (
    <div className="mx-auto flex max-w-[1600px] flex-col gap-6">
      <header>
        <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#087F46]">
          <Users className="size-4" aria-hidden="true" />
          Dữ liệu người dùng
        </p>
        <h1 className="text-[22px] font-bold text-[#111827] md:text-2xl">
          Người dùng
        </h1>
        <p className="mt-1 max-w-3xl text-[13px] leading-5 text-[#6B7280] md:text-sm">
          Danh sách read-only từ repository demo. Trang này không cung cấp thao
          tác quản trị tài khoản hoặc phân quyền.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-5">
          <p className="text-sm font-semibold text-[#6B7280]">Tổng người dùng</p>
          <p className="mt-3 text-3xl font-bold text-[#111827]">{users.length}</p>
        </div>
        <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-5">
          <p className="text-sm font-semibold text-[#6B7280]">Công dân</p>
          <p className="mt-3 text-3xl font-bold text-[#111827]">
            {users.filter((user) => user.role === "CITIZEN").length}
          </p>
        </div>
        <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-5">
          <p className="text-sm font-semibold text-[#6B7280]">Cán bộ</p>
          <p className="mt-3 text-3xl font-bold text-[#111827]">
            {users.filter((user) => user.role === "OFFICER").length}
          </p>
        </div>
        <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-5">
          <p className="text-sm font-semibold text-[#6B7280]">Vai trò khác</p>
          <p className="mt-3 text-3xl font-bold text-[#111827]">
            {users.filter(
              (user) => user.role !== "CITIZEN" && user.role !== "OFFICER",
            ).length}
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {users.map((user) => (
          <article
            key={user.id}
            className="min-w-0 rounded-[16px] border border-[#E5E7EB] bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,0.02)]"
          >
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#E8F7EF] text-[#087F46]">
                {user.role === "OFFICER" || user.role === "MANAGER" ? (
                  <ShieldCheck className="size-5" aria-hidden="true" />
                ) : (
                  <UserRound className="size-5" aria-hidden="true" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h2 className="break-words text-base font-bold text-[#111827]">
                    {user.displayName}
                  </h2>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${ROLE_CLASSES[user.role]}`}
                  >
                    {user.roleLabel}
                  </span>
                </div>
                {user.email ? (
                  <p className="mt-2 flex min-w-0 items-center gap-2 text-xs text-[#6B7280]">
                    <Mail className="size-3.5 shrink-0" aria-hidden="true" />
                    <span className="min-w-0 break-all">{user.email}</span>
                  </p>
                ) : null}
                {user.department ? (
                  <p className="mt-2 flex items-center gap-2 text-xs text-[#6B7280]">
                    <Building2
                      className="size-3.5 shrink-0"
                      aria-hidden="true"
                    />
                    {user.department}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 border-t border-[#F3F4F6] pt-4">
              <div className="rounded-[12px] bg-[#F9FAFB] p-3">
                <p className="text-xs text-[#6B7280]">Phản ánh đã gửi</p>
                <p className="mt-1 text-xl font-bold text-[#111827]">
                  {user.submittedReportCount}
                </p>
              </div>
              <div className="rounded-[12px] bg-[#F9FAFB] p-3">
                <p className="text-xs text-[#6B7280]">Sự cố phụ trách</p>
                <p className="mt-1 text-xl font-bold text-[#111827]">
                  {user.assignedIncidentCount}
                </p>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
