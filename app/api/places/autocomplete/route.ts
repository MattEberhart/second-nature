import { z } from "zod";
import { autocompleteAddress } from "@/lib/estimator/places";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import {
  enforceSubmissionRateLimit,
  SubmissionRateLimitError,
} from "@/lib/submission-security";

const inputSchema = z.object({
  input: z.string().trim().min(3).max(200),
  sessionToken: z.string().regex(/^[A-Za-z0-9-]{16,64}$/),
});

/**
 * Venue-address suggestions for the estimate builder. Read-only proxy to the
 * paid Places Autocomplete API: the client debounces, and this limiter caps a
 * single visitor at roughly a few dozen addresses' worth of typing per window.
 */
export async function POST(request: Request) {
  if (isSupabaseConfigured()) {
    try {
      await enforceSubmissionRateLimit(request, "places-autocomplete", {
        limit: 150,
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
  if (!parsed.success) return Response.json({ suggestions: [] });
  try {
    const suggestions = await autocompleteAddress(parsed.data.input, parsed.data.sessionToken);
    return Response.json({ suggestions });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Address suggestions are unavailable." },
      { status: 503 },
    );
  }
}
