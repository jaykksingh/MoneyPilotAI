// The navy brand panels beside the sign-in and create-account forms (DESIGN_SPEC §5.1.2).
// Decorative previews use the sample household (lib/landing/sample.ts, pinned to the golden fixture).
import { Avatar, OwnerDot, StatusChip } from "@mp/ui";
import { Mail, ShieldCheck, SquareCheck } from "lucide-react";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { CompassMark } from "../../lib/components/CompassMark";
import { cx } from "../../lib/components/cx";
import { CountUpMoney } from "../../lib/landing/CountUpMoney";
import { RunwayBars } from "../../lib/landing/RunwayBars";
import { SAMPLE, SAMPLE_TEXT } from "../../lib/landing/sample";
import styles from "./auth.module.css";

const step = (n: number) => ({ "--step": n }) as CSSProperties;

function Panel({ label, children, foot }: { label: string; children: ReactNode; foot: ReactNode }) {
  return (
    <aside className={styles.aside} aria-label={label}>
      <div className={styles.asideDots} aria-hidden="true" />
      <Link href="/" className={styles.asideBrand}>
        <CompassMark needle="settle" />
        <span className={styles.wordmark}>MoneyPilot</span>
      </Link>
      <div className={styles.asideBody}>{children}</div>
      <p className={styles.asideFoot}>{foot}</p>
    </aside>
  );
}

const ROWS = [
  { weekday: "Sun", day: 1, name: "Rent", role: "partnerB", amount: SAMPLE_TEXT.rent, decision: false },
  { weekday: "Mon", day: 2, name: "Daycare", role: "partnerA", amount: SAMPLE_TEXT.daycare, decision: false },
  {
    weekday: "Wed",
    day: 4,
    name: "Car insurance",
    role: "partnerB",
    amount: SAMPLE_TEXT.carInsurance,
    decision: true,
  },
] as const;

export function SignInAside() {
  return (
    <Panel label="About MoneyPilot" foot="Sample household shown. Your own numbers appear after you sign in.">
      <div className={cx(styles.asideHeading, styles.in)} style={step(1)}>
        <h2 className={styles.asideTitle}>Your plan picked up where you left off.</h2>
        <p className={styles.asideLead}>Bills, paydays and decisions, kept current while you were away.</p>
      </div>
      <div className={styles.previewWrap} aria-hidden="true">
        <div className={cx(styles.previewCard, styles.in)} style={step(4)}>
          <div className={styles.previewHead}>
            <span className={styles.overline}>Before {SAMPLE_TEXT.payday} payday</span>
            <span className={styles.avatars}>
              <Avatar name="Sam" role="partnerA" size={24} decorative />
              <span className={styles.overlap}>
                <Avatar name="Jordan" role="partnerB" size={24} decorative />
              </span>
            </span>
          </div>
          <div className={styles.previewFigures}>
            <span className={styles.previewAmountBlock}>
              <CountUpMoney cents={SAMPLE.safeToSpendCents} className={styles.previewAmount} />
              <span className={styles.previewCaption}>safe to spend · {SAMPLE_TEXT.perDay}</span>
            </span>
            <div className={styles.previewMini}>
              <RunwayBars tone="onSurface" height={56} />
            </div>
          </div>
          <ul className={styles.rows}>
            {ROWS.map((row, index) => (
              <li key={row.name} className={cx(styles.row, styles.slide)} style={step(13 + index * 2)}>
                <span className={styles.dateBlock}>
                  <span className={styles.dateWeekday}>{row.weekday}</span>
                  <span className={styles.dateDay}>{row.day}</span>
                </span>
                <OwnerDot role={row.role} />
                <span className={styles.rowName}>
                  {row.name}
                  {row.decision && <StatusChip variant="attention">Needs a decision</StatusChip>}
                </span>
                <span className={styles.rowAmount}>{row.amount}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className={cx(styles.chip, styles.chipBottomRight, styles.in)} style={step(22)}>
          <div className={cx(styles.chipBody, styles.float)} style={step(0)}>
            <span className={styles.chipIcon}>
              <Mail size={16} strokeWidth={1.8} />
            </span>
            <span className={styles.chipText}>
              <span className={styles.chipStrong}>{SAMPLE.renewalsFound} renewals found automatically</span>
              <span className={styles.chipMeta}>Insurance, memberships and registration</span>
            </span>
          </div>
        </div>
        <div className={cx(styles.chip, styles.chipTopLeft, styles.in)} style={step(27)}>
          <div className={cx(styles.chipBody, styles.chipPill, styles.float)} style={step(2)}>
            <SquareCheck size={16} strokeWidth={1.8} className={styles.chipAccent} />
            {SAMPLE.tasksDueThisWeek} tasks due this week
          </div>
        </div>
      </div>
    </Panel>
  );
}

const TIMELINE = [
  { title: "Create your account", body: "Your email or Google, plus an optional authenticator app." },
  {
    title: "Bring in your bills",
    body: "Connect Gmail or Outlook read-only, forward bills, or import a CSV.",
  },
  { title: "Invite your partner", body: "Each of you keeps one color, so you always know who owns what." },
] as const;

export function SignUpAside() {
  return (
    <Panel
      label="What happens next"
      foot={
        <>
          <ShieldCheck size={14} strokeWidth={1.8} aria-hidden="true" />
          MoneyPilot never moves money and never stores email bodies.
        </>
      }
    >
      <div className={cx(styles.asideHeading, styles.in)} style={step(1)}>
        <h2 className={styles.asideTitle}>One plan for both of you, in three steps.</h2>
        <p className={styles.asideLead}>
          Free to start. Upgrade to Family Plus when you want inbox capture and reminders.
        </p>
      </div>
      <div className={cx(styles.timelineWrap, styles.in)} style={step(4)}>
        <span className={styles.timelineTrack} aria-hidden="true" />
        <span className={styles.timelineFill} aria-hidden="true" />
        <ol className={styles.timeline}>
          {TIMELINE.map((item, index) => (
            <li key={item.title} className={styles.timelineItem}>
              <span className={styles.timelineDot} style={step(index)} aria-hidden="true" />
              <span className={styles.timelineText}>
                <span className={styles.timelineTitle}>{item.title}</span>
                <span className={styles.timelineBody}>{item.body}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
      <div className={cx(styles.inviteChip, styles.in)} style={step(11)} aria-hidden="true">
        <div className={cx(styles.chipBody, styles.float)} style={step(0)}>
          <span className={styles.avatars}>
            <Avatar name="Sam" role="partnerA" size={32} decorative />
            <span className={styles.overlap}>
              <Avatar name="Jordan" role="partnerB" size={32} decorative />
            </span>
          </span>
          <span className={styles.chipText}>
            <span className={styles.chipStrong}>Sam invited Jordan to the {SAMPLE.householdName}</span>
            <span className={styles.chipMeta}>Invitations expire after 7 days</span>
          </span>
        </div>
      </div>
    </Panel>
  );
}
