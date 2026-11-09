import "server-only";

import { getAdminSupabase } from "@/lib/supabase/admin";

export type ContactSource =
  | "contact"
  | "estimate"
  | "consultation"
  | "imported";

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function upsertContact(input: {
  name: string;
  email: string;
  phone?: string | null;
  source: ContactSource;
}) {
  const supabase = getAdminSupabase();
  const emailNormalized = normalizeEmail(input.email);
  const now = new Date().toISOString();
  const { data: existing, error: lookupError } = await supabase
    .from("contacts")
    .select("id")
    .eq("email_normalized", emailNormalized)
    .maybeSingle();
  if (lookupError) throw lookupError;

  if (existing) {
    const { data, error } = await supabase
      .from("contacts")
      .update({
        name: input.name.trim(),
        email: input.email.trim(),
        phone: input.phone?.trim() || null,
        last_activity_at: now,
        updated_at: now,
      })
      .eq("id", existing.id)
      .select("id")
      .single();
    if (error || !data) throw error || new Error("Could not update contact.");
    return data.id as string;
  }

  const { data, error } = await supabase
    .from("contacts")
    .insert({
      name: input.name.trim(),
      email: input.email.trim(),
      email_normalized: emailNormalized,
      phone: input.phone?.trim() || null,
      first_source: input.source,
      last_activity_at: now,
    })
    .select("id")
    .single();
  if (!error && data) return data.id as string;

  // Concurrent submissions from the same address can race the unique index.
  const { data: raced, error: raceError } = await supabase
    .from("contacts")
    .select("id")
    .eq("email_normalized", emailNormalized)
    .single();
  if (raceError || !raced) throw error || raceError || new Error("Could not create contact.");
  return raced.id as string;
}

export async function recordContactActivity(input: {
  contactId: string;
  activityType: string;
  summary: string;
  subjectType?: string;
  subjectId?: string;
  actorEmail?: string;
  metadata?: Record<string, unknown>;
}) {
  const supabase = getAdminSupabase();
  const now = new Date().toISOString();
  const [activity, contact] = await Promise.all([
    supabase.from("contact_activities").insert({
      contact_id: input.contactId,
      activity_type: input.activityType,
      summary: input.summary,
      subject_type: input.subjectType || null,
      subject_id: input.subjectId || null,
      actor_email: input.actorEmail || null,
      metadata: input.metadata || {},
    }),
    supabase
      .from("contacts")
      .update({ last_activity_at: now, updated_at: now })
      .eq("id", input.contactId),
  ]);
  if (activity.error) throw activity.error;
  if (contact.error) throw contact.error;
}
