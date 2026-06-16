import { PageShell } from "@/components/page-shell";

type Props = { params: Promise<{ town: string }> };

export default async function TownFoiaPage({ params }: Props) {
  const { town } = await params;
  return <PageShell title={`${town} — FOIA`} description="Submit a public records request." />;
}
