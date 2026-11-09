import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { recordContactActivity } from "@/lib/crm";
import { getAdminSupabase } from "@/lib/supabase/admin";

const schema = z.object({ body: z.string().trim().min(1).max(5000) });

export async function POST(
  request: Request,
  context: RouteContext<"/api/admin/customers/[id]/notes">,
) {
  try {
    const user = await requireAdmin();
    const { id } = await context.params;
    const input = schema.parse(await request.json());
    const { error } = await getAdminSupabase().from("contact_notes").insert({
      contact_id: id,
      body: input.body,
      author_email: user.email,
    });
    if (error) throw error;
    await recordContactActivity({
      contactId: id,
      activityType: "note-added",
      summary: "Internal note added",
      actorEmail: user.email,
    });
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Note could not be saved." },
      { status: 400 },
    );
  }
}
