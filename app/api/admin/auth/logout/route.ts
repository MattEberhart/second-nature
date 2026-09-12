import { NextResponse } from "next/server";
import { getAuthSupabase } from "@/lib/supabase/auth";

export async function POST(request: Request) {
  try { await (await getAuthSupabase()).auth.signOut(); } catch { /* Already signed out. */ }
  return NextResponse.redirect(new URL("/admin", request.url), 303);
}
