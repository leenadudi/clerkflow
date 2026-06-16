import { PageShell } from "@/components/page-shell";

type Props = { params: Promise<{ town: string }> };

export default async function TownMeetingsPage({ params }: Props) {
  const { town } = await params;
  return <PageShell variant="resident" title={`${town} — meetings`} description="Published agendas and minutes." />;
}
