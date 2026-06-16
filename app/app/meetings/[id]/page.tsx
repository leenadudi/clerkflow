import { PageShell } from "@/components/page-shell";

type Props = { params: Promise<{ id: string }> };

export default async function AppMeetingDetailPage({ params }: Props) {
  const { id } = await params;
  return <PageShell title={`Meeting: ${id}`} description="Agenda, minutes, publish, and action items." />;
}
