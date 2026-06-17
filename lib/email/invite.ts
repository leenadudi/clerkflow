type InviteEmailParams = {
  to: string
  inviterName: string
  townName: string
  role: string
  inviteUrl: string
  expiresAt: Date
}

function roleLabel(role: string) {
  return role === 'admin' ? 'Town Admin' : 'Staff Member'
}

function buildInviteEmail(params: InviteEmailParams) {
  const { inviterName, townName, role, inviteUrl, expiresAt } = params
  const label = roleLabel(role)
  const expiry = expiresAt.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  const subject = `${inviterName} invited you to join ${townName} on ClerkFlow`

  const text = `
You've been invited to join ${townName} on ClerkFlow as a ${label}.

Invited by: ${inviterName}
Town: ${townName}
Role: ${label}

Accept your invitation (expires ${expiry}):
${inviteUrl}

If you weren't expecting this, you can safely ignore it.
`.trim()

  const html = `<!DOCTYPE html>
<html>
<body style="font-family: system-ui, sans-serif; max-width: 520px; margin: 40px auto; color: #1B2B4B;">
  <p style="font-size: 15px; color: #555;">You've been invited to join</p>
  <h1 style="margin: 4px 0 0; font-size: 24px;">${townName}</h1>
  <p style="color: #555;">on <strong>ClerkFlow</strong> as a <strong>${label}</strong></p>
  <p style="color: #555;">Invited by <strong>${inviterName}</strong></p>
  <a href="${inviteUrl}"
     style="display: inline-block; margin: 24px 0; padding: 12px 24px;
            background: #1B2B4B; color: #fff; border-radius: 8px;
            text-decoration: none; font-weight: 600;">
    Accept Invitation
  </a>
  <p style="font-size: 13px; color: #888;">This invite expires on ${expiry}. If you weren't expecting this, ignore it.</p>
</body>
</html>`

  return { subject, text, html }
}

export async function sendInviteEmail(params: InviteEmailParams) {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.FROM_EMAIL ?? 'leena@clerkflow.software'
  const { subject, text, html } = buildInviteEmail(params)

  if (!apiKey) {
    console.log('[dry_run] Invite email', { to: params.to, subject, inviteUrl: params.inviteUrl })
    return { ok: true, mode: 'dry_run' as const }
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `ClerkFlow <${from}>`,
      to: [params.to],
      subject,
      text,
      html,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    return { ok: false, mode: 'resend' as const, error }
  }

  const data = (await response.json()) as { id?: string }
  return { ok: true, mode: 'resend' as const, messageId: data.id }
}
