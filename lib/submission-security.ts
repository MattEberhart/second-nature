import "server-only";

import { createHash, createHmac } from "node:crypto";
import { getAdminSupabase } from "@/lib/supabase/admin";

export class SubmissionRateLimitError extends Error {
  status = 429;

  constructor() {
    super("Too many attempts. Please wait a few minutes and try again.");
  }
}

function requestFingerprint(request: Request) {
  const ip =
    request.headers.get("x-vercel-forwarded-for") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";
  const value = `${ip}|${userAgent.slice(0, 240)}`;
  const secret = process.env.APP_ENCRYPTION_KEY;
  return secret
    ? createHmac("sha256", secret).update(value).digest("hex")
    : createHash("sha256").update(value).digest("hex");
}

export async function enforceSubmissionRateLimit(
  request: Request,
  scope: string,
  options: { limit?: number; windowSeconds?: number } = {},
) {
  const { data, error } = await getAdminSupabase().rpc(
    "claim_submission_attempt",
    {
      p_scope: scope,
      p_request_key: requestFingerprint(request),
      p_limit: options.limit ?? 8,
      p_window_seconds: options.windowSeconds ?? 900,
    },
  );
  if (error) throw error;
  if (data !== true) throw new SubmissionRateLimitError();
}

export function isHoneypotFilled(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}
