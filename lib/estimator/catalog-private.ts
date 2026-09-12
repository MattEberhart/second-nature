import "server-only";

// Private source references from Lydia's workbook. This module must never be
// imported by a Client Component or returned by the public catalog endpoint.
export const privateCatalogMetadata: Record<string, { internalName: string; supplier: string; sourcingNotes?: string }> = {
  "foundation-linen": { internalName: "Premium Polyester", supplier: "CV Linens", sourcingNotes: "Budget-tier 90, 120, and 132 inch rounds in white, ivory, and black." },
  "heirloom-linen": { internalName: "FD Signature Plus / Milliken", supplier: "Factory Direct", sourcingNotes: "Performance solid tablecloth program researched in white, ivory, and black." },
  "seamless-linen": { internalName: "Seamless White / Ivory / Black spun polyester", supplier: "Direct Textile Store", sourcingNotes: "132 inch ivory marked unavailable in source research and excluded publicly." },
  "meadow-linen": { internalName: "Majestic", supplier: "Ultimate Textiles", sourcingNotes: "Chocolate, moss, and light blue specialty table linen." },
  "bordeaux-linen": { internalName: "Melrose", supplier: "Ultimate Textiles", sourcingNotes: "Burgundy; source research describes a 59% cotton / 41% polyester blend." },
  "garden-party-linen": { internalName: "Duchess", supplier: "Ultimate Textiles", sourcingNotes: "Acid green specialty table linen." },
  "blue-hour-linen": { internalName: "Miranda", supplier: "Ultimate Textiles", sourcingNotes: "Slate blue; source research describes a 50/50 cotton-polyester blend." },
  "foundation-napkin": { internalName: "Premium Polyester napkin", supplier: "CV Linens" },
  "heirloom-napkin": { internalName: "Signature Plus napkin by Milliken", supplier: "Factory Direct" },
  "coastal-stripe-napkin": { internalName: "Seersucker Poly Print and Lexington Stripe Slub Print napkins", supplier: "Urquid" },
  "meadow-napkin": { internalName: "Majestic napkin", supplier: "Ultimate Textiles" },
  "bordeaux-napkin": { internalName: "Melrose napkin", supplier: "Ultimate Textiles" },
  "garden-party-napkin": { internalName: "Duchess napkin", supplier: "Ultimate Textiles" },
  "blue-hour-napkin": { internalName: "Miranda napkin", supplier: "Ultimate Textiles" },
  "camel-napkin": { internalName: "Spun Polyester napkin", supplier: "Ultimate Textiles" },
  "golden-bead-charger": { internalName: "Choice 13-inch Round Gold Beaded Rim Plastic Charger Plate", supplier: "WebstaurantStore" },
  "silver-line-charger": { internalName: "Choice 13-inch Round Silver Smooth Rim Plastic Charger Plate", supplier: "WebstaurantStore" },
  "gilded-glass-charger": { internalName: "Charge It by Jay 13-inch Round Gold Beaded Glass Charger Plate", supplier: "WebstaurantStore" },
  "pearl-rim-charger": { internalName: "10 Strawberry Street Coupe Gold Line Charger Plate", supplier: "WebstaurantStore" },
  "moonlight-charger": { internalName: "10 Strawberry Street Iriana Silver Porcelain Round Charger Plate", supplier: "WebstaurantStore" },
  "porcelain-edit-plates": { internalName: "Acopa Bright White Wide Rim Rolled Edge Stoneware plates", supplier: "WebstaurantStore" },
  "classic-flatware": { internalName: "Acopa Capulet 18/0 Stainless Steel Heavy Weight flatware", supplier: "WebstaurantStore" },
  "gilded-flatware": { internalName: "Acopa Phoenix Gold 18/0 Stainless Steel Forged flatware", supplier: "WebstaurantStore" },
  "heirloom-flatware": { internalName: "Oneida Arbor Rose / Scroll Pattern stainless flatware", supplier: "Katom" },
  "welcome-sign": { internalName: "Folding Sandwich Board (Plywood)", supplier: "Self", sourcingNotes: "Custom fabrication; source listing price starts at $220." },
};
