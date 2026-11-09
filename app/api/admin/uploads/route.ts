import { requireAdmin } from "@/lib/admin-auth";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const allowedKinds = new Set(["item", "variant", "collection-header", "collection-gallery"]);

type CloudflareImageResponse = {
  success: boolean;
  result?: { id?: string; variants?: string[] };
  errors?: Array<{ message?: string }>;
};

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const form = await request.formData();
    const file = form.get("file");
    const requestedKind = form.get("kind");
    const kind = typeof requestedKind === "string" && allowedKinds.has(requestedKind) ? requestedKind : "item";
    const requestedLabel = form.get("label");
    const label = typeof requestedLabel === "string" ? requestedLabel.trim().slice(0, 160) : "";
    if (!(file instanceof File)) throw new Error("Choose an image to upload.");
    if (!allowedTypes.has(file.type)) throw new Error("Use a JPG, PNG, WebP, or AVIF image.");
    if (file.size > 10 * 1024 * 1024) throw new Error("Images must be 10 MB or smaller.");

    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_IMAGES_API_TOKEN;
    if (!accountId || !apiToken) throw new Error("Cloudflare Images is not configured yet.");

    const upload = new FormData();
    upload.set("file", file, file.name);
    upload.set("id", `second-nature/${kind}/${new Date().toISOString().slice(0, 7)}/${crypto.randomUUID()}`);
    upload.set("creator", "second-nature");
    upload.set("requireSignedURLs", "false");
    upload.set("metadata", JSON.stringify({ project: "second-nature", kind, label, originalFilename: file.name.slice(0, 255) }));

    const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiToken}` },
      body: upload,
    });
    const payload = (await response.json()) as CloudflareImageResponse;
    if (!response.ok || !payload.success) {
      throw new Error(payload.errors?.[0]?.message || "Cloudflare could not accept that image.");
    }
    const variants = payload.result?.variants ?? [];
    const path = variants.find((url) => url.endsWith("/public")) ?? variants[0];
    if (!path) throw new Error("Cloudflare uploaded the image but did not return a delivery URL.");
    return Response.json({ path, imageId: payload.result?.id }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Image could not be uploaded." }, { status: 400 });
  }
}
