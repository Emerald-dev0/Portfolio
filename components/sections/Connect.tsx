"use client";

import SectionHeader from "@/components/ui/SectionHeader";
import Pill from "@/components/ui/Pill";
import SocialIcon from "@/components/ui/SocialIcon";
import Doodle from "@/components/materials/Doodle";
import Scribble from "@/components/motion/Scribble";
import AmbientField from "@/components/motion/AmbientField";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { connect } from "@/lib/content";

/**
 * Let's Connect. Real social rows with icons (email, GitHub, Instagram, TikTok,
 * X), a primary email pill, and a handwritten speech-bubble aside. Every link
 * points to a real destination and opens safely.
 */
export default function Connect() {
  return (
    <section id="contact" className="section-pad relative">
      <AmbientField
        marks={[
          { name: "star", className: "left-[5%] top-[24%]", size: 22, anim: "drift", delay: 2, color: "text-accent-2/45" },
          { name: "spark", className: "right-[6%] bottom-[18%]", size: 24, anim: "float", color: "text-accent/40" },
        ]}
      />
      <div className="relative z-10 mx-auto grid w-full max-w-4xl grid-cols-1 items-start gap-10 lg:grid-cols-[1fr_0.72fr] lg:gap-14">
        <div>
          <SectionHeader tag={connect.tag} heading={connect.heading} scribble="underline" />

          <Stagger className="mt-8 divide-y divide-rule border-y border-rule">
            {connect.socials.map((s) => (
              <StaggerItem key={s.label}>
                <a
                  href={s.href}
                  target={s.icon === "email" ? undefined : "_blank"}
                  rel={s.icon === "email" ? undefined : "noopener noreferrer"}
                  className="group flex items-center gap-4 py-3 transition-colors hover:bg-paper-raised"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ink/20 text-ink transition-all group-hover:border-ink group-hover:bg-ink group-hover:text-paper">
                    <SocialIcon icon={s.icon} size={17} />
                  </span>
                  <span className="w-20 shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
                    {s.label}
                  </span>
                  <span className="truncate font-mono text-[13px] text-ink">
                    {s.handle}
                  </span>
                  <span className="ml-auto shrink-0 text-ink-faint transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </a>
              </StaggerItem>
            ))}
          </Stagger>

          <Reveal dir="up" delay={0.1}>
            <div className="mt-7">
              <Pill href={connect.emailHref} variant="ink">
                Send me an email
              </Pill>
            </div>
          </Reveal>
        </div>

        {/* speech-bubble aside */}
        <Reveal dir="left" delay={0.15}>
          <div className="relative md:rotate-[1.5deg]">
            <div className="ink-edge--soft paper-stack relative bg-paper-raised p-5">
              <p className="font-pen text-2xl leading-snug text-ink">
                {connect.bubble}
              </p>
              <span
                aria-hidden
                className="absolute -bottom-2.5 left-8 h-4 w-4 rotate-45 border-b border-r border-ink bg-paper-raised"
              />
              <Scribble
                preset="underline"
                color="accent-2"
                className="absolute -bottom-1 left-4 h-2 w-24"
              />
            </div>
            <Doodle
              name="spark"
              size={26}
              className="animate-float absolute -right-2 -top-3 text-accent"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
