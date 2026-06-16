import { PageShell } from "@/components/page-shell";

type Props = { params: Promise<{ town: string }> };

export default async function TownApplyPage({ params }: Props) {
  const { town } = await params;
  return <PageShell variant="resident" title={`${town} — apply`} description="Licenses, permits, and forms." />;
}
