import { NextResponse } from "next/server";
import { getAdminUser, isCalendarOwnerEmail } from "@/lib/admin-auth";
import { getAuthSupabase } from "@/lib/supabase/auth";

export async function GET(request: Request) {
  const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;

  try {
    const user = await getAdminUser();
    if (!user?.email || !isCalendarOwnerEmail(user.email)) {
      return NextResponse.redirect(`${origin}/admin?error=Only+the+calendar+owner+can+connect+Google+Calendar`);
    }

    const supabase = await getAuthSupabase();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback?next=/admin&calendar=connect`,
        scopes: [
          "openid",
          "email",
          "https://www.googleapis.com/auth/calendar.events",
          "https://www.googleapis.com/auth/calendar.freebusy",
          "https://www.googleapis.com/auth/calendar.calendarlist.readonly",
        ].join(" "),
        queryParams: { access_type: "offline", prompt: "consent" },
      },
    });
    if (error || !data.url) throw error || new Error("Google Calendar connection is unavailable.");
    return NextResponse.redirect(data.url);
  } catch (error) {
    const url = new URL("/admin", origin);
    url.searchParams.set("error", error instanceof Error ? error.message : "Could not connect Google Calendar.");
    return NextResponse.redirect(url);
  }
}
