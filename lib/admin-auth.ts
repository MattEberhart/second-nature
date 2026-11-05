import "server-only";
import { getAuthSupabase } from "@/lib/supabase/auth";

export function getAdminEmails() {
  const configured = process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || process.env.LYDIA_EMAIL || "";
  return configured
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined) {
  return Boolean(email && getAdminEmails().includes(email.toLowerCase()));
}

export function getCalendarOwnerEmail() {
  return (process.env.CALENDAR_OWNER_EMAIL || process.env.LYDIA_EMAIL || process.env.ADMIN_EMAIL || "")
    .trim()
    .toLowerCase();
}

export function isCalendarOwnerEmail(email: string | null | undefined) {
  const owner = getCalendarOwnerEmail();
  return Boolean(owner && email && email.toLowerCase() === owner);
}

export async function getAdminUser() {
  try {
    const supabase = await getAuthSupabase();
    const { data } = await supabase.auth.getUser();
    if (!isAdminEmail(data.user?.email)) return null;
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
