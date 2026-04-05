export function isPremium(user) {
  return String(user?.plan || "").toLowerCase() === "premium";
}
