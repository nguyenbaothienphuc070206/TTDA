import Link from "next/link";

import AdminOverview from "@/components/admin/AdminOverview";

export const metadata = {
  title: "Admin/Coach",
};

function QuickLink({ href, title, desc }) {
  return (
    <Link
      href={href}
      className="rounded-3xl border border-white/10 bg-slate-950/30 p-5 transition hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-cyan-300/30"
    >
      <div className="text-sm font-semibold text-white">{title}</div>
      <div className="mt-2 text-sm leading-6 text-slate-300">{desc}</div>
    </Link>
  );
}

export default function AdminHomePage() {
  return (
    <div className="grid gap-4">
      <AdminOverview />

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-white">Lối tắt</h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Các module admin/coach đang chạy dạng demo (data lưu trên trình duyệt).
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <QuickLink
            href="/admin/hoi-vien"
            title="Quản lý hội viên"
            desc="Thêm/xóa hội viên, cấp đai hiện tại."
          />
          <QuickLink
            href="/admin/diem-danh"
            title="Điểm danh (QR demo)"
            desc="Check-in theo ngày; có thể nhập mã thay cho quét QR."
          />
          <QuickLink
            href="/admin/thi-len-dai"
            title="Thi lên đai"
            desc="Chấm điểm, lưu kết quả, xuất chứng nhận dạng text."
          />
          <QuickLink
            href="/admin/tai-chinh"
            title="Tài chính"
            desc="Xem đơn hàng từ cửa hàng và tổng doanh thu (demo)."
          />
          <QuickLink
            href="/admin/rbac"
            title="RBAC"
            desc="Xem trạng thái phiên đăng nhập và đăng xuất."
          />
        </div>
      </section>
    </div>
  );
}
