import TornEdge from "@/components/materials/TornEdge";
import Doodle from "@/components/materials/Doodle";
import SocialIcon from "@/components/ui/SocialIcon";
import ChibiWalker from "@/components/motion/ChibiWalker";
import { footer, nav, socials } from "@/lib/content";

/**
 * Footer. A torn paper edge tears the page away from a full-width ink bar: the
 * closing marker tagline, quick nav, real social icons, and the dual-identity
 * sign-off. A little chibi strolls back and forth along the tear.
 */
export default function Footer() {
  return (
    <footer className="relative">
      <TornEdge fill="var(--color-ink)" />

      {/* a wanderer paces the seam between page and footer */}
      <div className="relative h-0">
        <ChibiWalker
          size={40}
          duration={30}
          className="bottom-0"
          colorClass="text-ink/55"
          character="dash"
        />
        <ChibiWalker
          size={34}
          duration={38}
          reverse
          className="bottom-0"
          colorClass="text-ink/35"
          character="pip"
        />
      </div>

      <div className="bg-ink px-6 pb-8 pt-12 text-paper lg:px-12 xl:px-16">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <p className="font-marker text-[clamp(1.5rem,4vw,2.4rem)] leading-[1.15]">
              {footer.lines.map((line, i) => {
                const isEmphasis = line.toLowerCase().includes(footer.emphasis);
                return (
                  <span key={i} className="block">
                    {isEmphasis ? (
                      <>
                        Keep{" "}
                        <span className="text-accent">{footer.emphasis}.</span>
                      </>
                    ) : (
                      line
                    )}
                  </span>
                );
              })}
            </p>

            <nav className="flex flex-wrap gap-x-5 gap-y-2">
              {nav.links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="t-base font-mono text-[13px] lowercase text-paper/60 hover:text-marker"
                >
                  {l.label}
                </a>
              ))}
            </nav>
          </div>

          {/* social icons */}
          <div className="flex flex-wrap items-center gap-3 border-t border-paper/15 pt-6">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target={s.icon === "email" ? undefined : "_blank"}
                rel={s.icon === "email" ? undefined : "noopener noreferrer"}
                aria-label={s.label}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-paper/25 text-paper/80 transition-all hover:-translate-y-0.5 hover:border-marker hover:text-marker"
              >
                <SocialIcon icon={s.icon} size={18} />
              </a>
            ))}
          </div>

          <div className="flex flex-col gap-2 border-t border-paper/15 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-pen text-lg text-marker">{footer.signoff}</p>
            <p className="font-mono text-[12px] text-paper/50">
              {footer.copyright}
            </p>
            <p className="hidden font-mono text-[12px] text-paper/40 lg:block">
              {footer.builtNote}
            </p>
            <Doodle name="crown" size={24} className="text-marker" />
          </div>
        </div>
      </div>
    </footer>
  );
}
