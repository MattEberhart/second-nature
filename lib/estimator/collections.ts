import "server-only";
import type { z } from "zod";
import type { curatedCollectionSchema } from "./admin-schemas";
import { getAdminSupabase } from "@/lib/supabase/admin";

type CollectionInput = z.infer<typeof curatedCollectionSchema>;

/** Creates (id = null) or fully replaces a collection in one transaction. */
export async function saveCuratedCollection(id: string | null, input: CollectionInput) {
  const { data, error } = await getAdminSupabase().rpc("save_curated_collection", {
    p_id: id,
    p_collection: {
      slug: input.slug,
      name: input.name,
      description: input.description,
      header_image_path: input.headerImagePath || null,
      active: input.active,
    },
    p_members: input.members.map((member) => ({
      product_id: member.productId,
      variant_id: member.variantId,
    })),
    p_images: input.images.map((image) => ({
      image_path: image.imagePath,
      alt_text: image.altText,
    })),
  });
  if (error || !data) throw error || new Error("Collection could not be saved.");
  return data as string;
}
