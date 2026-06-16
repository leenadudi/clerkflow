import { PageShell } from "@/components/page-shell";

type Props = { params: Promise<{ town: string }> };

export default async function TownAskPage({ params }: Props) {
  const { town } = await params;
  return <PageShell title={`${town} — ask`} description="AI Q&A on published documents only." />;
}
