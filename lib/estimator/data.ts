import "server-only";
import { launchCatalog } from "./catalog-seed";
import { privateCatalogMetadata } from "./catalog-private";
import type { CatalogProduct } from "./types";
import { getAdminSupabase, isSupabaseConfigured } from "@/lib/supabase/admin";

type ProductRow = {
  id: string;
  public_name: string;
  category: CatalogProduct["category"];
  tier: CatalogProduct["tier"];
  material: string;
  description: string;
  image_path: string;
  accent: string;
  price_prefix: string | null;
  catalog_variants: Array<{
    id: string;
    label: string;
    size: string | null;
    color: string | null;
    unit_price_cents: number;
    sort_order: number;
    active: boolean;
  }>;
};

export async function getPublicCatalog(): Promise<CatalogProduct[]> {
  if (!isSupabaseConfigured()) {
    return launchCatalog;
  }

  const { data, error } = await getAdminSupabase()
    .from("catalog_products")
    .select("id,public_name,category,tier,material,description,image_path,accent,price_prefix,sort_order,catalog_variants(id,label,size,color,unit_price_cents,sort_order,active)")
    .eq("active", true)
    .order("sort_order");

  if (error) throw error;
  if (!data?.length) return launchCatalog;
  return (data as ProductRow[]).map((product) => ({
    id: product.id,
    publicName: product.public_name,
    category: product.category,
    tier: product.tier,
    material: product.material,
    description: product.description,
    imagePath: product.image_path,
    accent: product.accent,
    pricePrefix: product.price_prefix ?? undefined,
    variants: product.catalog_variants
      .filter((variant) => variant.active)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((variant) => ({
        id: variant.id,
        label: variant.label,
        size: variant.size,
        color: variant.color,
        unitPriceCents: variant.unit_price_cents,
      })),
  }));
}

export async function seedLaunchCatalog() {
  const supabase = getAdminSupabase();
  for (const [sortOrder, product] of launchCatalog.entries()) {
    const privateMetadata = privateCatalogMetadata[product.id];
    const { error: productError } = await supabase.from("catalog_products").upsert({
      id: product.id,
      public_name: product.publicName,
      category: product.category,
      tier: product.tier,
      material: product.material,
      description: product.description,
      image_path: product.imagePath,
      accent: product.accent,
      price_prefix: product.pricePrefix ?? null,
      internal_name: privateMetadata?.internalName ?? null,
      supplier: privateMetadata?.supplier ?? null,
      sourcing_notes: privateMetadata?.sourcingNotes ?? null,
      active: true,
      sort_order: sortOrder,
      updated_at: new Date().toISOString(),
    });
    if (productError) throw productError;

    const variants = product.variants.map((variant, variantOrder) => ({
      id: variant.id,
      product_id: product.id,
      label: variant.label,
      size: variant.size,
      color: variant.color,
      unit_price_cents: variant.unitPriceCents,
      active: true,
      sort_order: variantOrder,
      updated_at: new Date().toISOString(),
    }));
    const { error: variantError } = await supabase.from("catalog_variants").upsert(variants);
    if (variantError) throw variantError;
  }
}
