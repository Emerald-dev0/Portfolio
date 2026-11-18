import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { site } from "../lib/config";
import { graph, personSchema, safeJsonLd, websiteSchema } from "../lib/seo";

/* Runtime Google Fonts, Bricolage Grotesque (display), Inter (body),
   JetBrains Mono (labels), Caveat (sticker handwriting). */
const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=Caveat:wght@500;600;700&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap";

export const metadata: Metadata = {
  // One origin for every canonical, OG and sitemap URL in the app.
  metadataBase: new URL(site.url),
  title: {
    default: "Emerald, Daniel Oluwadare · Full-Stack Developer",
    template: "%s · Emerald",
  },
  applicationName: site.name,
  description:
    "Daniel 'Emerald' Oluwadare, a backend developer in Ile-Ife, Nigeria. Builds developer tools and web apps, and writes about architecture decisions and shipping in public.",
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  publisher: site.name,
  keywords: [
    "Daniel Oluwadare",
    "Emerald",
    "backend developer Nigeria",
    "Next.js developer",
    "TypeScript",
    "PostgreSQL",
    "full stack developer Ile-Ife",
    "developer tools",
  ],
  category: "technology",
  openGraph: {
    title: "Emerald, Daniel Oluwadare · Computer Science Student",
    description:
      "Computer Science student building developer-first tools and web apps. Calder, Intake, TestFlow, ORREI, and more on the wall.",
    url: site.url,
    siteName: "Emerald",
    locale: "en_NG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Emerald, Daniel Oluwadare · Computer Science Student",
    description:
      "Computer Science student and backend developer shipping products in public.",
  },
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": [{ url: "/feed.xml", title: "Emerald's blog" }],
    },
  },
  /**
   * Icons and manifest are file conventions in app/, so Next emits the tags
   * itself. Listing them here as well would duplicate every one of them.
   */
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  verification: {
    // Fill these in once the domain is live and the console accounts exist.
    // Empty values emit no tag, so this is safe to leave as is.
    google: process.env.GOOGLE_SITE_VERIFICATION,
    other: process.env.BING_SITE_VERIFICATION
      ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION }
      : undefined,
  },
};

/* Set the theme before first paint so dark mode never flashes. */
const themeScript = `(function(){try{var t=localStorage.getItem("emerald-theme");if(t){document.documentElement.dataset.theme=t;}}catch(e){}})();`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={FONT_URL} />
        {/* Album art for the now playing band, hinted late so it never delays fonts. */}
        <link rel="dns-prefetch" href="https://i.scdn.co" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: safeJsonLd(graph(personSchema(), websiteSchema())),
          }}
        />
      </head>
      <body className="bg-paper font-sans text-ink antialiased">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
