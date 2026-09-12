import { z } from "zod";

export const cartSchema = z.array(
  z.object({
    variantId: z.string().min(1).max(160),
    quantity: z.number().int().min(1).max(10000),
  }),
).max(100);

const detailsBaseSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(320),
  eventDate: z.string().max(10),
  dateUndecided: z.boolean(),
  guestCount: z.string().trim().max(6),
  venueName: z.string().trim().max(160),
  venueAddress: z.string().trim().max(300),
  fulfillment: z.enum(["pickup", "delivery", "full-service"]),
  notes: z.string().trim().max(3000),
});

export const detailsSchema = detailsBaseSchema.superRefine((details, ctx) => {
  if (!details.dateUndecided && !/^\d{4}-\d{2}-\d{2}$/.test(details.eventDate)) {
    ctx.addIssue({ code: "custom", path: ["eventDate"], message: "Choose a date or select ‘Not sure yet’." });
  }
  if (details.fulfillment !== "pickup" && details.venueAddress.length < 5) {
    ctx.addIssue({ code: "custom", path: ["venueAddress"], message: "A venue address is needed to estimate delivery." });
  }
});

export const saveEstimateSchema = z.object({
  cart: cartSchema,
  details: detailsBaseSchema.partial().and(detailsBaseSchema.pick({ name: true, email: true })),
  resumeToken: z.string().min(20).max(200).optional(),
});

export const scheduleSchema = z.object({
  cart: cartSchema,
  details: detailsSchema,
  slotStart: z.string().datetime(),
  resumeToken: z.string().min(20).max(200).optional(),
});

export const consultationSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(320),
  eventDate: z.string().max(10),
  dateUndecided: z.boolean(),
  venueName: z.string().trim().max(160),
  notes: z.string().trim().max(3000),
  slotStart: z.string().datetime(),
});
