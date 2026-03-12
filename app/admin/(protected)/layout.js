import Link from "next/link";

import AdminLogoutButton from "@/components/admin/AdminLogoutButton";

function NavLink({ href, children }) {
  return (
    <Link
      href={href}
      className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-200 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-300/40"
    >
      {children}
    </Link>
  );
}

export default function AdminLayout({ children }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <header className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Admin / Coach Dashboard
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
              Quản lý hội viên, điểm danh, thi lên đai và tài chính (demo localStorage).
            </p>
          </div>
          <AdminLogoutButton />
        </div>

        <nav className="mt-4 flex flex-wrap gap-2">
          <NavLink href="/admin">Tổng quan</NavLink>
          <NavLink href="/admin/hoi-vien">Hội viên</NavLink>
          <NavLink href="/admin/diem-danh">Điểm danh</NavLink>
          <NavLink href="/admin/thi-len-dai">Thi lên đai</NavLink>
          <NavLink href="/admin/tai-chinh">Tài chính</NavLink>
          <NavLink href="/admin/thong-ke">Thống kê</NavLink>
          <NavLink href="/admin/rbac">RBAC</NavLink>
        </nav>
      </header>

      <div className="mt-6">{children}</div>
    </div>
  );
}
