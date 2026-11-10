import { requireAdmin } from "@/lib/admin-auth";
import { revalidatePublicCatalog } from "@/lib/estimator/revalidate";
import { curatedCollectionSchema } from "@/lib/estimator/admin-schemas";
import { saveCuratedCollection } from "@/lib/estimator/collections";
import { getAdminSupabase } from "@/lib/supabase/admin";

export async function PATCH(request: Request, context: RouteContext<"/api/admin/collections/[id]">) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const input = curatedCollectionSchema.parse(await request.json());
    await saveCuratedCollection(id, input);
    revalidatePublicCatalog();
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Collection could not be updated." }, { status: 400 });
  }
}

export async function DELETE(_request: Request, context: RouteContext<"/api/admin/collections/[id]">) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const { error } = await getAdminSupabase().from("curated_collections").delete().eq("id", id);
    if (error) throw error;
    revalidatePublicCatalog();
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Collection could not be deleted." }, { status: 400 });
  }
}
