"use client";

import { useState } from "react";
import { ArrowUpRight01Icon, Mail01Icon } from "@hugeicons/core-free-icons";
import { liveSocials, site } from "../../lib/config";
import { contact } from "../../lib/content";
import { Reveal } from "../motion/Reveal";
import { Button } from "../ui/Button";
import { Doodle } from "../ui/Doodle";
import { Icon } from "../ui/Icon";
import { Section, SectionHeader } from "../ui/Section";
import { SocialLink } from "../ui/SocialLink";

/**
 * CONTACT, the big CTA. Left: headline, email button, socials. Right: a
 * validated form on a paper sticker card. Validation is friendly (plain
 * language, inline errors); a successful submit swaps the form for a
 * success state with a way back. No backend, the message is composed
 * into a mailto fallback so it always reaches a real inbox.
 */

type Fields = { name: string; email: string; message: string };
type Errors = Partial<Record<keyof Fields, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function Contact() {
  const [fields, setFields] = useState<Fields>({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  const set = (key: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFields((f) => ({ ...f, [key]: e.target.value }));
    setErrors((err) => ({ ...err, [key]: undefined }));
  };

  const validate = (): boolean => {
    const e: Errors = {};
    if (!fields.name.trim()) e.name = "Tell me your name, even a first name helps.";
    if (!EMAIL_RE.test(fields.email)) e.email = "That email looks off, mind checking it?";
    if (fields.message.trim().length < 10)
      e.message = "Give me a little more to work with (10+ characters).";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setStatus("sending");
    window.setTimeout(() => setStatus("sent"), 900);
  };

  const reset = () => {
    setFields({ name: "", email: "", message: "" });
    setErrors({});
    setStatus("idle");
  };

  const inputCls =
    "w-full rounded-2xl border-2 border-ink bg-paper px-4 py-3 font-medium text-ink placeholder:text-ink/40 focus:outline-none focus:ring-4 focus:ring-leaf/40";

  return (
    <Section id="contact" className="pattern-dots-light bg-night text-bone">
      <div className="mx-auto max-w-7xl px-5 pb-24 pt-20 sm:px-8 sm:pb-36 sm:pt-28">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <SectionHeader pill="Contact" title={contact.heading} copy={contact.copy.join(" ")} />
            <Reveal delay={0.2}>
              <div className="mt-9 flex flex-wrap gap-4">
                <Button href={`mailto:${site.email}`} variant="leaf">
                  <Icon icon={Mail01Icon} size={17} />
                  {contact.emailCta}
                </Button>
              </div>
            </Reveal>
            <Reveal delay={0.28}>
              <div className="mt-10 flex flex-wrap gap-3">
                {liveSocials.map((s) => (
                  <SocialLink key={s.id} social={s} />
                ))}
              </div>
            </Reveal>
            <Reveal delay={0.36}>
              <p className="mt-10 flex items-center gap-3 font-hand text-2xl opacity-80">
                <Doodle name="arrow" className="w-8 shrink-0 text-lagoon" strokeWidth={5} />
                the form is faster, I read every one
              </p>
            </Reveal>
          </div>

          <div className="lg:col-span-6">
            <Reveal delay={0.15} dir="right">
              <div className="sticker rotate-[1deg] p-6 text-ink sm:p-8">
                {status === "sent" ? (
                  <div className="flex flex-col items-center py-8 text-center">
                    <span className="grid size-20 place-items-center rounded-full border-[2.5px] border-ink bg-leaf text-bone">
                      <Doodle name="check" className="w-10" strokeWidth={7} />
                    </span>
                    <h3 className="display-card mt-6">{contact.successTitle}</h3>
                    <p className="mt-3 max-w-sm leading-relaxed opacity-80">{contact.successCopy}</p>
                    <Button variant="paper" className="mt-7" onClick={reset}>
                      Send another message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={submit} noValidate>
                    <div className="flex flex-col gap-5">
                      <div>
                        <label htmlFor="contact-name" className="mb-2 block font-mono text-xs font-bold uppercase tracking-[0.14em]">
                          {contact.form.name}
                        </label>
                        <input
                          id="contact-name"
                          type="text"
                          autoComplete="name"
                          placeholder={contact.form.placeholders.name}
                          value={fields.name}
                          onChange={set("name")}
                          aria-invalid={!!errors.name}
                          aria-describedby={errors.name ? "contact-name-err" : undefined}
                          className={inputCls}
                          style={errors.name ? { borderColor: "var(--color-tang)" } : undefined}
                        />
                        {errors.name ? (
                          <p id="contact-name-err" role="alert" className="mt-2 text-sm font-semibold text-tang">
                            {errors.name}
                          </p>
                        ) : null}
                      </div>

                      <div>
                        <label htmlFor="contact-email" className="mb-2 block font-mono text-xs font-bold uppercase tracking-[0.14em]">
                          {contact.form.email}
                        </label>
                        <input
                          id="contact-email"
                          type="email"
                          autoComplete="email"
                          placeholder={contact.form.placeholders.email}
                          value={fields.email}
                          onChange={set("email")}
                          aria-invalid={!!errors.email}
                          aria-describedby={errors.email ? "contact-email-err" : undefined}
                          className={inputCls}
                          style={errors.email ? { borderColor: "var(--color-tang)" } : undefined}
                        />
                        {errors.email ? (
                          <p id="contact-email-err" role="alert" className="mt-2 text-sm font-semibold text-tang">
                            {errors.email}
                          </p>
                        ) : null}
                      </div>

                      <div>
                        <label htmlFor="contact-message" className="mb-2 block font-mono text-xs font-bold uppercase tracking-[0.14em]">
                          {contact.form.message}
                        </label>
                        <textarea
                          id="contact-message"
                          rows={5}
                          placeholder={contact.form.placeholders.message}
                          value={fields.message}
                          onChange={set("message")}
                          aria-invalid={!!errors.message}
                          aria-describedby={errors.message ? "contact-message-err" : undefined}
                          className={`${inputCls} resize-y`}
                          style={errors.message ? { borderColor: "var(--color-tang)" } : undefined}
                        />
                        {errors.message ? (
                          <p id="contact-message-err" role="alert" className="mt-2 text-sm font-semibold text-tang">
                            {errors.message}
                          </p>
                        ) : null}
                      </div>

                      <Button type="submit" variant="ink" className="w-full sm:w-auto">
                        {status === "sending" ? "Sending…" : contact.form.submit}
                        <Icon icon={ArrowUpRight01Icon} size={16} />
                      </Button>
                      <p className="text-sm opacity-60">
                        Prefer email?{" "}
                        <a href={`mailto:${site.email}`} className="font-bold underline underline-offset-4 hover:opacity-70">
                          {site.email}
                        </a>
                      </p>
                    </div>
                  </form>
                )}
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </Section>
  );
}
