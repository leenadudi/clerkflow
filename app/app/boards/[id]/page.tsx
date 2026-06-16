import { PageShell } from "@/components/page-shell";

type Props = { params: Promise<{ id: string }> };

export default async function AppBoardDetailPage({ params }: Props) {
  const { id } = await params;
  return <PageShell title={`Board: ${id}`} description="Members, terms, and meetings." />;
}
