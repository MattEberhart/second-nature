import { z } from "zod";
import { calculateDelivery } from "@/lib/estimator/delivery";
import { PLACE_ID_PATTERN } from "@/lib/estimator/places";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import {
  enforceSubmissionRateLimit,
  SubmissionRateLimitError,
} from "@/lib/submission-security";

const inputSchema = z.object({
  address: z.string().trim().min(5).max(300),
  fulfillment: z.enum(["delivery", "full-service"]),
  placeId: z.string().regex(PLACE_ID_PATTERN).optional(),
});

export async function POST(request: Request) {
  // Each call hits the paid Google Routes API. Allow a few address retries,
  // but not unbounded use. The limiter is stored in Supabase.
  if (isSupabaseConfigured()) {
    try {
      await enforceSubmissionRateLimit(request, "delivery-estimate", {
        limit: 20,
        windowSeconds: 900,
      });
    } catch (error) {
      return Response.json(
        { error: error instanceof Error ? error.message : "Please try again later." },
        { status: error instanceof SubmissionRateLimitError ? error.status : 500 },
      );
    }
  }
  const parsed = inputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Enter a complete venue address." }, { status: 400 });
  try {
    return Response.json(await calculateDelivery(parsed.data.address, parsed.data.fulfillment, parsed.data.placeId));
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Delivery could not be calculated." },
      { status: 422 },
    );
  }
}
