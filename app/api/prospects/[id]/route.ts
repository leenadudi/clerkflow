import { NextRequest, NextResponse } from "next/server";
import { assertInternalAccess } from "@/lib/auth/internal";
import { updateProspectStatus } from "@/lib/prospects/storage";
import type { ProspectStatus } from "@/lib/prospects/types";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  if (!assertInternalAccess(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = (await request.json()) as { status?: ProspectStatus };
  if (!body.status) {
    return NextResponse.json({ error: "status required" }, { status: 400 });
  }

  const updated = await updateProspectStatus(id, body.status);
  if (!updated) {
    return NextResponse.json({ error: "Prospect not found" }, { status: 404 });
  }

  return NextResponse.json({ prospect: updated });
}
