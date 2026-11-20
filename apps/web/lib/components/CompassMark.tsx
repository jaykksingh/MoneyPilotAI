// The logo mark (DESIGN_SPEC §2.4): a compass needle in a circle on a brand.default square.
// `needle` animates it on the landing and sign-in pages only (§2.5.1); the app shell keeps it still.
import { cx } from "./cx";
import styles from "./compass-mark.module.css";

export interface CompassMarkProps {
  /** Square size: 36 everywhere except the landing call to action (72) and footer (28). */
  size?: 28 | 36 | 72;
  needle?: "still" | "settle" | "sway";
  className?: string;
}

export function CompassMark({ size = 36, needle = "still", className }: CompassMarkProps) {
  const glyph = size === 72 ? 40 : size === 28 ? 16 : 20;
  return (
    <span className={cx(styles.mark, styles[`size${size}`], className)} aria-hidden="true">
      <svg
        width={glyph}
        height={glyph}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={size === 72 ? 1.8 : 2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="9" />
        <path className={cx(styles.needle, styles[needle])} d="M15.5 8.5l-2 5-5 2 2-5z" />
      </svg>
    </span>
  );
}
