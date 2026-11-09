import { after } from "next/server";
import { recordSubmissionConsent } from "@/lib/consent";
import { recordContactActivity, upsertContact } from "@/lib/crm";
import { sendContactInquiryEmails } from "@/lib/estimator/email";
import { contactInquirySchema } from "@/lib/estimator/validation";
import { getAdminSupabase, isSupabaseConfigured } from "@/lib/supabase/admin";
import {
  enforceSubmissionRateLimit,
  isHoneypotFilled,
  SubmissionRateLimitError,
} from "@/lib/submission-security";

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return Response.json(
      { error: "The contact form is not configured yet." },
      { status: 503 },
    );
  }

  try {
    await enforceSubmissionRateLimit(request, "contact-inquiry", {
      limit: 6,
      windowSeconds: 900,
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Please try again later." },
      { status: error instanceof SubmissionRateLimitError ? error.status : 500 },
    );
  }

  const body = await request.json().catch(() => null);
  if (
    body &&
    typeof body === "object" &&
    isHoneypotFilled((body as Record<string, unknown>).website)
  ) {
    return Response.json({ ok: true });
  }

  const parsed = contactInquirySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message || "Complete the required fields." },
      { status: 400 },
    );
  }

  const supabase = getAdminSupabase();
  let inquiryId: string | null = null;
  try {
    const inquiry = parsed.data;
    const contactId = await upsertContact({
      name: inquiry.name,
      email: inquiry.email,
      phone: inquiry.phone,
      source: "contact",
    });
    const { data, error } = await supabase
      .from("contact_inquiries")
      .insert({
        contact_id: contactId,
        name: inquiry.name,
        email: inquiry.email.toLowerCase(),
        phone: inquiry.phone,
        interest: inquiry.interest,
        event_date: inquiry.eventDate || null,
        message: inquiry.message || null,
      })
      .select("id")
      .single();
    if (error || !data) throw error || new Error("Your inquiry could not be saved.");
    const savedInquiryId = data.id as string;
    inquiryId = savedInquiryId;

    await recordSubmissionConsent(request, {
      source: "contact-form",
      subjectType: "contact-inquiry",
      subjectId: savedInquiryId,
      name: inquiry.name,
      email: inquiry.email,
      phone: inquiry.phone,
      communicationsConsent: inquiry.communicationsConsent,
      marketingConsent: inquiry.marketingConsent,
    });
    await recordContactActivity({
      contactId,
      activityType: "inquiry-created",
      summary: `New ${inquiry.interest} inquiry`,
      subjectType: "contact-inquiry",
      subjectId: savedInquiryId,
    });

    after(async () => {
      try {
        const delivery = await sendContactInquiryEmails({
          inquiryId: savedInquiryId,
          contactId,
          name: inquiry.name,
          email: inquiry.email,
          phone: inquiry.phone,
          interest: inquiry.interest,
          eventDate: inquiry.eventDate || null,
          message: inquiry.message || null,
        });
        const errors = [delivery.owner.error, delivery.customer.error]
          .filter(Boolean)
          .join(" | ");
        await supabase
          .from("contact_inquiries")
          .update({
            owner_email_status: delivery.owner.status,
            customer_email_status: delivery.customer.status,
            email_error: errors || null,
            notified_at:
              delivery.owner.status === "sent" ? new Date().toISOString() : null,
          })
          .eq("id", savedInquiryId);
      } catch (emailError) {
        await supabase
          .from("contact_inquiries")
          .update({
            owner_email_status: "failed",
            customer_email_status: "failed",
            email_error:
              emailError instanceof Error
                ? emailError.message
                : "Inquiry email delivery failed.",
          })
          .eq("id", savedInquiryId);
      }
    });

    return Response.json({ ok: true });
  } catch (error) {
    if (inquiryId) {
      await supabase.from("contact_inquiries").delete().eq("id", inquiryId);
    }
    return Response.json(
      { error: error instanceof Error ? error.message : "Your inquiry could not be sent." },
      { status: 500 },
    );
  }
}
