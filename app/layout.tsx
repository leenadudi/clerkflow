import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Clerkflow",
  description: "The clerk operating system for towns under 5,000",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
