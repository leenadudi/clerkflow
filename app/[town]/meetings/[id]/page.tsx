import { PageShell } from "@/components/page-shell";

type Props = { params: Promise<{ town: string; id: string }> };

export default async function TownMeetingDetailPage({ params }: Props) {
  const { town, id } = await params;
  return <PageShell title={`${town} — meeting ${id}`} description="Published agenda and minutes." />;
}
