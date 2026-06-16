import { buildDemoRequestEmail } from "./demo-request";
import type { Prospect } from "@/lib/prospects/types";

type SendResult = {
  ok: boolean;
  mode: "resend" | "dry_run";
  messageId?: string;
  error?: string;
};

export async function sendDemoRequestEmail(prospect: Prospect): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.FROM_EMAIL ?? "leena@clerkflow.software";
  const { subject, text, html } = buildDemoRequestEmail(prospect);

  if (!apiKey) {
    console.log("[dry_run] Demo email", {
      to: prospect.email,
      from,
      subject,
      text,
    });
    return {
      ok: true,
      mode: "dry_run",
      messageId: `dry-run-${prospect.id}-${Date.now()}`,
    };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `Leena at Clerkflow <${from}>`,
      to: [prospect.email],
      subject,
      text,
      html,
      reply_to: from,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    return { ok: false, mode: "resend", error };
  }

  const data = (await response.json()) as { id?: string };
  return { ok: true, mode: "resend", messageId: data.id };
}
