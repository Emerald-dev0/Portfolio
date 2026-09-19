import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Daniel Oluwadare (Emerald) | Software Engineer",
  description:
    "Daniel Oluwadare is a software engineer building AI developer infrastructure and production web applications. Full-stack work in TypeScript, React and Node, with projects pulled live from GitHub.",
  metadataBase: new URL("https://danieloluwadare.dev"),
  openGraph: {
    title: "Daniel Oluwadare (Emerald) | Software Engineer",
    description:
      "Full-stack by trade. Backend by circumstance. AI developer infrastructure, production web applications, and tools developers actually enjoy using.",
    type: "website",
  },
  robots: { index: true, follow: true },
};

/**
 * Fonts are loaded at runtime via Google Fonts <link> (not next/font) so the
 * hand-drawn marker + pen faces render in the visitor's browser regardless of
 * build-time network. CSS variables in globals.css map to these families.
 */
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Permanent+Marker&family=Caveat:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="paper-grain relative antialiased">{children}</body>
    </html>
  );
}
