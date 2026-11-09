import "server-only";
import { createHash, createHmac } from "node:crypto";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { COMMUNICATIONS_CONSENT_TEXT, MARKETING_CONSENT_TEXT } from "@/lib/consent-copy";

export const CONSENT_DISCLOSURE_VERSION = "2026-11-09";

type ConsentSubject = {
  source: "contact-form" | "consultation-form" | "estimate-consultation-form";
  subjectType: "contact-inquiry" | "consultation" | "estimate-consultation";
  subjectId: string;
  name: string;
  email: string;
  phone: string;
  communicationsConsent: true;
  marketingConsent: boolean;
};

function requestIp(request: Request) {
  return (
    request.headers.get("x-vercel-forwarded-for") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    ""
  );
}

function hashIp(ip: string) {
  if (!ip) return null;
  const secret = process.env.APP_ENCRYPTION_KEY;
  return secret
    ? createHmac("sha256", secret).update(ip).digest("hex")
    : createHash("sha256").update(ip).digest("hex");
}

export async function recordSubmissionConsent(
  request: Request,
  subject: ConsentSubject,
) {
  const capturedAt = new Date().toISOString();
  const shared = {
    email: subject.email.toLowerCase(),
    phone: subject.phone,
    person_name: subject.name,
    disclosure_version: CONSENT_DISCLOSURE_VERSION,
    capture_source: subject.source,
    subject_type: subject.subjectType,
    subject_id: subject.subjectId,
    captured_at: capturedAt,
    ip_hash: hashIp(requestIp(request)),
    user_agent: request.headers.get("user-agent"),
    referrer: request.headers.get("referer"),
    evidence: {
      captureMethod: "unchecked-checkbox-then-affirmative-submit",
      pageUrl: request.headers.get("referer"),
    },
  };

  const { error } = await getAdminSupabase().from("consent_events").insert([
    {
      ...shared,
      consent_scope: "inquiry-communications",
      action: "granted",
      disclosure_text: COMMUNICATIONS_CONSENT_TEXT,
    },
    {
      ...shared,
      consent_scope: "email-marketing",
      action: subject.marketingConsent ? "granted" : "declined",
      disclosure_text: MARKETING_CONSENT_TEXT,
    },
  ]);

  if (error) throw error;
}
