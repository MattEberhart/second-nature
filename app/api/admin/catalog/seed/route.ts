import { requireAdmin } from "@/lib/admin-auth";
import { revalidatePublicCatalog } from "@/lib/estimator/revalidate";
import { seedLaunchCatalog } from "@/lib/estimator/data";

export async function POST() {
  try {
    await requireAdmin();
    await seedLaunchCatalog();
    revalidatePublicCatalog();
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Could not load the catalog." }, { status: 401 });
  }
}
