"use client";

import { useEffect, useMemo, useState } from "react";
import { Bar, Line } from "react-chartjs-2";

import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Title,
} from "chart.js";

import { getLessonBySlug } from "@/data/lessons";
import { formatVnd, getProductById } from "@/data/store";
import { getVideoById } from "@/data/videos";
import { getTechniqueBySlug } from "@/data/wiki";
import { readAttendance, readExams, readMembers } from "@/lib/adminData";
import { readAnalytics, topByCount } from "@/lib/analytics";
import { readOrders } from "@/lib/orders";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Title,
  Filler
);

function StatCard({ label, value, sub }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-xs font-semibold text-slate-300">{label}</div>
      <div className="mt-2 text-2xl font-semibold tracking-tight text-white">{value}</div>
      {sub ? <div className="mt-1 text-xs text-slate-300">{sub}</div> : null}
    </div>
  );
}

function isoDate(ms) {
  const d = new Date(ms);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function clampScore(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(10, Math.round(n * 10) / 10));
}

function lastDays(count) {
  const safe = Math.max(1, Math.round(Number(count) || 7));
  const today = new Date();
  const out = [];
  for (let i = safe - 1; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

function chartTheme() {
  const text = "rgba(226, 232, 240, 0.92)";
  const grid = "rgba(255, 255, 255, 0.08)";
  const cyan = "rgba(34, 211, 238, 0.85)";
  const blue = "rgba(59, 130, 246, 0.85)";

  return {
    text,
    grid,
    cyan,
    blue,
  };
}

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState(() => readAnalytics());
  const [members, setMembers] = useState(() => readMembers());
  const [attendance, setAttendance] = useState(() => readAttendance());
  const [exams, setExams] = useState(() => readExams());
  const [orders, setOrders] = useState(() => readOrders());

  useEffect(() => {
    const sync = () => {
      setAnalytics(readAnalytics());
      setMembers(readMembers());
      setAttendance(readAttendance());
      setExams(readExams());
      setOrders(readOrders());
    };

    sync();
    window.addEventListener("vovinam-analytics", sync);
    window.addEventListener("vovinam-admin-members", sync);
    window.addEventListener("vovinam-admin-attendance", sync);
    window.addEventListener("vovinam-admin-exams", sync);
    window.addEventListener("vovinam-orders", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("vovinam-analytics", sync);
      window.removeEventListener("vovinam-admin-members", sync);
      window.removeEventListener("vovinam-admin-attendance", sync);
      window.removeEventListener("vovinam-admin-exams", sync);
      window.removeEventListener("vovinam-orders", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const revenueVnd = useMemo(() => {
    const list = Array.isArray(orders) ? orders : [];
    return list.reduce((sum, o) => sum + (Number(o?.totalVnd) || 0), 0);
  }, [orders]);

  const topLessons = useMemo(() => {
    return topByCount(analytics.lessonViews, 7).map((x) => {
      const lesson = getLessonBySlug(x.id);
      return {
        id: x.id,
        label: lesson ? lesson.title : x.id,
        count: x.count,
      };
    });
  }, [analytics.lessonViews]);

  const topVideos = useMemo(() => {
    return topByCount(analytics.videoViews, 7).map((x) => {
      const video = getVideoById(x.id);
      return {
        id: x.id,
        label: video ? video.title : x.id,
        count: x.count,
      };
    });
  }, [analytics.videoViews]);

  const topTechniques = useMemo(() => {
    return topByCount(analytics.techniqueViews, 7).map((x) => {
      const t = getTechniqueBySlug(x.id);
      return {
        id: x.id,
        label: t ? t.title : x.id,
        count: x.count,
      };
    });
  }, [analytics.techniqueViews]);

  const days = useMemo(() => lastDays(14), []);

  const examStats = useMemo(() => {
    const list = Array.isArray(exams) ? exams : [];
    let passed = 0;
    let failed = 0;

    for (const e of list) {
      if (!e || typeof e !== "object") continue;
      const scores = e.scores && typeof e.scores === "object" ? e.scores : e;
      const avg =
        (clampScore(scores.technique) + clampScore(scores.fitness) + clampScore(scores.discipline)) /
        3;
      if (avg >= 7) passed += 1;
      else failed += 1;
    }

    const total = passed + failed;
    const passRate = total === 0 ? 0 : Math.round((passed / total) * 100);
    return { total, passed, failed, passRate };
  }, [exams]);

  const revenueByDay = useMemo(() => {
    const map = new Map();
    const list = Array.isArray(orders) ? orders : [];

    for (const o of list) {
      if (!o) continue;
      const d = isoDate(o.createdAt);
      if (!d) continue;
      const current = map.get(d) || 0;
      map.set(d, current + (Number(o.totalVnd) || 0));
    }

    return days.map((d) => map.get(d) || 0);
  }, [orders, days]);

  const attendanceByDay = useMemo(() => {
    const map = new Map();
    const list = Array.isArray(attendance) ? attendance : [];
    for (const r of list) {
      if (!r || typeof r !== "object") continue;
      const d = String(r.date || "");
      if (!d) continue;
      const current = map.get(d) || 0;
      map.set(d, current + 1);
    }

    return days.map((d) => map.get(d) || 0);
  }, [attendance, days]);

  const { text, grid, cyan, blue } = chartTheme();

  const commonOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: text,
          },
        },
        title: {
          display: false,
        },
      },
      scales: {
        x: {
          ticks: { color: text },
          grid: { color: grid },
        },
        y: {
          beginAtZero: true,
          ticks: { color: text },
          grid: { color: grid },
        },
      },
    }),
    [grid, text]
  );

  const contentChart = useMemo(() => {
    const labels = ["Bài học", "Video", "Kỹ thuật"];

    const totals = [
      Object.values(analytics.lessonViews || {}).reduce((sum, x) => sum + (Number(x) || 0), 0),
      Object.values(analytics.videoViews || {}).reduce((sum, x) => sum + (Number(x) || 0), 0),
      Object.values(analytics.techniqueViews || {}).reduce((sum, x) => sum + (Number(x) || 0), 0),
    ];

    return {
      labels,
      datasets: [
        {
          label: "Lượt xem (tổng)",
          data: totals,
          backgroundColor: ["rgba(34, 211, 238, 0.25)", "rgba(59, 130, 246, 0.25)", "rgba(250, 204, 21, 0.18)"],
          borderColor: [cyan, blue, "rgba(250, 204, 21, 0.9)"],
          borderWidth: 1,
        },
      ],
    };
  }, [analytics, cyan, blue]);

  const revenueChart = useMemo(() => {
    return {
      labels: days,
      datasets: [
        {
          label: "Doanh thu (VND)",
          data: revenueByDay,
          borderColor: cyan,
          backgroundColor: "rgba(34, 211, 238, 0.18)",
          pointRadius: 2,
          tension: 0.25,
          fill: true,
        },
      ],
    };
  }, [days, revenueByDay, cyan]);

  const attendanceChart = useMemo(() => {
    return {
      labels: days,
      datasets: [
        {
          label: "Điểm danh",
          data: attendanceByDay,
          backgroundColor: "rgba(59, 130, 246, 0.22)",
          borderColor: blue,
          borderWidth: 1,
        },
      ],
    };
  }, [days, attendanceByDay, blue]);

  const examChart = useMemo(() => {
    return {
      labels: ["Đạt", "Chưa đạt"],
      datasets: [
        {
          label: "Kết quả thi",
          data: [examStats.passed, examStats.failed],
          backgroundColor: ["rgba(34, 211, 238, 0.22)", "rgba(59, 130, 246, 0.22)"],
          borderColor: [cyan, blue],
          borderWidth: 1,
        },
      ],
    };
  }, [examStats, cyan, blue]);

  const topOrders = useMemo(() => {
    const list = Array.isArray(orders) ? orders : [];
    const lines = [];
    for (const o of list) {
      if (!o || !Array.isArray(o.items)) continue;
      for (const it of o.items) {
        const productId = String(it?.productId || "");
        const qty = Number(it?.qty) || 0;
        if (!productId || qty <= 0) continue;

        const product = getProductById(productId);
        lines.push({
          id: productId,
          label: product ? product.name : productId,
          qty,
        });
      }
    }

    const map = new Map();
    for (const x of lines) {
      map.set(x.id, (map.get(x.id) || 0) + x.qty);
    }

    return Array.from(map.entries())
      .map(([id, qty]) => ({ id, qty, label: getProductById(id)?.name || id }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }, [orders]);

  return (
    <div className="grid gap-4">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-white">Thống kê</h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Dashboard analytics (demo) đọc từ localStorage: lượt xem nội dung + đơn hàng + điểm danh.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Hội viên" value={Array.isArray(members) ? members.length : 0} sub="localStorage" />
          <StatCard label="Lượt xem bài học" value={Object.keys(analytics.lessonViews || {}).length} sub="slug khác nhau" />
          <StatCard label="Đơn hàng" value={Array.isArray(orders) ? orders.length : 0} sub="demo/local" />
          <StatCard label="Doanh thu" value={formatVnd(revenueVnd)} sub="tổng" />
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
          <h3 className="text-lg font-semibold text-white">Tổng lượt xem theo nhóm</h3>
          <p className="mt-2 text-sm leading-6 text-slate-300">Tổng hợp lesson/video/technique views.</p>
          <div className="mt-4 h-64">
            <Bar data={contentChart} options={commonOptions} />
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
          <h3 className="text-lg font-semibold text-white">Doanh thu 14 ngày</h3>
          <p className="mt-2 text-sm leading-6 text-slate-300">Tính từ đơn hàng đã lưu trong máy.</p>
          <div className="mt-4 h-64">
            <Line data={revenueChart} options={commonOptions} />
          </div>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
          <h3 className="text-lg font-semibold text-white">Điểm danh 14 ngày</h3>
          <p className="mt-2 text-sm leading-6 text-slate-300">Số lượt check-in theo ngày.</p>
          <div className="mt-4 h-64">
            <Bar data={attendanceChart} options={commonOptions} />
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
          <h3 className="text-lg font-semibold text-white">Top nội dung</h3>
          <p className="mt-2 text-sm leading-6 text-slate-300">Top 7 theo lượt xem.</p>

          <div className="mt-4 grid gap-3">
            <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
              <div className="text-xs font-semibold text-slate-300">Kỳ thi lên đai</div>
              <div className="mt-2 grid gap-1 text-sm text-slate-200">
                <div className="flex items-center justify-between gap-3">
                  <span className="truncate">Tổng số bài thi</span>
                  <span className="shrink-0 font-semibold text-white">{examStats.total}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="truncate">Đạt</span>
                  <span className="shrink-0 font-semibold text-white">{examStats.passed}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="truncate">Chưa đạt</span>
                  <span className="shrink-0 font-semibold text-white">{examStats.failed}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="truncate">Tỷ lệ đạt</span>
                  <span className="shrink-0 font-semibold text-white">{examStats.total ? `${examStats.passRate}%` : "-"}</span>
                </div>
              </div>

              {examStats.total ? (
                <div className="mt-3 h-40">
                  <Bar data={examChart} options={commonOptions} />
                </div>
              ) : (
                <div className="mt-3 text-slate-400">Chưa có dữ liệu.</div>
              )}
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
              <div className="text-xs font-semibold text-slate-300">Bài học</div>
              <div className="mt-2 grid gap-1 text-sm text-slate-200">
                {topLessons.length ? (
                  topLessons.map((x) => (
                    <div key={x.id} className="flex items-center justify-between gap-3">
                      <span className="truncate">{x.label}</span>
                      <span className="shrink-0 text-white font-semibold">{x.count}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-400">Chưa có dữ liệu (mở vài bài học để ghi nhận).</div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
              <div className="text-xs font-semibold text-slate-300">Video</div>
              <div className="mt-2 grid gap-1 text-sm text-slate-200">
                {topVideos.length ? (
                  topVideos.map((x) => (
                    <div key={x.id} className="flex items-center justify-between gap-3">
                      <span className="truncate">{x.label}</span>
                      <span className="shrink-0 text-white font-semibold">{x.count}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-400">Chưa có dữ liệu.</div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
              <div className="text-xs font-semibold text-slate-300">Kỹ thuật</div>
              <div className="mt-2 grid gap-1 text-sm text-slate-200">
                {topTechniques.length ? (
                  topTechniques.map((x) => (
                    <div key={x.id} className="flex items-center justify-between gap-3">
                      <span className="truncate">{x.label}</span>
                      <span className="shrink-0 text-white font-semibold">{x.count}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-400">Chưa có dữ liệu.</div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
              <div className="text-xs font-semibold text-slate-300">Top sản phẩm (theo qty)</div>
              <div className="mt-2 grid gap-1 text-sm text-slate-200">
                {topOrders.length ? (
                  topOrders.map((x) => (
                    <div key={x.id} className="flex items-center justify-between gap-3">
                      <span className="truncate">{x.label}</span>
                      <span className="shrink-0 text-white font-semibold">{x.qty}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-400">Chưa có đơn hàng.</div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
