import { NextRequest, NextResponse } from "next/server";
import { assertInternalAccess } from "@/lib/auth/internal";
import { listNotContacted, updateProspectStatus } from "@/lib/prospects/storage";
import { sendDemoRequestEmail } from "@/lib/email/send";

export async function POST(request: NextRequest) {
  if (!assertInternalAccess(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const prospects = await listNotContacted();
  const results: Array<{ id: string; email: string; ok: boolean; mode?: string; error?: string }> = [];

  for (const prospect of prospects) {
    const send = await sendDemoRequestEmail(prospect);
    if (send.ok) {
      await updateProspectStatus(prospect.id, "contacted", new Date().toISOString());
    }
    results.push({
      id: prospect.id,
      email: prospect.email,
      ok: send.ok,
      mode: send.mode,
      error: send.error,
    });
  }

  return NextResponse.json({
    attempted: results.length,
    sent: results.filter((r) => r.ok).length,
    results,
  });
}
