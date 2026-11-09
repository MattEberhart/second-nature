import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { defaultAvailability, setSetting } from "@/lib/estimator/settings";
import { getAdminSupabase } from "@/lib/supabase/admin";

const schema = z.object({
  availability: z.object({
    durationMinutes: z.number().int().min(15).max(120),
    bufferMinutes: z.number().int().min(0).max(120),
    minimumNoticeHours: z.number().int().min(0).max(720),
    bookingHorizonDays: z.number().int().min(7).max(365),
    busyCalendarIds: z.array(z.string().min(1).max(320)).max(10),
  }),
  delivery: z.object({
    baseFeeCents: z.number().int().min(0).max(1000000),
    roundTripPerMileCents: z.number().int().min(0).max(100000),
    fullServiceStartingFeeCents: z.number().int().min(0).max(1000000),
  }),
});

export async function PATCH(request: Request) {
  try {
    await requireAdmin();
    const parsed = schema.parse(await request.json());
    // The dashboard edits only some availability fields; keep the stored weekly
    // hours and time zone instead of resetting them to the defaults.
    // Read directly (not getSetting) so a failed read errors out rather than
    // silently writing the defaults back.
    const { data: stored, error: readError } = await getAdminSupabase()
      .from("app_settings")
      .select("value")
      .eq("key", "availability")
      .maybeSingle();
    if (readError) throw readError;
    const availability = { ...defaultAvailability, ...(stored?.value ?? {}), ...parsed.availability };
    await Promise.all([setSetting("availability", availability), setSetting("delivery", parsed.delivery)]);
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Settings could not be saved." }, { status: 400 });
  }
}
