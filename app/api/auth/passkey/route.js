import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from "@simplewebauthn/server";

import { createCompatResponder } from "@/lib/api/compatResponse";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/routeHandlerClient";
import { checkRateLimit, isBodyTooLarge, isSameOrigin } from "@/lib/apiGuards";
import {
  getPasskeyCredentialById,
  listPasskeysByUserId,
  putPasskeyChallenge,
  randomPasskeySessionToken,
  takePasskeyChallenge,
  updatePasskeyCounter,
  upsertPasskeyCredential,
} from "@/lib/auth/passkeyPersistence";

function asText(value) {
  return String(value || "").trim();
}

function getRpId(request) {
  const explicit = asText(process.env.PASSKEY_RP_ID);
  if (explicit) return explicit;

  const host = asText(request.headers.get("x-forwarded-host") || request.headers.get("host"));
  return host.split(":")[0] || "localhost";
}

function getExpectedOrigins(request) {
  const list = [];
  const explicit = asText(process.env.PASSKEY_EXPECTED_ORIGINS);
  if (explicit) {
    for (const raw of explicit.split(",")) {
      const item = asText(raw);
      if (item) list.push(item);
    }
  }

  const fromHeaderProto = asText(request.headers.get("x-forwarded-proto") || "https").split(",")[0];
  const host = asText(request.headers.get("x-forwarded-host") || request.headers.get("host")).split(",")[0];
  if (host) {
    list.push(`${fromHeaderProto}://${host}`);
  }

  return Array.from(new Set(list.filter(Boolean)));
}

function toBufferFromBase64url(s) {
  try {
    return Buffer.from(asText(s), "base64url");
  } catch {
    return Buffer.from([]);
  }
}

function toBase64url(input) {
  try {
    if (!input) return "";
    return Buffer.from(input).toString("base64url");
  } catch {
    return "";
  }
}

function publicCredentialFromStored(stored) {
  return {
    credentialID: toBufferFromBase64url(stored?.id),
    credentialPublicKey: Buffer.from(asText(stored?.publicKeyBase64), "base64"),
    counter: Math.max(0, Math.round(Number(stored?.counter) || 0)),
    transports: Array.isArray(stored?.transports) ? stored.transports : [],
  };
}

export async function POST(request) {
  const api = createCompatResponder(request);

  if (!isSameOrigin(request)) {
    return api.fail({ message: "Invalid origin.", code: "INVALID_ORIGIN", status: 403 });
  }

  if (isBodyTooLarge(request, 220_000)) {
    return api.fail({ message: "Body too large.", code: "BODY_TOO_LARGE", status: 413 });
  }

  const rl = checkRateLimit({
    request,
    key: "auth_passkey",
    limit: 50,
    windowMs: 60 * 1000,
  });

  if (!rl.ok) {
    return api.fail({
      message: "Too many requests.",
      code: "RATE_LIMITED",
      status: 429,
      retryAfterSec: rl.retryAfterSec,
    });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return api.fail({ message: "Invalid JSON body.", code: "INVALID_JSON", status: 400 });
  }

  const action = asText(body?.action);
  const rpID = getRpId(request);
  const expectedOrigin = getExpectedOrigins(request);

  if (!expectedOrigin.length) {
    return api.fail({ message: "Cannot determine expected origin.", code: "CONFIG_ERROR", status: 500 });
  }

  if (action === "register_options") {
    let user;
    try {
      const supabase = createSupabaseRouteHandlerClient();
      const { data } = await supabase.auth.getUser();
      user = data?.user || null;
    } catch {
      user = null;
    }

    if (!user) {
      return api.fail({ message: "Sign in first to register passkey.", code: "UNAUTHORIZED", status: 401 });
    }

    const credentials = await listPasskeysByUserId(user.id);
    const options = await generateRegistrationOptions({
      rpName: asText(process.env.PASSKEY_RP_NAME) || "Vovinam Learning",
      rpID,
      userName: asText(user.email || user.id).slice(0, 80),
      userDisplayName: asText(user.user_metadata?.full_name || user.email || "Student").slice(0, 80),
      userID: Buffer.from(asText(user.id)),
      attestationType: "none",
      excludeCredentials: credentials.map((c) => ({
        id: toBufferFromBase64url(c.id),
        transports: Array.isArray(c.transports) ? c.transports : [],
      })),
      authenticatorSelection: {
        residentKey: "preferred",
        userVerification: "preferred",
      },
    });

    await putPasskeyChallenge({ challenge: options.challenge, action: "register", userId: user.id });
    return api.ok({ action: "register_options", options });
  }

  if (action === "register_verify") {
    const rawResponse = body?.response;

    // challenge is validated by simplewebauthn; we consume by expected challenge from parsed response.
    // keep a lightweight fallback: client sends challenge explicitly.
    const expectedChallenge = asText(body?.challenge);
    const challengeData = await takePasskeyChallenge({ challenge: expectedChallenge, action: "register" });

    if (!challengeData?.userId) {
      return api.fail({ message: "Passkey challenge expired.", code: "CHALLENGE_EXPIRED", status: 400 });
    }

    let verification;
    try {
      verification = await verifyRegistrationResponse({
        response: rawResponse,
        expectedChallenge,
        expectedOrigin,
        expectedRPID: rpID,
      });
    } catch {
      return api.fail({ message: "Passkey registration verification failed.", code: "PASSKEY_VERIFY_FAILED", status: 400 });
    }

    if (!verification?.verified || !verification.registrationInfo) {
      return api.fail({ message: "Passkey not verified.", code: "PASSKEY_VERIFY_FAILED", status: 400 });
    }

    const cred = verification.registrationInfo.credential || {};
    const id = toBase64url(cred.id || verification.registrationInfo.credentialID);
    const publicKey = cred.publicKey || verification.registrationInfo.credentialPublicKey;
    const counter = Number(cred.counter ?? verification.registrationInfo.counter ?? 0);
    const transports = Array.isArray(cred.transports) ? cred.transports : [];

    await upsertPasskeyCredential({
      userId: challengeData.userId,
      id,
      publicKeyBase64: Buffer.from(publicKey || Buffer.from([])).toString("base64"),
      counter,
      transports,
    });

    return api.ok({ action: "register_verify", verified: true });
  }

  if (action === "login_options") {
    const options = await generateAuthenticationOptions({
      rpID,
      userVerification: "preferred",
    });

    await putPasskeyChallenge({ challenge: options.challenge, action: "login", userId: "" });
    return api.ok({ action: "login_options", options });
  }

  if (action === "login_verify") {
    const expectedChallenge = asText(body?.challenge);
    const challengeData = await takePasskeyChallenge({ challenge: expectedChallenge, action: "login" });
    if (!challengeData) {
      return api.fail({ message: "Passkey challenge expired.", code: "CHALLENGE_EXPIRED", status: 400 });
    }

    const credentialId = asText(body?.response?.id || body?.response?.rawId);
    const stored = await getPasskeyCredentialById(credentialId);
    if (!stored) {
      return api.fail({ message: "Passkey not recognized on this server yet.", code: "PASSKEY_NOT_FOUND", status: 404 });
    }

    let verification;
    try {
      verification = await verifyAuthenticationResponse({
        response: body?.response,
        expectedChallenge,
        expectedOrigin,
        expectedRPID: rpID,
        credential: publicCredentialFromStored(stored),
      });
    } catch {
      return api.fail({ message: "Passkey login verification failed.", code: "PASSKEY_VERIFY_FAILED", status: 400 });
    }

    if (!verification?.verified) {
      return api.fail({ message: "Passkey login failed.", code: "PASSKEY_VERIFY_FAILED", status: 401 });
    }

    await updatePasskeyCounter({
      credentialId: stored.id,
      counter: verification.authenticationInfo?.newCounter || stored.counter,
    });

    const sessionToken = randomPasskeySessionToken();
    const res = api.ok({
      action: "login_verify",
      verified: true,
      userId: stored.userId,
      session: { token: sessionToken },
    });

    res.cookies?.set?.("vovinam_passkey_uid", stored.userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 14,
    });

    return res;
  }

  if (action === "logout") {
    const res = api.ok({ action: "logout", ok: true });
    res.cookies?.set?.("vovinam_passkey_uid", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    return res;
  }

  return api.fail({ message: "Unsupported passkey action.", code: "ACTION_INVALID", status: 400 });
}
