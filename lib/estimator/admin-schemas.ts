import { z } from "zod";

const optionalText = z.string().trim().max(500).nullable().optional();

export const inventoryItemSchema = z.object({
  publicName: z.string().trim().min(1).max(160),
  category: z.enum(["table-linens", "napkins", "chargers", "plates", "flatware", "custom-details"]),
  tier: z.enum(["Essential", "Premium", "Luxe", "Signature"]),
  material: z.string().trim().max(160).default(""),
  description: z.string().trim().max(1000).default(""),
  imagePath: z.string().trim().min(1).max(1000),
  accent: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  pricePrefix: optionalText,
  active: z.boolean().default(true),
  variants: z.array(z.object({
    id: z.string().min(1).max(180).optional(),
    label: z.string().trim().min(1).max(160),
    size: optionalText,
    color: optionalText,
    imagePath: optionalText,
    unitPriceCents: z.number().int().min(0).max(10000000),
    active: z.boolean().default(true),
  })).min(1).max(500),
});

export const curatedCollectionSchema = z.object({
  name: z.string().trim().min(1).max(160),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(160),
  description: z.string().trim().max(2000).default(""),
  headerImagePath: z.string().trim().max(1000).nullable().optional(),
  active: z.boolean().default(true),
  members: z.array(z.object({
    productId: z.string().min(1).max(180),
    variantId: z.string().min(1).max(180).nullable(),
  })).max(1000),
  images: z.array(z.object({
    id: z.string().uuid().optional(),
    imagePath: z.string().trim().min(1).max(1000),
    altText: z.string().trim().max(300).default(""),
  })).max(20),
}).superRefine((collection, context) => {
  const seen = new Set<string>();
  for (const [index, member] of collection.members.entries()) {
    const key = `${member.productId}:${member.variantId ?? "*"}`;
    if (seen.has(key)) context.addIssue({ code: "custom", path: ["members", index], message: "Duplicate collection selection." });
    seen.add(key);
  }
});
