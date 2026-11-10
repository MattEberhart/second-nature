import { requireAdmin } from "@/lib/admin-auth";
import { revalidatePublicCatalog } from "@/lib/estimator/revalidate";
import { inventoryItemSchema } from "@/lib/estimator/admin-schemas";
import { getAdminSupabase } from "@/lib/supabase/admin";

const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 120);

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const input = inventoryItemSchema.parse(await request.json());
    const id = `${slugify(input.publicName) || "item"}-${crypto.randomUUID().slice(0, 8)}`;
    const supabase = getAdminSupabase();
    const { error } = await supabase.from("catalog_products").insert({
      id, public_name: input.publicName, category: input.category,
      material: input.material, description: input.description, image_path: input.imagePath,
      accent: input.accent, price_prefix: input.pricePrefix || null, active: input.active,
    });
    if (error) throw error;
    const { error: variantError } = await supabase.from("catalog_variants").insert(input.variants.map((variant, index) => ({
      id: variant.id || `${id}-${crypto.randomUUID().slice(0, 8)}`, product_id: id,
      label: variant.label, size: variant.size || null, color: variant.color || null,
      image_path: variant.imagePath || null, unit_price_cents: variant.unitPriceCents,
      active: variant.active, sort_order: index,
    })));
    if (variantError) throw variantError;
    revalidatePublicCatalog();
    return Response.json({ id }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Item could not be created." }, { status: 400 });
  }
}
