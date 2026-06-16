export type RouteGroup = "marketing" | "app" | "resident";

export type RouteEntry = {
  path: string;
  label: string;
  group: RouteGroup;
};

export const routes: RouteEntry[] = [
  { path: "/", label: "Home", group: "marketing" },
  { path: "/product", label: "Product", group: "marketing" },
  { path: "/for-small-towns", label: "For small towns", group: "marketing" },
  { path: "/pricing", label: "Pricing", group: "marketing" },
  { path: "/about", label: "About", group: "marketing" },
  { path: "/contact", label: "Contact", group: "marketing" },
  { path: "/privacy", label: "Privacy", group: "marketing" },
  { path: "/terms", label: "Terms", group: "marketing" },

  { path: "/app", label: "Command center", group: "app" },
  { path: "/app/login", label: "Login", group: "app" },
  { path: "/app/onboarding", label: "Onboarding", group: "app" },
  { path: "/app/settings", label: "Settings", group: "app" },
  { path: "/app/meetings", label: "Meetings", group: "app" },
  { path: "/app/meetings/demo-meeting", label: "Meeting detail", group: "app" },
  { path: "/app/foia", label: "FOIA", group: "app" },
  { path: "/app/foia/demo-request", label: "FOIA detail", group: "app" },
  { path: "/app/publish", label: "Publish", group: "app" },
  { path: "/app/services", label: "Services", group: "app" },
  { path: "/app/services/demo-form", label: "Form detail", group: "app" },
  { path: "/app/boards", label: "Boards", group: "app" },
  { path: "/app/boards/demo-board", label: "Board detail", group: "app" },
  { path: "/app/residents", label: "Residents", group: "app" },
  { path: "/app/finance", label: "Finance", group: "app" },
  { path: "/app/import", label: "Import", group: "app" },
  { path: "/app/reports", label: "Reports", group: "app" },
  { path: "/app/handoff", label: "Handoff", group: "app" },
  { path: "/app/compliance", label: "Compliance", group: "app" },

  { path: "/riverside-oh", label: "Town home", group: "resident" },
  { path: "/riverside-oh/meetings", label: "Town meetings", group: "resident" },
  { path: "/riverside-oh/meetings/demo-meeting", label: "Town meeting detail", group: "resident" },
  { path: "/riverside-oh/apply", label: "Apply", group: "resident" },
  { path: "/riverside-oh/track", label: "Track request", group: "resident" },
  { path: "/riverside-oh/foia", label: "FOIA submit", group: "resident" },
  { path: "/riverside-oh/pay", label: "Pay", group: "resident" },
  { path: "/riverside-oh/search", label: "Search", group: "resident" },
  { path: "/riverside-oh/ask", label: "Ask", group: "resident" },
];

export const groupLabels: Record<RouteGroup, string> = {
  marketing: "Marketing",
  app: "Clerk app",
  resident: "Resident hub (demo: riverside-oh)",
};
