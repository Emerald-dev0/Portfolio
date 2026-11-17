import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

/* Runtime Google Fonts, Bricolage Grotesque (display), Inter (body),
   JetBrains Mono (labels), Caveat (sticker handwriting). */
const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=Caveat:wght@500;600;700&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap";

export const metadata: Metadata = {
  metadataBase: new URL("https://dev-emerald-one.vercel.app"),
  title: {
    default: "Emerald, Daniel Oluwadare · Full-Stack Developer",
    template: "%s · Emerald",
  },
  description:
    "Daniel 'Emerald' Oluwadare is a Computer Science student and backend developer building developer tools, web apps, and writing about shipping in public.",
  openGraph: {
    title: "Emerald, Daniel Oluwadare · Computer Science Student",
    description:
      "Computer Science student building developer-first tools and web apps. Calder, Intake, TestFlow, ORREI, and more on the wall.",
    url: "https://dev-emerald-one.vercel.app",
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
    types: {
      "application/rss+xml": [{ url: "/feed.xml", title: "Emerald's blog" }],
    },
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
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
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
