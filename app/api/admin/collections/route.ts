import { requireAdmin } from "@/lib/admin-auth";
import { curatedCollectionSchema } from "@/lib/estimator/admin-schemas";
import { getAdminSupabase } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const input = curatedCollectionSchema.parse(await request.json());
    const supabase = getAdminSupabase();
    const { data, error } = await supabase.from("curated_collections").insert({
      slug: input.slug, name: input.name, description: input.description,
      header_image_path: input.headerImagePath || null, active: input.active,
    }).select("id").single();
    if (error || !data) throw error || new Error("Collection could not be created.");
    if (input.members.length) {
      const { error: memberError } = await supabase.from("curated_collection_members").insert(input.members.map((member, index) => ({ collection_id: data.id, product_id: member.productId, variant_id: member.variantId, sort_order: index })));
      if (memberError) throw memberError;
    }
    if (input.images.length) {
      const { error: imageError } = await supabase.from("curated_collection_images").insert(input.images.map((image, index) => ({ collection_id: data.id, image_path: image.imagePath, alt_text: image.altText, sort_order: index })));
      if (imageError) throw imageError;
    }
    return Response.json({ id: data.id }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Collection could not be created." }, { status: 400 });
  }
}
