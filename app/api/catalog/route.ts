import { getPublicCatalog } from "@/lib/estimator/data";

export async function GET() {
  try {
    return Response.json({ products: await getPublicCatalog() });
  } catch {
    return Response.json({ error: "The catalog is taking a moment to load." }, { status: 500 });
  }
}
