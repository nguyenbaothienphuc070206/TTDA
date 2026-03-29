import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import CommunityChat from "@/components/CommunityChat";
import CommunityInbox from "@/components/CommunityInbox";
import { createSupabaseServerComponentClient } from "@/lib/supabase/serverComponentClient";
import { createSupabaseServiceClient } from "@/lib/supabase/serviceClient";

export const metadata = {
  title: "Chat",
};

export const dynamic = "force-dynamic";

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
  const t = await getTranslations("community.chatPage");
  const supabase = createSupabaseServerComponentClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/ho-so?reason=community_chat_login_required");
  }

  const toUserId = String(searchParams?.to || "").trim();
  const toName = await getDisplayName(toUserId);

  if (!toUserId) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10">
        <div className="mb-4">
          <Link
            href="/cong-dong"
            className="text-sm font-semibold text-cyan-200 transition hover:text-white"
          >
            {t("backArrow")}
          </Link>
        </div>

        <CommunityInbox />
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
          {t("backArrow")}
        </Link>
      </div>

      <CommunityChat key={toUserId} toUserId={toUserId} toName={toName} />
    </div>
  );
}
