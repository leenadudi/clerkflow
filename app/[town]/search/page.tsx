import { PageShell } from "@/components/page-shell";

type Props = { params: Promise<{ town: string }> };

export default async function TownSearchPage({ params }: Props) {
  const { town } = await params;
  return <PageShell variant="resident" title={`${town} — search`} description="Search published town documents." />;
}
