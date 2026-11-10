import "server-only";
import { defaultDelivery, getSetting } from "./settings";
import { PLACE_ID_PATTERN } from "./places";
import type { DeliveryEstimate, FulfillmentType } from "./types";

/**
 * Server-side delivery quote. When the customer picked an autocomplete
 * suggestion, `placeId` routes to that exact place; otherwise the free-text
 * address is geocoded by the Routes API itself.
 */
export async function calculateDelivery(
  destination: string,
  fulfillment: FulfillmentType,
  placeId?: string | null,
): Promise<DeliveryEstimate> {
  if (fulfillment === "pickup") {
    return { distanceMilesOneWay: 0, distanceMilesRoundTrip: 0, deliveryFeeCents: 0, fullServiceFeeCents: 0 };
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const origin = process.env.DELIVERY_ORIGIN_ADDRESS;
  if (!apiKey || !origin) throw new Error("Delivery estimates are not configured yet.");

  const response = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "routes.distanceMeters",
    },
    body: JSON.stringify({
      origin: { address: origin },
      destination:
        placeId && PLACE_ID_PATTERN.test(placeId) ? { placeId } : { address: destination },
      travelMode: "DRIVE",
      routingPreference: "TRAFFIC_UNAWARE",
      units: "IMPERIAL",
    }),
  });
  if (!response.ok) throw new Error("We could not calculate that delivery route.");
  const payload = (await response.json()) as { routes?: Array<{ distanceMeters?: number }> };
  const meters = payload.routes?.[0]?.distanceMeters;
  if (!meters) throw new Error("We could not find a driving route to that address.");

  const settings = await getSetting("delivery", defaultDelivery);
  const oneWay = meters / 1609.344;
  const roundTrip = oneWay * 2;
  const deliveryFeeCents = Math.round(
    settings.baseFeeCents + roundTrip * settings.roundTripPerMileCents,
  );

  return {
    distanceMilesOneWay: Math.round(oneWay * 10) / 10,
    distanceMilesRoundTrip: Math.round(roundTrip * 10) / 10,
    deliveryFeeCents,
    fullServiceFeeCents:
      fulfillment === "full-service" ? settings.fullServiceStartingFeeCents : 0,
  };
}
