import { PageShell } from "@/components/page-shell";

type Props = { params: Promise<{ town: string }> };

export default async function TownHomePage({ params }: Props) {
  const { town } = await params;
  return (
    <PageShell
      title={town.replace(/-/g, " ")}
      description="Resident hub — pay, apply, track, search, and view public meetings."
    />
  );
}
