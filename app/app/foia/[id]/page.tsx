import { PageShell } from "@/components/page-shell";

type Props = { params: Promise<{ id: string }> };

export default async function AppFoiaDetailPage({ params }: Props) {
  const { id } = await params;
  return <PageShell title={`FOIA request: ${id}`} description="Correspondence, deadlines, and release." />;
}
