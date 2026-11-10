import "server-only";
import { revalidatePath } from "next/cache";

/**
 * The public estimate and collection pages are prerendered (they use no
 * request-time APIs), so their HTML is a snapshot of the catalog. Call this
 * after any admin write to products, variants or collections so Lydia's edits
 * show up without a redeploy.
 */
export function revalidatePublicCatalog() {
  revalidatePath("/gatherings", "layout");
  revalidatePath("/estimate/[token]", "page");
}
