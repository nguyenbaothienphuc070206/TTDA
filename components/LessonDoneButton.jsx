"use client";

import { useEffect, useRef, useState } from "react";

import { popConfettiFromElement } from "@/lib/confetti";
import { isLessonDone, toggleLessonDone } from "@/lib/progress";

export default function LessonDoneButton({ slug }) {
  const [done, setDone] = useState(false);
  const buttonRef = useRef(null);

  useEffect(() => {
    const sync = () => {
      setDone(isLessonDone(slug));
    };

    sync();
    window.addEventListener("vovinam-progress", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("vovinam-progress", sync);
      window.removeEventListener("storage", sync);
    };
  }, [slug]);

  const onClick = () => {
    const wasDone = done;
    const next = toggleLessonDone(slug);
    const nextDone = next.includes(slug);
    setDone(nextDone);

    if (!wasDone && nextDone) {
      popConfettiFromElement(buttonRef.current);
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      ref={buttonRef}
      className={
        done
          ? "inline-flex h-11 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-500/15 px-4 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/20 focus:outline-none focus:ring-2 focus:ring-emerald-300/30"
          : "inline-flex h-11 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-300 to-blue-500 px-4 text-sm font-semibold text-slate-950 transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-cyan-300/50"
      }
    >
      {done ? "Đã hoàn thành • Bấm để bỏ" : "Đánh dấu hoàn thành"}
    </button>
  );
}
