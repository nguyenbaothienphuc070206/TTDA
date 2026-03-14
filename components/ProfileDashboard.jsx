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
  const [profile, setProfile] = useState(() => {
    const base = readProfile();
    if (typeof base.joinedAt === "number" && base.joinedAt > 0) return base;
    return {
      ...base,
      joinedAt: Date.now(),
    };
  });
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [reminderNotice, setReminderNotice] = useState("");

  const [beltEntry, setBeltEntry] = useState(() => ({
    beltId: readProfile().beltId,
    date: todayInput(),
  }));

  const [diaryEntry, setDiaryEntry] = useState(() => ({
    date: todayInput(),
    title: "",
    note: "",
  }));

  const planId = profile?.planId === "premium" ? "premium" : "free";
  const isPremium = planId === "premium";

  useEffect(() => {
    const sync = () => {
      setProfile(readProfile());
    };
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("storage", sync);
    };
  }, []);

  useEffect(() => {
    const t = setInterval(() => setNowMs(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    writeProfile(profile);
  }, [profile]);

  const currentBelt = useMemo(() => {
    return getBeltById(profile.beltId) || BELTS[0];
  }, [profile.beltId]);

  const personalizedStatus = useMemo(() => {
    const msPerDay = 24 * 60 * 60 * 1000;
    const joinedAt = typeof profile.joinedAt === "number" ? profile.joinedAt : 0;
    const baseNow = typeof nowMs === "number" && nowMs > 0 ? nowMs : joinedAt;

    const days = joinedAt && baseNow >= joinedAt
      ? Math.max(1, Math.floor((baseNow - joinedAt) / msPerDay) + 1)
      : 1;

    const currentIndex = BELTS.findIndex((b) => b.id === profile.beltId);
    const nextBelt = currentIndex >= 0 && currentIndex < BELTS.length - 1 ? BELTS[currentIndex + 1] : null;

    const encouragement = nextBelt
      ? `Cố gắng lên ${nextBelt.title} nhé!`
      : "Giữ phong độ và giúp người mới nhé!";

    return {
      days,
      encouragement,
    };
  }, [nowMs, profile.beltId, profile.joinedAt]);

  const reminders = profile.reminders && typeof profile.reminders === "object" ? profile.reminders : { enabled: false };

  const sendTestReminder = async () => {
    setReminderNotice("");

    if (typeof window === "undefined" || !("Notification" in window)) {
      setReminderNotice("Trình duyệt chưa hỗ trợ Notification API.");
      return;
    }

    const perm = await Notification.requestPermission();
    if (perm !== "granted") {
      setReminderNotice("Bạn chưa cho phép thông báo. Hãy cấp quyền để nhận lời nhắc.");
      return;
    }

    if (!("serviceWorker" in navigator)) {
      setReminderNotice("Thiếu Service Worker (PWA). Thử refresh lại trang.");
      return;
    }

    const reg = await navigator.serviceWorker.ready.catch(() => null);
    if (!reg || typeof reg.showNotification !== "function") {
      setReminderNotice("Chưa sẵn sàng để gửi thông báo. Thử refresh lại trang.");
      return;
    }

    await reg.showNotification("Lời nhắc sư phụ", {
      body: "Test: dành 5 phút ôn lại kỹ thuật hôm nay nhé.",
      tag: "vovinam-sifu-test",
      data: { url: "/ky-thuat" },
      icon: "/favicon.ico",
      badge: "/favicon.ico",
    });
  };

  const toggleReminders = async () => {
    setReminderNotice("");

    if (reminders.enabled) {
      setProfile((p) => ({
        ...p,
        reminders: {
          ...p.reminders,
          enabled: false,
        },
      }));
      return;
    }

    if (typeof window === "undefined" || !("Notification" in window)) {
      setReminderNotice("Trình duyệt chưa hỗ trợ Notification API.");
      return;
    }

    const perm = await Notification.requestPermission();
    if (perm !== "granted") {
      setReminderNotice("Bạn chưa cho phép thông báo. Hãy cấp quyền để bật lời nhắc.");
      return;
    }

    setProfile((p) => ({
      ...p,
      reminders: {
        ...p.reminders,
        enabled: true,
      },
    }));
  };

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
      <section
        id="goi-premium"
        className="scroll-mt-24 rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 lg:col-span-2"
      >
        <h2 className="text-xl font-semibold text-white">Gói Freemium / Premium</h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Freemium cho phép xem kỹ thuật/video nền tảng (Lam đai). Premium mở khóa kỹ thuật nâng cao và AI Coach.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
            <div className="text-xs font-semibold text-slate-300">Gói hiện tại</div>
            <div className="mt-2 text-sm font-semibold text-white">{isPremium ? "Premium" : "Freemium"}</div>
            <div className="mt-1 text-xs text-slate-400">(Demo: lưu trên máy)</div>

            <button
              type="button"
              onClick={() => {
                setProfile((p) => ({
                  ...p,
                  planId: isPremium ? "free" : "premium",
                }));
              }}
              className={
                "mt-3 inline-flex h-11 w-full items-center justify-center rounded-2xl px-4 text-sm font-semibold transition focus:outline-none focus:ring-2 " +
                (isPremium
                  ? "border border-white/10 bg-white/5 text-white hover:bg-white/10 focus:ring-blue-400/30"
                  : "bg-gradient-to-r from-cyan-300 to-blue-500 text-slate-950 hover:brightness-110 focus:ring-cyan-300/50")
              }
            >
              {isPremium ? "Tắt Premium (demo)" : "Nâng cấp Premium (demo)"}
            </button>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4 sm:col-span-2">
            <div className="text-xs font-semibold text-slate-300">Bạn nhận được</div>
            <ul className="mt-2 grid gap-1 text-sm leading-6 text-slate-300">
              {isPremium ? (
                <>
                  <li>• Xem kỹ thuật Hoàng/Huyền đai</li>
                  <li>• Xem video nâng cao và hỏi ngay bằng AI Coach</li>
                  <li>• Mở khóa AI Coach (RAG) để hỏi lỗi thường gặp & an toàn</li>
                </>
              ) : (
                <>
                  <li>• Xem kỹ thuật Lam đai</li>
                  <li>• Xem video cơ bản</li>
                  <li>• Xem bảng tin cộng đồng (lịch/sự kiện)</li>
                </>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-200">
          Gợi ý triển khai thật: dùng Stripe Subscription + lưu entitlement theo user trong Supabase để đồng bộ đa thiết bị.
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 lg:col-span-2">
        <h2 className="text-xl font-semibold text-white">Trạng thái hôm nay</h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Hôm nay là ngày thứ <span className="font-semibold text-white">{personalizedStatus.days}</span> bạn gắn bó với Vovinam. {personalizedStatus.encouragement}
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
            <div className="text-xs font-semibold text-slate-300">Cấp đai hiện tại</div>
            <div className="mt-2 text-sm font-semibold text-white">{currentBelt?.title}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
            <div className="text-xs font-semibold text-slate-300">Mục tiêu</div>
            <div className="mt-2 text-sm font-semibold text-white">Đúng kỹ thuật & đều đặn</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
            <div className="text-xs font-semibold text-slate-300">Gợi ý</div>
            <div className="mt-2 text-sm leading-6 text-slate-300">Nếu có 5 phút: ôn lại 1 kỹ thuật bạn hay sai.</div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 lg:col-span-2">
        <h2 className="text-xl font-semibold text-white">Lời nhắc sư phụ</h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Bật thông báo để nhận lời nhắc nhẹ nhàng khi bạn bỏ quá lâu chưa ôn lại kỹ thuật.
        </p>

        {reminderNotice ? (
          <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/30 p-4 text-sm text-slate-200">
            {reminderNotice}
          </div>
        ) : null}

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
            <div className="text-xs font-semibold text-slate-300">Trạng thái</div>
            <div className="mt-2 text-sm font-semibold text-white">
              {reminders.enabled ? "Đang bật" : "Chưa bật"}
            </div>
            <div className="mt-1 text-xs text-slate-400">Dùng Notification API + Service Worker.</div>
          </div>

          <button
            type="button"
            onClick={toggleReminders}
            className="inline-flex h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-300 to-blue-500 px-5 text-sm font-semibold text-slate-950 transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-cyan-300/50"
          >
            {reminders.enabled ? "Tắt lời nhắc" : "Bật lời nhắc"}
          </button>

          <button
            type="button"
            onClick={sendTestReminder}
            className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-300/30"
          >
            Gửi test
          </button>
        </div>

        <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/30 p-4">
          <div className="text-xs font-semibold text-slate-300">Ngưỡng nhắc</div>
          <div className="mt-2 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
            <input
              type="number"
              min={1}
              max={14}
              value={reminders.daysWithoutPractice || 3}
              onChange={(e) => {
                const v = Math.max(1, Math.min(14, Math.round(Number(e.target.value) || 3)));
                setProfile((p) => ({
                  ...p,
                  reminders: {
                    ...p.reminders,
                    daysWithoutPractice: v,
                  },
                }));
              }}
              className="h-11 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-300/30"
            />
            <div className="text-sm font-semibold text-slate-200">ngày chưa ôn</div>
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-400">
            Lời nhắc dựa trên lần gần nhất bạn xem bài học/kỹ thuật/video trong app.
          </p>
        </div>
      </section>

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
