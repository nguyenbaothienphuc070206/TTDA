function normalizeBooleanFlag(value) {
  const safe = String(value || "").trim().toLowerCase();
  return safe === "1" || safe === "true" || safe === "yes" || safe === "on";
}

export function isPitchModeEnabled() {
  return normalizeBooleanFlag(process.env.NEXT_PUBLIC_PITCH_MODE);
}
