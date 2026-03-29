function asText(value) {
  return String(value || "").trim();
}

export async function callGateway({
  target,
  method = "POST",
  payload = undefined,
  query = undefined,
  headers = undefined,
  signal = undefined,
  accept = undefined,
}) {
  const safeTarget = asText(target);
  if (!safeTarget) {
    throw new Error("Missing gateway target.");
  }

  const safeMethod = asText(method).toUpperCase() || "POST";
  const params = new URLSearchParams();
  params.set("target", safeTarget);

  const inputQuery = query && typeof query === "object" ? query : {};
  for (const [k, v] of Object.entries(inputQuery)) {
    const key = asText(k);
    const value = asText(v);
    if (!key || !value) continue;
    params.set(key, value);
  }

  const finalHeaders = {
    ...(headers && typeof headers === "object" ? headers : {}),
  };

  if (accept) {
    finalHeaders.Accept = asText(accept);
  }

  let body;
  if (payload !== undefined) {
    if (!finalHeaders["Content-Type"]) {
      finalHeaders["Content-Type"] = "application/json";
    }
    body = JSON.stringify(payload);
  }

  const res = await fetch(`/api/gateway?${params.toString()}`, {
    method: safeMethod,
    headers: finalHeaders,
    body,
    signal,
  });

  return res;
}
