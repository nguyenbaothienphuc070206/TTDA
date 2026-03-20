"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

function dist(a, b) {
  if (!a || !b) return 0;
  const dx = Number(a.x) - Number(b.x);
  const dy = Number(a.y) - Number(b.y);
  if (!Number.isFinite(dx) || !Number.isFinite(dy)) return 0;
  return Math.hypot(dx, dy);
}

function angleDeg(a, b, c) {
  if (!a || !b || !c) return 0;

  const abx = Number(a.x) - Number(b.x);
  const aby = Number(a.y) - Number(b.y);
  const cbx = Number(c.x) - Number(b.x);
  const cby = Number(c.y) - Number(b.y);

  if (![abx, aby, cbx, cby].every(Number.isFinite)) return 0;

  const dot = abx * cbx + aby * cby;
  const mag1 = Math.hypot(abx, aby);
  const mag2 = Math.hypot(cbx, cby);
  if (mag1 === 0 || mag2 === 0) return 0;

  const cos = Math.min(1, Math.max(-1, dot / (mag1 * mag2)));
  return (Math.acos(cos) * 180) / Math.PI;
}

function pickFeedback(landmarks) {
  if (!Array.isArray(landmarks) || landmarks.length < 29) {
    return "Đưa toàn thân vào khung hình để AI nhận diện (demo).";
  }

  const ls = landmarks[11];
  const rs = landmarks[12];
  const lh = landmarks[23];
  const rh = landmarks[24];
  const lk = landmarks[25];
  const rk = landmarks[26];
  const la = landmarks[27];
  const ra = landmarks[28];

  const shoulders = dist(ls, rs);
  const stance = dist(la, ra);

  const leftKnee = angleDeg(lh, lk, la);
  const rightKnee = angleDeg(rh, rk, ra);

  const tips = [];

  if (shoulders > 0 && stance > 0) {
    const ratio = stance / shoulders;

    if (ratio < 0.85) {
      tips.push("Mở rộng chân thêm một chút để tấn vững hơn.");
    } else if (ratio > 1.9) {
      tips.push("Thu chân lại một chút để giữ thăng bằng.");
    }
  }

  const kneeAngles = [leftKnee, rightKnee].filter((x) => x > 0);
  if (kneeAngles.length > 0) {
    const avg = kneeAngles.reduce((a, b) => a + b, 0) / kneeAngles.length;

    if (avg > 165) {
      tips.push("Hạ tấn: gập gối nhẹ, giữ lưng thẳng. (Demo)");
    } else if (avg < 75) {
      tips.push("Không gập quá sâu, giữ gối an toàn. (Demo)");
    } else {
      tips.push("Tấn nhìn ổn - giữ nhịp thở đều và vai thả lỏng.");
    }
  }

  if (tips.length === 0) {
    return "Đang theo dõi… giữ lưng thẳng và thở đều.";
  }

  return tips.join(" ");
}

export default function PoseCoach() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const streamRef = useRef(null);
  const landmarkerRef = useRef(null);
  const drawingRef = useRef(null);
  const rafRef = useRef(0);
  const lastUiUpdateRef = useRef(0);
  const lastDetectRef = useRef(0);
  const lastPoseRef = useRef(null);
  const uploadUrlRef = useRef("");

  const [enabled, setEnabled] = useState(false);
  const [status, setStatus] = useState("Chưa bật camera.");
  const [feedback, setFeedback] = useState(
    "Bật camera hoặc tải ảnh/video để AI góp ý tư thế/tấn. (Demo: không thay thế huấn luyện viên)"
  );
  const [error, setError] = useState("");
  const [uploadKind, setUploadKind] = useState("");
  const [uploadUrl, setUploadUrl] = useState("");

  const stop = async ({ statusText } = {}) => {
    const wasCamera = Boolean(streamRef.current);
    const hadUpload = Boolean(uploadUrlRef.current);

    setEnabled(false);
    setStatus(
      statusText ||
        (wasCamera ? "Đã tắt camera." : hadUpload ? "Đã dừng phân tích." : "Đã dừng.")
    );

    lastDetectRef.current = 0;
    lastPoseRef.current = null;

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }

    const stream = streamRef.current;
    streamRef.current = null;
    if (stream) {
      for (const track of stream.getTracks()) {
        try {
          track.stop();
        } catch {
          // ignore
        }
      }
    }

    const video = videoRef.current;
    if (video) {
      try {
        video.pause();
        video.srcObject = null;
      } catch {
        // ignore
      }
    }

    const landmarker = landmarkerRef.current;
    landmarkerRef.current = null;
    try {
      landmarker?.close?.();
    } catch {
      // ignore
    }

    drawingRef.current = null;

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const clearUpload = async () => {
    setError("");
    await stop({ statusText: "Chưa bật camera." });

    const prev = uploadUrlRef.current;
    uploadUrlRef.current = "";
    if (prev) {
      try {
        URL.revokeObjectURL(prev);
      } catch {
        // ignore
      }
    }

    setUploadKind("");
    setUploadUrl("");
    setFeedback(
      "Bật camera hoặc tải ảnh/video để AI góp ý tư thế/tấn. (Demo: không thay thế huấn luyện viên)"
    );

    const video = videoRef.current;
    if (video) {
      try {
        video.removeAttribute("src");
        video.load();
      } catch {
        // ignore
      }
    }
  };

  const analyzeImageUrl = async (url) => {
    setError("");
    setStatus("Đang tải model pose…");
    setFeedback("Đang phân tích ảnh…");

    try {
      const mod = await import("@mediapipe/tasks-vision");
      const { PoseLandmarker, FilesetResolver, DrawingUtils } = mod;

      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
      );

      let landmarker;
      try {
        landmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
            delegate: "GPU",
          },
          runningMode: "IMAGE",
          numPoses: 1,
        });
      } catch {
        landmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
            delegate: "CPU",
          },
          runningMode: "IMAGE",
          numPoses: 1,
        });
      }

      const img = new Image();
      img.src = url;
      await new Promise((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Image load failed"));
      });

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) {
        setError("Thiếu canvas.");
        setStatus("Chưa bật camera.");
        try {
          landmarker.close?.();
        } catch {
          // ignore
        }
        return;
      }

      canvas.width = img.naturalWidth || 960;
      canvas.height = img.naturalHeight || 540;

      const draw = new DrawingUtils(ctx);
      let pose = null;
      try {
        const result = landmarker.detect(img);
        pose = Array.isArray(result?.landmarks) ? result.landmarks[0] : null;
      } catch {
        pose = null;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (pose) {
        draw.drawConnectors(pose, PoseLandmarker.POSE_CONNECTIONS, {
          color: "rgba(59, 130, 246, 0.85)",
          lineWidth: 3,
        });
        draw.drawLandmarks(pose, {
          color: "rgba(34, 211, 238, 0.9)",
          radius: 2,
        });
        setFeedback(pickFeedback(pose));
        setStatus("Đã phân tích ảnh.");
      } else {
        setFeedback("Không thấy pose - thử ảnh rõ nét, đủ sáng, toàn thân.");
        setStatus("Không nhận diện được pose.");
      }

      try {
        landmarker.close?.();
      } catch {
        // ignore
      }
    } catch {
      setError("Không tải được AI pose (model/wasm). Kiểm tra mạng và thử lại.");
      setStatus("Chưa bật camera.");
    }
  };

  const startUploadVideo = async (url) => {
    setError("");
    if (enabled) return;

    const video = videoRef.current;
    if (!video) {
      setError("Thiếu thẻ video.");
      return;
    }

    setStatus("Đang tải video…");

    try {
      video.pause();
      video.srcObject = null;
      video.src = url;
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      await video.play();
    } catch {
      // ignore
    }

    setStatus("Đang tải model pose…");

    try {
      const mod = await import("@mediapipe/tasks-vision");
      const { PoseLandmarker, FilesetResolver, DrawingUtils } = mod;

      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
      );

      let landmarker;
      try {
        landmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numPoses: 1,
        });
      } catch {
        landmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
            delegate: "CPU",
          },
          runningMode: "VIDEO",
          numPoses: 1,
        });
      }

      landmarkerRef.current = landmarker;

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) {
        setError("Thiếu canvas.");
        await stop();
        return;
      }

      drawingRef.current = {
        DrawingUtils,
        PoseLandmarker,
        utils: new DrawingUtils(ctx),
        ctx,
      };

      setEnabled(true);
      setStatus("Đang theo dõi…");

      const loop = () => {
        const v = videoRef.current;
        const c = canvasRef.current;
        const lm = landmarkerRef.current;
        const draw = drawingRef.current;

        if (!v || !c || !lm || !draw) return;

        if (v.readyState < 2 || v.videoWidth === 0 || v.videoHeight === 0) {
          rafRef.current = requestAnimationFrame(loop);
          return;
        }

        if (c.width !== v.videoWidth || c.height !== v.videoHeight) {
          c.width = v.videoWidth;
          c.height = v.videoHeight;
        }

        const t = performance.now();

        const DETECT_INTERVAL_MS = 90;
        if (t - lastDetectRef.current >= DETECT_INTERVAL_MS) {
          lastDetectRef.current = t;

          let pose = null;
          try {
            const result = lm.detectForVideo(v, t);
            pose = Array.isArray(result?.landmarks) ? result.landmarks[0] : null;
          } catch {
            pose = null;
          }

          lastPoseRef.current = pose;

          if (pose) {
            if (t - lastUiUpdateRef.current > 450) {
              lastUiUpdateRef.current = t;
              setFeedback(pickFeedback(pose));
            }
          } else if (t - lastUiUpdateRef.current > 450) {
            lastUiUpdateRef.current = t;
            setFeedback("Không thấy pose - thử đứng xa hơn và đủ sáng.");
          }
        }

        draw.ctx.clearRect(0, 0, c.width, c.height);

        const pose = lastPoseRef.current;
        if (pose) {
          draw.utils.drawConnectors(pose, draw.PoseLandmarker.POSE_CONNECTIONS, {
            color: "rgba(59, 130, 246, 0.85)",
            lineWidth: 3,
          });
          draw.utils.drawLandmarks(pose, {
            color: "rgba(34, 211, 238, 0.9)",
            radius: 2,
          });
        }

        rafRef.current = requestAnimationFrame(loop);
      };

      rafRef.current = requestAnimationFrame(loop);
    } catch {
      setError("Không tải được AI pose (model/wasm). Kiểm tra mạng và thử lại.");
      await stop();
    }
  };

  const onPickFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setError("");

    if (file.size > 25 * 1024 * 1024) {
      setError("File quá lớn. Hãy chọn ảnh/video ngắn (≤ 25MB).");
      return;
    }

    await stop({ statusText: "Đang chuẩn bị phân tích…" });

    const prev = uploadUrlRef.current;
    if (prev) {
      try {
        URL.revokeObjectURL(prev);
      } catch {
        // ignore
      }
    }

    const url = URL.createObjectURL(file);
    uploadUrlRef.current = url;
    setUploadUrl(url);

    if (String(file.type || "").startsWith("image/")) {
      setUploadKind("image");
      await analyzeImageUrl(url);
      return;
    }

    if (String(file.type || "").startsWith("video/")) {
      setUploadKind("video");
      await startUploadVideo(url);
      return;
    }

    uploadUrlRef.current = "";
    setUploadKind("");
    setUploadUrl("");
    setError("Chỉ hỗ trợ ảnh/video.");
  };

  const start = async () => {
    setError("");

    if (enabled) return;

    // If user previously uploaded a file, clear it before starting camera.
    if (uploadUrlRef.current) {
      try {
        URL.revokeObjectURL(uploadUrlRef.current);
      } catch {
        // ignore
      }
      uploadUrlRef.current = "";
      setUploadKind("");
      setUploadUrl("");
    }

    if (typeof window === "undefined") {
      setError("Chỉ chạy trên trình duyệt.");
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Trình duyệt chưa hỗ trợ camera (getUserMedia).");
      return;
    }

    setStatus("Đang xin quyền camera…");

    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 960 },
          height: { ideal: 540 },
          frameRate: { ideal: 24, max: 30 },
        },
        audio: false,
      });
    } catch {
      setError(
        "Không mở được camera. Hãy kiểm tra quyền camera (HTTPS/localhost) và thử lại."
      );
      setStatus("Chưa bật camera.");
      return;
    }

    streamRef.current = stream;

    const video = videoRef.current;
    if (!video) {
      setError("Thiếu thẻ video.");
      await stop();
      return;
    }

    try {
      video.pause();
      video.removeAttribute("src");
      video.load();
    } catch {
      // ignore
    }

    video.srcObject = stream;
    try {
      await video.play();
    } catch {
      // Some browsers require a user gesture; button click is the gesture.
    }

    setStatus("Đang tải model pose…");

    try {
      const mod = await import("@mediapipe/tasks-vision");
      const { PoseLandmarker, FilesetResolver, DrawingUtils } = mod;

      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
      );

      let landmarker;
      try {
        landmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numPoses: 1,
        });
      } catch {
        landmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
            delegate: "CPU",
          },
          runningMode: "VIDEO",
          numPoses: 1,
        });
      }

      landmarkerRef.current = landmarker;

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) {
        setError("Thiếu canvas.");
        await stop();
        return;
      }

      drawingRef.current = {
        DrawingUtils,
        PoseLandmarker,
        utils: new DrawingUtils(ctx),
        ctx,
      };

      setEnabled(true);
      setStatus("Đang theo dõi…");

      const loop = () => {
        const v = videoRef.current;
        const c = canvasRef.current;
        const lm = landmarkerRef.current;
        const draw = drawingRef.current;

        if (!v || !c || !lm || !draw) return;

        if (v.readyState < 2 || v.videoWidth === 0 || v.videoHeight === 0) {
          rafRef.current = requestAnimationFrame(loop);
          return;
        }

        if (c.width !== v.videoWidth || c.height !== v.videoHeight) {
          c.width = v.videoWidth;
          c.height = v.videoHeight;
        }

        const t = performance.now();

        // Throttle pose detection to reduce CPU/GPU load.
        const DETECT_INTERVAL_MS = 90;
        if (t - lastDetectRef.current >= DETECT_INTERVAL_MS) {
          lastDetectRef.current = t;

          let pose = null;
          try {
            const result = lm.detectForVideo(v, t);
            pose = Array.isArray(result?.landmarks) ? result.landmarks[0] : null;
          } catch {
            pose = null;
          }

          lastPoseRef.current = pose;

          if (pose) {
            if (t - lastUiUpdateRef.current > 450) {
              lastUiUpdateRef.current = t;
              setFeedback(pickFeedback(pose));
            }
          } else if (t - lastUiUpdateRef.current > 450) {
            lastUiUpdateRef.current = t;
            setFeedback("Không thấy pose - thử đứng xa hơn và đủ sáng.");
          }
        }

        draw.ctx.clearRect(0, 0, c.width, c.height);

        const pose = lastPoseRef.current;
        if (pose) {
          draw.utils.drawConnectors(pose, draw.PoseLandmarker.POSE_CONNECTIONS, {
            color: "rgba(59, 130, 246, 0.85)",
            lineWidth: 3,
          });
          draw.utils.drawLandmarks(pose, {
            color: "rgba(34, 211, 238, 0.9)",
            radius: 2,
          });
        }

        rafRef.current = requestAnimationFrame(loop);
      };

      rafRef.current = requestAnimationFrame(loop);
    } catch {
      setError("Không tải được AI pose (model/wasm). Kiểm tra mạng và thử lại.");
      await stop();
    }
  };

  useEffect(() => {
    return () => {
      stop();

      const url = uploadUrlRef.current;
      uploadUrlRef.current = "";
      if (url) {
        try {
          URL.revokeObjectURL(url);
        } catch {
          // ignore
        }
      }
    };
  }, []);

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 shadow-[var(--shadow-card)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-white">AI Pose Coach</h2>
          <p className="mt-1 text-sm leading-6 text-slate-300">
            Bật camera hoặc tải ảnh/video ngắn để AI vẽ khung xương và góp ý tư thế/tấn. (Demo)
          </p>
        </div>

        <button
          type="button"
          onClick={enabled ? stop : start}
          className={
            enabled
              ? "inline-flex h-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-400/30"
              : "inline-flex h-11 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-400 to-blue-600 px-4 text-sm font-semibold text-slate-950 transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
          }
        >
          {enabled ? (streamRef.current ? "Tắt camera" : "Dừng phân tích") : "Bật camera"}
        </button>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
        <label className="block">
          <div className="text-xs font-semibold text-slate-200">Tải ảnh/video</div>
          <input
            type="file"
            accept="image/*,video/*"
            onChange={onPickFile}
            className="mt-2 h-11 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-3 text-sm text-slate-200 outline-none focus:ring-2 focus:ring-blue-400/30"
          />
        </label>

        {uploadUrl ? (
          <button
            type="button"
            onClick={clearUpload}
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-400/30"
          >
            Xoá file
          </button>
        ) : null}
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/40">
        <div className="relative aspect-video">
          <video
            ref={videoRef}
            className={
              uploadKind === "image"
                ? "pointer-events-none absolute inset-0 h-full w-full object-cover opacity-0"
                : "absolute inset-0 h-full w-full object-cover"
            }
            playsInline
            muted
            autoPlay
          />

          {uploadKind === "image" && uploadUrl ? (
            <Image
              src={uploadUrl}
              alt="Upload"
              fill
              unoptimized
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          ) : null}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 h-full w-full"
          />
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
          <div className="text-xs font-semibold text-slate-300">Trạng thái</div>
          <div className="mt-1 text-sm font-semibold text-white">{status}</div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
          <div className="text-xs font-semibold text-slate-300">Gợi ý</div>
          <div className="mt-1 text-sm leading-6 text-slate-200">{feedback}</div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-100">
            {error}
          </div>
        ) : null}
      </div>
    </section>
  );
}

