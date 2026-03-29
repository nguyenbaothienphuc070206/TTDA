"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "react-qr-code";

import { readDoneSlugs, writeDoneSlugs } from "@/lib/progress";
import { readProfile } from "@/lib/profile";
import { base64UrlDecodeJson, base64UrlEncodeJson } from "@/lib/base64url";
import { callGateway } from "@/lib/api/gatewayClient";

const SHARE_KEY = "vovinam_mesh_share_v1";
const QUEUE_KEY = "vovinam_mesh_sync_queue_v1";

function asText(value) {
  return String(value || "").trim();
}

function readQueue() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(QUEUE_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function writeQueue(list) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(QUEUE_KEY, JSON.stringify(Array.isArray(list) ? list : []));
  } catch {
    // ignore
  }
}

function buildSharePayload() {
  const done = readDoneSlugs();
  const profile = readProfile();

  return {
    version: "mesh-share-v1",
    exportedAt: new Date().toISOString(),
    profile: {
      name: asText(profile?.name).slice(0, 80),
      beltId: asText(profile?.beltId).slice(0, 30),
    },
    progress: done.slice(0, 500),
  };
}

function mergeProgressFromPayload(payload) {
  const incoming = Array.isArray(payload?.progress)
    ? payload.progress.map((x) => asText(x)).filter(Boolean)
    : [];

  if (!incoming.length) return 0;

  const current = readDoneSlugs();
  const merged = Array.from(new Set([...current, ...incoming]));

  if (merged.length !== current.length) {
    writeDoneSlugs(merged);
  }

  return merged.length - current.length;
}

async function flushSyncQueue() {
  const currentQueue = readQueue();
  if (!currentQueue.length) return { sent: 0, remain: 0 };

  const remain = [];
  let sent = 0;

  for (const item of currentQueue) {
    try {
      const res = await callGateway({
        target: "aiIngest",
        method: "POST",
        payload: {
          modality: "progress",
          sessionId: asText(item?.sessionId),
          source: "offline-mesh",
          entries: Array.isArray(item?.entries) ? item.entries : [],
        },
      });

      if (!res.ok) {
        remain.push(item);
      } else {
        sent += 1;
      }
    } catch {
      remain.push(item);
    }
  }

  writeQueue(remain);
  return { sent, remain: remain.length };
}

export default function OfflineMeshPanel() {
  const [importToken, setImportToken] = useState("");
  const [status, setStatus] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [online, setOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);
  const [queueCount, setQueueCount] = useState(() => readQueue().length);

  const payload = useMemo(() => buildSharePayload(), []);
  const shareToken = useMemo(() => base64UrlEncodeJson(payload), [payload]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(SHARE_KEY, shareToken);
    }
  }, [shareToken]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  const queueSyncNow = async () => {
    setSyncing(true);
    setStatus("");

    const done = readDoneSlugs();
    const nextItem = {
      sessionId: `${Date.now()}`,
      entries: done.map((slug) => ({ slug, doneAt: new Date().toISOString() })),
    };

    const current = readQueue();
    writeQueue([...current, nextItem].slice(-20));

    const result = await flushSyncQueue();
    setQueueCount(result.remain);

    if (result.sent > 0) {
      setStatus(`Da dong bo ${result.sent} goi tien do.`);
    } else {
      setStatus("Dang xep hang offline, se tu dong dong bo khi co mang.");
    }

    setSyncing(false);
  };

  const onShare = async () => {
    if (!shareToken) return;

    const text = `vovinam-mesh://${shareToken}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Vovinam Offline Mesh",
          text,
        });
      } else {
        await navigator.clipboard.writeText(text);
      }
      setStatus("Da chia se goi bai tap offline.");
    } catch {
      setStatus("Khong the chia se luc nay.");
    }
  };

  const onImport = () => {
    const raw = asText(importToken).replace("vovinam-mesh://", "");
    const data = base64UrlDecodeJson(raw);

    if (!data || data.version !== "mesh-share-v1") {
      setStatus("Goi du lieu khong hop le.");
      return;
    }

    const mergedCount = mergeProgressFromPayload(data);
    setStatus(`Da nhap du lieu. Them ${mergedCount} bai moi vao tien do.`);
    setImportToken("");
  };

  useEffect(() => {
    if (!online) return;
    flushSyncQueue().then((res) => setQueueCount(res.remain)).catch(() => {
      // ignore
    });
  }, [online]);

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[var(--shadow-card)]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-white">Offline Mesh Network</h2>
        <span className="rounded-full border border-white/10 bg-slate-950/40 px-3 py-1 text-xs text-slate-200">
          {online ? "Online" : "Offline"}
        </span>
      </div>

      <p className="mt-2 text-sm text-slate-300">
        Tai truoc va chia se tien do tap qua QR / link gan. Khi co mang, he thong tu dong dong bo len gateway.
      </p>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
          <div className="text-sm font-semibold text-white">Chia se gan</div>
          <div className="mt-2 inline-flex rounded-2xl border border-white/10 bg-white p-3">
            <QRCode value={`vovinam-mesh://${shareToken || "empty"}`} size={132} />
          </div>
          <div className="mt-3">
            <button
              type="button"
              onClick={onShare}
              className="inline-flex h-10 items-center justify-center rounded-xl bg-gradient-to-r from-cyan-300 to-blue-500 px-4 text-xs font-semibold text-slate-950 transition hover:brightness-110"
            >
              Chia se goi offline
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
          <div className="text-sm font-semibold text-white">Nhap tu ban tap</div>
          <textarea
            value={importToken}
            onChange={(e) => setImportToken(e.target.value)}
            className="mt-2 h-24 w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-xs text-slate-100"
            placeholder="Dan chuoi vovinam-mesh://..."
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onImport}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 text-xs font-semibold text-white transition hover:bg-white/10"
            >
              Nhap du lieu
            </button>
            <button
              type="button"
              onClick={queueSyncNow}
              disabled={syncing}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-cyan-300/30 bg-cyan-300/10 px-4 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-300/20 disabled:opacity-60"
            >
              {syncing ? "Dang dong bo..." : "Dong bo tien do"}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-3 text-xs text-slate-300">
        Queue offline: {queueCount} goi cho dong bo lai.
      </div>
      {status ? <div className="mt-2 text-xs text-cyan-100">{status}</div> : null}
    </section>
  );
}
