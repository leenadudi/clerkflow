import Link from "next/link";
import { groupLabels, routes, type RouteGroup } from "@/lib/routes";

const groups: RouteGroup[] = ["marketing", "app", "resident"];

export function SiteNav() {
  return (
    <nav
      style={{
        background: "#1e3a5f",
        color: "#fff",
        padding: "1rem 1.5rem",
        fontSize: "0.875rem",
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: "0.75rem" }}>Clerkflow — route map (dev)</div>
      {groups.map((group) => (
        <div key={group} style={{ marginBottom: "0.75rem" }}>
          <div style={{ opacity: 0.85, marginBottom: "0.25rem" }}>{groupLabels[group]}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem 1rem" }}>
            {routes
              .filter((r) => r.group === group)
              .map((route) => (
                <Link key={route.path} href={route.path} style={{ color: "#dbeafe" }}>
                  {route.label}
                </Link>
              ))}
          </div>
        </div>
      ))}
    </nav>
  );
}
