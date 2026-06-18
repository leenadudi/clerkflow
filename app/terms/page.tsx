import { MarketingPageLayout } from '@/components/marketing/page-layout'

const SECTIONS = [
  {
    title: 'Agreement',
    body: 'By accessing or using Clerkflow ("Service"), you agree to these Terms of Service. If you are using Clerkflow on behalf of a municipality, you represent that you have authority to bind that organization to these terms.',
  },
  {
    title: 'The service',
    body: 'Clerkflow provides cloud-based software for municipal clerks, including tools for meetings, public records management, forms, boards, and a public resident hub. We may update features over time and will provide reasonable notice of material changes that affect your workflow.',
  },
  {
    title: 'Accounts and access',
    body: 'You are responsible for maintaining the confidentiality of account credentials and for all activity under your account. Town administrators control staff access through role-based permissions. Notify us immediately at hello@clerkflow.software if you suspect unauthorized access.',
  },
  {
    title: 'Acceptable use',
    body: 'You agree to use Clerkflow only for lawful municipal purposes. You may not attempt to access other towns\' data, reverse engineer the Service, or use Clerkflow to store or transmit malicious content. We reserve the right to suspend accounts that violate these terms.',
  },
  {
    title: 'Your data',
    body: 'You retain ownership of all data you enter into Clerkflow. We process your data solely to provide the Service. You grant us a limited license to host, back up, and display your data as necessary to operate Clerkflow on your behalf.',
  },
  {
    title: 'Public records responsibility',
    body: 'Clerkflow provides tools to help manage public records workflows. Your municipality remains solely responsible for compliance with applicable public records laws, including FOIA deadlines, redactions, and releases. Clerkflow does not provide legal advice.',
  },
  {
    title: 'Subscription and billing',
    body: 'We reserve the right to introduce pricing in the future with at least 30 days\' notice to existing users before any change takes effect.',
  },
  {
    title: 'Availability',
    body: 'We target 99.9% uptime for the Service and perform maintenance during low-traffic windows when possible. We are not liable for downtime caused by factors outside our reasonable control, including internet outages or force majeure events.',
  },
  {
    title: 'Limitation of liability',
    body: 'To the maximum extent permitted by law, Clerkflow\'s total liability for any claim arising from the Service is limited to the fees you paid in the twelve months preceding the claim. We are not liable for indirect, incidental, or consequential damages.',
  },
  {
    title: 'Termination',
    body: 'Either party may terminate with 30 days\' written notice. Upon termination, you may export your data during a 30-day grace period. We will delete tenant data within 90 days of termination unless retention is required by law.',
  },
  {
    title: 'Governing law',
    body: 'These terms are governed by the laws of the State of Ohio, without regard to conflict of law principles. Disputes will be resolved in the state or federal courts located in Ohio.',
  },
  {
    title: 'Contact',
    body: 'Questions about these terms? Email hello@clerkflow.software.',
  },
]

export default function TermsPage() {
  return (
    <MarketingPageLayout className="max-w-3xl">
      <div>
        <p className="text-sm text-muted-foreground">Last updated: June 2026</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
          Terms of service
        </h1>
        <p className="mt-3 text-muted-foreground">
          Terms for using Clerkflow as a clerk, staff member, or municipality.
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
