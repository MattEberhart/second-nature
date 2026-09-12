import { NextResponse } from "next/server";
import { getAuthSupabase } from "@/lib/supabase/auth";

export async function GET(request: Request) {
  try {
    const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
    const supabase = await getAuthSupabase();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback?next=/admin`,
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
    if (error || !data.url) throw error || new Error("Google sign-in is unavailable.");
    return NextResponse.redirect(data.url);
  } catch (error) {
    const url = new URL("/admin", request.url);
    url.searchParams.set("error", error instanceof Error ? error.message : "Could not start Google sign-in.");
    return NextResponse.redirect(url);
  }
}
