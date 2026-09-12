import { scheduleSchema } from "@/lib/estimator/validation";
import { calculateDelivery } from "@/lib/estimator/delivery";
import { listAvailability, createCalendarMeeting } from "@/lib/estimator/calendar";
import { saveEstimate } from "@/lib/estimator/estimate-service";
import { sendAppointmentEmails } from "@/lib/estimator/email";
import { getAdminSupabase, isSupabaseConfigured } from "@/lib/supabase/admin";

function appointmentLabel(start: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(new Date(start));
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) return Response.json({ error: "Scheduling is not configured yet." }, { status: 503 });
  const parsed = scheduleSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || parsed.data.cart.length === 0) {
    return Response.json({ error: parsed.error?.issues[0]?.message || "Complete the estimate details." }, { status: 400 });
  }

  let appointmentId: string | null = null;
  try {
    const available = await listAvailability();
    const slot = available.find((candidate) => candidate.start === parsed.data.slotStart);
    if (!slot) return Response.json({ error: "That time was just taken. Please choose another." }, { status: 409 });

    const delivery = await calculateDelivery(parsed.data.details.venueAddress, parsed.data.details.fulfillment);
    const estimate = await saveEstimate({
      cart: parsed.data.cart,
      details: parsed.data.details,
      resumeToken: parsed.data.resumeToken,
      deliveryFeeCents: delivery.deliveryFeeCents,
      fullServiceFeeCents: delivery.fullServiceFeeCents,
      status: "awaiting-scheduling",
    });

    const supabase = getAdminSupabase();
    const { data: appointment, error: appointmentError } = await supabase
      .from("appointments")
      .insert({
        estimate_id: estimate.id,
        customer_name: parsed.data.details.name,
        customer_email: parsed.data.details.email.toLowerCase(),
        event_date: parsed.data.details.dateUndecided ? null : parsed.data.details.eventDate,
        venue_name: parsed.data.details.venueName || null,
        notes: parsed.data.details.notes || null,
        starts_at: slot.start,
        ends_at: slot.end,
        status: "pending",
      })
      .select("id")
      .single();
    if (appointmentError || !appointment) throw appointmentError || new Error("Could not reserve that time.");
    appointmentId = appointment.id;

    const meeting = await createCalendarMeeting({
      appointmentId: appointmentId!,
      customerName: parsed.data.details.name,
      customerEmail: parsed.data.details.email,
      startsAt: slot.start,
      endsAt: slot.end,
      description: `Estimate ${estimate.id}\nEvent date: ${parsed.data.details.dateUndecided ? "Not decided" : parsed.data.details.eventDate}\nVenue: ${parsed.data.details.venueName || "Not provided"}\nFulfillment: ${parsed.data.details.fulfillment}\nNotes: ${parsed.data.details.notes || "None"}`,
    });

    await supabase.from("appointments").update({
      google_event_id: meeting.eventId,
      google_meet_url: meeting.meetUrl,
      status: "confirmed",
    }).eq("id", appointmentId);
    await supabase.from("estimates").update({ status: "scheduled", updated_at: new Date().toISOString() }).eq("id", estimate.id);

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
    const label = appointmentLabel(slot.start);
    let emailWarning: string | undefined;
    try {
      await sendAppointmentEmails({
        estimateId: estimate.id,
        customerName: parsed.data.details.name,
        customerEmail: parsed.data.details.email,
        appointmentLabel: label,
        meetUrl: meeting.meetUrl,
        resumeUrl: `${baseUrl}/estimate/${estimate.resumeToken}`,
        eventDate: parsed.data.details.dateUndecided ? null : parsed.data.details.eventDate,
        venueName: parsed.data.details.venueName || null,
        fulfillment: parsed.data.details.fulfillment,
        notes: parsed.data.details.notes || null,
        items: estimate.items,
        subtotalCents: estimate.subtotalCents,
        deliveryFeeCents: estimate.deliveryFeeCents,
        fullServiceFeeCents: estimate.fullServiceFeeCents,
        totalCents: estimate.totalCents,
        appointmentId: appointmentId!,
      });
    } catch {
      emailWarning = "Your meeting is booked, but the follow-up email may be delayed.";
    }

    return Response.json({
      appointmentId,
      appointmentLabel: label,
      meetUrl: meeting.meetUrl,
      resumeToken: estimate.resumeToken,
      totalCents: estimate.totalCents,
      warning: emailWarning,
    });
  } catch (error) {
    if (appointmentId) await getAdminSupabase().from("appointments").delete().eq("id", appointmentId);
    return Response.json({ error: error instanceof Error ? error.message : "The consultation could not be booked." }, { status: 500 });
  }
}
