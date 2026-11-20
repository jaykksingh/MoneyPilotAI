// The animated mini runway on the landing preview and the sign-in brand panel (DESIGN_SPEC §5.1.1).
// Decorative, like the mobile hero's mini runway (§4.1): the text beside it carries the meaning.
import type { CSSProperties } from "react";
import { cx } from "../components/cx";
import styles from "./runway-bars.module.css";
import { SAMPLE_TEXT, runwayBars } from "./sample";

export interface RunwayBarsProps {
  /** `onStrong` on the navy hero card; `onSurface` on a white card. */
  tone: "onStrong" | "onSurface";
  /** Bar area height: 80 on the landing hero, 56 on the sign-in panel. */
  height: 56 | 80;
  /** Show the first and last dates under the bars. */
  dates?: boolean;
  className?: string;
}

export function RunwayBars({ tone, height, dates = false, className }: RunwayBarsProps) {
  return (
    <div className={cx(styles.runway, styles[tone], className)} aria-hidden="true">
      <div className={cx(styles.bars, height === 56 ? styles.h56 : styles.h80)}>
        {runwayBars().map((bar, index) => (
          <span
            key={bar.date}
            className={cx(styles.bar, styles[bar.kind])}
            style={{ height: `${bar.percent}%`, "--step": index } as CSSProperties}
          />
        ))}
      </div>
      {dates && (
        <div className={styles.dates}>
          <span>{SAMPLE_TEXT.today}</span>
          <span>{SAMPLE_TEXT.payday}</span>
        </div>
      )}
    </div>
  );
}
