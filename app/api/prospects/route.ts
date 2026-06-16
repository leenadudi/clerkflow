import { NextRequest, NextResponse } from "next/server";
import { assertInternalAccess } from "@/lib/auth/internal";
import { createProspect, listProspects } from "@/lib/prospects/storage";
import type { CreateProspectInput } from "@/lib/prospects/types";

export async function GET(request: NextRequest) {
  if (!assertInternalAccess(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const prospects = await listProspects();
  return NextResponse.json({ prospects });
}

export async function POST(request: NextRequest) {
  if (!assertInternalAccess(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as CreateProspectInput;
  if (!body.townName || !body.state || !body.clerkName || !body.email) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const prospect = await createProspect(body);
  return NextResponse.json({ prospect }, { status: 201 });
}
