import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { acceptInvitation, getInvitationByToken } from '@/lib/server/team'

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const invitation = await getInvitationByToken(token)

  if (!invitation) {
    return <InviteShell title="Invalid invitation" body="This invite link is invalid or has expired." />
  }

  if (invitation.acceptedAt) {
    return <InviteShell title="Already accepted" body="This invitation has already been used." />
  }

  if (invitation.expiresAt < new Date()) {
    return <InviteShell title="Invitation expired" body="This invitation has expired. Ask your admin to send a new one." />
  }

  const { userId } = await auth()
  const roleLabel = invitation.role === 'admin' ? 'Town Admin' : 'Staff Member'

  if (!userId) {
    const signInUrl = `/app/login?redirect_url=${encodeURIComponent(`/invite/${token}`)}`
    return (
      <InviteShell
        title={`Join ${invitation.town.name}`}
        body={`${invitation.createdBy?.name ?? 'Someone'} invited you to join ${invitation.town.name} on ClerkFlow as a ${roleLabel}.`}
      >
        <a
          href={signInUrl}
          className="mt-6 inline-block rounded-lg bg-[#1B2B4B] px-6 py-3 text-sm font-semibold text-white hover:opacity-90"
        >
          Sign in to accept
        </a>
      </InviteShell>
    )
  }

  // User is authenticated — accept on form submit
  async function accept() {
    'use server'
    const clerkUser = await currentUser()
    if (!clerkUser) redirect(`/app/login?redirect_url=${encodeURIComponent(`/invite/${token}`)}`)

    const name =
      [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') ||
      clerkUser.emailAddresses[0]?.emailAddress ||
      'Unknown'
    const email =
      clerkUser.primaryEmailAddress?.emailAddress ||
      clerkUser.emailAddresses[0]?.emailAddress ||
      ''

    try {
      await acceptInvitation(token, clerkUser.id, name, email)
    } catch (e) {
      if (e instanceof Error && e.message === 'ALREADY_MEMBER') {
        redirect('/app')
      }
      throw e
    }
    redirect('/app')
  }

  return (
    <InviteShell
      title={`Join ${invitation.town.name}`}
      body={`${invitation.createdBy?.name ?? 'Someone'} invited you to join ${invitation.town.name} as a ${roleLabel}.`}
    >
      <form action={accept}>
        <button
          type="submit"
          className="mt-6 rounded-lg bg-[#1B2B4B] px-6 py-3 text-sm font-semibold text-white hover:opacity-90"
        >
          Accept invitation
        </button>
      </form>
    </InviteShell>
  )
}

function InviteShell({
  title,
  body,
  children,
}: {
  title: string
  body: string
  children?: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-2 text-2xl font-bold text-[#1B2B4B]">ClerkFlow</div>
        <h1 className="mt-6 text-xl font-semibold text-gray-900">{title}</h1>
        <p className="mt-2 text-sm text-gray-600">{body}</p>
        {children}
      </div>
    </div>
  )
}
