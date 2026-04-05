"use client";

import { useMemo } from "react";

const RANKS = ["Lam đai", "Hoàng đai", "Hồng đai"];
const NAMES = [
  "Nguyen An",
  "Tran Binh",
  "Le Chau",
  "Pham Duc",
  "Vo Giang",
  "Doan Hieu",
  "Truong Khang",
  "Bui Linh",
  "Dang Minh",
  "Hoang Nhi",
  "Phan Quang",
  "Ngo Son",
  "Huynh Tam",
  "Ly Uyen",
  "Dinh Vy",
];

const ACTIVITIES = [
  "vừa hoàn thành Lam đai nhất",
  "streak 12 ngày liên tục",
  "vừa check-in buổi sáng",
  "đạt điểm form check 82/100",
  "vừa mở khóa bài phản đòn mới",
  "hoàn thành 3 bài kỹ thuật tuần này",
];

function buildFakePosts(count = 72) {
  const now = Date.now();
  return Array.from({ length: count }, (_, idx) => {
    const name = NAMES[idx % NAMES.length];
    const rank = RANKS[idx % RANKS.length];
    const activity = ACTIVITIES[idx % ACTIVITIES.length];
    const offsetMinutes = idx * 19;

    return {
      id: `fake-${idx + 1}`,
      content: `${name} ${activity}`,
      rank,
      likes: 6 + (idx % 27),
      created_at: new Date(now - offsetMinutes * 60000).toISOString(),
      author: name,
    };
  });
}

function initials(name) {
  return String(name || "V").split(" ").filter(Boolean).slice(0, 2).map((x) => x[0]).join("").toUpperCase();
}

export default function PostFeed({ posts }) {
  const real = useMemo(() => (Array.isArray(posts) ? posts : []), [posts]);

  const list = useMemo(() => {
    const mappedReal = real.map((post, idx) => ({
      id: post.id || `real-${idx}`,
      content: post.content,
      created_at: post.created_at,
      rank: "Lam đai",
      likes: 10 + (idx % 12),
      author: `Võ sinh #${idx + 1}`,
    }));

    const seeded = buildFakePosts(72);
    return [...mappedReal, ...seeded]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 90);
  }, [real]);

  return (
    <div className="grid gap-3">
      <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4">
        <div className="text-sm font-semibold text-white">Community Insight (mô phỏng)</div>
        <p className="mt-1 text-xs text-slate-300">
          Dùng để minh họa hành vi học tập phổ biến của người mới, không phải số liệu realtime.
        </p>
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-semibold text-slate-100">Người mới thường bắt đầu với Lam đai tự vệ</span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-semibold text-slate-100">Buổi 15-20 phút là lựa chọn phổ biến</span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-semibold text-slate-100">Check-in ngắn mỗi ngày giúp duy trì nhịp tập</span>
          <span className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 font-semibold text-cyan-100">Mini-testing: người mới phản hồi dễ duy trì hơn tự tập rời rạc</span>
        </div>
      </div>

      {list.map((post) => (
        <article key={post.id} className="rounded-2xl border border-white/10 bg-slate-950/30 p-4 transition hover:border-cyan-300/30 hover:bg-slate-950/40">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-cyan-300/25 bg-cyan-300/10 text-xs font-semibold text-cyan-100">
                {initials(post.author)}
              </div>
              <div>
                <div className="text-sm font-semibold text-white">{post.author}</div>
                <div className="text-xs text-slate-400">{post.rank}</div>
              </div>
            </div>

            <div className="text-xs text-slate-400">{new Date(post.created_at).toLocaleString()}</div>
          </div>

          <p className="mt-3 text-sm text-slate-100">{post.content}</p>

          <div className="mt-3 flex items-center gap-2 text-xs text-slate-300">
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">#{post.rank}</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">{post.likes} lượt quan tâm</span>
          </div>
        </article>
      ))}
    </div>
  );
}
