// The hero's product preview (DESIGN_SPEC §5.1.1): the sample household's Overview in miniature, with
// activity chips floating around it. It is a picture, so it is hidden from assistive tech and a
// visually hidden sentence says what it shows. Nothing in it is a control.
import { Avatar, StatusChip, VisuallyHidden } from "@mp/ui";
import { Check, Mail, TriangleAlert } from "lucide-react";
import type { CSSProperties } from "react";
import { cx } from "../components/cx";
import { CountUpMoney } from "./CountUpMoney";
import styles from "./landing.module.css";
import { RunwayBars } from "./RunwayBars";
import { SAMPLE, SAMPLE_TEXT } from "./sample";

const step = (n: number) => ({ "--step": n }) as CSSProperties;

export function ProductPreview() {
  return (
    <div className={styles.preview}>
      <VisuallyHidden>
        {`Example: a household with ${SAMPLE_TEXT.safeToSpend} safe to spend before their ${SAMPLE_TEXT.payday} payday, ` +
          `${SAMPLE.billsBeforePayday.count} bills due first, and one decision about a car insurance renewal.`}
      </VisuallyHidden>
      <div aria-hidden="true">
        <div className={cx(styles.frame, styles.in)} style={step(4)}>
          <div className={styles.frameHead}>
            <span className={styles.frameHousehold}>
              <span className={styles.stepAvatars}>
                <Avatar name="Sam" role="partnerA" size={28} decorative />
                <span className={styles.overlapSm}>
                  <Avatar name="Jordan" role="partnerB" size={28} decorative />
                </span>
              </span>
              {SAMPLE.householdName}
            </span>
            <span className={styles.overline}>{SAMPLE_TEXT.today}</span>
          </div>

          <div className={styles.heroCard}>
            <div className={styles.heroTop}>
              <div className={styles.heroFigures}>
                <span className={styles.heroLabel}>Safe to spend before {SAMPLE_TEXT.payday} payday</span>
                <CountUpMoney cents={SAMPLE.safeToSpendCents} delayMs={700} className={styles.heroAmount} />
                <span className={styles.heroCaption}>
                  {SAMPLE_TEXT.perDay} · {SAMPLE.daysToPayday} days to payday
                </span>
              </div>
              <div className={styles.heroMini}>
                <RunwayBars tone="onStrong" height={80} dates />
              </div>
            </div>
            <div className={styles.heroStats}>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Lowest point</span>
                <span className={styles.statValue}>
                  {SAMPLE_TEXT.lowest} · {SAMPLE_TEXT.lowestDate}
                </span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Cushion</span>
                <span className={styles.statValue}>{SAMPLE_TEXT.cushion}</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Bills before payday</span>
                <span className={styles.statValue}>
                  {SAMPLE.billsBeforePayday.count} · {SAMPLE_TEXT.billsTotal}
                </span>
              </div>
            </div>
          </div>

          <div className={cx(styles.attention, styles.in)} style={step(16)}>
            <span className={styles.attentionHead}>
              <TriangleAlert size={16} strokeWidth={1.8} />
              Needs a decision · Jordan
            </span>
            <span className={styles.attentionTitle}>
              Car insurance renewal · {SAMPLE_TEXT.carInsurance} on {SAMPLE_TEXT.carInsuranceDate}
            </span>
            <span className={styles.attentionBody}>
              It lands the day before your lowest point. Moving it to payday lifts safe to spend to{" "}
              {SAMPLE_TEXT.safeIfMoved}.
            </span>
            <span className={styles.attentionActions}>
              <span className={styles.fakeButton}>Decide with Jordan</span>
              <span className={styles.fakeLink}>See the math</span>
            </span>
          </div>
        </div>

        <div className={cx(styles.chip, styles.chipTopRight, styles.in)} style={step(22)}>
          <div className={cx(styles.chipBody, styles.float)} style={step(0)}>
            <span className={styles.chipIcon}>
              <Mail size={16} strokeWidth={1.8} />
            </span>
            <span className={styles.chipText}>
              <span className={styles.chipMeta}>Found in Sam’s email</span>
              <span className={styles.chipStrong}>Car insurance renews {SAMPLE_TEXT.carInsuranceDate}</span>
            </span>
          </div>
        </div>
        <div className={cx(styles.chip, styles.chipBottomLeft, styles.in)} style={step(27)}>
          <div className={cx(styles.chipBody, styles.float)} style={step(1)}>
            <Avatar name="Jordan" role="partnerB" size={32} decorative />
            <span className={styles.chipText}>
              <span className={styles.chipStrong}>Jordan marked Internet as paid</span>
              <span className={styles.chipMeta}>{SAMPLE_TEXT.internet} · just now</span>
            </span>
            <span className={styles.chipCheck}>
              <Check size={14} strokeWidth={2.2} />
            </span>
          </div>
        </div>
        <div className={cx(styles.chip, styles.chipMidRight, styles.in)} style={step(32)}>
          <div className={cx(styles.chipBody, styles.chipPill, styles.float)} style={step(2)}>
            <StatusChip variant="attention">Price up {SAMPLE_TEXT.streamingPriceUp}</StatusChip>
            Streaming bundle
          </div>
        </div>
      </div>
    </div>
  );
}
