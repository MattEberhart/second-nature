import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { getAdminSupabase } from "@/lib/supabase/admin";

const schema = z.object({ active: z.boolean() });

export async function PATCH(request: Request, context: RouteContext<"/api/admin/catalog/[id]">) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const input = schema.parse(await request.json());
    const { error } = await getAdminSupabase().from("catalog_products").update({ active: input.active, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) throw error;
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Catalog item could not be updated." }, { status: 400 });
  }
}
