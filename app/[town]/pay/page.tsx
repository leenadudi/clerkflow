import { PageShell } from "@/components/page-shell";

type Props = { params: Promise<{ town: string }> };

export default async function TownPayPage({ params }: Props) {
  const { town } = await params;
  return <PageShell title={`${town} — pay`} description="Pay fees and bills online." />;
}
