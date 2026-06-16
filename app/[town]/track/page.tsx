import { PageShell } from "@/components/page-shell";

type Props = { params: Promise<{ town: string }> };

export default async function TownTrackPage({ params }: Props) {
  const { town } = await params;
  return <PageShell title={`${town} — track`} description="Track FOIA or application status." />;
}
