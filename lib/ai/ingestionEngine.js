function asText(value) {
  return String(value || "").trim();
}

function toFiniteNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function clamp(value, min, max) {
  const n = toFiniteNumber(value, min);
  return Math.max(min, Math.min(max, n));
}

function normalizeTextInput(input) {
  const content = asText(input?.content).slice(0, 12_000);
  const language = asText(input?.language || "vi").slice(0, 10);

  return {
    modality: "text",
    content,
    language,
    tokenEstimate: Math.max(1, Math.ceil(content.length / 4)),
  };
}

function normalizeImageInput(input) {
  const mimeType = asText(input?.mimeType || "image/jpeg").toLowerCase();
  const width = clamp(input?.width, 1, 20_000);
  const height = clamp(input?.height, 1, 20_000);
  const angle = clamp(input?.angleDeg, -180, 180);
  const landmarks = Array.isArray(input?.landmarks)
    ? input.landmarks
        .slice(0, 512)
        .map((p) => ({
          x: clamp(p?.x, -1_000_000, 1_000_000),
          y: clamp(p?.y, -1_000_000, 1_000_000),
          z: clamp(p?.z, -1_000_000, 1_000_000),
          score: clamp(p?.score, 0, 1),
          label: asText(p?.label).slice(0, 40),
        }))
    : [];

  return {
    modality: "image",
    mimeType,
    width,
    height,
    angleDeg: angle,
    landmarks,
    landmarkCount: landmarks.length,
  };
}

function normalizeVideoInput(input) {
  const durationMs = clamp(input?.durationMs, 0, 30 * 60 * 1000);
  const fps = clamp(input?.fps, 1, 240);
  const frameCount = clamp(input?.frameCount, 0, 200_000);
  const motionScore = clamp(input?.motionScore, 0, 1);
  const keyframes = Array.isArray(input?.keyframes)
    ? input.keyframes.slice(0, 120).map((f) => ({
        tsMs: clamp(f?.tsMs, 0, durationMs || 30 * 60 * 1000),
        confidence: clamp(f?.confidence, 0, 1),
        hint: asText(f?.hint).slice(0, 140),
      }))
    : [];

  return {
    modality: "video",
    durationMs,
    fps,
    frameCount,
    motionScore,
    keyframes,
  };
}

function normalizePoseInput(input) {
  const sequence = Array.isArray(input?.sequence) ? input.sequence.slice(0, 1_200) : [];
  const normalized = sequence.map((frame) => ({
    tsMs: clamp(frame?.tsMs, 0, 30 * 60 * 1000),
    joints: Array.isArray(frame?.joints)
      ? frame.joints.slice(0, 80).map((j) => ({
          name: asText(j?.name).slice(0, 40),
          angle: clamp(j?.angle, -360, 360),
          visibility: clamp(j?.visibility, 0, 1),
        }))
      : [],
  }));

  return {
    modality: "pose",
    sequence: normalized,
    frameCount: normalized.length,
  };
}

function normalizeAudioInput(input) {
  const durationMs = clamp(input?.durationMs, 0, 30 * 60 * 1000);
  const transcript = asText(input?.transcript).slice(0, 8_000);
  const avgDb = clamp(input?.avgDb, -120, 20);

  return {
    modality: "audio",
    durationMs,
    transcript,
    avgDb,
  };
}

function normalizeProgressInput(input) {
  const entries = Array.isArray(input?.entries)
    ? input.entries.slice(0, 600).map((e) => ({
        slug: asText(e?.slug).slice(0, 120),
        doneAt: asText(e?.doneAt).slice(0, 80),
      }))
    : [];

  return {
    modality: "progress",
    entries,
    count: entries.length,
  };
}

const NORMALIZERS = {
  text: normalizeTextInput,
  image: normalizeImageInput,
  video: normalizeVideoInput,
  pose: normalizePoseInput,
  audio: normalizeAudioInput,
  progress: normalizeProgressInput,
};

function scoreForRealtime(modality, payload) {
  if (modality === "pose") {
    return clamp(0.5 + payload.frameCount / 1000, 0, 1);
  }
  if (modality === "video") {
    const cadence = payload.fps >= 24 ? 0.3 : 0.15;
    return clamp(0.4 + cadence + payload.motionScore * 0.3, 0, 1);
  }
  if (modality === "image") {
    return clamp(0.4 + Math.min(1, payload.landmarkCount / 40) * 0.4, 0, 1);
  }
  if (modality === "text") {
    return clamp(0.3 + Math.min(1, payload.tokenEstimate / 2000) * 0.4, 0, 1);
  }
  if (modality === "audio") {
    return clamp(0.3 + Math.min(1, payload.durationMs / 120000) * 0.5, 0, 1);
  }
  return 0.5;
}

export function ingestPolymorphicPayload(input) {
  const modality = asText(input?.modality).toLowerCase();
  const normalize = NORMALIZERS[modality];

  if (!normalize) {
    return {
      ok: false,
      error: {
        code: "UNSUPPORTED_MODALITY",
        message: "Supported modalities: text, image, video, pose, audio, progress.",
      },
    };
  }

  const normalized = normalize(input || {});

  return {
    ok: true,
    data: {
      version: "ingest-v1",
      modality,
      normalized,
      quality: {
        realtimeFitness: scoreForRealtime(modality, normalized),
      },
      receivedAt: new Date().toISOString(),
    },
  };
}
