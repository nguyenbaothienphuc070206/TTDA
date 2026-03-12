"use client";

import { useEffect, useMemo, useState } from "react";

import { readAttendance, readExams, readMembers } from "@/lib/adminData";
import { readOrders } from "@/lib/orders";
import { formatVnd } from "@/data/store";

function todayInput() {
  return new Date().toISOString().slice(0, 10);
}

function StatCard({ label, value, sub }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-xs font-semibold text-slate-300">{label}</div>
      <div className="mt-2 text-2xl font-semibold tracking-tight text-white">{value}</div>
      {sub ? <div className="mt-1 text-xs text-slate-300">{sub}</div> : null}
    </div>
  );
}

export default function AdminOverview() {
  const [members, setMembers] = useState(() => readMembers());
  const [attendance, setAttendance] = useState(() => readAttendance());
  const [exams, setExams] = useState(() => readExams());
  const [orders, setOrders] = useState(() => readOrders());

  useEffect(() => {
    const sync = () => {
      setMembers(readMembers());
      setAttendance(readAttendance());
      setExams(readExams());
      setOrders(readOrders());
    };

    sync();
    window.addEventListener("vovinam-admin-members", sync);
    window.addEventListener("vovinam-admin-attendance", sync);
    window.addEventListener("vovinam-admin-exams", sync);
    window.addEventListener("vovinam-orders", sync);
    window.addEventListener("storage", sync);

    return () => {
      window.removeEventListener("vovinam-admin-members", sync);
      window.removeEventListener("vovinam-admin-attendance", sync);
      window.removeEventListener("vovinam-admin-exams", sync);
      window.removeEventListener("vovinam-orders", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const today = todayInput();

  const todayAttendanceCount = useMemo(() => {
    return (Array.isArray(attendance) ? attendance : []).filter((r) => r && r.date === today).length;
  }, [attendance, today]);

  const revenueVnd = useMemo(() => {
    const list = Array.isArray(orders) ? orders : [];
    return list.reduce((sum, o) => sum + (Number(o?.totalVnd) || 0), 0);
  }, [orders]);

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Hội viên" value={Array.isArray(members) ? members.length : 0} sub="localStorage" />
      <StatCard label="Điểm danh hôm nay" value={todayAttendanceCount} sub={today} />
      <StatCard label="Bài thi" value={Array.isArray(exams) ? exams.length : 0} sub="đã lưu" />
      <StatCard label="Doanh thu" value={formatVnd(revenueVnd)} sub="từ đơn hàng demo" />
    </div>
  );
}
