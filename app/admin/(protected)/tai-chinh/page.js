import FinanceDashboard from "@/components/admin/FinanceDashboard";
import { createSupabaseServerComponentClient } from "@/lib/supabase/serverComponentClient";
import { APP_ROLES, getAppRoleForUserId } from "@/lib/supabase/roles";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Tài chính",
};

export default async function FinancePage() {
  const supabase = createSupabaseServerComponentClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login?reason=unauthorized");
  }

  const role = await getAppRoleForUserId(supabase, user.id);
  if (role !== APP_ROLES.ADMIN) {
    redirect("/admin/login?reason=admin_only");
  }

  return <FinanceDashboard />;
}
