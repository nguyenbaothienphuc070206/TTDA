"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/browserClient";

export default function ChatRealtime({ beltGroup = "all" }) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const loadMessages = useCallback(async () => {
    const res = await fetch(`/api/community?belt_group=${encodeURIComponent(beltGroup)}`, {
      cache: "no-store",
    });
    const json = await res.json();
    if (!res.ok || !json?.ok) return;
    setMessages(Array.isArray(json?.data?.messages) ? json.data.messages : []);
  }, [beltGroup]);

  useEffect(() => {
    loadMessages();

    const channel = supabase
      .channel(`chat:${beltGroup}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const row = payload?.new;
          if (!row) return;
          if (beltGroup !== "all" && String(row.belt_group || "") !== beltGroup) return;
          setMessages((prev) => [...prev, row]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [beltGroup, loadMessages, supabase]);

  const send = async () => {
    const content = String(text || "").trim();
    if (!content) return;

    setSending(true);
    try {
      await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, belt_group: beltGroup }),
      });
      setText("");
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-4">
      <h2 className="text-sm font-semibold text-white">Realtime Chat ({beltGroup})</h2>

      <div className="mt-3 max-h-80 space-y-2 overflow-auto rounded-2xl border border-white/10 bg-slate-950/30 p-3">
        {messages.map((m) => (
          <article key={m.id} className="rounded-xl border border-white/10 bg-white/5 p-2 text-sm text-slate-200">
            <p>{m.content}</p>
          </article>
        ))}

        {!messages.length ? <p className="text-sm text-slate-400">No messages yet.</p> : null}
      </div>

      <div className="mt-3 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message"
          className="h-10 flex-1 rounded-xl border border-white/10 bg-slate-950/30 px-3 text-sm text-white outline-none"
        />
        <button
          type="button"
          onClick={send}
          disabled={sending}
          className="h-10 rounded-xl border border-cyan-300/30 bg-cyan-300/10 px-4 text-xs font-semibold text-cyan-100"
        >
          {sending ? "Sending..." : "Send"}
        </button>
      </div>
    </section>
  );
}
