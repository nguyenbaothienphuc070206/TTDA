"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "react-qr-code";

import { BELTS, getBeltById } from "@/data/belts";
import { readMembers, writeMembers } from "@/lib/adminData";

function makeId(prefix) {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}_${crypto.randomUUID()}`;
  }

  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function generateMemberCode(existing) {
  const existingSet = new Set(existing);

  for (let i = 0; i < 50; i += 1) {
    const candidate = `HV-${Math.floor(100000 + Math.random() * 900000)}`;
    if (!existingSet.has(candidate)) return candidate;
  }

  return `HV-${Date.now()}`;
}

function Field({ label, children }) {
  return (
    <label className="block rounded-2xl border border-white/10 bg-white/5 p-3">
      <div className="text-xs font-semibold text-slate-200">{label}</div>
      <div className="mt-2">{children}</div>
    </label>
  );
}

export default function MembersManager() {
  const [members, setMembers] = useState(() => readMembers());
  const [name, setName] = useState("");
  const [beltId, setBeltId] = useState("lam-dai");

  useEffect(() => {
    const sync = () => setMembers(readMembers());

    sync();
    window.addEventListener("vovinam-admin-members", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("vovinam-admin-members", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const normalized = useMemo(() => {
    const list = Array.isArray(members) ? members : [];

    return list
      .map((m) => {
        if (!m || typeof m !== "object") return null;
        const id = String(m.id || "");
        const code = String(m.code || "");
        const memberName = String(m.name || "");
        const memberBeltId = String(m.beltId || "");
        const joinedAt = typeof m.joinedAt === "number" ? m.joinedAt : 0;
        if (!id || !code || !memberName) return null;

        return {
          id,
          code,
          name: memberName,
          beltId: memberBeltId || "lam-dai",
          joinedAt,
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.joinedAt - a.joinedAt);
  }, [members]);

  const onAdd = () => {
    const safeName = name.trim();
    const belt = getBeltById(beltId) || BELTS[0];

    if (!safeName) return;

    const code = generateMemberCode(normalized.map((m) => m.code));

    const next = [
      {
        id: makeId("mem"),
        code,
        name: safeName,
        beltId: belt.id,
        joinedAt: Date.now(),
      },
      ...normalized,
    ];

    writeMembers(next);
    setName("");
  };

  const onRemove = (id) => {
    const safeId = String(id || "");
    const next = normalized.filter((m) => m.id !== safeId);
    writeMembers(next);
  };

  const onUpdateBelt = (id, nextBeltId) => {
    const safeId = String(id || "");
    const belt = getBeltById(nextBeltId);
    if (!belt) return;

    const next = normalized.map((m) => (m.id === safeId ? { ...m, beltId: belt.id } : m));
    writeMembers(next);
  };

  return (
    <div className="grid gap-4">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-white">Quản lý hội viên</h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Thêm hội viên và tạo mã điểm danh (QR demo) theo dạng code.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Field label="Tên hội viên">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-300/30"
              placeholder="Ví dụ: Trần Thị B"
            />
          </Field>

          <Field label="Cấp đai hiện tại">
            <select
              value={beltId}
              onChange={(e) => setBeltId(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-300/30"
            >
              {BELTS.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <button
          type="button"
          onClick={onAdd}
          className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-300 to-blue-500 px-4 text-sm font-semibold text-slate-950 transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-cyan-300/50"
        >
          Thêm hội viên
        </button>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
        <h3 className="text-lg font-semibold text-white">Danh sách hội viên</h3>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Mã điểm danh dùng để check-in: nhập code ở trang Điểm danh.
        </p>

        {normalized.length ? (
          <div className="mt-4 grid gap-3">
            {normalized.map((m) => {
              const belt = getBeltById(m.beltId);

              return (
                <div key={m.id} className="rounded-3xl border border-white/10 bg-slate-950/30 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-white">{m.name}</div>
                      <div className="mt-1 text-xs text-slate-300">Code: {m.code}</div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemove(m.id)}
                      className="text-xs font-semibold text-slate-300 transition hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-300/30 rounded-xl px-2 py-1"
                    >
                      Xóa
                    </button>
                  </div>

                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                      <div className="text-xs font-semibold text-slate-300">Cấp đai</div>
                      <select
                        value={m.beltId}
                        onChange={(e) => onUpdateBelt(m.id, e.target.value)}
                        className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-300/30"
                      >
                        {BELTS.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.title}
                          </option>
                        ))}
                      </select>
                      <div className="mt-2 text-xs text-slate-300">
                        {belt ? belt.short : ""}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                      <div className="text-xs font-semibold text-slate-300">Ngày tham gia</div>
                      <div className="mt-2 text-sm font-semibold text-white">
                        {new Date(m.joinedAt).toLocaleDateString("vi-VN")}
                      </div>
                      <div className="mt-2 text-xs text-slate-300">ID: {m.id}</div>
                    </div>
                  </div>

                  <details className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <summary className="cursor-pointer list-none text-sm font-semibold text-white">
                      QR điểm danh
                    </summary>
                    <div className="mt-4 flex flex-wrap items-start gap-4">
                      <div className="rounded-2xl bg-white p-3">
                        <QRCode value={m.code} size={132} />
                      </div>
                      <div className="min-w-[220px] text-sm leading-6 text-slate-300">
                        <div className="text-xs font-semibold text-slate-200">Cách dùng</div>
                        <p className="mt-2">
                          Mở trang <span className="font-semibold text-white">Điểm danh</span> và dùng nút
                          <span className="font-semibold text-white"> Quét QR</span> để tự điền code.
                        </p>
                        <p className="mt-2 text-xs text-slate-400">Giá trị QR: {m.code}</p>
                      </div>
                    </div>
                  </details>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/30 p-4 text-sm text-slate-300">
            Chưa có hội viên nào.
          </div>
        )}
      </section>
    </div>
  );
}
