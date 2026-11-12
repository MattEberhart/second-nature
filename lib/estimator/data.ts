import "server-only";
import { launchCatalog } from "./catalog-seed";
import { privateCatalogMetadata } from "./catalog-private";
import type { CatalogProduct, CuratedCollection } from "./types";
import { getAdminSupabase, isSupabaseConfigured } from "@/lib/supabase/admin";

type ProductRow = {
  id: string;
  public_name: string;
  category: CatalogProduct["category"];
  material: string;
  description: string;
  image_path: string;
  catalog_variants: Array<{
    id: string;
    label: string;
    size: string | null;
    color: string | null;
    image_path: string | null;
    unit_price_cents: number;
    sort_order: number;
    active: boolean;
  }>;
};

export async function getPublicCatalog(): Promise<CatalogProduct[]> {
  if (!isSupabaseConfigured()) {
    return launchCatalog;
  }

  const supabase = getAdminSupabase();
  let { data, error } = await supabase
    .from("catalog_products")
    .select("id,public_name,category,material,description,image_path,sort_order,catalog_variants(id,label,size,color,image_path,unit_price_cents,sort_order,active)")
    .eq("active", true)
    .order("sort_order");

  // Keep the deployed catalog usable during the short window before the new
  // migration is applied.
  if (["PGRST204", "42703"].includes(error?.code ?? "") && error?.message.includes("image_path")) {
    const legacy = await supabase
      .from("catalog_products")
      .select("id,public_name,category,material,description,image_path,sort_order,catalog_variants(id,label,size,color,unit_price_cents,sort_order,active)")
      .eq("active", true)
      .order("sort_order");
    data = legacy.data as typeof data;
    error = legacy.error;
  }

  if (error) throw error;
  // An empty table is a real, empty inventory — never fall back to the seed
  // placeholders here, or deleting every item would resurrect them publicly
  // (and priceCart would accept their prices).
  if (!data?.length) return [];
  return (data as ProductRow[]).map((product) => ({
    id: product.id,
    publicName: product.public_name,
    category: product.category,
    material: product.material,
    description: product.description,
    imagePath: product.image_path,
    variants: product.catalog_variants
      .filter((variant) => variant.active)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((variant) => ({
        id: variant.id,
        label: variant.label,
        size: variant.size,
        color: variant.color,
        imagePath: variant.image_path ?? null,
        unitPriceCents: variant.unit_price_cents,
      })),
  }));
}

const fallbackCollections: CuratedCollection[] = [
  {
    id: "summer-blues",
    slug: "summer-blues",
    name: "Summer Blues",
    description: "Cool, layered blues selected for easy summer gatherings.",
    headerImagePath: "/event-rentals-2.png",
    images: [
      { id: "summer-blues-1", imagePath: "/event-rentals-2.png", altText: "A layered blue summer tablescape" },
      { id: "summer-blues-2", imagePath: "/event-rentals-1.png", altText: "A curated outdoor gathering" },
    ],
    products: launchCatalog.flatMap((product) => {
      const variants = product.variants.filter((variant) =>
        `${variant.color ?? ""} ${variant.label}`.toLowerCase().includes("blue"),
      );
      return variants.length ? [{ ...product, variants }] : [];
    }),
  },
];

type CollectionRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  header_image_path: string | null;
  curated_collection_images: Array<{ id: string; image_path: string; alt_text: string; sort_order: number }>;
  curated_collection_members: Array<{ product_id: string; variant_id: string | null; sort_order: number }>;
};

export async function getPublicCollections(): Promise<CuratedCollection[]> {
  if (!isSupabaseConfigured()) return fallbackCollections;
  const { data, error } = await getAdminSupabase()
    .from("curated_collections")
    .select("id,slug,name,description,header_image_path,sort_order,curated_collection_images(id,image_path,alt_text,sort_order),curated_collection_members(product_id,variant_id,sort_order)")
    .eq("active", true)
    .order("sort_order");
  if (error?.code === "PGRST205") return fallbackCollections;
  if (error) throw error;
  if (!data?.length) return [];

  const catalog = await getPublicCatalog();
  const productMap = new Map(catalog.map((product) => [product.id, product]));
  return (data as CollectionRow[]).map((collection) => {
    const grouped = new Map<string, { product: CatalogProduct; all: boolean; variantIds: Set<string>; order: number }>();
    for (const member of collection.curated_collection_members) {
      const product = productMap.get(member.product_id);
      if (!product) continue;
      const current = grouped.get(product.id) ?? { product, all: false, variantIds: new Set<string>(), order: member.sort_order };
      if (member.variant_id === null) current.all = true;
      else current.variantIds.add(member.variant_id);
      current.order = Math.min(current.order, member.sort_order);
      grouped.set(product.id, current);
    }
    return {
      id: collection.id,
      slug: collection.slug,
      name: collection.name,
      description: collection.description,
      headerImagePath: collection.header_image_path,
      images: collection.curated_collection_images
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((image) => ({ id: image.id, imagePath: image.image_path, altText: image.alt_text })),
      products: [...grouped.values()]
        .sort((a, b) => a.order - b.order)
        .map(({ product, all, variantIds }) => ({
          ...product,
          variants: all ? product.variants : product.variants.filter((variant) => variantIds.has(variant.id)),
        }))
        .filter((product) => product.variants.length),
    };
  });
}

export async function getPublicCollection(slug: string) {
  const collections = await getPublicCollections();
  return collections.find((collection) => collection.slug === slug) ?? null;
}

export async function seedLaunchCatalog() {
  const supabase = getAdminSupabase();
  for (const [sortOrder, product] of launchCatalog.entries()) {
    const privateMetadata = privateCatalogMetadata[product.id];
    const { error: productError } = await supabase.from("catalog_products").upsert({
      id: product.id,
      public_name: product.publicName,
      category: product.category,
      material: product.material,
      description: product.description,
      image_path: product.imagePath,
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
      image_path: variant.imagePath,
      unit_price_cents: variant.unitPriceCents,
      active: true,
      sort_order: variantOrder,
      updated_at: new Date().toISOString(),
    }));
    const { error: variantError } = await supabase.from("catalog_variants").upsert(variants);
    if (variantError) throw variantError;
  }
}
