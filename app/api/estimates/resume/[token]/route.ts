import { getEstimateByToken } from "@/lib/estimator/estimate-service";
import { isSupabaseConfigured } from "@/lib/supabase/admin";

export async function GET(_request: Request, context: RouteContext<"/api/estimates/resume/[token]">) {
  if (!isSupabaseConfigured()) return Response.json({ error: "Estimate storage is not configured." }, { status: 503 });
  const { token } = await context.params;
  if (token.length < 20 || token.length > 200) return Response.json({ error: "That link is not valid." }, { status: 400 });
  try {
    const estimate = await getEstimateByToken(token);
    if (!estimate) return Response.json({ error: "We could not find that estimate." }, { status: 404 });
    return Response.json({
      cart: (estimate.estimate_items ?? []).map((item: { variant_id: string; quantity: number }) => ({
        variantId: item.variant_id,
        quantity: item.quantity,
      })),
      details: {
        name: estimate.customer_name,
        email: estimate.customer_email,
        eventDate: estimate.event_date || "",
        dateUndecided: estimate.date_undecided,
        guestCount: estimate.guest_count ? String(estimate.guest_count) : "",
        venueName: estimate.venue_name || "",
        venueAddress: estimate.venue_address || "",
        fulfillment: estimate.fulfillment,
        notes: estimate.notes || "",
      },
    });
  } catch {
    return Response.json({ error: "That estimate could not be opened." }, { status: 500 });
  }
}
