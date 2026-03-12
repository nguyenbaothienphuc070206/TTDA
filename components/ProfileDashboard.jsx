"use client";

import { useEffect, useMemo, useState } from "react";

import { BELTS, getBeltById } from "@/data/belts";
import { readProfile, writeProfile } from "@/lib/profile";

function Field({ label, hint, children }) {
  return (
    <label className="block rounded-2xl border border-white/10 bg-white/5 p-3">
      <div className="text-xs font-semibold text-slate-200">{label}</div>
      <div className="mt-2">{children}</div>
      {hint ? <div className="mt-2 text-xs text-slate-300">{hint}</div> : null}
    </label>
  );
}

function makeId(prefix) {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}_${crypto.randomUUID()}`;
  }

  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function todayInput() {
  return new Date().toISOString().slice(0, 10);
}

export default function ProfileDashboard() {
  const [profile, setProfile] = useState(() => readProfile());

  const [beltEntry, setBeltEntry] = useState(() => ({
    beltId: readProfile().beltId,
    date: todayInput(),
  }));

  const [diaryEntry, setDiaryEntry] = useState(() => ({
    date: todayInput(),
    title: "",
    note: "",
  }));

  useEffect(() => {
    const sync = () => {
      setProfile(readProfile());
    };

    sync();
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("storage", sync);
    };
  }, []);

  useEffect(() => {
    writeProfile(profile);
  }, [profile]);

  const currentBelt = useMemo(() => {
    return getBeltById(profile.beltId) || BELTS[0];
  }, [profile.beltId]);

  const sortedHistory = useMemo(() => {
    const list = Array.isArray(profile.beltHistory) ? profile.beltHistory : [];

    return [...list]
      .map((x) => {
        if (!x || typeof x !== "object") return null;
        const id = String(x.id || "");
        const beltId = String(x.beltId || "");
        const date = String(x.date || "");
        if (!id || !beltId || !date) return null;
        return { id, beltId, date };
      })
      .filter(Boolean)
      .sort((a, b) => String(b.date).localeCompare(String(a.date)));
  }, [profile.beltHistory]);

  const sortedDiary = useMemo(() => {
    const list = Array.isArray(profile.diary) ? profile.diary : [];

    return [...list]
      .map((x) => {
        if (!x || typeof x !== "object") return null;
        const id = String(x.id || "");
        const date = String(x.date || "");
        const title = String(x.title || "");
        const note = String(x.note || "");
        if (!id || !date) return null;
        return { id, date, title, note };
      })
      .filter(Boolean)
      .sort((a, b) => String(b.date).localeCompare(String(a.date)));
  }, [profile.diary]);

  const ensureCertificate = () => {
    if (profile.certificateId) return;

    setProfile((p) => ({
      ...p,
      certificateId: makeId("cert"),
    }));
  };

  const addBeltHistory = () => {
    const belt = getBeltById(beltEntry.beltId);
    const date = String(beltEntry.date || "").trim();
    if (!belt || !date) return;

    const entry = {
      id: makeId("belt"),
      beltId: belt.id,
      date,
    };

    setProfile((p) => ({
      ...p,
      beltId: belt.id,
      beltHistory: [entry, ...(Array.isArray(p.beltHistory) ? p.beltHistory : [])],
    }));
  };

  const removeBeltHistory = (id) => {
    const safeId = String(id || "");
    setProfile((p) => ({
      ...p,
      beltHistory: (Array.isArray(p.beltHistory) ? p.beltHistory : []).filter(
        (x) => x && x.id !== safeId
      ),
    }));
  };

  const addDiary = () => {
    const date = String(diaryEntry.date || "").trim();
    const title = String(diaryEntry.title || "").trim();
    const note = String(diaryEntry.note || "").trim();

    if (!date) return;

    const entry = {
      id: makeId("diary"),
      date,
      title,
      note,
    };

    setProfile((p) => ({
      ...p,
      diary: [entry, ...(Array.isArray(p.diary) ? p.diary : [])],
    }));

    setDiaryEntry((s) => ({ ...s, title: "", note: "" }));
  };

  const removeDiary = (id) => {
    const safeId = String(id || "");
    setProfile((p) => ({
      ...p,
      diary: (Array.isArray(p.diary) ? p.diary : []).filter((x) => x && x.id !== safeId),
    }));
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-white">Thông tin học viên</h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Hồ sơ và nhật ký tập được lưu trên máy (localStorage).
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Field label="Họ tên">
            <input
              value={profile.name}
              onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
              className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-300/30"
              placeholder="Ví dụ: Nguyễn Văn A"
            />
          </Field>

          <Field label="Cấp đai hiện tại" hint={currentBelt?.description}>
            <select
              value={profile.beltId}
              onChange={(e) => {
                const next = e.target.value;
                setProfile((p) => ({ ...p, beltId: next }));
                setBeltEntry((s) => ({ ...s, beltId: next }));
              }}
              className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-300/30"
            >
              {BELTS.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title} • {b.short}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="mt-4 rounded-3xl border border-white/10 bg-slate-950/30 p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-white">Bằng cấp số</p>
              <p className="mt-1 text-sm leading-6 text-slate-300">
                Chứng nhận nội bộ (demo). Dùng để lưu lịch sử lên đai và theo dõi tiến độ.
              </p>
            </div>
            <button
              type="button"
              onClick={ensureCertificate}
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-300/30"
            >
              {profile.certificateId ? "Đã tạo" : "Tạo bằng"}
            </button>
          </div>

          <div className="mt-4 grid gap-2 text-sm text-slate-300">
            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-200">Học viên</span>
              <span className="font-semibold text-white">{profile.name || "Học viên"}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-200">Cấp đai</span>
              <span className="font-semibold text-white">{currentBelt?.title}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-200">Mã chứng nhận</span>
              <span className="font-mono text-xs text-cyan-200">
                {profile.certificateId ? profile.certificateId : "—"}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-white">Lịch sử & nhật ký</h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Lưu lại mốc lên đai và các buổi tập của bạn.
        </p>

        <div className="mt-4 rounded-3xl border border-white/10 bg-slate-950/30 p-6">
          <p className="text-sm font-semibold text-white">Lịch sử lên đai</p>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Field label="Cấp đai">
              <select
                value={beltEntry.beltId}
                onChange={(e) => setBeltEntry((s) => ({ ...s, beltId: e.target.value }))}
                className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-300/30"
              >
                {BELTS.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Ngày">
              <input
                type="date"
                value={beltEntry.date}
                onChange={(e) => setBeltEntry((s) => ({ ...s, date: e.target.value }))}
                className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-300/30"
              />
            </Field>
          </div>

          <button
            type="button"
            onClick={addBeltHistory}
            className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-300 to-blue-500 px-4 text-sm font-semibold text-slate-950 transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-cyan-300/50"
          >
            Thêm mốc lên đai
          </button>

          {sortedHistory.length ? (
            <div className="mt-4 grid gap-2">
              {sortedHistory.map((h) => {
                const belt = getBeltById(h.beltId);

                return (
                  <div
                    key={h.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <div>
                      <div className="text-sm font-semibold text-white">{belt?.title || h.beltId}</div>
                      <div className="mt-1 text-xs text-slate-300">{h.date}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeBeltHistory(h.id)}
                      className="text-xs font-semibold text-slate-300 transition hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-300/30 rounded-xl px-2 py-1"
                    >
                      Xóa
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
              Chưa có mốc lên đai nào.
            </div>
          )}
        </div>

        <div className="mt-4 rounded-3xl border border-white/10 bg-slate-950/30 p-6">
          <p className="text-sm font-semibold text-white">Nhật ký tập luyện</p>

          <div className="mt-3 grid gap-3">
            <Field label="Ngày">
              <input
                type="date"
                value={diaryEntry.date}
                onChange={(e) => setDiaryEntry((s) => ({ ...s, date: e.target.value }))}
                className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-300/30"
              />
            </Field>
            <Field label="Tiêu đề" hint="Ví dụ: Luyện bài quyền số 1, đá tống trước">
              <input
                value={diaryEntry.title}
                onChange={(e) => setDiaryEntry((s) => ({ ...s, title: e.target.value }))}
                className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-300/30"
                placeholder="Bạn đã tập gì hôm nay?"
              />
            </Field>
            <Field label="Ghi chú" hint="Cảm giác, lỗi thường gặp, mục tiêu buổi sau…">
              <textarea
                value={diaryEntry.note}
                onChange={(e) => setDiaryEntry((s) => ({ ...s, note: e.target.value }))}
                className="min-h-[96px] w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-300/30"
                placeholder="Ví dụ: còn hụt hơi ở hiệp 2, cần chú ý thăng bằng khi đá…"
              />
            </Field>
          </div>

          <button
            type="button"
            onClick={addDiary}
            className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-300/30"
          >
            Lưu nhật ký
          </button>

          {sortedDiary.length ? (
            <div className="mt-4 grid gap-2">
              {sortedDiary.map((d) => (
                <div key={d.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-white">
                        {d.title ? d.title : "Buổi tập"}
                      </div>
                      <div className="mt-1 text-xs text-slate-300">{d.date}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeDiary(d.id)}
                      className="text-xs font-semibold text-slate-300 transition hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-300/30 rounded-xl px-2 py-1"
                    >
                      Xóa
                    </button>
                  </div>
                  {d.note ? (
                    <p className="mt-3 text-sm leading-6 text-slate-300">{d.note}</p>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
              Chưa có nhật ký nào.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
