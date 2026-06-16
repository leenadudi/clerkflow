import { NextRequest, NextResponse } from "next/server";
import { assertInternalAccess } from "@/lib/auth/internal";
import { getProspect, updateProspectStatus } from "@/lib/prospects/storage";
import { sendDemoRequestEmail } from "@/lib/email/send";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
  if (!assertInternalAccess(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const prospect = await getProspect(id);
  if (!prospect) {
    return NextResponse.json({ error: "Prospect not found" }, { status: 404 });
  }

  const result = await sendDemoRequestEmail(prospect);
  if (!result.ok) {
    return NextResponse.json({ error: result.error ?? "Send failed" }, { status: 502 });
  }

  const updated = await updateProspectStatus(id, "contacted", new Date().toISOString());
  return NextResponse.json({ prospect: updated, send: result });
}
