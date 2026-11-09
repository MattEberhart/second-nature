import { requireAdmin } from "@/lib/admin-auth";
import { inventoryItemSchema } from "@/lib/estimator/admin-schemas";
import { getAdminSupabase } from "@/lib/supabase/admin";

export async function PATCH(request: Request, context: RouteContext<"/api/admin/inventory/[id]">) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const input = inventoryItemSchema.parse(await request.json());
    const supabase = getAdminSupabase();
    const { error } = await supabase.from("catalog_products").update({
      public_name: input.publicName, category: input.category, tier: input.tier,
      material: input.material, description: input.description, image_path: input.imagePath,
      accent: input.accent, price_prefix: input.pricePrefix || null, active: input.active,
      updated_at: new Date().toISOString(),
    }).eq("id", id);
    if (error) throw error;
    const rows = input.variants.map((variant, index) => ({
      id: variant.id || `${id}-${crypto.randomUUID().slice(0, 8)}`, product_id: id,
      label: variant.label, size: variant.size || null, color: variant.color || null,
      image_path: variant.imagePath || null, unit_price_cents: variant.unitPriceCents,
      active: variant.active, sort_order: index, updated_at: new Date().toISOString(),
    }));
    const { error: upsertError } = await supabase.from("catalog_variants").upsert(rows);
    if (upsertError) throw upsertError;
    const keep = rows.map((row) => row.id);
    const { error: deleteError } = await supabase.from("catalog_variants").delete().eq("product_id", id).not("id", "in", `(${keep.join(",")})`);
    if (deleteError) throw deleteError;
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Item could not be updated." }, { status: 400 });
  }
}

export async function DELETE(_request: Request, context: RouteContext<"/api/admin/inventory/[id]">) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const { error } = await getAdminSupabase().from("catalog_products").delete().eq("id", id);
    if (error) throw error;
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Item could not be deleted." }, { status: 400 });
  }
}
