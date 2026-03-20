import { LESSONS } from "@/data/lessons";

export const BADGES = [
  {
    id: "starter",
    title: "Khởi động",
    description: "Hoàn thành 1 bài học đầu tiên.",
    requirement: { type: "count", count: 1 },
  },
  {
    id: "on-track",
    title: "Vào guồng",
    description: "Hoàn thành 3 bài học.",
    requirement: { type: "count", count: 3 },
  },
  {
    id: "foundation",
    title: "Nền tảng vững",
    description: "Hoàn thành 5 bài học.",
    requirement: { type: "count", count: 5 },
  },
  {
    id: "consistent",
    title: "Chăm chỉ",
    description: "Hoàn thành 10 bài học.",
    requirement: { type: "count", count: 10 },
  },
  {
    id: "roadmap-master",
    title: "Chinh phục lộ trình",
    description: "Hoàn thành toàn bộ lộ trình.",
    requirement: { type: "all" },
  },
];

export function computeBadges(doneSlugs) {
  const done = Array.isArray(doneSlugs) ? doneSlugs : [];
  const doneCount = done.length;
  const total = LESSONS.length;

  return BADGES.map((b) => {
    const req = b.requirement || { type: "count", count: 0 };

    const earned =
      req.type === "all"
        ? total > 0 && doneCount >= total
        : doneCount >= Math.max(0, Number(req.count) || 0);

    return {
      ...b,
      earned,
    };
  });
}
