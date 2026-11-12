export type CatalogCategory =
  | "table-linens"
  | "napkins"
  | "chargers"
  | "plates"
  | "flatware"
  | "glasses"
  | "custom-details";

export type CatalogVariant = {
  id: string;
  label: string;
  size: string | null;
  color: string | null;
  imagePath: string | null;
  unitPriceCents: number;
};

export type CatalogProduct = {
  id: string;
  publicName: string;
  category: CatalogCategory;
  material: string;
  description: string;
  imagePath: string;
  variants: CatalogVariant[];
};

export type CuratedCollectionImage = {
  id: string;
  imagePath: string;
  altText: string;
};

export type CuratedCollection = {
  id: string;
  slug: string;
  name: string;
  description: string;
  headerImagePath: string | null;
  images: CuratedCollectionImage[];
  products: CatalogProduct[];
};

export type CartLine = {
  variantId: string;
  quantity: number;
};

export type FulfillmentType = "pickup" | "delivery" | "full-service";

export type EstimateDetails = {
  name: string;
  email: string;
  phone: string;
  eventDate: string;
  dateUndecided: boolean;
  guestCount: string;
  venueName: string;
  venueAddress: string;
  fulfillment: FulfillmentType;
  notes: string;
  communicationsConsent: boolean;
  marketingConsent: boolean;
};

export type DeliveryEstimate = {
  distanceMilesOneWay: number;
  distanceMilesRoundTrip: number;
  deliveryFeeCents: number;
  fullServiceFeeCents: number;
};

/** One venue-address suggestion from `/api/places/autocomplete`. */
export type AddressSuggestion = {
  placeId: string;
  /** Full single-line text, stored as the venue address when picked. */
  text: string;
  mainText: string;
  secondaryText: string;
  /** True for named places (venues, hotels, parks) rather than bare street addresses. */
  isEstablishment: boolean;
};

export type AvailabilitySlot = {
  start: string;
  end: string;
};

export type EstimateSummary = {
  id: string;
  resumeToken: string;
  resumeUrl: string;
};
