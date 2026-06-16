import { PageShell } from "@/components/page-shell";

type Props = { params: Promise<{ formId: string }> };

export default async function AppServiceDetailPage({ params }: Props) {
  const { formId } = await params;
  return <PageShell title={`Form: ${formId}`} description="Form builder and submissions." />;
}
