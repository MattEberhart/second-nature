import { requireAdmin } from "@/lib/admin-auth";
import { seedLaunchCatalog } from "@/lib/estimator/data";

export async function POST() {
  try {
    await requireAdmin();
    await seedLaunchCatalog();
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Could not load the catalog." }, { status: 401 });
  }
}
