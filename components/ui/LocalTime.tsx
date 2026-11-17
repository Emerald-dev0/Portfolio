"use client";

import { useEffect, useState } from "react";

/**
 * LOCAL TIME, a live clock for Ile-Ife, Nigeria (Africa/Lagos). Renders
 * nothing until mounted, so server and client markup never disagree.
 */
export function LocalTime({ suffix = true }: { suffix?: boolean }) {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Africa/Lagos",
    });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, []);

  if (!time) return <span>Ile-Ife, Nigeria · UTC+1</span>;
  return <span>{suffix ? `${time} in Ile-Ife` : time}</span>;
}
