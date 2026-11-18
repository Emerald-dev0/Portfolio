"use client";

import { useState } from "react";
import { CheckIcon, Link01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "../ui/Icon";

/**
 * SHARE ROW. X, WhatsApp, LinkedIn and email, plus copy link.
 *
 * Copy link uses the clipboard API and, when the browser refuses it (older
 * Safari, insecure context), falls back to selecting a temporary input so the
 * action still works. The label confirms either way.
 */
export function ShareRow({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      try {
        document.execCommand("copy");
        setCopied(true);
      } catch {
        /* nothing more we can do, the link is visible in the address bar */
      }
      document.body.removeChild(input);
    }
    window.setTimeout(() => setCopied(false), 2200);
  };

  const enc = encodeURIComponent;

  return (
    <div className="sticker mt-14 flex flex-wrap items-center gap-3 p-5">
      <p className="font-hand text-2xl font-bold">Did this help?</p>
      <p className="text-sm opacity-70">Send it to someone fighting the same bug.</p>

      <div className="ml-auto flex flex-wrap gap-2">
        <a
          className="btn btn-ink px-4 py-2 text-sm"
          href={`https://x.com/intent/tweet?text=${enc(title)}&url=${enc(url)}`}
          target="_blank"
          rel="noreferrer noopener"
        >
          X
        </a>
        <a
          className="btn btn-paper px-4 py-2 text-sm"
          href={`https://api.whatsapp.com/send?text=${enc(`${title} ${url}`)}`}
          target="_blank"
          rel="noreferrer noopener"
        >
          WhatsApp
        </a>
        <a
          className="btn btn-paper px-4 py-2 text-sm"
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`}
          target="_blank"
          rel="noreferrer noopener"
        >
          LinkedIn
        </a>
        <a
          className="btn btn-lagoon px-4 py-2 text-sm"
          href={`mailto:?subject=${enc(title)}&body=${enc(url)}`}
        >
          Email
        </a>
        <button type="button" onClick={copy} className="btn btn-ink px-4 py-2 text-sm">
          <Icon icon={copied ? CheckIcon : Link01Icon} size={14} />
          {copied ? "Link copied" : "Copy link"}
        </button>
      </div>

      <p aria-live="polite" className="sr-only">
        {copied ? "Link copied to the clipboard" : ""}
      </p>
    </div>
  );
}
