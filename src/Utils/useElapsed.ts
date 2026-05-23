import { useEffect, useState } from "react";

/** Returns `mm:ss` since `startedAt`, ticking once per second. */
export function useElapsed(startedAt: number | null): string {
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    if (startedAt == null) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [startedAt]);

  if (startedAt == null) return "00:00";
  const seconds = Math.max(0, Math.floor((now - startedAt) / 1000));
  return formatSeconds(seconds);
}

export function formatSeconds(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const h = Math.floor(safe / 3600);
  const m = String(Math.floor((safe % 3600) / 60)).padStart(2, "0");
  const s = String(safe % 60).padStart(2, "0");
  return h > 0 ? `${h}:${m}:${s}` : `${m}:${s}`;
}
