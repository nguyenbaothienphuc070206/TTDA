export async function askAI(question) {
  const payload = { question: String(question || "").trim() };

  const res = await fetch("/api/ai", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(body || "AI request failed");
  }

  return res.json();
}
