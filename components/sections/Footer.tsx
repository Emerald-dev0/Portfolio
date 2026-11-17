import Link from "next/link";
import { ArrowUp01Icon, ArrowUpRight01Icon } from "@hugeicons/core-free-icons";
import { liveSocials, navLinks, site } from "../../lib/config";
import { footer } from "../../lib/content";
import { Doodle } from "../ui/Doodle";
import { Icon } from "../ui/Icon";
import { LocalTime } from "../ui/LocalTime";
import { SocialLink } from "../ui/SocialLink";
import { Terminal } from "../ui/Terminal";

/**
 * FOOTER, the closing act. Instead of a giant wordmark, a live terminal types
 * out who I am, the stack, what's shipping, and the contact card. Around it:
 * nav, socials, the live Ile-Ife clock, and back-to-top.
 *
 * The EMERALD wordmark still exists, as the terminal's cursor line and in the
 * nav, so the brand is present without a 19vw block of empty space.
 */
export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t-[2.5px] border-ink bg-paper">
      <Doodle
        name="spark"
        className="pointer-events-none absolute left-4 top-12 w-10 text-tang animate-float"
        strokeWidth={5}
      />
      <Doodle
        name="asterisk"
        className="pointer-events-none absolute right-6 top-24 w-14 text-grape animate-spin-slow"
        strokeWidth={5}
      />

      <div className="mx-auto max-w-7xl px-5 pb-[calc(env(safe-area-inset-bottom)+96px)] pt-16 sm:px-8 sm:pb-10 sm:pt-20 md:pb-10">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Terminal */}
          <div className="lg:col-span-7">
            <h2 className="display-section max-w-md text-[clamp(2rem,4.4vw,3rem)]">
              {footer.tagline}
            </h2>
            <div className="mt-6">
              <Terminal />
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-col justify-between gap-10 lg:col-span-5 lg:pl-6">
            <div>
              <p className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.18em] opacity-55">
                {footer.brand}
              </p>

              <nav aria-label="Footer" className="mt-7 grid grid-cols-2 gap-x-6 gap-y-2">
                {navLinks.map((l) => (
                  <Link
                    key={l.label}
                    href={l.href}
                    className="group inline-flex items-center gap-1.5 font-mono text-sm font-bold uppercase tracking-wider transition hover:text-leaf"
                  >
                    {l.label}
                    <Icon
                      icon={ArrowUpRight01Icon}
                      size={12}
                      className="opacity-0 transition group-hover:opacity-100"
                    />
                  </Link>
                ))}
                <a
                  href={`mailto:${site.email}`}
                  className="font-mono text-sm font-bold uppercase tracking-wider transition hover:text-leaf"
                >
                  Email
                </a>
                <Link
                  href="/studio"
                  className="font-mono text-sm font-bold uppercase tracking-wider opacity-40 transition hover:text-leaf hover:opacity-100"
                >
                  Studio
                </Link>
              </nav>

              <div className="mt-7 flex flex-wrap gap-2.5">
                {liveSocials.map((s) => (
                  <SocialLink key={s.id} social={s} />
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-end justify-between gap-4 border-t-2 border-ink/15 pt-6">
              <div>
                <p className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.14em] opacity-60">
                  <LocalTime suffix={false} /> · {footer.location}
                </p>
                <p className="mt-1 font-mono text-[0.62rem] font-bold uppercase tracking-[0.14em] opacity-40">
                  {footer.availability}
                </p>
              </div>
              <Link href="/#top" className="btn btn-ink px-4 py-2 text-sm">
                Back to top
                <Icon icon={ArrowUp01Icon} size={15} />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-between gap-3 border-t-2 border-ink/15 pt-6 text-[0.72rem] opacity-60">
          <p>{footer.copyright}</p>
          <p>{footer.builtNote}</p>
        </div>
      </div>
    </footer>
  );
}
