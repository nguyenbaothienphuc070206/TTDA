#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";

import { LESSONS } from "../data/lessons.js";
import { TECHNIQUES } from "../data/wiki.js";
import { VIDEOS } from "../data/videos.js";

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
    skipIngest: false,
  };

  for (let i = 0; i < args.length; i += 1) {
    const a = args[i];
    const next = () => (i + 1 < args.length ? args[i + 1] : "");

    if (a === "--from") {
      out.from = String(next() || "project");
      i += 1;
      continue;
    }

    if (a === "--dir") {
      out.dir = String(next() || "");
      i += 1;
      continue;
    }

    if (a === "--source") {
      out.source = String(next() || "manual");
      i += 1;
      continue;
    }

    if (a === "--belt") {
      out.belt = String(next() || "");
      i += 1;
      continue;
    }

    if (a === "--limit") {
      out.limit = Number(next() || 0);
      i += 1;
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

    if (a === "--skip-ingest") {
      out.skipIngest = true;
      continue;
    }
  }

  return out;
}

function buildAssistantAnswer({ title, summary, steps, mistakes, safety }) {
  return [
    "## Ly thuyet",
    summary || `Ky thuat ${title} can on dinh truc va nhip tho deu.`,
    "",
    "## Cac buoc thuc hien",
    ...(steps?.length ? steps.map((s, idx) => `${idx + 1}. ${s}`) : ["1. Khoi dong va vao tu the thu an toan.", "2. Tien hanh dong tac cham de dung bien do.", "3. Thu ve guard va reset nhip tho."]),
    "",
    "## Loi thuong gap",
    ...(mistakes?.length ? mistakes.map((m) => `- ${m}`) : ["- Mat truc co the", "- Qua nhanh khi chua kiem soat" ]),
    "",
    "## Luu y an toan",
    ...(safety?.length ? safety.map((s) => `- ${s}`) : ["- Dung lai neu dau nhon/choang.", "- Tap cham truoc khi tang toc."]),
    "",
    "Ban muon minh goi y 1 bai sua loi 15 phut cho ky thuat nay khong?",
  ].join("\n");
}

function buildTrainPairs() {
  const rows = [];

  for (const t of TECHNIQUES) {
    rows.push({
      messages: [
        {
          role: "system",
          content:
            "Ban la AI Coach Vovinam. Tra loi ngan, ro, uu tien an toan va dung giao trinh.",
        },
        {
          role: "user",
          content: `Huong dan ky thuat ${t.title}. Cho ly thuyet, cac buoc, loi thuong gap va luu y an toan.`,
        },
        {
          role: "assistant",
          content: buildAssistantAnswer({
            title: t.title,
            summary: t.summary,
            steps: t.steps,
            mistakes: t.mistakes,
            safety: t.safety,
          }),
        },
      ],
    });
  }

  for (const lesson of LESSONS.slice(0, 80)) {
    rows.push({
      messages: [
        {
          role: "system",
          content:
            "Ban la AI Coach Vovinam. Goi y lo trinh ngan gon theo cap dai va an toan.",
        },
        {
          role: "user",
          content: `Toi dang hoc bai ${lesson.title}. Hay goi y cach tap hieu qua trong 20 phut.`,
        },
        {
          role: "assistant",
          content: [
            "## Ke hoach 20 phut",
            `- Muc tieu: ${lesson.summary || "On dinh ky thuat co ban"}`,
            "- 5 phut khoi dong: co chan, goi, hong, vai.",
            ...(Array.isArray(lesson.steps) ? lesson.steps.slice(0, 3).map((s, idx) => `- Block ${idx + 1}: ${s}`) : ["- Block 1: Luyen dong tac cham, dung bien do.", "- Block 2: Lap lai 3 hiep, moi hiep 60s."]),
            "- 2 phut tong ket: danh dau tien do va ghi 1 loi can sua.",
            "",
            "## Luu y an toan",
            "- Dung lai neu dau nhon/choang.",
            "- Uu tien dung form truoc khi tang toc.",
          ].join("\n"),
        },
      ],
    });
  }

  for (const video of VIDEOS.slice(0, 60)) {
    rows.push({
      messages: [
        {
          role: "system",
          content: "Ban la AI Coach Vovinam. Tom tat video thanh huong dan de tap lai.",
        },
        {
          role: "user",
          content: `Tom tat video ${video.title} va cho toi checklist tu tap.`,
        },
        {
          role: "assistant",
          content: [
            "## Tom tat",
            video.description || "Video tap trung vao nen tang ky thuat va nhip tap on dinh.",
            "",
            "## Checklist tu tap",
            "- Xem 1 lan toan bo de nam nhip.",
            "- Chia thanh 3 doan ngan de tap lai.",
            "- Quay clip 10-20s de tu doi chieu form.",
            "- Danh dau hoan thanh sau moi block.",
          ].join("\n"),
        },
      ],
    });
  }

  return rows;
}

async function writeFineTuneDataset() {
  const rows = buildTrainPairs();
  const outDir = path.resolve("training");
  const outFile = path.join(outDir, "ai-coach-finetune.jsonl");

  await fs.mkdir(outDir, { recursive: true });
  const content = rows.map((x) => JSON.stringify(x)).join("\n") + "\n";
  await fs.writeFile(outFile, content, "utf8");

  return { outFile, count: rows.length };
}

function runIngest(opts) {
  const args = ["scripts/ingest-ai-kb.mjs"];

  args.push("--from", opts.from || "project");
  if (opts.dir) args.push("--dir", opts.dir);
  if (opts.source) args.push("--source", opts.source);
  if (opts.belt) args.push("--belt", opts.belt);
  if (opts.limit > 0) args.push("--limit", String(opts.limit));
  if (opts.reset) args.push("--reset");
  if (opts.yes) args.push("--yes");

  const run = spawnSync(process.execPath, args, { stdio: "inherit" });
  return run.status === 0;
}

async function main() {
  const opts = parseArgs(process.argv);

  console.log("\nAI Coach training pipeline\n");

  if (!opts.skipIngest) {
    console.log("Step 1/2: Ingest KB into vector store...");
    const ok = runIngest(opts);
    if (!ok) {
      console.error("Ingest failed. Re-run after checking OPENAI/SUPABASE env.");
      process.exit(1);
    }
  } else {
    console.log("Step 1/2: Skip ingest (--skip-ingest)");
  }

  console.log("Step 2/2: Generate fine-tune dataset...");
  const out = await writeFineTuneDataset();
  console.log(`Done. Dataset: ${out.outFile}`);
  console.log(`Rows: ${out.count}`);
}

main().catch((e) => {
  console.error(e?.message || e);
  process.exit(1);
});
