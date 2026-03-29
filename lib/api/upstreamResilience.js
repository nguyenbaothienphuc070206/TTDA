function asText(value) {
  return String(value || "").trim();
}

function getStore() {
  if (!globalThis.__vovinamCircuitStore) {
    globalThis.__vovinamCircuitStore = new Map();
  }
  return globalThis.__vovinamCircuitStore;
}

function nowMs() {
  return Date.now();
}

function toSafeInt(value, fallback, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.round(n)));
}

function getConfig() {
  return {
    failureThreshold: toSafeInt(process.env.UPSTREAM_CB_FAILURE_THRESHOLD, 5, 1, 20),
    openMs: toSafeInt(process.env.UPSTREAM_CB_OPEN_MS, 30_000, 5_000, 5 * 60_000),
  };
}

function getState(key) {
  const store = getStore();
  const safeKey = asText(key) || "default";

  if (!store.has(safeKey)) {
    store.set(safeKey, {
      failures: 0,
      openUntilMs: 0,
      lastFailureAtMs: 0,
    });
  }

  return store.get(safeKey);
}

function markFailure(key) {
  const state = getState(key);
  const cfg = getConfig();

  state.failures += 1;
  state.lastFailureAtMs = nowMs();

  if (state.failures >= cfg.failureThreshold) {
    state.openUntilMs = nowMs() + cfg.openMs;
  }
}

function markSuccess(key) {
  const state = getState(key);
  state.failures = 0;
  state.openUntilMs = 0;
}

function isOpen(key) {
  const state = getState(key);
  if (state.openUntilMs <= nowMs()) {
    if (state.openUntilMs > 0) {
      state.openUntilMs = 0;
      state.failures = 0;
    }
    return false;
  }

  return true;
}

function isRetriableStatus(status) {
  return status === 408 || status === 425 || status === 429 || (status >= 500 && status <= 599);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchWithResilience(
  url,
  {
    service = "upstream",
    timeoutMs = 10_000,
    retries = 1,
    retryDelayMs = 180,
    ...init
  } = {}
) {
  const safeService = asText(service) || "upstream";

  if (isOpen(safeService)) {
    return {
      ok: false,
      type: "circuit_open",
      response: null,
      error: new Error("Circuit breaker is open."),
      attemptCount: 0,
    };
  }

  const maxRetries = Math.max(0, toSafeInt(retries, 1, 0, 4));
  const safeTimeoutMs = toSafeInt(timeoutMs, 10_000, 500, 60_000);
  const safeRetryDelay = toSafeInt(retryDelayMs, 180, 50, 5_000);

  let attempt = 0;
  let lastError = null;

  while (attempt <= maxRetries) {
    attempt += 1;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), safeTimeoutMs);

    try {
      const response = await fetch(url, {
        ...init,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (response.ok) {
        markSuccess(safeService);
        return {
          ok: true,
          type: "ok",
          response,
          error: null,
          attemptCount: attempt,
        };
      }

      if (!isRetriableStatus(response.status) || attempt > maxRetries) {
        if (response.status >= 500) {
          markFailure(safeService);
        }

        return {
          ok: false,
          type: "http_error",
          response,
          error: null,
          attemptCount: attempt,
        };
      }

      lastError = new Error(`Retriable upstream status: ${response.status}`);
    } catch (error) {
      clearTimeout(timeout);
      const isAbort = error?.name === "AbortError";
      lastError = error instanceof Error ? error : new Error("Upstream request failed.");

      if (!isAbort && attempt > maxRetries) {
        markFailure(safeService);
        return {
          ok: false,
          type: "network_error",
          response: null,
          error: lastError,
          attemptCount: attempt,
        };
      }

      if (attempt > maxRetries) {
        markFailure(safeService);
        return {
          ok: false,
          type: isAbort ? "timeout" : "network_error",
          response: null,
          error: lastError,
          attemptCount: attempt,
        };
      }
    }

    const jitter = Math.floor(Math.random() * 60);
    await sleep(safeRetryDelay * attempt + jitter);
  }

  markFailure(safeService);
  return {
    ok: false,
    type: "unknown",
    response: null,
    error: lastError || new Error("Unknown upstream error."),
    attemptCount: attempt,
  };
}
