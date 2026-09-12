import "server-only";
import { getAuthSupabase } from "@/lib/supabase/auth";

export async function getAdminUser() {
  try {
    const supabase = await getAuthSupabase();
    const { data } = await supabase.auth.getUser();
    const allowed = (process.env.ADMIN_EMAIL || process.env.LYDIA_EMAIL || "").toLowerCase();
    if (!data.user?.email || data.user.email.toLowerCase() !== allowed) return null;
    return data.user;
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const user = await getAdminUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}
