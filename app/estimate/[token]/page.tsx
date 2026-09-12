import type { Metadata } from "next";
import { EstimateBuilder } from "@/components/estimate/estimate-builder";
import { getPublicCatalog } from "@/lib/estimator/data";

export const metadata: Metadata = { title: "Continue Your Estimate | Second Nature" };

export default async function ResumeEstimatePage({ params }: { params: Promise<{ token: string }> }) {
  const [{ token }, products] = await Promise.all([params, getPublicCatalog()]);
  return <EstimateBuilder products={products} resumeToken={token} />;
}
