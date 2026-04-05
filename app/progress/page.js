import ProgressSummary from "@/components/progress/ProgressSummary";
import SectionCard from "@/components/ui/SectionCard";
import { createSupabaseServerComponentClient } from "@/lib/supabase/serverComponentClient";

export const metadata = {
  title: "Progress",
};

export default async function ProgressPage() {
  const supabase = createSupabaseServerComponentClient();
  const { data, error } = await supabase
    .from("progress")
    .select("id, lesson_id, completed, updated_at")
    .order("updated_at", { ascending: false })
    .limit(100);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="stagger-fade grid gap-4">
        <SectionCard title="Progress Intelligence">
        {error ? (
          <p className="text-sm text-amber-200">Unable to load progress right now.</p>
        ) : (
          <ProgressSummary rows={data || []} />
        )}
        </SectionCard>
      </div>
    </div>
  );
}
