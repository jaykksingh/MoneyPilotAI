"use client";

import { money } from "@mp/format";
import { VisuallyHidden } from "@mp/ui";
import { useEffect, useState } from "react";

export interface CountUpMoneyProps {
  /** The engine's value in integer cents; the count ends exactly on it. */
  cents: number;
  /** Wait before counting, so the number starts once its card has faded in. */
  delayMs?: number;
  durationMs?: number;
  className?: string;
}

/**
 * A headline amount that counts up from $0 on the landing and sign-in pages (DESIGN_SPEC §2.5.1).
 * The server renders the final amount, every frame is formatted by packages/format, and assistive
 * tech reads only the final amount. With reduced motion it never counts.
 */
export function CountUpMoney({ cents, delayMs = 600, durationMs = 1600, className }: CountUpMoneyProps) {
  const [shown, setShown] = useState(cents);

  useEffect(() => {
    // No matchMedia (tests, very old browsers) or reduced motion: show the final amount, no counting.
    if (
      typeof window.matchMedia !== "function" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    let frame = 0;
    let start: number | null = null;
    const step = (now: number) => {
      start ??= now;
      const t = Math.min(1, Math.max(0, (now - start - delayMs) / durationMs));
      const eased = 1 - (1 - t) ** 3;
      setShown(Math.round(cents * eased));
      if (t < 1) frame = requestAnimationFrame(step);
    };
    setShown(0);
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [cents, delayMs, durationMs]);

  const final = money(cents, { mode: "headline" });
  return (
    <span className={className}>
      <span aria-hidden="true">{money(shown, { mode: "headline" })}</span>
      <VisuallyHidden>{final}</VisuallyHidden>
    </span>
  );
}
