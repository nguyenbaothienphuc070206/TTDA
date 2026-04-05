export function buildInactiveReminder(daysInactive) {
  const days = Math.max(0, Number(daysInactive) || 0);
  if (days > 3) {
    return "Ban da nghi tap 3 ngay, quay lai 1 buoi nhe.";
  }
  return "Tiep tuc giu streak, tap ngan cung duoc.";
}
