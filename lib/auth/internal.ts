import { NextRequest } from "next/server";

export function assertInternalAccess(request: NextRequest): boolean {
  const secret = process.env.INTERNAL_SECRET;
  if (!secret) return true;

  const header = request.headers.get("x-internal-secret");
  const urlSecret = new URL(request.url).searchParams.get("secret");
  return header === secret || urlSecret === secret;
}
