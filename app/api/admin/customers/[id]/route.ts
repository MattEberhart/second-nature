import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { recordContactActivity } from "@/lib/crm";
import { getAdminSupabase } from "@/lib/supabase/admin";

const schema = z.object({
  status: z.enum(["new", "contacted", "qualified", "booked", "closed"]),
});

export async function PATCH(
  request: Request,
  context: RouteContext<"/api/admin/customers/[id]">,
) {
  try {
    const user = await requireAdmin();
    const { id } = await context.params;
    const input = schema.parse(await request.json());
    const { error } = await getAdminSupabase()
      .from("contacts")
      .update({ status: input.status, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
    await recordContactActivity({
      contactId: id,
      activityType: "status-changed",
      summary: `Status changed to ${input.status}`,
      actorEmail: user.email,
      metadata: { status: input.status },
    });
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Customer could not be updated." },
      { status: 400 },
    );
  }
}
