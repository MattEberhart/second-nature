import { z } from "zod";
import { calculateDelivery } from "@/lib/estimator/delivery";

const inputSchema = z.object({
  address: z.string().trim().min(5).max(300),
  fulfillment: z.enum(["delivery", "full-service"]),
});

export async function POST(request: Request) {
  const parsed = inputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Enter a complete venue address." }, { status: 400 });
  try {
    return Response.json(await calculateDelivery(parsed.data.address, parsed.data.fulfillment));
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Delivery could not be calculated." },
      { status: 422 },
    );
  }
}
