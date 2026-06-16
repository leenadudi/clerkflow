import { MarketingPageLayout } from '@/components/marketing/page-layout'

const SECTIONS = [
  {
    title: 'Overview',
    body: 'Clerkflow ("we," "us," or "our") provides cloud-based software for municipal clerks and local government staff. This privacy policy explains how we collect, use, and protect information when you use clerkflow.software and related services.',
  },
  {
    title: 'Information we collect',
    body: 'We collect information you provide directly — such as your name, email, town name, and role when you request a demo or create an account. For towns using Clerkflow, we also store operational data entered by staff: FOIA requests, meeting records, board appointments, and resident submissions through the public hub.',
  },
  {
    title: 'How we use information',
    body: 'We use your information to provide and improve Clerkflow, respond to support requests, send product updates relevant to your account, and comply with legal obligations. We do not sell town data or clerk information to third parties.',
  },
  {
    title: 'Resident hub data',
    body: 'When residents submit FOIA requests, permit applications, or other forms through your town\'s public hub, that data is stored on your behalf as the municipality\'s data processor. Your town controls retention and release of public records in accordance with applicable law.',
  },
  {
    title: 'Data security',
    body: 'Clerkflow uses encrypted connections (TLS) for all data in transit and encrypts data at rest. Access to town data is restricted by role-based permissions configured by your organization\'s administrators.',
  },
  {
    title: 'Data retention',
    body: 'We retain account data for as long as your subscription is active. Upon cancellation, we provide a data export window and delete tenant data within 90 days unless a longer retention period is required by law or requested in writing.',
  },
  {
    title: 'Third-party services',
    body: 'We use infrastructure providers (such as cloud hosting and email delivery) to operate Clerkflow. These providers process data on our behalf under contractual data protection obligations and do not use town data for their own purposes.',
  },
  {
    title: 'Your rights',
    body: 'You may request access to, correction of, or deletion of personal information we hold about you by contacting hello@clerkflow.software. Town administrators can export operational data at any time from the Settings page.',
  },
  {
    title: 'Changes to this policy',
    body: 'We may update this policy from time to time. We will notify account administrators of material changes via email or in-app notice. Continued use of Clerkflow after changes constitutes acceptance of the updated policy.',
  },
  {
    title: 'Contact',
    body: 'Questions about this privacy policy? Email us at hello@clerkflow.software.',
  },
]

export default function PrivacyPage() {
  return (
    <MarketingPageLayout className="max-w-3xl">
      <div>
        <p className="text-sm text-muted-foreground">Last updated: June 2026</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
          Privacy policy
        </h1>
        <p className="mt-3 text-muted-foreground">
          How Clerkflow handles data for clerks, staff, and residents.
        </p>
      </div>

      <div className="mt-10 flex flex-col gap-8">
        {SECTIONS.map((section) => (
          <section key={section.title}>
            <h2 className="text-lg font-semibold text-foreground">
              {section.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {section.body}
            </p>
          </section>
        ))}
      </div>
    </MarketingPageLayout>
  )
}
