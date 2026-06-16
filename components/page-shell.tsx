import { SiteNav } from "@/components/site-nav";

type PageShellProps = {
  title: string;
  description?: string;
  children?: React.ReactNode;
};

export function PageShell({ title, description, children }: PageShellProps) {
  return (
    <>
      <SiteNav />
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "2rem 1.5rem" }}>
        <p style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b" }}>
          Placeholder page
        </p>
        <h1 style={{ margin: "0.25rem 0 0.5rem", fontSize: "1.75rem" }}>{title}</h1>
        {description ? <p style={{ color: "#475569" }}>{description}</p> : null}
        {children}
      </main>
    </>
  );
}
