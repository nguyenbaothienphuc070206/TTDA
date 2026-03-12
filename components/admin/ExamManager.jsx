"use client";

import { useEffect, useMemo, useState } from "react";

import { BELTS, getBeltById } from "@/data/belts";
import { readAttendance, readExams, readMembers, writeExams } from "@/lib/adminData";

const ELIGIBILITY_LOOKBACK_DAYS = 30;
const ELIGIBILITY_MIN_ATTENDANCE = 8;

function makeId(prefix) {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}_${crypto.randomUUID()}`;
  }

  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function todayInput() {
  return new Date().toISOString().slice(0, 10);
}

function clampScore(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(10, Math.round(n * 10) / 10));
}

function MessageBox({ tone, children }) {
  const styles =
    tone === "success"
      ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-50"
      : tone === "error"
      ? "border-rose-400/20 bg-rose-500/10 text-rose-50"
      : "border-white/10 bg-white/5 text-slate-200";

  return <div className={`rounded-2xl border p-4 text-sm ${styles}`}>{children}</div>;
}

export default function ExamManager() {
  const [members, setMembers] = useState(() => readMembers());
  const [exams, setExams] = useState(() => readExams());
  const [attendance, setAttendance] = useState(() => readAttendance());

  const [memberId, setMemberId] = useState("");
  const [targetBeltId, setTargetBeltId] = useState("hoang-dai");
  const [date, setDate] = useState(todayInput());

  const [technique, setTechnique] = useState(7);
  const [fitness, setFitness] = useState(7);
  const [discipline, setDiscipline] = useState(7);

  const [message, setMessage] = useState(null);

  useEffect(() => {
    const sync = () => {
      setMembers(readMembers());
      setExams(readExams());
      setAttendance(readAttendance());
    };

    sync();
    window.addEventListener("vovinam-admin-members", sync);
    window.addEventListener("vovinam-admin-attendance", sync);
    window.addEventListener("vovinam-admin-exams", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("vovinam-admin-members", sync);
      window.removeEventListener("vovinam-admin-attendance", sync);
      window.removeEventListener("vovinam-admin-exams", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const memberList = useMemo(() => {
    const list = Array.isArray(members) ? members : [];

    return list
      .map((m) => {
        if (!m || typeof m !== "object") return null;
        const id = String(m.id || "");
        const name = String(m.name || "");
        const code = String(m.code || "");
        const beltId = String(m.beltId || "") || "lam-dai";
        const joinedAt = typeof m.joinedAt === "number" ? m.joinedAt : 0;
        if (!id || !name || !code) return null;
        return { id, name, code, beltId, joinedAt };
      })
      .filter(Boolean);
  }, [members]);

  const eligibility = useMemo(() => {
    const lookbackDays = ELIGIBILITY_LOOKBACK_DAYS;
    const minSessions = ELIGIBILITY_MIN_ATTENDANCE;

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - lookbackDays);
    const cutoffIso = cutoff.toISOString().slice(0, 10);

    const totalByMember = new Map();
    const recentByMember = new Map();
    const lastDateByMember = new Map();

    const records = Array.isArray(attendance) ? attendance : [];
    for (const r of records) {
      if (!r || typeof r !== "object") continue;
      const mid = String(r.memberId || "");
      const d = String(r.date || "");
      if (!mid || !d) continue;

      totalByMember.set(mid, (totalByMember.get(mid) || 0) + 1);
      if (d >= cutoffIso) {
        recentByMember.set(mid, (recentByMember.get(mid) || 0) + 1);
      }

      const prevLast = lastDateByMember.get(mid);
      if (!prevLast || d > prevLast) {
        lastDateByMember.set(mid, d);
      }
    }

    const items = memberList
      .map((m) => {
        const belt = getBeltById(m.beltId);
        const recentAttendance = recentByMember.get(m.id) || 0;
        const totalAttendance = totalByMember.get(m.id) || 0;
        const lastAttendance = lastDateByMember.get(m.id) || "";

        return {
          ...m,
          beltTitle: belt ? belt.title : m.beltId,
          recentAttendance,
          totalAttendance,
          lastAttendance,
          eligible: recentAttendance >= minSessions,
        };
      })
      .sort((a, b) => b.recentAttendance - a.recentAttendance);

    return {
      lookbackDays,
      minSessions,
      cutoffIso,
      items,
      eligible: items.filter((x) => x.eligible),
    };
  }, [attendance, memberList]);

  const normalizedExams = useMemo(() => {
    const list = Array.isArray(exams) ? exams : [];

    return list
      .map((x) => {
        if (!x || typeof x !== "object") return null;
        const id = String(x.id || "");
        const mid = String(x.memberId || "");
        const d = String(x.date || "");
        const belt = String(x.targetBeltId || "");
        const scores = x.scores && typeof x.scores === "object" ? x.scores : {};

        if (!id || !mid || !d || !belt) return null;

        const sTech = clampScore(scores.technique);
        const sFit = clampScore(scores.fitness);
        const sDis = clampScore(scores.discipline);
        const avg = Math.round(((sTech + sFit + sDis) / 3) * 10) / 10;

        const m = memberList.find((mm) => mm.id === mid);
        const beltObj = getBeltById(belt);

        return {
          id,
          memberId: mid,
          memberName: m ? m.name : mid,
          date: d,
          targetBeltId: belt,
          targetBeltTitle: beltObj ? beltObj.title : belt,
          scores: { technique: sTech, fitness: sFit, discipline: sDis },
          avg,
          passed: avg >= 7,
          createdAt: typeof x.createdAt === "number" ? x.createdAt : 0,
        };
      })
      .filter(Boolean)
      .sort((a, b) => String(b.date).localeCompare(String(a.date)));
  }, [exams, memberList]);

  const preview = useMemo(() => {
    const sTech = clampScore(technique);
    const sFit = clampScore(fitness);
    const sDis = clampScore(discipline);
    const avg = Math.round(((sTech + sFit + sDis) / 3) * 10) / 10;

    return {
      technique: sTech,
      fitness: sFit,
      discipline: sDis,
      avg,
      passed: avg >= 7,
    };
  }, [technique, fitness, discipline]);

  const onSave = () => {
    setMessage(null);

    const safeMemberId = String(memberId || "");
    const member = memberList.find((m) => m.id === safeMemberId);
    if (!member) {
      setMessage({ tone: "error", text: "Vui lòng chọn hội viên." });
      return;
    }

    const belt = getBeltById(targetBeltId);
    if (!belt) {
      setMessage({ tone: "error", text: "Cấp đai mục tiêu không hợp lệ." });
      return;
    }

    const safeDate = String(date || "").trim();
    if (!safeDate) {
      setMessage({ tone: "error", text: "Ngày không hợp lệ." });
      return;
    }

    const entry = {
      id: makeId("exam"),
      memberId: member.id,
      date: safeDate,
      targetBeltId: belt.id,
      scores: {
        technique: preview.technique,
        fitness: preview.fitness,
        discipline: preview.discipline,
      },
      createdAt: Date.now(),
    };

    writeExams([entry, ...(Array.isArray(exams) ? exams : [])]);
    setMessage({
      tone: "success",
      text: `Đã lưu bài thi cho ${member.name} • ${belt.title} • ${preview.passed ? "Đạt" : "Chưa đạt"}`,
    });
  };

  const onRemove = (id) => {
    const safeId = String(id || "");
    const next = normalizedExams
      .filter((x) => x.id !== safeId)
      .map((x) => ({
        id: x.id,
        memberId: x.memberId,
        date: x.date,
        targetBeltId: x.targetBeltId,
        scores: x.scores,
        createdAt: x.createdAt,
      }));

    writeExams(next);
  };

  return (
    <div className="grid gap-4">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-white">Thi lên đai</h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Chấm điểm theo 3 tiêu chí và lưu kết quả. (Xuất chứng nhận dạng text)
        </p>

        {message ? (
          <div className="mt-4">
            <MessageBox tone={message.tone}>{message.text}</MessageBox>
          </div>
        ) : null}

        <div className="mt-4 rounded-3xl border border-white/10 bg-slate-950/30 p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-white">Danh sách đủ điều kiện thi</div>
              <p className="mt-1 text-xs leading-5 text-slate-300">
                Điều kiện demo: ≥ {eligibility.minSessions} buổi điểm danh trong {eligibility.lookbackDays} ngày gần nhất (từ {" "}
                {eligibility.cutoffIso}).
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200">
              {eligibility.eligible.length}/{memberList.length}
            </div>
          </div>

          {eligibility.eligible.length ? (
            <div className="mt-4 grid gap-2">
              {eligibility.eligible.slice(0, 10).map((m) => (
                <div
                  key={m.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-3"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-white truncate">
                      {m.name} <span className="text-xs font-semibold text-slate-300">({m.code})</span>
                    </div>
                    <div className="mt-1 text-xs text-slate-300">
                      {m.beltTitle} • Chuyên cần: <span className="font-semibold text-white">{m.recentAttendance}</span> • Tổng: {m.totalAttendance}
                      {m.lastAttendance ? ` • Gần nhất: ${m.lastAttendance}` : ""}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setMessage(null);
                      setMemberId(m.id);
                    }}
                    className="inline-flex h-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 text-xs font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-300/30"
                  >
                    Chọn
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
              Chưa có hội viên nào đạt điều kiện theo rule demo. Bạn vẫn có thể chấm thi thủ công bằng dropdown bên dưới.
            </div>
          )}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block rounded-2xl border border-white/10 bg-white/5 p-3 sm:col-span-2">
            <div className="text-xs font-semibold text-slate-200">Hội viên</div>
            <select
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-300/30"
            >
              <option value="">— Chọn hội viên —</option>
              {memberList.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.code})
                </option>
              ))}
            </select>
          </label>

          <label className="block rounded-2xl border border-white/10 bg-white/5 p-3">
            <div className="text-xs font-semibold text-slate-200">Ngày thi</div>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-300/30"
            />
          </label>

          <label className="block rounded-2xl border border-white/10 bg-white/5 p-3">
            <div className="text-xs font-semibold text-slate-200">Đai mục tiêu</div>
            <select
              value={targetBeltId}
              onChange={(e) => setTargetBeltId(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-300/30"
            >
              {BELTS.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title}
                </option>
              ))}
            </select>
          </label>

          <label className="block rounded-2xl border border-white/10 bg-white/5 p-3">
            <div className="text-xs font-semibold text-slate-200">Kỹ thuật (0–10)</div>
            <input
              type="number"
              min={0}
              max={10}
              step={0.5}
              value={technique}
              onChange={(e) => setTechnique(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-300/30"
            />
          </label>

          <label className="block rounded-2xl border border-white/10 bg-white/5 p-3">
            <div className="text-xs font-semibold text-slate-200">Thể lực (0–10)</div>
            <input
              type="number"
              min={0}
              max={10}
              step={0.5}
              value={fitness}
              onChange={(e) => setFitness(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-300/30"
            />
          </label>

          <label className="block rounded-2xl border border-white/10 bg-white/5 p-3 sm:col-span-2">
            <div className="text-xs font-semibold text-slate-200">Kỷ luật / thái độ (0–10)</div>
            <input
              type="number"
              min={0}
              max={10}
              step={0.5}
              value={discipline}
              onChange={(e) => setDiscipline(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-300/30"
            />
          </label>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
            <div className="text-xs font-semibold text-slate-300">Điểm TB</div>
            <div className="mt-2 text-2xl font-semibold tracking-tight text-white">{preview.avg}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
            <div className="text-xs font-semibold text-slate-300">Kết quả</div>
            <div className="mt-2 text-2xl font-semibold tracking-tight text-white">
              {preview.passed ? "Đạt" : "Chưa đạt"}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
            <div className="text-xs font-semibold text-slate-300">Gợi ý</div>
            <div className="mt-2 text-sm leading-6 text-slate-300">
              TB ≥ 7 được coi là đạt (demo).
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onSave}
          className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-300 to-blue-500 px-4 text-sm font-semibold text-slate-950 transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-cyan-300/50"
        >
          Lưu kết quả thi
        </button>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
        <h3 className="text-lg font-semibold text-white">Kết quả đã lưu</h3>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Mỗi kết quả có kèm chứng nhận dạng text.
        </p>

        {normalizedExams.length ? (
          <div className="mt-4 grid gap-3">
            {normalizedExams.map((x) => {
              const certText = `CHỨNG NHẬN LÊN ĐAI (DEMO)\n\nHọc viên: ${x.memberName}\nNgày thi: ${x.date}\nĐai đạt: ${x.targetBeltTitle}\nĐiểm: Kỹ thuật ${x.scores.technique} • Thể lực ${x.scores.fitness} • Kỷ luật ${x.scores.discipline}\nĐiểm TB: ${x.avg}\nKết quả: ${x.passed ? "ĐẠT" : "CHƯA ĐẠT"}\n\nMã hồ sơ: ${x.id}\n`;

              return (
                <details key={x.id} className="group rounded-3xl border border-white/10 bg-slate-950/30 p-5">
                  <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 text-sm font-semibold text-white [&::-webkit-details-marker]:hidden">
                    <span>
                      {x.memberName} • {x.targetBeltTitle} • {x.date}
                    </span>
                    <span className="text-slate-300 transition group-open:rotate-180" aria-hidden="true">
                      ▾
                    </span>
                  </summary>

                  <div className="mt-3 grid gap-2 text-sm text-slate-300">
                    <div>
                      <span className="text-slate-200">Điểm TB:</span> {x.avg} •{" "}
                      <span className="text-slate-200">Kết quả:</span> {x.passed ? "Đạt" : "Chưa đạt"}
                    </div>
                    <textarea
                      readOnly
                      value={certText}
                      className="min-h-[160px] w-full rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-xs text-slate-200 outline-none"
                    />
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => onRemove(x.id)}
                        className="text-xs font-semibold text-slate-300 transition hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-300/30 rounded-xl px-2 py-1"
                      >
                        Xóa kết quả
                      </button>
                    </div>
                  </div>
                </details>
              );
            })}
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/30 p-4 text-sm text-slate-300">
            Chưa có kết quả thi nào.
          </div>
        )}
      </section>
    </div>
  );
}
