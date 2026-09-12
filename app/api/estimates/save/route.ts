import { saveEstimateSchema } from "@/lib/estimator/validation";
import { saveEstimate } from "@/lib/estimator/estimate-service";
import { sendResumeEstimate } from "@/lib/estimator/email";
import { isSupabaseConfigured } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return Response.json({ error: "Saving will be available after Supabase is connected." }, { status: 503 });
  }
  const parsed = saveEstimateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || parsed.data.cart.length === 0) {
    return Response.json({ error: "Add at least one selection and enter your name and email." }, { status: 400 });
  }

  try {
    const saved = await saveEstimate({
      cart: parsed.data.cart,
      details: parsed.data.details,
      resumeToken: parsed.data.resumeToken,
    });
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
    const resumeUrl = `${baseUrl}/estimate/${saved.resumeToken}`;
    await sendResumeEstimate({
      id: saved.id,
      name: parsed.data.details.name,
      email: parsed.data.details.email,
      resumeUrl,
    });
    return Response.json({ id: saved.id, resumeToken: saved.resumeToken, resumeUrl });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Your estimate could not be saved." },
      { status: 500 },
    );
  }
}
