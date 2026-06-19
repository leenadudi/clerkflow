import { headers } from 'next/headers'

export async function isDemoRequest(): Promise<boolean> {
  try {
    const h = await headers()
    return h.get('x-clerkflow-demo') === '1'
  } catch {
    return false
  }
}
