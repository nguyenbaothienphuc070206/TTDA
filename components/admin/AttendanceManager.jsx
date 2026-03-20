"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { readAttendance, readMembers, writeAttendance } from "@/lib/adminData";

function makeId(prefix) {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}_${crypto.randomUUID()}`;
  }

  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function todayInput() {
  return new Date().toISOString().slice(0, 10);
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

export default function AttendanceManager() {
  const [members, setMembers] = useState(() => readMembers());
  const [attendance, setAttendance] = useState(() => readAttendance());

  const [date, setDate] = useState(todayInput());
  const [memberId, setMemberId] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState(null);

  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannerError, setScannerError] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const sync = () => {
      setMembers(readMembers());
      setAttendance(readAttendance());
    };

    sync();
    window.addEventListener("vovinam-admin-members", sync);
    window.addEventListener("vovinam-admin-attendance", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("vovinam-admin-members", sync);
      window.removeEventListener("vovinam-admin-attendance", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  useEffect(() => {
    const stop = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }

      const stream = streamRef.current;
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };

    if (!scannerOpen) {
      stop();
      return undefined;
    }

    let active = true;

    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });

        if (!active) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;

        const video = videoRef.current;
        if (!video) {
          return;
        }

        video.srcObject = stream;
        await video.play().catch(() => {
          // Some browsers require user gesture; ignore.
        });

        const Detector = window.BarcodeDetector;
        const detector = new Detector({ formats: ["qr_code"] });

        const scan = async () => {
          if (!active) return;
          const v = videoRef.current;
          if (!v) return;

          try {
            const barcodes = await detector.detect(v);
            const raw = barcodes && barcodes.length ? String(barcodes[0].rawValue || "") : "";
            const value = raw.trim();

            if (value) {
              setCode(value);
              setScannerOpen(false);
              setMessage({ tone: "success", text: `Đã quét code: ${value}` });
              return;
            }
          } catch {
            // Ignore transient decode errors
          }

          rafRef.current = requestAnimationFrame(scan);
        };

        rafRef.current = requestAnimationFrame(scan);
      } catch (err) {
        const msg =
          err && typeof err === "object" && "message" in err ? String(err.message) : "Không mở được camera.";
        setScannerError(msg);
        setScannerOpen(false);
      }
    };

    start();

    return () => {
      active = false;
      stop();
    };
  }, [scannerOpen]);

  const memberList = useMemo(() => {
    const list = Array.isArray(members) ? members : [];

    return list
      .map((m) => {
        if (!m || typeof m !== "object") return null;
        const id = String(m.id || "");
        const memberName = String(m.name || "");
        const memberCode = String(m.code || "");
        if (!id || !memberName || !memberCode) return null;
        return { id, name: memberName, code: memberCode };
      })
      .filter(Boolean);
  }, [members]);

  const records = useMemo(() => {
    const list = Array.isArray(attendance) ? attendance : [];

    return list
      .map((r) => {
        if (!r || typeof r !== "object") return null;
        const id = String(r.id || "");
        const dateStr = String(r.date || "");
        const mid = String(r.memberId || "");
        const createdAt = typeof r.createdAt === "number" ? r.createdAt : 0;
        if (!id || !dateStr || !mid) return null;

        const m = memberList.find((x) => x.id === mid);
        return {
          id,
          date: dateStr,
          memberId: mid,
          memberName: m ? m.name : mid,
          createdAt,
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [attendance, memberList]);

  const resolveMember = () => {
    const trimmed = code.trim();
    if (trimmed) {
      const found = memberList.find((m) => m.code.toLowerCase() === trimmed.toLowerCase());
      if (!found) return null;
      return found;
    }

    if (!memberId) return null;
    return memberList.find((m) => m.id === memberId) || null;
  };

  const onCheckIn = () => {
    setMessage(null);

    const member = resolveMember();
    if (!member) {
      setMessage({ tone: "error", text: "Không tìm thấy hội viên theo ID/code." });
      return;
    }

    const safeDate = String(date || "").trim();
    if (!safeDate) {
      setMessage({ tone: "error", text: "Ngày không hợp lệ." });
      return;
    }

    const existed = records.some((r) => r.date === safeDate && r.memberId === member.id);
    if (existed) {
      setMessage({ tone: "info", text: "Hội viên đã được điểm danh ngày này." });
      return;
    }

    const next = [
      {
        id: makeId("att"),
        memberId: member.id,
        date: safeDate,
        createdAt: Date.now(),
      },
      ...(Array.isArray(attendance) ? attendance : []),
    ];

    writeAttendance(next);
    setCode("");
    setMemberId("");
    setMessage({ tone: "success", text: `Đã điểm danh: ${member.name} (${safeDate}).` });
  };

  const onRemove = (id) => {
    const safeId = String(id || "");
    const next = records.filter((r) => r.id !== safeId).map((r) => ({
      id: r.id,
      memberId: r.memberId,
      date: r.date,
      createdAt: r.createdAt,
    }));

    writeAttendance(next);
  };

  return (
    <div className="grid gap-4">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-white">Điểm danh</h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          QR attendance (demo): nhập <span className="font-semibold">code HV-xxxxxx</span> hoặc chọn hội viên.
        </p>

        {message ? (
          <div className="mt-4">
            <MessageBox tone={message.tone}>{message.text}</MessageBox>
          </div>
        ) : null}

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block rounded-2xl border border-white/10 bg-white/5 p-3">
            <div className="text-xs font-semibold text-slate-200">Ngày</div>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-300/30"
            />
          </label>

          <label className="block rounded-2xl border border-white/10 bg-white/5 p-3">
            <div className="text-xs font-semibold text-slate-200">Nhập code (ưu tiên)</div>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-300/30"
              placeholder="VD: HV-123456"
            />

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setMessage(null);
                  setScannerError(null);

                  if (scannerOpen) {
                    setScannerOpen(false);
                    return;
                  }

                  const supported = typeof window !== "undefined" && "BarcodeDetector" in window;
                  if (!supported) {
                    setScannerError(
                      "Trình duyệt chưa hỗ trợ BarcodeDetector để quét QR. Bạn vẫn có thể nhập code thủ công."
                    );
                    return;
                  }

                  setScannerOpen(true);
                }}
                className="inline-flex h-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-300/30"
              >
                {scannerOpen ? "Tắt quét QR" : "Quét QR"}
              </button>
              <span className="text-xs text-slate-400">Dùng camera để quét mã điểm danh.</span>
            </div>
          </label>

          <label className="block rounded-2xl border border-white/10 bg-white/5 p-3 sm:col-span-2">
            <div className="text-xs font-semibold text-slate-200">Hoặc chọn hội viên</div>
            <select
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-300/30"
            >
              <option value="">- Chọn hội viên -</option>
              {memberList.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.code})
                </option>
              ))}
            </select>
          </label>
        </div>

        {scannerOpen ? (
          <div className="mt-4 rounded-3xl border border-white/10 bg-slate-950/30 p-4">
            <div className="text-sm font-semibold text-white">Camera quét QR</div>
            <p className="mt-2 text-xs leading-5 text-slate-300">
              Hướng camera vào QR của hội viên. Khi quét xong, code sẽ tự điền.
            </p>
            <div className="mt-3 overflow-hidden rounded-2xl border border-white/10 bg-black">
              <video ref={videoRef} className="h-56 w-full object-cover" playsInline muted />
            </div>
            {scannerError ? (
              <div className="mt-3">
                <MessageBox tone="error">{scannerError}</MessageBox>
              </div>
            ) : null}
          </div>
        ) : null}

        {!scannerOpen && scannerError ? (
          <div className="mt-4">
            <MessageBox tone="error">{scannerError}</MessageBox>
          </div>
        ) : null}

        <button
          type="button"
          onClick={onCheckIn}
          className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-300 to-blue-500 px-4 text-sm font-semibold text-slate-950 transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-cyan-300/50"
        >
          Điểm danh
        </button>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
        <h3 className="text-lg font-semibold text-white">Lịch sử điểm danh</h3>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Danh sách check-in gần nhất.
        </p>

        {records.length ? (
          <div className="mt-4 grid gap-2">
            {records.slice(0, 20).map((r) => (
              <div key={r.id} className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-white">{r.memberName}</div>
                    <div className="mt-1 text-xs text-slate-300">
                      {r.date} • {new Date(r.createdAt).toLocaleTimeString("vi-VN")}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemove(r.id)}
                    className="text-xs font-semibold text-slate-300 transition hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-300/30 rounded-xl px-2 py-1"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/30 p-4 text-sm text-slate-300">
            Chưa có lượt điểm danh.
          </div>
        )}
      </section>
    </div>
  );
}

