import { listAvailability } from "@/lib/estimator/calendar";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return Response.json({ slots: await listAvailability() });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Availability could not be loaded." },
      { status: 500 },
    );
  }
}
