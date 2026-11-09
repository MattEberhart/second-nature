import { saveEstimateSchema } from "@/lib/estimator/validation";
import { EmptyCartError, saveEstimate } from "@/lib/estimator/estimate-service";
import { sendResumeEstimate } from "@/lib/estimator/email";
import { getAdminSupabase, isSupabaseConfigured } from "@/lib/supabase/admin";
import { recordSubmissionConsent } from "@/lib/consent";
import {
  enforceSubmissionRateLimit,
  SubmissionRateLimitError,
} from "@/lib/submission-security";

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return Response.json({ error: "Saving will be available after Supabase is connected." }, { status: 503 });
  }
  try {
    await enforceSubmissionRateLimit(request, "estimate-save", {
      limit: 10,
      windowSeconds: 900,
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Please try again later." },
      { status: error instanceof SubmissionRateLimitError ? error.status : 500 },
    );
  }

  const parsed = saveEstimateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || parsed.data.cart.length === 0) {
    const consentIssue = parsed.error?.issues.find((issue) => issue.path.includes("communicationsConsent"));
    return Response.json(
      { error: consentIssue?.message || "Add at least one selection and enter your name and email." },
      { status: 400 },
    );
  }

  try {
    const saved = await saveEstimate({
      cart: parsed.data.cart,
      details: parsed.data.details,
      resumeToken: parsed.data.resumeToken,
    });
    await recordSubmissionConsent(request, {
      source: "estimate-save-form",
      subjectType: "estimate-save",
      subjectId: saved.id,
      name: parsed.data.details.name,
      email: parsed.data.details.email,
      phone: parsed.data.details.phone || "",
      communicationsConsent: parsed.data.details.communicationsConsent,
      marketingConsent: parsed.data.details.marketingConsent,
    });
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
    const resumeUrl = `${baseUrl}/estimate/${saved.resumeToken}`;
    let emailSent = false;
    let warning: string | undefined;
    try {
      await sendResumeEstimate({
        id: saved.id,
        name: parsed.data.details.name,
        email: parsed.data.details.email,
        resumeUrl,
      });
      emailSent = true;
      await getAdminSupabase()
        .from("estimates")
        .update({
          resume_email_status: "sent",
          resume_email_error: null,
          last_resume_email_at: new Date().toISOString(),
        })
        .eq("id", saved.id);
    } catch (emailError) {
      const message =
        emailError instanceof Error ? emailError.message : "Email delivery failed.";
      warning =
        "Your estimate is saved, but the email could not be sent. Keep the private link below.";
      await getAdminSupabase()
        .from("estimates")
        .update({ resume_email_status: "failed", resume_email_error: message })
        .eq("id", saved.id);
    }
    return Response.json({
      id: saved.id,
      resumeToken: saved.resumeToken,
      resumeUrl,
      emailSent,
      warning,
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Your estimate could not be saved." },
      { status: error instanceof EmptyCartError ? error.status : 500 },
    );
  }
}
