/**
 * ============================================================================
 * CONFIG, the single source of truth for every link on this site.
 * ============================================================================
 * Every social, email, and external URL lives here. Components read from this
 * file and never hard-code a URL, so swapping a handle is a one-line edit.
 *
 * Rules:
 *  - Only REAL handles/URLs go in `href`. Never invent one.
 *  - A social with `href: null` is a PLACEHOLDER: it stays in this file,
 *    clearly marked, and renders nowhere on the site until a real link is
 *    added. Add the URL and it appears automatically.
 *  - The content brand handle (@dev_boy09 / DevEmerald) is display-only, 
 *    no URL is constructed from it. Follow CTAs point at verified accounts.
 * ============================================================================
 */

/**
 * The canonical origin. Everything absolute is built from this: canonical tags,
 * the sitemap, the RSS feed, the JSON-LD, the share cards and the links in
 * share buttons.
 *
 * Set NEXT_PUBLIC_SITE_URL in the host's environment once the domain is
 * attached, and this file needs no edit. The literal below is the fallback, so
 * a preview deploy still produces correct, absolute URLs rather than relative
 * ones that break in a feed reader.
 */
const CANONICAL = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");

export const site = {
  name: "Daniel Oluwadare",
  persona: "Emerald",
  role: "Computer Science student",
  location: "Ile-Ife, Nigeria",
  url: CANONICAL || "https://oluwadaredaniel.me",
  email: "oluwadare458@gmail.com",
  github: "https://github.com/Emerald-dev0",
  githubHandle: "@Emerald-dev0",
  /** Content brand, shown in the Content section, never linked directly. */
  contentHandle: "@dev_boy09",
  contentName: "DevEmerald",
  availability: "Open for freelance work",
} as const;

export type Social = {
  id: string;
  label: string;
  /** Display handle, e.g. "@Emerald-dev0". Null for placeholders. */
  handle: string | null;
  /** Real URL, or null when this is a placeholder (renders nowhere). */
  href: string | null;
  /** True when this entry is a placeholder awaiting a real link. */
  placeholder?: boolean;
  /** What to do to activate it, shown in code comments only. */
  note?: string;
};

export const socials: Social[] = [
  {
    id: "github",
    label: "GitHub",
    handle: "@Emerald-dev0",
    href: "https://github.com/Emerald-dev0",
  },
  {
    id: "email",
    label: "Email",
    handle: "oluwadare458@gmail.com",
    href: "mailto:oluwadare458@gmail.com",
  },
  {
    id: "x",
    label: "X",
    handle: "@Dev_emeraldX",
    href: "https://x.com/Dev_emeraldX",
  },
  {
    id: "instagram",
    label: "Instagram",
    handle: "@emerald_dev1",
    href: "https://instagram.com/emerald_dev1",
  },
  {
    id: "tiktok",
    label: "TikTok",
    handle: "@emerald_dev1",
    href: "https://tiktok.com/@emerald_dev1",
  },
  /* ---- PLACEHOLDERS: add a real href and the link appears everywhere ---- */
  {
    id: "linkedin",
    label: "LinkedIn",
    handle: null,
    href: null,
    placeholder: true,
    note: "Add the real LinkedIn URL to activate.",
  },
  {
    id: "youtube",
    label: "YouTube",
    handle: null,
    href: null,
    placeholder: true,
    note: "Add the real YouTube channel URL to activate.",
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    handle: null,
    href: null,
    placeholder: true,
    note: "Add the real WhatsApp link (wa.me/…) to activate.",
  },
];

/** Only the socials with real links, what the UI renders. */
export const liveSocials = socials.filter((s) => s.href !== null);

export const navLinks = [
  { label: "Home", href: "/#top" },
  { label: "Work", href: "/#work" },
  { label: "About", href: "/#about" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/#contact" },
] as const;
