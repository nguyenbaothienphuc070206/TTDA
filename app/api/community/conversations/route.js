import { NextResponse } from "next/server";

import { checkRateLimit } from "@/lib/apiGuards";
import { getRequestId, jsonError, jsonOk } from "@/lib/api/enterprise";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/routeHandlerClient";

function asText(value) {
  return String(value || "").trim();
}

function sanitizeLimit(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 20;
  return Math.min(50, Math.max(1, Math.round(n)));
}

export async function GET(request) {
  const requestId = getRequestId(request);
  const rl = checkRateLimit({
    request,
    key: "community_conversations_get",
    limit: 60,
    windowMs: 60 * 1000,
  });

  if (!rl.ok) {
    const res = jsonError(
      { message: "Too many requests. Please retry shortly.", code: "RATE_LIMITED" },
      { status: 429, requestId }
    );
    res.headers.set("Retry-After", String(rl.retryAfterSec));
    return res;
  }

  try {
    const supabase = createSupabaseRouteHandlerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return jsonError({ message: "Unauthorized.", code: "UNAUTHORIZED" }, { status: 401, requestId });
    }

    const url = new URL(request.url);
    const limit = sanitizeLimit(url.searchParams.get("limit"));

    const [{ data: rows, error }, { data: unreadRows }] = await Promise.all([
      supabase
        .from("community_messages")
        .select("id,sender_id,recipient_id,body,created_at")
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order("created_at", { ascending: false })
        .limit(800),
      supabase
        .from("community_messages")
        .select("sender_id")
        .eq("recipient_id", user.id)
        .is("read_at", null)
        .limit(1500),
    ]);

    if (error) {
      return jsonError({ message: "Unable to load conversations.", code: "DB_QUERY_FAILED" }, { status: 500, requestId });
    }

    const unreadBySender = new Map();
    for (const row of Array.isArray(unreadRows) ? unreadRows : []) {
      const senderId = asText(row?.sender_id);
      if (!senderId) continue;
      unreadBySender.set(senderId, Number(unreadBySender.get(senderId) || 0) + 1);
    }

    const latestByPartner = new Map();
    const partnerIds = new Set();

    for (const row of Array.isArray(rows) ? rows : []) {
      const senderId = asText(row?.sender_id);
      const recipientId = asText(row?.recipient_id);
      const partnerId = senderId === user.id ? recipientId : senderId;
      if (!partnerId || partnerId === user.id) continue;
      partnerIds.add(partnerId);
      if (!latestByPartner.has(partnerId)) {
        latestByPartner.set(partnerId, row);
      }
    }

    let profileById = new Map();
    const idList = Array.from(partnerIds);
    if (idList.length) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id,display_name,avatar_url")
        .in("user_id", idList);

      profileById = new Map(
        (Array.isArray(profiles) ? profiles : [])
          .filter((p) => p && typeof p.user_id === "string")
          .map((p) => [p.user_id, p])
      );
    }

    const conversations = [];

    for (const [partnerId, row] of latestByPartner.entries()) {
      const profile = profileById.get(partnerId);
      const body = asText(row?.body);
      const createdAt = asText(row?.created_at);
      const unreadCount = Number(unreadBySender.get(partnerId) || 0);

      conversations.push({
        partnerId,
        partnerName: asText(profile?.display_name) || "Student",
        avatarUrl: asText(profile?.avatar_url) || "",
        lastMessage: body,
        lastMessageAt: createdAt,
        lastFromMe: asText(row?.sender_id) === user.id,
        unreadCount,
      });
    }

    conversations.sort((a, b) => {
      return Date.parse(b?.lastMessageAt || "") - Date.parse(a?.lastMessageAt || "");
    });

    const windowed = conversations.slice(0, limit);
    const unreadTotal = windowed.reduce((sum, item) => sum + Number(item?.unreadCount || 0), 0);

    return jsonOk(
      {
        viewerId: user.id,
        unreadTotal,
        conversations: windowed,
      },
      { requestId }
    );
  } catch {
    return jsonError({ message: "Unable to load conversations.", code: "INTERNAL_ERROR" }, { status: 500, requestId });
  }
}