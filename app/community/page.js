import PostFeed from "@/components/community/PostFeed";
import SectionCard from "@/components/ui/SectionCard";
import { createSupabaseServerComponentClient } from "@/lib/supabase/serverComponentClient";

export const metadata = {
  title: "Community",
};

export default async function CommunityPage() {
  const supabase = createSupabaseServerComponentClient();
  const { data, error } = await supabase
    .from("posts")
    .select("id, content, created_at")
    .order("created_at", { ascending: false })
    .limit(30);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <SectionCard title="Community Pulse">
        {error ? (
          <p className="text-sm text-amber-200">Unable to load posts right now.</p>
        ) : (
          <PostFeed posts={data || []} />
        )}
      </SectionCard>
    </div>
  );
}
