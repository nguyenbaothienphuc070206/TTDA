function asText(value) {
  return String(value || "").trim();
}

const ROUTES = {
  aiCoachAsk: { path: "/api/ai/coach", methods: ["POST"] },
  aiCoachFeedback: { path: "/api/ai/coach/feedback", methods: ["POST"] },
  aiTranscript: { path: "/api/ai/transcript", methods: ["POST"] },
  aiSparring: { path: "/api/ai/sparring", methods: ["POST"] },
  aiDiary: { path: "/api/ai/diary", methods: ["POST"] },
  checkoutCreate: { path: "/api/checkout", methods: ["POST"] },
  checkoutSession: { path: "/api/checkout/session", methods: ["GET"] },
  authMe: { path: "/api/auth/me", methods: ["GET"] },
  authOtp: { path: "/api/auth/otp", methods: ["POST"] },
  authLogout: { path: "/api/auth/logout", methods: ["POST"] },
  authPasskey: { path: "/api/auth/passkey", methods: ["POST"] },
  communityMessagesGet: { path: "/api/community/messages", methods: ["GET"] },
  communityMessagesSend: { path: "/api/community/messages", methods: ["POST"] },
  communityMessagesRead: { path: "/api/community/messages/read", methods: ["PUT"] },
  communityConversations: { path: "/api/community/conversations", methods: ["GET"] },
  communityTyping: { path: "/api/community/typing", methods: ["PUT"] },
  aiIngest: { path: "/api/ai/ingest", methods: ["POST"] },
};

export function resolveGatewayTarget(target) {
  const key = asText(target);
  if (!key) return null;

  const spec = ROUTES[key];
  if (!spec) return null;

  return {
    target: key,
    path: spec.path,
    methods: Array.isArray(spec.methods) ? spec.methods : [],
  };
}

export function listGatewayTargets() {
  return Object.keys(ROUTES);
}
