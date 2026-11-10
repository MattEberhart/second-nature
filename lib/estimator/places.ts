import "server-only";
import type { AddressSuggestion } from "./types";

/** Google place IDs are URL-safe base64-ish strings. */
export const PLACE_ID_PATTERN = /^[A-Za-z0-9_-]{10,400}$/;

// Uptown Charlotte. Suggestions are biased (not restricted) to ~50 km around it.
const CHARLOTTE = { latitude: 35.2271, longitude: -80.8431 };

type AutocompleteResponse = {
  suggestions?: Array<{
    placePrediction?: {
      placeId?: string;
      text?: { text?: string };
      structuredFormat?: {
        mainText?: { text?: string };
        secondaryText?: { text?: string };
      };
      types?: string[];
    };
  }>;
};

/**
 * Places API (New) Autocomplete, proxied server-side so the Google key never
 * reaches the browser. `sessionToken` groups one typing session for billing.
 */
export async function autocompleteAddress(
  input: string,
  sessionToken: string,
): Promise<AddressSuggestion[]> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) throw new Error("Address suggestions are not configured yet.");

  const response = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask":
        "suggestions.placePrediction.placeId,suggestions.placePrediction.text.text,suggestions.placePrediction.structuredFormat,suggestions.placePrediction.types",
    },
    body: JSON.stringify({
      input,
      sessionToken,
      includedRegionCodes: ["us"],
      languageCode: "en",
      locationBias: { circle: { center: CHARLOTTE, radius: 50000 } },
    }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Address suggestions are unavailable right now.");

  const payload = (await response.json()) as AutocompleteResponse;
  return (payload.suggestions ?? []).flatMap(({ placePrediction: p }) => {
    if (!p?.placeId || !p.text?.text || !PLACE_ID_PATTERN.test(p.placeId)) return [];
    return [
      {
        placeId: p.placeId,
        text: p.text.text.replace(/, USA$/, ""),
        mainText: p.structuredFormat?.mainText?.text || p.text.text,
        secondaryText: (p.structuredFormat?.secondaryText?.text || "").replace(/, USA$/, ""),
        isEstablishment: Boolean(p.types?.includes("establishment")),
      },
    ];
  });
}
