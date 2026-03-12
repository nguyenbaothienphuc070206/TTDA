"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { LESSONS } from "@/data/lessons";
import { readDoneSlugs } from "@/lib/progress";

function NavItem({ href, children }) {
  return (
    <Link
      href={href}
      className="rounded-full px-3 py-1.5 text-sm text-slate-200 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-300/40"
    >
      {children}
    </Link>
  );
}

export default function SiteHeader() {
  const total = useMemo(() => LESSONS.length, []);
  const [doneCount, setDoneCount] = useState(0);

  useEffect(() => {
    const update = () => {
      const done = readDoneSlugs();
      setDoneCount(Array.isArray(done) ? done.length : 0);
    };

    update();

    window.addEventListener("vovinam-progress", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("vovinam-progress", update);
      window.removeEventListener("storage", update);
    };
  }, []);

  const percent = total === 0 ? 0 : Math.round((doneCount / total) * 100);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/70 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-cyan-300/40 rounded-xl"
        >
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-300 to-blue-500 text-slate-950 font-extrabold shadow-sm">
            V
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-semibold tracking-tight text-white">
              Vovinam
            </span>
            <span className="block text-xs text-slate-300">
              Học từ cơ bản → nâng cao
            </span>
          </span>
        </Link>

        <nav className="flex flex-wrap items-center gap-1">
          <NavItem href="/lo-trinh">Lộ trình</NavItem>
          <NavItem href="/lich-tap">Lịch tập</NavItem>

          <div className="hidden sm:flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 ml-1">
            <span className="text-xs text-slate-300">Tiến độ</span>
            <span className="text-xs font-semibold text-cyan-200">
              {doneCount}/{total}
            </span>
            <div className="h-2 w-24 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full bg-gradient-to-r from-cyan-300 to-blue-500 progress-bar"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
