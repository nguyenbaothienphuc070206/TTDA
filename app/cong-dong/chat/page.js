import Link from "next/link";
import { getLocale } from "next-intl/server";

import CommunityChat from "@/components/CommunityChat";
import { createSupabaseServiceClient } from "@/lib/supabase/serviceClient";

export const metadata = {
  title: "Chat",
};

export const dynamic = "force-dynamic";

function getCopy(locale) {
  const id = String(locale || "vi").toLowerCase();

  if (id === "en") {
    return {
      title: "Chat",
      missingReceiver: "Missing recipient. Go back to Community and choose a profile.",
      backToCommunity: "Back to Community",
      backArrow: "← Back to Community",
    };
  }

  if (id === "ja") {
    return {
      title: "チャット",
      missingReceiver: "受信者が指定されていません。Community に戻ってプロフィールを選んでください。",
      backToCommunity: "Community に戻る",
      backArrow: "← Community に戻る",
    };
  }

  return {
    title: "Chat",
    missingReceiver: "Thiếu người nhận. Quay lại Community để chọn một profile.",
    backToCommunity: "Về Community",
    backArrow: "← Quay lại Community",
  };
}

async function getDisplayName(userId) {
  const id = String(userId || "").trim();
  if (!id) return "";

  try {
    const supabase = createSupabaseServiceClient();
    const { data } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("user_id", id)
      .maybeSingle();

    return String(data?.display_name || "").trim();
  } catch {
    return "";
  }
}

export default async function CommunityChatPage({ searchParams }) {
  const locale = await getLocale();
  const copy = getCopy(locale);
  const toUserId = String(searchParams?.to || "").trim();
  const toName = await getDisplayName(toUserId);

  if (!toUserId) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h1 className="text-xl font-semibold text-white">{copy.title}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            {copy.missingReceiver}
          </p>
          <div className="mt-4">
            <Link
              href="/cong-dong"
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-300 to-blue-500 px-5 text-sm font-semibold text-slate-950 transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-cyan-300/50"
            >
              {copy.backToCommunity}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <div className="mb-4">
        <Link
          href="/cong-dong"
          className="text-sm font-semibold text-cyan-200 transition hover:text-white"
        >
          {copy.backArrow}
        </Link>
      </div>

      <CommunityChat key={toUserId} toUserId={toUserId} toName={toName} />
    </div>
  );
}
