import { type NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.json() as {
    name?: string
    role?: string
    town?: string
    state?: string
    email?: string
    population?: string
    preferredDate?: string
    preferredTime?: string
    message?: string
  }

  const { name, role, town, state, email, population, preferredDate, preferredTime, message } = body

  if (!name || !town || !email) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  if (!process.env.RESEND_API_KEY) {
    // No email configured — still return success so the UI works
    console.log('Contact form submission (no Resend key):', body)
    return NextResponse.json({ ok: true })
  }

  try {
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)

    const result = await resend.emails.send({
      from: 'noreply@clerkflow.software',
      to: 'leena.dudi12@gmail.com',
      replyTo: email,
      subject: `Walkthrough request — ${town}, ${state ?? ''}`.trim().replace(/,\s*$/, ''),
      text: [
        `Name: ${name}`,
        `Role: ${role || '—'}`,
        `Town: ${town}${state ? `, ${state}` : ''}`,
        `Email: ${email}`,
        `Population: ${population || '—'}`,
        `Preferred time: ${preferredDate ? `${preferredDate}${preferredTime ? ` at ${preferredTime}` : ''}` : '—'}`,
        '',
        message ? `Message:\n${message}` : 'No additional message.',
      ].join('\n'),
    })
    console.log('Resend result:', JSON.stringify(result))
  } catch (err) {
    console.error('Contact email failed:', err)
  }

  return NextResponse.json({ ok: true })
}
