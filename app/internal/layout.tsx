import Link from "next/link";

export default function InternalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <header style={{ background: "#0f172a", color: "#fff", padding: "0.75rem 1.5rem", fontSize: "0.875rem" }}>
        <strong>Clerkflow Internal</strong>
        <span style={{ margin: "0 0.75rem", opacity: 0.5 }}>|</span>
        <Link href="/internal/prospects" style={{ color: "#93c5fd" }}>
          Prospects
        </Link>
        <span style={{ margin: "0 0.75rem", opacity: 0.5 }}>|</span>
        <Link href="/" style={{ color: "#93c5fd" }}>
          Public site
        </Link>
      </header>
      {children}
    </div>
  );
}
