const OPENAI_BASE_URL = "https://api.openai.com/v1";

function getOpenAiApiKey() {
  const key = String(process.env.OPENAI_API_KEY || "").trim();
  return key;
}

export function hasOpenAi() {
  return Boolean(getOpenAiApiKey());
}

export function getOpenAiModels() {
  return {
    chat: String(process.env.OPENAI_CHAT_MODEL || "gpt-4o").trim() || "gpt-4o",
    embed:
      String(process.env.OPENAI_EMBED_MODEL || "text-embedding-3-small").trim() ||
      "text-embedding-3-small",
  };
}

export async function createEmbedding({ text }) {
  const apiKey = getOpenAiApiKey();
  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY");
  }

  const input = String(text || "").slice(0, 2000);
  const { embed: model } = getOpenAiModels();

  const res = await fetch(`${OPENAI_BASE_URL}/embeddings`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model, input }),
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(`OpenAI embeddings failed: ${res.status} ${msg}`);
  }

  const data = await res.json().catch(() => null);
  const vec = data?.data?.[0]?.embedding;
  if (!Array.isArray(vec) || vec.length < 10) {
    throw new Error("OpenAI embeddings: invalid response");
  }

  return vec;
}

export async function chatCompletion({ messages, temperature = 0.2 }) {
  const apiKey = getOpenAiApiKey();
  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY");
  }

  const { chat: model } = getOpenAiModels();

  const res = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      stream: false,
    }),
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(`OpenAI chat failed: ${res.status} ${msg}`);
  }

  const data = await res.json().catch(() => null);
  const text = data?.choices?.[0]?.message?.content;
  return String(text || "");
}

function extractSseDataLines(chunk) {
  const lines = String(chunk || "").split("\n");
  return lines
    .map((l) => l.trimEnd())
    .filter((l) => l.startsWith("data:"))
    .map((l) => l.slice("data:".length).trim());
}

export async function* streamChatCompletion({ messages, temperature = 0.2 }) {
  const apiKey = getOpenAiApiKey();
  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY");
  }

  const { chat: model } = getOpenAiModels();

  const res = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      stream: true,
    }),
  });

  if (!res.ok || !res.body) {
    const msg = await res.text().catch(() => "");
    throw new Error(`OpenAI stream failed: ${res.status} ${msg}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // Process by SSE event delimiter (blank line). Keep remainder in buffer.
    const parts = buffer.split("\n\n");
    buffer = parts.pop() || "";

    for (const part of parts) {
      for (const dataLine of extractSseDataLines(part)) {
        if (!dataLine) continue;
        if (dataLine === "[DONE]") return;

        let payload;
        try {
          payload = JSON.parse(dataLine);
        } catch {
          payload = null;
        }

        const delta = payload?.choices?.[0]?.delta;
        const text = delta?.content;
        if (text) {
          yield String(text);
        }
      }
    }
  }
}
