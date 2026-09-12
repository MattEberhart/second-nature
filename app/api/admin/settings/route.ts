import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { setSetting } from "@/lib/estimator/settings";

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
    const availability = {
      timeZone: "America/New_York",
      weekly: { "1": [["10:00", "16:00"]], "2": [["10:00", "16:00"]], "3": [["10:00", "16:00"]], "4": [["10:00", "16:00"]], "5": [["10:00", "14:00"]] },
      ...parsed.availability,
    };
    await Promise.all([setSetting("availability", availability), setSetting("delivery", parsed.delivery)]);
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Settings could not be saved." }, { status: 400 });
  }
}
