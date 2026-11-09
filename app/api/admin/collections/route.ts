import { requireAdmin } from "@/lib/admin-auth";
import { curatedCollectionSchema } from "@/lib/estimator/admin-schemas";
import { saveCuratedCollection } from "@/lib/estimator/collections";

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const input = curatedCollectionSchema.parse(await request.json());
    const id = await saveCuratedCollection(null, input);
    return Response.json({ id }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Collection could not be created." }, { status: 400 });
  }
}
