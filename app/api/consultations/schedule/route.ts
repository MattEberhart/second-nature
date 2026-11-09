import { consultationSchema } from "@/lib/estimator/validation";
import { listAvailability, createCalendarMeeting } from "@/lib/estimator/calendar";
import { sendAppointmentEmails } from "@/lib/estimator/email";
import { getAdminSupabase, isSupabaseConfigured } from "@/lib/supabase/admin";
import { recordSubmissionConsent } from "@/lib/consent";

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) return Response.json({ error: "Scheduling is not configured yet." }, { status: 503 });
  const parsed = consultationSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message || "Complete your details." }, { status: 400 });
  let appointmentId: string | null = null;
  try {
    const slot = (await listAvailability()).find((candidate) => candidate.start === parsed.data.slotStart);
    if (!slot) return Response.json({ error: "That time was just taken. Please choose another." }, { status: 409 });
    const supabase = getAdminSupabase();
    const { data: appointment, error } = await supabase.from("appointments").insert({
      customer_name: parsed.data.name,
      customer_email: parsed.data.email.toLowerCase(),
      customer_phone: parsed.data.phone,
      event_date: parsed.data.dateUndecided ? null : parsed.data.eventDate || null,
      venue_name: parsed.data.venueName || null,
      notes: parsed.data.notes || null,
      starts_at: slot.start,
      ends_at: slot.end,
      status: "pending",
    }).select("id").single();
    if (error || !appointment) throw error || new Error("Could not reserve that time.");
    appointmentId = appointment.id;
    await recordSubmissionConsent(request, {
      source: "consultation-form",
      subjectType: "consultation",
      subjectId: appointmentId!,
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      communicationsConsent: parsed.data.communicationsConsent,
      marketingConsent: parsed.data.marketingConsent,
    });
    const meeting = await createCalendarMeeting({
      appointmentId: appointmentId!,
      customerName: parsed.data.name,
      customerEmail: parsed.data.email,
      startsAt: slot.start,
      endsAt: slot.end,
      description: `Free consultation\nEvent date: ${parsed.data.dateUndecided ? "Not decided" : parsed.data.eventDate || "Not provided"}\nVenue: ${parsed.data.venueName || "Not provided"}\nNotes: ${parsed.data.notes || "None"}`,
    });
    await supabase.from("appointments").update({ google_event_id: meeting.eventId, google_meet_url: meeting.meetUrl, status: "confirmed" }).eq("id", appointmentId);
    const label = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", weekday: "long", month: "long", day: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short" }).format(new Date(slot.start));
    try {
      await sendAppointmentEmails({
        customerName: parsed.data.name,
        customerEmail: parsed.data.email,
        appointmentLabel: label,
        meetUrl: meeting.meetUrl,
        eventDate: parsed.data.dateUndecided ? null : parsed.data.eventDate || null,
        venueName: parsed.data.venueName || null,
        fulfillment: "Consultation only",
        notes: parsed.data.notes || null,
        items: [], subtotalCents: 0, deliveryFeeCents: 0, fullServiceFeeCents: 0, totalCents: 0,
        appointmentId: appointmentId!,
      });
    } catch { /* Google already sent the calendar invitation. */ }
    return Response.json({ appointmentLabel: label, meetUrl: meeting.meetUrl });
  } catch (error) {
    if (appointmentId) await getAdminSupabase().from("appointments").delete().eq("id", appointmentId);
    return Response.json({ error: error instanceof Error ? error.message : "The consultation could not be booked." }, { status: 500 });
  }
}
