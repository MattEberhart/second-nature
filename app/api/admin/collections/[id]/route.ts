import { requireAdmin } from "@/lib/admin-auth";
import { curatedCollectionSchema } from "@/lib/estimator/admin-schemas";
import { getAdminSupabase } from "@/lib/supabase/admin";

export async function PATCH(request: Request, context: RouteContext<"/api/admin/collections/[id]">) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const input = curatedCollectionSchema.parse(await request.json());
    const supabase = getAdminSupabase();
    const { error } = await supabase.from("curated_collections").update({
      slug: input.slug, name: input.name, description: input.description,
      header_image_path: input.headerImagePath || null, active: input.active,
      updated_at: new Date().toISOString(),
    }).eq("id", id);
    if (error) throw error;
    await Promise.all([
      supabase.from("curated_collection_members").delete().eq("collection_id", id),
      supabase.from("curated_collection_images").delete().eq("collection_id", id),
    ]);
    if (input.members.length) {
      const { error: memberError } = await supabase.from("curated_collection_members").insert(input.members.map((member, index) => ({ collection_id: id, product_id: member.productId, variant_id: member.variantId, sort_order: index })));
      if (memberError) throw memberError;
    }
    if (input.images.length) {
      const { error: imageError } = await supabase.from("curated_collection_images").insert(input.images.map((image, index) => ({ collection_id: id, image_path: image.imagePath, alt_text: image.altText, sort_order: index })));
      if (imageError) throw imageError;
    }
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
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Collection could not be deleted." }, { status: 400 });
  }
}
