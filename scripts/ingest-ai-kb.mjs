#!/usr/bin/env node
/*
  Ingest knowledge into Supabase Vector for AI Coach.

  Usage (run from vovinam-app/):
    node scripts/ingest-ai-kb.mjs --from project
    node scripts/ingest-ai-kb.mjs --dir ./knowledge --source manual --belt lam-dai

  Optional:
    node scripts/ingest-ai-kb.mjs --from project --limit 10
    node scripts/ingest-ai-kb.mjs --reset --yes

  Env (can be in .env.local):
    NEXT_PUBLIC_SUPABASE_URL=
    SUPABASE_SECRET_KEY= (or SUPABASE_SERVICE_ROLE_KEY)
    OPENAI_API_KEY=
    OPENAI_EMBED_MODEL=text-embedding-3-small
*/

import fs from "node:fs/promises";
import path from "node:path";

import { createClient } from "@supabase/supabase-js";

import { createEmbedding, getOpenAiModels, hasOpenAi } from "../lib/ai/openai.js";

function parseArgs(argv) {
  const args = argv.slice(2);
  const out = {
    from: "project",
    dir: "",
    source: "manual",
    belt: "",
    limit: 0,
    reset: false,
    yes: false,
    dryRun: false,
  };

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    const next = () => (i + 1 < args.length ? args[i + 1] : "");

    if (a === "--from") {
      out.from = String(next() || "project");
      i++;
      continue;
    }

    if (a === "--dir") {
      out.dir = String(next() || "");
      i++;
      continue;
    }

    if (a === "--source") {
      out.source = String(next() || "manual");
      i++;
      continue;
    }

    if (a === "--belt") {
      out.belt = String(next() || "");
      i++;
      continue;
    }

    if (a === "--limit") {
      out.limit = Number(next() || 0) || 0;
      i++;
      continue;
    }

    if (a === "--reset") {
      out.reset = true;
      continue;
    }

    if (a === "--yes") {
      out.yes = true;
      continue;
    }

    if (a === "--dry-run") {
      out.dryRun = true;
      continue;
    }

    if (a === "--help" || a === "-h") {
      out.help = true;
      continue;
    }
  }

  return out;
}

function printHelp() {
  console.log(`\nAI KB ingestion\n\nExamples:\n  node scripts/ingest-ai-kb.mjs --from project\n  node scripts/ingest-ai-kb.mjs --dir ./knowledge --source manual --belt lam-dai\n\nOptions:\n  --from project        Ingest from in-repo TECHNIQUES + VIDEOS (default)\n  --dir <path>          Ingest from a directory of .md/.txt files\n  --source <name>       Source tag stored in DB (default: manual)\n  --belt <beltId>       Optional beltId to attach to all chunks (dir mode)\n  --limit <n>           Limit number of items processed (for quick tests)\n  --reset --yes         Delete all existing chunks before ingest\n  --dry-run             Do not write to Supabase; just print what would be ingested\n`);
}

async function loadEnvFile(file) {
  try {
    const raw = await fs.readFile(file, "utf-8");
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx <= 0) continue;
      const key = trimmed.slice(0, idx).trim();
      let value = trimmed.slice(idx + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // ignore
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function normalizeWhitespace(text) {
  return String(text || "")
    .replace(/\r\n/g, "\n")
    .replace(/\t/g, " ")
    .replace(/[ \u00A0]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function extractTitleFromMarkdown(text, fallback) {
  const lines = String(text || "").split(/\r?\n/);
  for (const l of lines) {
    const m = l.match(/^\s*#\s+(.+)$/);
    if (m && m[1]) return m[1].trim();
  }
  return fallback;
}

function chunkText(text, { maxChars = 1100, overlapChars = 150 } = {}) {
  const cleaned = normalizeWhitespace(text);
  if (!cleaned) return [];

  const paras = cleaned
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  const chunks = [];
  let current = "";

  for (const p of paras) {
    if (!current) {
      current = p;
      continue;
    }

    if (current.length + 2 + p.length <= maxChars) {
      current += "\n\n" + p;
      continue;
    }

    chunks.push(current.trim());
    const overlap = current.slice(-overlapChars);
    current = `${overlap}\n\n${p}`.trim();

    if (current.length > maxChars * 2) {
      // Very long paragraph; fall back to a hard split.
      while (current.length > maxChars) {
        chunks.push(current.slice(0, maxChars).trim());
        current = current.slice(maxChars - overlapChars).trim();
      }
    }
  }

  if (current.trim()) chunks.push(current.trim());
  return chunks.filter(Boolean);
}

function beltFromDifficulty(difficulty) {
  if (difficulty === "easy") return "lam-dai";
  if (difficulty === "medium") return "hoang-dai";
  if (difficulty === "hard") return "huyen-dai";
  return null;
}

function getSupabaseClient() {
  const url = String(process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
  const key = String(process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();

  if (!url) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  if (!key) throw new Error("Missing SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY)");

  return createClient(url, key, {
    auth: { persistSession: false },
    global: { headers: { "X-Client-Info": "ai-kb-ingest" } },
  });
}

async function listFilesRecursive(dir) {
  const out = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      out.push(...(await listFilesRecursive(full)));
      continue;
    }

    if (!e.isFile()) continue;
    if (!/\.(md|txt)$/i.test(e.name)) continue;
    out.push(full);
  }

  return out;
}

async function ingestRows({ supabase, rows, dryRun }) {
  if (!rows.length) return { inserted: 0 };

  if (dryRun) {
    console.log(`\n[DRY RUN] Would insert ${rows.length} chunks into ai_knowledge_chunks`);
    console.log(rows.slice(0, 2).map((r) => ({ source: r.source, source_id: r.source_id, title: r.title, belt_id: r.belt_id, chars: r.content.length })));
    return { inserted: 0 };
  }

  const BATCH = 25;
  let inserted = 0;

  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const { error } = await supabase.from("ai_knowledge_chunks").insert(batch);
    if (error) {
      throw new Error(`Insert failed: ${error.message}`);
    }
    inserted += batch.length;
    process.stdout.write(`\rInserted ${inserted}/${rows.length}...`);
    // gentle pacing for both DB + OpenAI
    await sleep(150);
  }

  process.stdout.write("\n");
  return { inserted };
}

async function buildProjectDocs({ limit }) {
  const { TECHNIQUES, TECHNIQUE_CATEGORIES } = await import("../data/wiki.js");
  const { VIDEOS } = await import("../data/videos.js");

  const categoryById = new Map((TECHNIQUE_CATEGORIES || []).map((c) => [c.id, c]));

  const items = [];

  for (const t of TECHNIQUES || []) {
    const cat = categoryById.get(t.categoryId);
    items.push({
      source: "technique",
      source_id: String(t.slug),
      title: String(t.title),
      url: `/ky-thuat#${t.slug}`,
      belt_id: beltFromDifficulty(t.difficulty),
      content: [
        `KỸ THUẬT: ${t.title}`,
        cat?.title ? `Nhóm: ${cat.title}` : "",
        t.summary ? `Tóm tắt: ${t.summary}` : "",
        Array.isArray(t.steps) && t.steps.length ? `Các bước:\n- ${t.steps.join("\n- ")}` : "",
        Array.isArray(t.mistakes) && t.mistakes.length ? `Lỗi thường gặp:\n- ${t.mistakes.join("\n- ")}` : "",
        Array.isArray(t.safety) && t.safety.length ? `An toàn:\n- ${t.safety.join("\n- ")}` : "",
        Array.isArray(t.tags) && t.tags.length ? `Tags: ${t.tags.join(", ")}` : "",
      ].filter(Boolean).join("\n\n"),
      metadata: {
        kind: "project",
        categoryId: t.categoryId,
        difficulty: t.difficulty,
        tags: t.tags || [],
      },
    });
  }

  for (const v of VIDEOS || []) {
    items.push({
      source: "video",
      source_id: String(v.id),
      title: String(v.title),
      url: `/video/${v.id}`,
      belt_id: v.beltId || null,
      content: [
        `VIDEO: ${v.title}`,
        v.summary ? `Tóm tắt: ${v.summary}` : "",
        Array.isArray(v.transcript) && v.transcript.length ? `Transcript:\n- ${v.transcript.join("\n- ")}` : "",
        Array.isArray(v.tags) && v.tags.length ? `Tags: ${v.tags.join(", ")}` : "",
      ].filter(Boolean).join("\n\n"),
      metadata: {
        kind: "project",
        minutes: v.minutes || null,
        tags: v.tags || [],
      },
    });
  }

  return typeof limit === "number" && limit > 0 ? items.slice(0, limit) : items;
}

async function buildDirDocs({ dir, source, belt, limit }) {
  const abs = path.isAbsolute(dir) ? dir : path.join(process.cwd(), dir);
  const files = await listFilesRecursive(abs);
  const picked = typeof limit === "number" && limit > 0 ? files.slice(0, limit) : files;

  const items = [];
  for (const file of picked) {
    const raw = await fs.readFile(file, "utf-8");
    const rel = path.relative(process.cwd(), file).replace(/\\/g, "/");
    const fallbackTitle = path.basename(file);
    const title = extractTitleFromMarkdown(raw, fallbackTitle);

    items.push({
      source: source || "manual",
      source_id: rel,
      title,
      url: "",
      belt_id: belt || null,
      content: raw,
      metadata: {
        kind: "file",
        path: rel,
      },
    });
  }

  return items;
}

async function main() {
  const opts = parseArgs(process.argv);
  if (opts.help) {
    printHelp();
    process.exit(0);
  }

  // Load local env for convenience.
  await loadEnvFile(path.join(process.cwd(), ".env.local"));
  await loadEnvFile(path.join(process.cwd(), ".env"));

  if (!hasOpenAi()) {
    throw new Error("Missing OPENAI_API_KEY (required for embeddings)");
  }

  const { embed } = getOpenAiModels();
  console.log(`Using OpenAI embedding model: ${embed}`);

  const supabase = getSupabaseClient();

  if (opts.reset) {
    if (!opts.yes) {
      throw new Error("Refusing to --reset without --yes");
    }

    if (!opts.dryRun) {
      console.log("Deleting existing ai_knowledge_chunks...");
      const { error } = await supabase
        .from("ai_knowledge_chunks")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000");

      if (error) throw new Error(`Reset failed: ${error.message}`);
    } else {
      console.log("[DRY RUN] Would delete all ai_knowledge_chunks rows");
    }
  }

  let docs = [];
  if (opts.dir) {
    docs = await buildDirDocs({ dir: opts.dir, source: opts.source, belt: opts.belt, limit: opts.limit });
  } else {
    docs = await buildProjectDocs({ limit: opts.limit });
  }

  console.log(`Prepared ${docs.length} documents to chunk.`);

  const rows = [];
  for (const doc of docs) {
    const chunks = chunkText(doc.content);

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const embedding = await createEmbedding({ text: chunk });

      rows.push({
        source: doc.source,
        source_id: doc.source_id,
        title: doc.title,
        url: doc.url,
        content: chunk,
        metadata: {
          ...(doc.metadata || {}),
          chunkIndex: i,
          chunksTotal: chunks.length,
        },
        belt_id: doc.belt_id || null,
        embedding,
      });

      if (rows.length % 25 === 0) {
        process.stdout.write(`\rEmbedded ${rows.length} chunks...`);
      }

      // Gentle pacing for OpenAI.
      await sleep(120);
    }
  }

  process.stdout.write("\n");
  console.log(`Generated ${rows.length} chunks.`);

  const result = await ingestRows({ supabase, rows, dryRun: opts.dryRun });
  console.log(`Done. Inserted: ${result.inserted}`);
}

main().catch((e) => {
  console.error("\nERROR:", e?.message || e);
  process.exit(1);
});
