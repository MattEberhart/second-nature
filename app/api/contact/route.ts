import { recordSubmissionConsent } from "@/lib/consent";
import { contactInquirySchema } from "@/lib/estimator/validation";
import { getAdminSupabase, isSupabaseConfigured } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return Response.json(
      { error: "The contact form is not configured yet." },
      { status: 503 },
    );
  }

  const parsed = contactInquirySchema.safeParse(
    await request.json().catch(() => null),
  );
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
    const { data, error } = await supabase
      .from("contact_inquiries")
      .insert({
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
    inquiryId = data.id;

    await recordSubmissionConsent(request, {
      source: "contact-form",
      subjectType: "contact-inquiry",
      subjectId: data.id as string,
      name: inquiry.name,
      email: inquiry.email,
      phone: inquiry.phone,
      communicationsConsent: inquiry.communicationsConsent,
      marketingConsent: inquiry.marketingConsent,
    });

    return Response.json({ ok: true });
  } catch (error) {
    if (inquiryId) await supabase.from("contact_inquiries").delete().eq("id", inquiryId);
    return Response.json(
      { error: error instanceof Error ? error.message : "Your inquiry could not be sent." },
      { status: 500 },
    );
  }
}
