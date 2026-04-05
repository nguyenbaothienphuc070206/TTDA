export function recommendTraining(userStats) {
  const stats = userStats && typeof userStats === "object" ? userStats : {};
  const failRate = Number(stats.fail_rate || 0);
  const streak = Number(stats.streak || 0);

  if (failRate > 0.4) {
    return {
      level: "basic",
      recommendation: "basic drills",
      note: "Tap trung bai co ban de on dinh truc va nhip.",
    };
  }

  if (streak > 7) {
    return {
      level: "advanced",
      recommendation: "advanced combo",
      note: "Ban dang giu nhip tot, co the nang do kho.",
    };
  }

  return {
    level: "balanced",
    recommendation: "standard flow",
    note: "Duy tri lich tap deu va theo doi chat luong ky thuat.",
  };
}
