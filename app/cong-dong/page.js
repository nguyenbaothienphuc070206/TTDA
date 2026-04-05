import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";

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

function asText(value) {
  return String(value || "").trim();
}

const MOCK_NAMES = [
  "Nguyen Van An",
  "Tran Minh Khoa",
  "Le Hoang Nam",
  "Pham Quoc Bao",
  "Vo Thi Mai",
  "Dang Thu Ha",
  "Bui Tuan Kiet",
  "Doan Ngoc Han",
  "Phan Gia Huy",
  "Hoang Minh Chau",
  "Truong Bao Nhi",
  "Ngo Quynh Anh",
  "Duong Thanh Dat",
  "Ly Kim Ngan",
  "Mai Thanh Tung",
];

function sanitizeSort(value) {
  const v = asText(value).toLowerCase();
  if (v === "belt") return "belt";
  return "name_asc";
}

function buildMockMembersByBelt(sortLocale) {
  const byBelt = createEmptyByBelt();
  let cursor = 0;

  for (const belt of BELTS) {
    const count = 6;
    const list = [];

    for (let i = 0; i < count; i += 1) {
      const name = MOCK_NAMES[cursor % MOCK_NAMES.length];
      cursor += 1;

      list.push({
        userId: `mock-${belt.id}-${i + 1}`,
        name,
        avatarUrl: "",
        createdAt: new Date(Date.now() - i * 86_400_000).toISOString(),
      });
    }

    byBelt[belt.id] = sortMembers(list, "name_asc", sortLocale);
  }

  return byBelt;
}

function hasAnyMember(byBelt) {
  return BELTS.some((belt) => {
    const list = byBelt?.[belt.id];
    return Array.isArray(list) && list.length > 0;
  });
}

async function loadBeltLeaderboard({ memberFallback, loadError, envError, sortLocale }) {
  const emptyByBelt = createEmptyByBelt();
  const empty = {
    ok: true,
    error: "",
    notice: "",
    byBelt: emptyByBelt,
  };

  try {
    const supabase = createSupabaseServiceClient();

    const [{ data: profiles, error: profilesErr }, { data: progress, error: progressErr }] =
      await Promise.all([
        supabase.from("profiles").select("user_id,display_name,avatar_url,created_at"),
        supabase.from("student_progress").select("user_id,belt_rank"),
      ]);

    if (profilesErr || progressErr) {
      return {
        ...empty,
        notice: loadError,
        byBelt: buildMockMembersByBelt(sortLocale),
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
        name: asText(p?.display_name) || memberFallback,
        avatarUrl: asText(p?.avatar_url),
        createdAt: asText(p?.created_at),
      });
    }

    for (const beltId of Object.keys(byBelt)) {
      byBelt[beltId].sort((a, b) => a.name.localeCompare(b.name, sortLocale));
    }

    if (!hasAnyMember(byBelt)) {
      return {
        ok: true,
        error: "",
        notice: envError,
        byBelt: buildMockMembersByBelt(sortLocale),
      };
    }

    return { ok: true, error: "", notice: "", byBelt };
  } catch {
    return {
      ...empty,
      notice: envError,
      byBelt: buildMockMembersByBelt(sortLocale),
    };
  }
}

function sortMembers(members, sort, sortLocale) {
  const list = Array.isArray(members) ? [...members] : [];
  const createdAtValue = (item) => {
    const ts = Date.parse(item?.createdAt || "");
    return Number.isFinite(ts) ? ts : 0;
  };

  if (sort === "name_desc") {
    list.sort((a, b) => b.name.localeCompare(a.name, sortLocale));
    return list;
  }

  if (sort === "belt") {
    list.sort((a, b) => a.name.localeCompare(b.name, sortLocale));
    return list;
  }

  if (sort === "newest") {
    list.sort((a, b) => createdAtValue(b) - createdAtValue(a));
    return list;
  }

  if (sort === "oldest") {
    list.sort((a, b) => createdAtValue(a) - createdAtValue(b));
    return list;
  }

  list.sort((a, b) => a.name.localeCompare(b.name, sortLocale));
  return list;
}

function filterAndSortByBelt(byBelt, queryText, sort, sortLocale) {
  const q = asText(queryText).toLocaleLowerCase(sortLocale);
  const next = {};

  for (const belt of BELTS) {
    const list = Array.isArray(byBelt?.[belt.id]) ? byBelt[belt.id] : [];
    const filtered = q
      ? list.filter((m) => asText(m?.name).toLocaleLowerCase(sortLocale).includes(q))
      : list;

    next[belt.id] = sortMembers(filtered, sort, sortLocale);
  }

  return next;
}

function MemberRow({ member, memberFallback, memberLabel, chatCta }) {
  const name = asText(member?.name) || memberFallback;
  const avatarUrl = asText(member?.avatarUrl);
  const userId = asText(member?.userId);

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
          <div className="text-xs text-slate-300">{memberLabel}</div>
        </div>
      </div>

      {userId ? (
        <Link
          href={`/cong-dong/chat?to=${encodeURIComponent(userId)}`}
          className="inline-flex h-9 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-400/30"
        >
          {chatCta}
        </Link>
      ) : null}
    </div>
  );
}

export default async function CommunityPage({ searchParams }) {
  const locale = await getLocale();
  const t = await getTranslations("community.list");
  const queryText = asText(searchParams?.q).slice(0, 80);
  const sort = sanitizeSort(searchParams?.sort);
  const selectedBeltId = asText(searchParams?.belt);

  const data = await loadBeltLeaderboard({
    memberFallback: t("memberFallback"),
    loadError: t("loadError"),
    envError: t("envError"),
    sortLocale: locale,
  });

  const byBelt = filterAndSortByBelt(data.byBelt, queryText, sort, locale);
  const totalMembers = BELTS.reduce((sum, belt) => {
    return sum + (Array.isArray(byBelt?.[belt.id]) ? byBelt[belt.id].length : 0);
  }, 0);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <header className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">{t("title")}</h1>
        <p className="mt-1 text-sm font-medium text-cyan-100">{t("subtitle")}</p>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">{t("description")}</p>
      </header>

      {data.notice ? (
        <div className="mb-4 rounded-3xl border border-amber-300/25 bg-amber-400/10 p-5 text-sm text-amber-100">
          <div>{data.notice}</div>
          <div className="mt-3">
            <Link
              href="/cong-dong"
              className="inline-flex h-9 items-center justify-center rounded-2xl border border-amber-100/30 bg-amber-200/15 px-3 text-xs font-semibold text-amber-50 transition hover:bg-amber-200/25"
            >
              {t("retry")}
            </Link>
          </div>
        </div>
      ) : null}

      <form className="mb-4 grid gap-3 rounded-3xl border border-white/10 bg-white/5 p-4 sm:grid-cols-[1fr_auto_auto] sm:items-end">
        <div>
          <label
            htmlFor="community-q"
            className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-300"
          >
            {t("searchLabel")}
          </label>
          <input
            id="community-q"
            name="q"
            defaultValue={queryText}
            placeholder={t("searchPlaceholder")}
            className="h-10 w-full rounded-2xl border border-white/10 bg-slate-950/40 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-300/30"
          />
        </div>

        <div>
          <label
            htmlFor="community-sort"
            className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-300"
          >
            {t("sortLabel")}
          </label>
          <select
            id="community-sort"
            name="sort"
            defaultValue={sort}
            className="h-10 rounded-2xl border border-white/10 bg-slate-950/40 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-300/30"
          >
            <option value="name_asc">{t("sortNameAsc")}</option>
            <option value="belt">{t("sortBelt")}</option>
          </select>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="inline-flex h-10 items-center justify-center rounded-2xl bg-linear-to-r from-cyan-300 to-blue-500 px-4 text-sm font-semibold text-slate-950 transition hover:brightness-110"
          >
            {t("applyFilters")}
          </button>

          <Link
            href="/cong-dong"
            className="inline-flex h-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            {t("clearFilters")}
          </Link>
        </div>
      </form>

      <div className="mb-4 text-sm text-slate-300">
        {t("resultSummary")}: <span className="font-semibold text-white">{totalMembers}</span>
      </div>

      <div className="grid gap-3">
        {BELTS.map((belt) => {
          const members = Array.isArray(byBelt?.[belt.id]) ? byBelt[belt.id] : [];
          const isSelected = selectedBeltId === belt.id;

          const params = new URLSearchParams();
          if (queryText) params.set("q", queryText);
          if (sort) params.set("sort", sort);
          params.set("belt", belt.id);

          const viewHref = `/cong-dong?${params.toString()}`;

          return (
            <div
              key={belt.id}
              className={
                "rounded-3xl border p-5 " +
                (isSelected ? "border-cyan-300/25 bg-cyan-300/8" : "border-white/10 bg-white/5")
              }
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-white">{belt.title}</div>
                  <div className="mt-1 text-xs text-slate-300">
                    {members.length} {t("peopleSuffix")}
                  </div>
                </div>

                <Link
                  href={viewHref}
                  className="inline-flex h-9 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  {t("viewAction")} →
                </Link>
              </div>

              {isSelected ? (
                <div className="mt-4 grid gap-2">
                  {members.length ? (
                    members.map((m) => (
                      <MemberRow
                        key={m.userId}
                        member={m}
                        memberFallback={t("memberFallback")}
                        memberLabel={t("memberLabel")}
                        chatCta={t("chatCta")}
                      />
                    ))
                  ) : (
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                      {t("emptyBelt")}
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

    </div>
  );
}
