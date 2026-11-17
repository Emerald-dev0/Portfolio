import {
  Github01Icon,
  InstagramIcon,
  Linkedin01Icon,
  Mail01Icon,
  NewTwitterIcon,
  TiktokIcon,
  WhatsappIcon,
  YoutubeIcon,
} from "@hugeicons/core-free-icons";
import type { Social } from "../../lib/config";
import { Icon } from "./Icon";

/**
 * SOCIAL LINK, one social, rendered as a sticker chip. Reads its URL from
 * `lib/config.ts`; a placeholder social (href: null) renders nothing, so
 * adding a real link in config is all it takes to show it here.
 */

const ICONS: Record<string, Parameters<typeof Icon>[0]["icon"]> = {
  github: Github01Icon,
  email: Mail01Icon,
  x: NewTwitterIcon,
  instagram: InstagramIcon,
  tiktok: TiktokIcon,
  linkedin: Linkedin01Icon,
  youtube: YoutubeIcon,
  whatsapp: WhatsappIcon,
};

export function SocialLink({
  social,
  className = "",
}: {
  social: Social;
  className?: string;
}) {
  if (!social.href) return null; // placeholder, renders nowhere until real
  const icon = ICONS[social.id];
  const isMail = social.href.startsWith("mailto:");
  return (
    <a
      href={social.href}
      {...(isMail ? {} : { target: "_blank", rel: "noreferrer noopener" })}
      aria-label={`${social.label}${social.handle ? `, ${social.handle}` : ""}`}
      className={`group inline-flex items-center gap-2.5 rounded-full border-2 border-ink bg-paper px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-ink shadow-[3px_3px_0_var(--color-ink)] transition hover:-translate-y-0.5 hover:shadow-[5px_5px_0_var(--color-ink)] ${className}`}
    >
      {icon ? <Icon icon={icon} size={17} /> : null}
      <span>{social.label}</span>
      {social.handle ? (
        <span className="hidden opacity-55 normal-case tracking-normal md:inline">
          {social.handle}
        </span>
      ) : null}
    </a>
  );
}
