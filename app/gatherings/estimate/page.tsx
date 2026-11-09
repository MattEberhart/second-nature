import type { Metadata } from "next";
import { EstimateBuilder } from "@/components/estimate/estimate-builder";
import { getPublicCatalog } from "@/lib/estimator/data";

export const metadata: Metadata = {
  title: "Build Your Estimate | Second Nature",
  description: "Explore tabletop rentals, see starting prices, and book a personal review with our team.",
};

export default async function EstimatePage() {
  const products = await getPublicCatalog();
  return <EstimateBuilder products={products} />;
}
