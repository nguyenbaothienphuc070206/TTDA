export async function popConfettiFromElement(el) {
  if (typeof window === "undefined") return;
  if (!el || typeof el.getBoundingClientRect !== "function") return;

  try {
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
  } catch {
    // ignore
  }

  const rect = el.getBoundingClientRect();
  const vw = Math.max(1, window.innerWidth || 1);
  const vh = Math.max(1, window.innerHeight || 1);

  const x = (rect.left + rect.width / 2) / vw;
  const y = (rect.top + rect.height / 2) / vh;

  try {
    const mod = await import("canvas-confetti");
    const confetti = mod?.default || mod;

    if (typeof confetti !== "function") return;

    confetti({
      particleCount: 28,
      spread: 55,
      startVelocity: 20,
      gravity: 0.9,
      scalar: 0.8,
      ticks: 160,
      origin: { x, y },
      zIndex: 9999,
    });
  } catch {
    // ignore
  }
}
