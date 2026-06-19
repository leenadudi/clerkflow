import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function GET() {
  const cookieStore = await cookies()
  cookieStore.set('clerkflow-demo', '1', {
    path: '/',
    maxAge: 60 * 60 * 4,
    sameSite: 'lax',
    httpOnly: true,
  })
  redirect('/app')
}
