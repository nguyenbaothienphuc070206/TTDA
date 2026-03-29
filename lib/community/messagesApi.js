import { callGateway } from "@/lib/api/gatewayClient";

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

  const res = await callGateway({
    target: "communityMessagesGet",
    method: "GET",
    query: Object.fromEntries(params.entries()),
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

  const res = await callGateway({
    target: "communityConversations",
    method: "GET",
    query: Object.fromEntries(params.entries()),
  });

  const payload = await parseJsonResponse(res);
  return {
    viewerId: asText(payload?.data?.viewerId) || "",
    unreadTotal: Number(payload?.data?.unreadTotal || 0),
    conversations: Array.isArray(payload?.data?.conversations) ? payload.data.conversations : [],
  };
}

export async function sendCommunityMessage({ toUserId, body }) {
  const res = await callGateway({
    target: "communityMessagesSend",
    method: "POST",
    payload: {
      toUserId: asText(toUserId),
      body: asText(body),
    },
  });

  const payload = await parseJsonResponse(res);
  return payload?.data?.message || null;
}

export async function markConversationRead({ toUserId }) {
  const res = await callGateway({
    target: "communityMessagesRead",
    method: "PUT",
    payload: { toUserId: asText(toUserId) },
  });

  const payload = await parseJsonResponse(res);
  return Number(payload?.data?.updatedCount || 0);
}

export async function sendTypingPing({ toUserId }) {
  const res = await callGateway({
    target: "communityTyping",
    method: "PUT",
    payload: { toUserId: asText(toUserId) },
  });

  const payload = await parseJsonResponse(res);
  return asText(payload?.data?.updatedAt);
}