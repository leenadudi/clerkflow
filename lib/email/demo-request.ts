import type { Prospect } from "@/lib/prospects/types";

export function buildDemoRequestEmail(prospect: Prospect) {
  const subject = `Quick question for ${prospect.townName}, ${prospect.state} — clerk workflow`;

  const text = `Hi ${prospect.clerkName},

I'm Leena, building Clerkflow — the clerk operating system designed specifically for small towns (meetings, FOIA, resident requests).

I'm talking with clerks in ${prospect.state} to learn what actually breaks in day-to-day work (spreadsheets, FOIA deadlines, publishing agendas, handoffs when someone retires).

Would you be open to a 15-minute call in the next couple weeks? No pitch deck — mostly listening.

Site: https://clerkflow.software

Thanks,
Leena
Clerkflow
leena@clerkflow.software`;

  const html = `<p>Hi ${prospect.clerkName},</p>
<p>I'm Leena, building <strong>Clerkflow</strong> — the clerk operating system designed specifically for small towns (meetings, FOIA, resident requests).</p>
<p>I'm talking with clerks in ${prospect.state} to learn what actually breaks in day-to-day work (spreadsheets, FOIA deadlines, publishing agendas, handoffs when someone retires).</p>
<p>Would you be open to a <strong>15-minute call</strong> in the next couple weeks? No pitch deck — mostly listening.</p>
<p><a href="https://clerkflow.software">clerkflow.software</a></p>
<p>Thanks,<br/>Leena<br/>Clerkflow<br/>leena@clerkflow.software</p>`;

  return { subject, text, html };
}
