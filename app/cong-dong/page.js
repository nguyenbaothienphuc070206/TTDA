import Link from "next/link";
import { getLocale } from "next-intl/server";

import { BELTS } from "@/data/belts";
import { normalizeBeltId } from "@/lib/ai/belts";
import { createSupabaseServiceClient } from "@/lib/supabase/serviceClient";

export const metadata = {
  title: "Community",
};

export const dynamic = "force-dynamic";

function initialFromName(name) {
  const safe = String(name || "").trim();
  if (!safe) return "V";
  return safe.slice(0, 1).toUpperCase();
}

function createEmptyByBelt() {
  return Object.fromEntries(BELTS.map((b) => [b.id, []]));
}

function getCopy(locale) {
  const id = String(locale || "vi").toLowerCase();

  if (id === "en") {
    return {
      title: "Community",
      description: "Leaderboard by belt level. Expand each belt to see member profiles and start a chat.",
      loadError: "Unable to load leaderboard data (Supabase query failed).",
      envError:
        "Supabase service key is missing (SUPABASE_SECRET_KEY), so belt-level member counts are unavailable.",
      memberFallback: "Student",
      memberLabel: "Member",
      peopleSuffix: "members",
      emptyBelt: "No members in this belt group yet.",
      chatCta: "Chat",
      sortLocale: "en",
    };
  }

  if (id === "ja") {
    return {
      title: "コミュニティ",
      description: "帯ごとのランキングです。帯を開いてプロフィールを確認し、チャットできます。",
      loadError: "ランキングデータを読み込めませんでした（Supabase クエリエラー）。",
      envError:
        "Supabase service key（SUPABASE_SECRET_KEY）が未設定のため、帯別メンバー数を表示できません。",
      memberFallback: "門下生",
      memberLabel: "メンバー",
      peopleSuffix: "人",
      emptyBelt: "この帯グループにはまだメンバーがいません。",
      chatCta: "チャット",
      sortLocale: "ja",
    };
  }

  return {
    title: "Community",
    description: "Bảng xếp hạng theo từng đai. Bấm vào mỗi đai để xem danh sách profile, rồi chat.",
    loadError: "Không tải được dữ liệu bảng xếp hạng (Supabase query lỗi).",
    envError:
      "Chưa cấu hình Supabase service key (SUPABASE_SECRET_KEY) nên chưa xem được số lượng học viên theo đai.",
    memberFallback: "Học viên",
    memberLabel: "Học viên",
    peopleSuffix: "người",
    emptyBelt: "Chưa có học viên trong nhóm này.",
    chatCta: "Chat",
    sortLocale: "vi",
  };
}

async function loadBeltLeaderboard(copy) {
  const emptyByBelt = createEmptyByBelt();

  const empty = {
    ok: false,
    error: "",
    byBelt: emptyByBelt,
  };

  try {
    const supabase = createSupabaseServiceClient();

    const [{ data: profiles, error: profilesErr }, { data: progress, error: progressErr }] =
      await Promise.all([
        supabase.from("profiles").select("user_id,display_name,avatar_url"),
        supabase.from("student_progress").select("user_id,belt_rank"),
      ]);

    if (profilesErr || progressErr) {
      return {
        ...empty,
        error: copy.loadError,
      };
    }

    const profileList = Array.isArray(profiles) ? profiles : [];
    const progressList = Array.isArray(progress) ? progress : [];

    const profilesById = new Map(
      profileList
        .filter((p) => p && typeof p.user_id === "string")
        .map((p) => [p.user_id, p])
    );

    const byBelt = createEmptyByBelt();

    for (const row of progressList) {
      const userId = typeof row?.user_id === "string" ? row.user_id : "";
      if (!userId) continue;

      const beltId = normalizeBeltId(row?.belt_rank);
      const p = profilesById.get(userId);

      byBelt[beltId].push({
        userId,
        name: String(p?.display_name || copy.memberFallback).trim() || copy.memberFallback,
        avatarUrl: String(p?.avatar_url || "").trim(),
      });
    }

    for (const beltId of Object.keys(byBelt)) {
      byBelt[beltId].sort((a, b) => a.name.localeCompare(b.name, copy.sortLocale));
    }

    return { ok: true, error: "", byBelt };
  } catch {
    return {
      ...empty,
      error: copy.envError,
    };
  }
}

function MemberRow({ member, copy }) {
  const name = String(member?.name || copy.memberFallback).trim() || copy.memberFallback;
  const avatarUrl = String(member?.avatarUrl || "").trim();
  const userId = String(member?.userId || "").trim();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
      <div className="flex min-w-0 items-center gap-3">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt=""
            className="h-10 w-10 rounded-2xl border border-white/10 object-cover"
          />
        ) : (
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/30 text-sm font-extrabold text-cyan-200">
            {initialFromName(name)}
          </div>
        )}

        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-white">{name}</div>
          <div className="text-xs text-slate-300">{copy.memberLabel}</div>
        </div>
      </div>

      {userId ? (
        <Link
          href={`/cong-dong/chat?to=${encodeURIComponent(userId)}`}
          className="inline-flex h-9 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-400/30"
        >
          {copy.chatCta}
        </Link>
      ) : null}
    </div>
  );
}

export default async function CommunityPage() {
  const locale = await getLocale();
  const copy = getCopy(locale);
  const data = await loadBeltLeaderboard(copy);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <header className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">{copy.title}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
          {copy.description}
        </p>
      </header>

      {data.ok ? null : (
        <div className="mb-4 rounded-3xl border border-amber-300/25 bg-amber-400/10 p-5 text-sm text-amber-100">
          {data.error}
        </div>
      )}

      <div className="grid gap-3">
        {BELTS.map((belt) => {
          const members = Array.isArray(data.byBelt?.[belt.id]) ? data.byBelt[belt.id] : [];

          return (
            <details
              key={belt.id}
              className="group rounded-3xl border border-white/10 bg-white/5 p-5 open:bg-white/10"
            >
              <summary className="cursor-pointer list-none outline-none">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-white">{belt.title}</div>
                    <div className="mt-1 text-xs text-slate-300">{members.length} {copy.peopleSuffix}</div>
                  </div>

                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-200 transition group-open:rotate-45">
                    +
                  </span>
                </div>
              </summary>

              <div className="mt-4 grid gap-2">
                {members.length ? (
                  members.map((m) => <MemberRow key={m.userId} member={m} copy={copy} />)
                ) : (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                    {copy.emptyBelt}
                  </div>
                )}
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
