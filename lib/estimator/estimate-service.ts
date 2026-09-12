import "server-only";
import type { CartLine, EstimateDetails } from "./types";
import { getPublicCatalog } from "./data";
import { createOpaqueToken, hashToken } from "@/lib/security";
import { getAdminSupabase } from "@/lib/supabase/admin";

export async function priceCart(cart: CartLine[]) {
  const catalog = await getPublicCatalog();
  const variants = new Map(
    catalog.flatMap((product) =>
      product.variants.map((variant) => [variant.id, { product, variant }] as const),
    ),
  );

  const items = cart.map((line) => {
    const match = variants.get(line.variantId);
    if (!match) throw new Error(`Unknown catalog item: ${line.variantId}`);
    return {
      productId: match.product.id,
      variantId: match.variant.id,
      publicName: match.product.publicName,
      variantLabel: match.variant.label,
      unitPriceCents: match.variant.unitPriceCents,
      quantity: line.quantity,
      lineTotalCents: match.variant.unitPriceCents * line.quantity,
    };
  });

  return {
    items,
    subtotalCents: items.reduce((total, item) => total + item.lineTotalCents, 0),
  };
}

type SaveOptions = {
  cart: CartLine[];
  details: Partial<EstimateDetails> & Pick<EstimateDetails, "name" | "email">;
  resumeToken?: string;
  deliveryFeeCents?: number;
  fullServiceFeeCents?: number;
  status?: "draft" | "awaiting-scheduling" | "scheduled";
};

export async function saveEstimate(options: SaveOptions) {
  const supabase = getAdminSupabase();
  const priced = await priceCart(options.cart);
  const resumeToken = options.resumeToken || createOpaqueToken();
  const tokenHash = hashToken(resumeToken);
  const deliveryFeeCents = options.deliveryFeeCents ?? 0;
  const fullServiceFeeCents = options.fullServiceFeeCents ?? 0;
  const totalCents = priced.subtotalCents + deliveryFeeCents + fullServiceFeeCents;

  let existingId: string | null = null;
  if (options.resumeToken) {
    const { data } = await supabase
      .from("estimates")
      .select("id")
      .eq("resume_token_hash", tokenHash)
      .maybeSingle();
    existingId = data?.id ?? null;
  }

  const guestCount = options.details.guestCount
    ? Number.parseInt(options.details.guestCount, 10)
    : null;
  const record = {
    resume_token_hash: tokenHash,
    customer_name: options.details.name,
    customer_email: options.details.email.toLowerCase(),
    event_date:
      options.details.dateUndecided || !options.details.eventDate
        ? null
        : options.details.eventDate,
    date_undecided: options.details.dateUndecided ?? false,
    guest_count: Number.isFinite(guestCount) ? guestCount : null,
    venue_name: options.details.venueName || null,
    venue_address: options.details.venueAddress || null,
    fulfillment: options.details.fulfillment || "pickup",
    notes: options.details.notes || null,
    subtotal_cents: priced.subtotalCents,
    delivery_fee_cents: deliveryFeeCents,
    full_service_fee_cents: fullServiceFeeCents,
    total_cents: totalCents,
    status: options.status || "draft",
    updated_at: new Date().toISOString(),
  };

  const query = existingId
    ? supabase.from("estimates").update(record).eq("id", existingId).select("id").single()
    : supabase.from("estimates").insert(record).select("id").single();
  const { data, error } = await query;
  if (error || !data) throw error || new Error("Could not save estimate.");

  await supabase.from("estimate_items").delete().eq("estimate_id", data.id);
  if (priced.items.length) {
    const { error: itemError } = await supabase.from("estimate_items").insert(
      priced.items.map((item) => ({
        estimate_id: data.id,
        product_id: item.productId,
        variant_id: item.variantId,
        public_name_snapshot: item.publicName,
        variant_label_snapshot: item.variantLabel,
        unit_price_cents_snapshot: item.unitPriceCents,
        quantity: item.quantity,
        line_total_cents: item.lineTotalCents,
      })),
    );
    if (itemError) throw itemError;
  }

  return {
    id: data.id as string,
    resumeToken,
    ...priced,
    deliveryFeeCents,
    fullServiceFeeCents,
    totalCents,
  };
}

export async function getEstimateByToken(token: string) {
  const { data, error } = await getAdminSupabase()
    .from("estimates")
    .select("*,estimate_items(*)")
    .eq("resume_token_hash", hashToken(token))
    .maybeSingle();
  if (error) throw error;
  return data;
}
