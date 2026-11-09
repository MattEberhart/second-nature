import "server-only";
import type { CartLine, EstimateDetails } from "./types";
import { getPublicCatalog } from "./data";
import { createOpaqueToken, hashToken } from "@/lib/security";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { recordContactActivity, upsertContact } from "@/lib/crm";

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
  const contactId = await upsertContact({
    name: options.details.name,
    email: options.details.email,
    phone: options.details.phone,
    source: "estimate",
  });

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
    contact_id: contactId,
    customer_name: options.details.name,
    customer_email: options.details.email.toLowerCase(),
    customer_phone: options.details.phone || null,
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

  const { data: savedId, error } = await supabase.rpc(
    "save_estimate_with_items",
    {
      p_existing_id: existingId,
      p_record: record,
      p_items: priced.items.map((item) => ({
        product_id: item.productId,
        variant_id: item.variantId,
        public_name: item.publicName,
        variant_label: item.variantLabel,
        unit_price_cents: item.unitPriceCents,
        quantity: item.quantity,
        line_total_cents: item.lineTotalCents,
      })),
    },
  );
  if (error || !savedId) throw error || new Error("Could not save estimate.");

  await recordContactActivity({
    contactId,
    activityType: existingId ? "estimate-updated" : "estimate-created",
    summary: existingId ? "Estimate updated" : "Estimate saved",
    subjectType: "estimate",
    subjectId: savedId as string,
    metadata: { totalCents, status: options.status || "draft" },
  }).catch(() => undefined);

  return {
    id: savedId as string,
    contactId,
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
