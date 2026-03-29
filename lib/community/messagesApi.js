function asText(value) {
  return String(value || "").trim();
}

async function parseJsonResponse(res) {
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const message =
      asText(data?.error?.message) ||
      asText(data?.error) ||
      `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data;
}

export async function fetchCommunityMessages({ toUserId, cursor = "", limit = 30 }) {
  const params = new URLSearchParams();
  params.set("to", asText(toUserId));
  params.set("limit", String(limit));
  if (cursor) {
    params.set("cursor", asText(cursor));
  }

  const res = await fetch(`/api/community/messages?${params.toString()}`, {
    method: "GET",
    cache: "no-store",
  });

  const payload = await parseJsonResponse(res);
  return {
    viewerId: asText(payload?.data?.viewerId) || "",
    messages: Array.isArray(payload?.data?.messages) ? payload.data.messages : [],
    nextCursor: asText(payload?.data?.nextCursor) || "",
  };
}

export async function fetchCommunityConversations({ limit = 20 } = {}) {
  const params = new URLSearchParams();
  params.set("limit", String(limit));

  const res = await fetch(`/api/community/conversations?${params.toString()}`, {
    method: "GET",
    cache: "no-store",
  });

  const payload = await parseJsonResponse(res);
  return {
    viewerId: asText(payload?.data?.viewerId) || "",
    unreadTotal: Number(payload?.data?.unreadTotal || 0),
    conversations: Array.isArray(payload?.data?.conversations) ? payload.data.conversations : [],
  };
}

export async function sendCommunityMessage({ toUserId, body }) {
  const res = await fetch("/api/community/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      toUserId: asText(toUserId),
      body: asText(body),
    }),
  });

  const payload = await parseJsonResponse(res);
  return payload?.data?.message || null;
}

export async function markConversationRead({ toUserId }) {
  const res = await fetch("/api/community/messages/read", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ toUserId: asText(toUserId) }),
  });

  const payload = await parseJsonResponse(res);
  return Number(payload?.data?.updatedCount || 0);
}

export async function sendTypingPing({ toUserId }) {
  const res = await fetch("/api/community/typing", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ toUserId: asText(toUserId) }),
  });

  const payload = await parseJsonResponse(res);
  return asText(payload?.data?.updatedAt);
}