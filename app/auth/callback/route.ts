import { NextResponse } from "next/server";
import { getAuthSupabase } from "@/lib/supabase/auth";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { encryptSecret } from "@/lib/security";
import { isAdminEmail, isCalendarOwnerEmail } from "@/lib/admin-auth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = process.env.NEXT_PUBLIC_SITE_URL || url.origin;
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next")?.startsWith("/") ? url.searchParams.get("next")! : "/admin";
  const connectingCalendar = url.searchParams.get("calendar") === "connect";
  if (!code) return NextResponse.redirect(`${origin}/admin?error=Missing+authorization+code`);

  try {
    const supabase = await getAuthSupabase();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error || !data.user.email) throw error || new Error("Google did not return an email address.");
    if (!isAdminEmail(data.user.email)) {
      await supabase.auth.signOut();
      return NextResponse.redirect(`${origin}/admin?error=This+Google+account+is+not+authorized`);
    }

    if (connectingCalendar) {
      if (!isCalendarOwnerEmail(data.user.email)) {
        await supabase.auth.signOut();
        return NextResponse.redirect(`${origin}/admin?error=Only+the+calendar+owner+can+connect+Google+Calendar`);
      }
      if (!data.session.provider_refresh_token) {
        throw new Error("Google did not return the offline Calendar permission. Please try connecting again.");
      }
      const { error: saveError } = await getAdminSupabase().from("oauth_connections").upsert({
        provider: "google",
        account_email: data.user.email,
        encrypted_refresh_token: encryptSecret(data.session.provider_refresh_token),
        scopes: "calendar.events calendar.freebusy calendar.calendarlist.readonly",
        updated_at: new Date().toISOString(),
      });
      if (saveError) throw saveError;
    }
    return NextResponse.redirect(`${origin}${next}`);
  } catch (error) {
    const message = encodeURIComponent(error instanceof Error ? error.message : "Authorization failed.");
    return NextResponse.redirect(`${origin}/admin?error=${message}`);
  }
}
