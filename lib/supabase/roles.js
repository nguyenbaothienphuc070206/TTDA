export const APP_ROLES = {
  USER: "user",
  COACH: "coach",
  ADMIN: "admin",
};

export function normalizeAppRole(value) {
  const v = String(value || "").toLowerCase();
  if (v === APP_ROLES.ADMIN) return APP_ROLES.ADMIN;
  if (v === APP_ROLES.COACH) return APP_ROLES.COACH;
  return APP_ROLES.USER;
}

export async function getAppRoleForUserId(supabase, userId) {
  if (!supabase || !userId) return APP_ROLES.USER;

  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    // If table/policies are not configured yet, default to least-privileged.
    return APP_ROLES.USER;
  }

  return normalizeAppRole(data?.role);
}
