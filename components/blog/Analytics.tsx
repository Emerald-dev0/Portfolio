"use client";

import { useEffect, useRef } from "react";

/**
 * ============================================================================
 * ANALYTICS BEACON, client side.
 * ============================================================================
 * Sends two kinds of event to /api/track:
 *
 *   view  once per article, shortly after mount
 *   read  once, when the reader reaches three quarters of the page
 *
 * The session id is a random value held in sessionStorage, so a reload in the
 * same tab is not a second view, and closing the tab forgets it. No cookie, no
 * fingerprint, nothing that follows anyone to another site. The server hashes
 * an IP and user agent with a daily salt and throws the originals away.
 *
 * If anything here fails, it fails silently. Analytics must never cost a
 * reader a page.
 * ============================================================================
 */

function sessionId(): string {
  try {
    const key = "emerald-session";
    const existing = sessionStorage.getItem(key);
    if (existing && existing.length >= 8) return existing;
    const made =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
    sessionStorage.setItem(key, made);
    return made;
  } catch {
    // Private mode or blocked storage: fall back to an in-memory id.
    return `ephemeral-${Math.random().toString(36).slice(2, 12)}`;
  }
}

function send(payload: Record<string, unknown>) {
  try {
    const body = JSON.stringify(payload);
    if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
      navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }));
      return;
    }
    void fetch("/api/track", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
      keepalive: true,
    });
  } catch {
    /* never break the page for a stat */
  }
}

export function AnalyticsBeacon({ slug }: { slug: string }) {
  const sentRead = useRef(false);

  useEffect(() => {
    const session = sessionId();
    // Slight delay so a bounce off the back button does not count as a read.
    const timer = window.setTimeout(() => {
      send({ slug, kind: "view", session });
    }, 1200);

    const onScroll = () => {
      if (sentRead.current) return;
      const doc = document.documentElement;
      const scrolled = window.scrollY + window.innerHeight;
      const height = doc.scrollHeight;
      if (height <= 0) return;
      if (scrolled / height >= 0.75) {
        sentRead.current = true;
        send({ slug, kind: "read", session, progress: 75 });
        window.removeEventListener("scroll", onScroll);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [slug]);

  return null;
}
