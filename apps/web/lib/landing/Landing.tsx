"use client";

// The public landing page at `/` (DESIGN_SPEC §5.1.1, canvas board "Web · Landing page").
// A client component because the @mp/ui barrel is (its stateful parts have no "use client" boundary);
// it still renders fully on the server, and its only live parts are the count-up, header and pricing.
import { Avatar, StatusChip, VisuallyHidden } from "@mp/ui";
import { ArrowRight, BarChart3, Check, Lock, Mail, ShieldCheck } from "lucide-react";
import Link from "next/link";
import type { CSSProperties } from "react";
import { CompassMark } from "../components/CompassMark";
import { cx } from "../components/cx";
import styles from "./landing.module.css";
import { NavActions } from "./NavActions";
import { PricingPlans } from "./PricingPlans";
import { ProductPreview } from "./ProductPreview";
import { SAMPLE, SAMPLE_TEXT, SAM_SHARE_PERCENT } from "./sample";

const vars = (values: Record<string, number>) => values as CSSProperties;

const CYCLE_WORDS = ["payday.", "rent.", "daycare.", "renewals."] as const;

type Dot = "A" | "B" | "Both";
const dotClass: Record<Dot, string | undefined> = { A: styles.dotA, B: styles.dotB, Both: styles.dotBoth };

const TICKER: readonly [string, Dot][] = [
  ["Rent", "B"],
  ["Mortgage", "Both"],
  ["Daycare", "A"],
  ["Car insurance", "B"],
  ["Health insurance", "A"],
  ["Home insurance", "Both"],
  ["Life insurance", "B"],
  ["Motorcycle insurance", "A"],
  ["Vehicle registration", "B"],
  ["Electricity", "A"],
  ["Internet", "B"],
  ["Phone", "Both"],
  ["Streaming", "A"],
  ["Gym membership", "B"],
  ["Water", "Both"],
  ["Student loan", "A"],
];

/** November 1–14 on the calendar illustration: owner dots on the days the sample bills fall due. */
const CALENDAR_DOTS: Partial<Record<number, Dot>> = { 1: "B", 2: "A", 3: "A", 4: "B", 5: "B", 12: "Both" };
const PAYDAY_DAY = Number(SAMPLE.payday.slice(-2));

/** The runway as an SVG line: 11 points across a 300 × 120 box, 10 px of headroom. */
function runwayPoints(): { points: string; lowest: { x: number; y: number }; cushionY: number } {
  const max = Math.max(...SAMPLE.runway.map((d) => d.endOfDayCents));
  const y = (cents: number) => 110 - (cents / max) * 100;
  const step = 300 / (SAMPLE.runway.length - 1);
  const points = SAMPLE.runway.map((d, i) => `${i * step},${y(d.endOfDayCents).toFixed(1)}`).join(" ");
  const lowestIndex = SAMPLE.runway.findIndex((d) => d.date === SAMPLE.lowest.date);
  return {
    points,
    lowest: { x: lowestIndex * step, y: y(SAMPLE.lowest.balanceCents) },
    cushionY: y(SAMPLE.cushionCents),
  };
}

function Header() {
  return (
    <header className={styles.header}>
      <div className={cx(styles.container, styles.headerInner)}>
        <Link href="/" className={styles.brand}>
          <CompassMark needle="settle" />
          <span className={styles.wordmark}>MoneyPilot</span>
        </Link>
        <nav aria-label="Main" className={styles.navLinks}>
          <a href="#how" className={styles.navLink}>
            How it works
          </a>
          <a href="#privacy" className={styles.navLink}>
            Privacy
          </a>
          <a href="#pricing" className={styles.navLink}>
            Pricing
          </a>
        </nav>
        <NavActions />
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={cx(styles.glow, styles.glowBoth)} aria-hidden="true" />
      <div className={cx(styles.glow, styles.glowA)} aria-hidden="true" />
      <div className={cx(styles.glow, styles.glowB)} aria-hidden="true" />
      <div className={styles.dots} aria-hidden="true" />
      <div className={cx(styles.container, styles.heroInner)}>
        <div className={styles.heroCopy}>
          <span className={cx(styles.eyebrow, styles.in)} style={vars({ "--step": 0 })}>
            <span className={styles.eyebrowDots} aria-hidden="true">
              <span className={cx(styles.eyebrowDot, styles.dotA)} />
              <span className={cx(styles.eyebrowDot, styles.dotB)} />
            </span>
            For couples and families
          </span>
          <h1 id="hero-title" className={cx(styles.h1, styles.in)} style={vars({ "--step": 2 })}>
            See what’s coming before{" "}
            <span className={styles.cycler} aria-hidden="true">
              {CYCLE_WORDS.map((word, index) => (
                <span
                  key={word}
                  className={cx(styles.cycleWord, index > 0 && styles.cycleExtra)}
                  style={vars({ "--word": index })}
                >
                  {word}
                </span>
              ))}
            </span>
            <VisuallyHidden>payday.</VisuallyHidden>
          </h1>
          <p className={cx(styles.lead, styles.in)} style={vars({ "--step": 4 })}>
            MoneyPilot shows every bill due before your next paycheck, how much is safe to spend, and who owns
            what. One shared plan for both of you.
          </p>
          <div className={cx(styles.ctaRow, styles.in)} style={vars({ "--step": 6 })}>
            <Link href="/sign-up" className={cx(styles.btn, styles.btnLarge, styles.btnPrimary)}>
              Create your household
              <ArrowRight size={16} strokeWidth={1.8} className={styles.arrow} aria-hidden="true" />
            </Link>
            <a href="#how" className={cx(styles.btn, styles.btnLarge, styles.btnSecondary)}>
              See how it works
            </a>
          </div>
          <ul className={cx(styles.trustRow, styles.in)} style={vars({ "--step": 8 })}>
            <li className={styles.trustItem}>
              <ShieldCheck size={16} strokeWidth={1.8} className={styles.trustIcon} aria-hidden="true" />
              Never moves money
            </li>
            <li className={styles.trustItem}>
              <Mail size={16} strokeWidth={1.8} className={styles.trustIcon} aria-hidden="true" />
              Read-only email
            </li>
            <li className={styles.trustItem}>
              <Lock size={16} strokeWidth={1.8} className={styles.trustIcon} aria-hidden="true" />
              Two-step sign-in
            </li>
          </ul>
        </div>
        <ProductPreview />
      </div>
    </section>
  );
}

function Ticker() {
  const items = (hidden: boolean) => (
    <ul className={styles.tickerList} aria-hidden={hidden || undefined}>
      {TICKER.map(([label, dot]) => (
        <li key={label} className={styles.tickerItem}>
          <span className={cx(styles.dot, dotClass[dot])} aria-hidden="true" />
          {label}
        </li>
      ))}
    </ul>
  );
  return (
    <section className={styles.ticker} aria-labelledby="ticker-title">
      <p id="ticker-title" className={cx(styles.overline, styles.tickerLabel)}>
        Every bill, subscription and renewal, found for you
      </p>
      <div className={styles.tickerViewport}>
        <div className={styles.tickerTrack}>
          {items(false)}
          {items(true)}
        </div>
      </div>
    </section>
  );
}

function Pillars() {
  const runway = runwayPoints();
  return (
    <section className={cx(styles.section, styles.onCanvas)} aria-labelledby="pillars-title">
      <div className={styles.container}>
        <div className={cx(styles.sectionHead, styles.reveal)}>
          <span className={styles.kicker}>One page before payday</span>
          <h2 id="pillars-title" className={styles.h2}>
            Three answers, every morning.
          </h2>
          <p className={styles.sectionLead}>
            What’s due, what’s safe, and whose turn it is. Calculated by fixed rules, so every number shows
            its math.
          </p>
        </div>
        <div className={cx(styles.cards, styles.sectionBody)}>
          <article className={cx(styles.card, styles.reveal)}>
            <div className={cx(styles.illus, styles.calendar)} aria-hidden="true">
              <div className={styles.weekdays}>
                {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                  <span key={i}>{d}</span>
                ))}
              </div>
              <div className={styles.days}>
                {Array.from({ length: 14 }, (_, i) => i + 1).map((day) => {
                  const dot = CALENDAR_DOTS[day];
                  return (
                    <span key={day} className={cx(styles.day, day === PAYDAY_DAY && styles.dayPayday)}>
                      {day}
                      {dot && (
                        <span
                          className={cx(styles.dot, dotClass[dot], styles.pop)}
                          style={vars({ "--step": day })}
                        />
                      )}
                    </span>
                  );
                })}
              </div>
            </div>
            <div className={styles.cardText}>
              <h3 className={styles.cardTitle}>See what’s coming</h3>
              <p className={styles.cardBody}>
                Every bill, renewal and paycheck between now and payday on one shared calendar, with paydays
                marked.
              </p>
            </div>
          </article>

          <article className={cx(styles.card, styles.reveal)}>
            <div className={styles.illus} aria-hidden="true">
              <svg className={styles.runwaySvg} viewBox="0 0 300 120">
                <line
                  className={styles.runwayCushion}
                  x1="0"
                  x2="300"
                  y1={runway.cushionY}
                  y2={runway.cushionY}
                />
                <polyline className={styles.runwayLine} points={runway.points} pathLength={1} />
                <circle className={styles.runwayRing} cx={runway.lowest.x} cy={runway.lowest.y} r="5" />
                <circle className={styles.runwayDot} cx={runway.lowest.x} cy={runway.lowest.y} r="5" />
              </svg>
              <span className={styles.tooltip}>Lowest · {SAMPLE_TEXT.lowest}</span>
              <span className={styles.illusCaption}>{SAMPLE_TEXT.cushion} cushion</span>
            </div>
            <div className={styles.cardText}>
              <h3 className={styles.cardTitle}>Know what’s safe to spend</h3>
              <p className={styles.cardBody}>
                A day-by-day runway to your next paycheck, with a cushion you choose. Tap any number to see
                how it was worked out.
              </p>
            </div>
          </article>

          <article className={cx(styles.card, styles.reveal)}>
            <div className={cx(styles.illus, styles.split)} aria-hidden="true">
              <div className={styles.splitRow}>
                <Avatar name="Sam" role="partnerA" size={28} decorative />
                <span className={styles.splitName}>Sam</span>
                <span>{SAMPLE_TEXT.samBills}</span>
              </div>
              <div className={styles.splitRow}>
                <Avatar name="Jordan" role="partnerB" size={28} decorative />
                <span className={styles.splitName}>Jordan</span>
                <span>{SAMPLE_TEXT.jordanBills}</span>
              </div>
              <div className={styles.splitBar}>
                <span className={cx(styles.segA, styles.fill)} style={{ width: `${SAM_SHARE_PERCENT}%` }} />
                <span
                  className={cx(styles.segB, styles.fill)}
                  style={{ width: `${100 - SAM_SHARE_PERCENT}%`, ...vars({ "--step": 1 }) }}
                />
              </div>
              <span className={styles.splitCaption}>
                {SAMPLE.billsBeforePayday.count} bills before payday · {SAMPLE_TEXT.billsTotal}
              </span>
            </div>
            <div className={styles.cardText}>
              <h3 className={styles.cardTitle}>Share the load</h3>
              <p className={styles.cardBody}>
                Every bill has an owner, and each of you keeps one color everywhere. No more “did you pay
                that?”
              </p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how" className={styles.section} aria-labelledby="how-title">
      <div className={styles.container}>
        <div className={cx(styles.sectionHead, styles.reveal)}>
          <span className={styles.kicker}>How it works</span>
          <h2 id="how-title" className={styles.h2}>
            Less typing. More deciding.
          </h2>
          <p className={styles.sectionLead}>
            MoneyPilot reads the bills that already land in your inbox. You review what it found, and the plan
            builds itself.
          </p>
        </div>
        <div className={styles.sectionBody}>
          <div className={styles.rail} aria-hidden="true">
            <span className={styles.railDot} />
          </div>
          <ol className={styles.cards}>
            <li className={cx(styles.card, styles.reveal)}>
              <span className={styles.stepNumber} aria-hidden="true">
                1
              </span>
              <div className={styles.stepIllus} aria-hidden="true">
                <span className={styles.stepAvatars}>
                  <Avatar name="Sam" role="partnerA" size={40} decorative />
                  <span className={cx(styles.overlap, styles.pop)}>
                    <Avatar name="Jordan" role="partnerB" size={40} decorative />
                  </span>
                </span>
                <span className={styles.stepMeta}>
                  <span className={styles.stepStrong}>{SAMPLE.householdName}</span>
                  <span className={styles.stepMetaMuted}>Jordan joined</span>
                </span>
              </div>
              <div className={styles.cardText}>
                <h3 className={styles.cardTitle}>Create your household</h3>
                <p className={styles.cardBody}>
                  Sign up with your email or Google, then invite your partner whenever you’re ready.
                </p>
              </div>
            </li>
            <li className={cx(styles.card, styles.reveal)}>
              <span className={styles.stepNumber} aria-hidden="true">
                2
              </span>
              <div className={cx(styles.stepIllus, styles.stepColumn)} aria-hidden="true">
                <span className={styles.tickRow}>
                  <span className={cx(styles.tick, styles.pop)}>
                    <Check size={10} strokeWidth={3} />
                  </span>
                  Gmail or Outlook, read-only
                </span>
                <span className={styles.tickRow}>
                  <span className={cx(styles.tick, styles.pop)} style={vars({ "--step": 3 })}>
                    <Check size={10} strokeWidth={3} />
                  </span>
                  Forwarding address or CSV import
                </span>
              </div>
              <div className={styles.cardText}>
                <h3 className={styles.cardTitle}>Bring in your bills</h3>
                <p className={styles.cardBody}>
                  Connect an inbox, forward bills to your household address, or import a CSV. Nothing is added
                  until you confirm it.
                </p>
              </div>
            </li>
            <li className={cx(styles.card, styles.reveal)}>
              <span className={styles.stepNumber} aria-hidden="true">
                3
              </span>
              <div className={cx(styles.stepIllus, styles.stepSplit)} aria-hidden="true">
                <span className={styles.stepMeta}>
                  <span className={styles.stepDecision}>Needs a decision</span>
                  <span className={styles.stepStrong}>Move car insurance to payday?</span>
                </span>
                <span className={styles.pop} style={vars({ "--step": 5 })}>
                  <StatusChip variant="ok">Approved</StatusChip>
                </span>
              </div>
              <div className={styles.cardText}>
                <h3 className={styles.cardTitle}>Decide together</h3>
                <p className={styles.cardBody}>
                  See this week’s decisions, ask MoneyPilot why, and mark bills as paid once they’re paid.
                </p>
              </div>
            </li>
          </ol>
        </div>
      </div>
    </section>
  );
}

const PRIVACY = [
  {
    icon: ShieldCheck,
    title: "Never moves money",
    body: "No payments and no transfers. When a bill is paid, you mark it as paid.",
  },
  {
    icon: Mail,
    title: "Read-only email",
    body: "It reads bills and renewals and never sends mail. Email bodies are not stored.",
  },
  {
    icon: Lock,
    title: "Last 4 digits only",
    body: "Account and policy numbers are kept as their last 4 digits, never in full.",
  },
  {
    icon: BarChart3,
    title: "Rules calculate, AI explains",
    body: "Every amount comes from fixed rules. AI only describes the result and shows its sources.",
  },
] as const;

function Privacy() {
  return (
    <section id="privacy" className={cx(styles.section, styles.onStrong)} aria-labelledby="privacy-title">
      <svg
        className={styles.privacyCompass}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={0.6}
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="6.5" />
        <path d="M15.5 8.5l-2 5-5 2 2-5z" />
        <path d="M12 1.5v2M12 20.5v2M1.5 12h2M20.5 12h2" />
      </svg>
      <div className={cx(styles.container, styles.privacyLayout)}>
        <div className={cx(styles.sectionHead, styles.privacyHead, styles.reveal)}>
          <span className={styles.kicker}>Privacy by design</span>
          <h2 id="privacy-title" className={styles.h2}>
            It looks. It never touches.
          </h2>
          <p className={styles.sectionLead}>
            MoneyPilot plans. It can’t pay, transfer or send money, and it keeps only what it needs to plan.
          </p>
        </div>
        <ul className={styles.privacyList}>
          {PRIVACY.map(({ icon: Icon, title, body }) => (
            <li key={title} className={cx(styles.privacyItem, styles.reveal)}>
              <Icon size={22} strokeWidth={1.8} className={styles.privacyIcon} aria-hidden="true" />
              <h3 className={styles.privacyTitle}>{title}</h3>
              <p className={styles.privacyBody}>{body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Closing() {
  return (
    <section className={styles.closing} aria-labelledby="closing-title">
      <div className={styles.container}>
        <div className={cx(styles.closingCard, styles.reveal)}>
          <div className={cx(styles.dots, styles.dotsStrong)} aria-hidden="true" />
          <div className={styles.closingCopy}>
            <CompassMark size={72} needle="sway" />
            <div className={styles.closingText}>
              <h2 id="closing-title" className={styles.closingTitle}>
                Get to payday, together.
              </h2>
              <p className={styles.closingLead}>
                Create your household in a few minutes, then invite your partner.
              </p>
            </div>
          </div>
          <div className={styles.closingActions}>
            <Link href="/sign-up" className={cx(styles.btn, styles.btnLarge, styles.btnInverse)}>
              Create your household
              <ArrowRight size={16} strokeWidth={1.8} className={styles.arrow} aria-hidden="true" />
            </Link>
            <Link href="/sign-in" className={cx(styles.btn, styles.btnLarge, styles.btnTextInverse)}>
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={cx(styles.container, styles.footerInner)}>
        <span className={styles.footerBrand}>
          <CompassMark size={28} />© 2026 MoneyPilot. A planning tool. It never moves money.
        </span>
        <nav aria-label="Footer" className={styles.footerLinks}>
          <a href="#privacy" className={styles.footerLink}>
            Privacy
          </a>
          <Link href="/sign-in" className={styles.footerLink}>
            Sign in
          </Link>
          <Link href="/sign-up" className={styles.footerLink}>
            Create account
          </Link>
        </nav>
      </div>
    </footer>
  );
}

export function Landing() {
  return (
    <div className={styles.page}>
      <Header />
      <main>
        <Hero />
        <Ticker />
        <Pillars />
        <HowItWorks />
        <Privacy />
        <section id="pricing" className={styles.section} aria-label="Pricing">
          <div className={styles.container}>
            <PricingPlans />
          </div>
        </section>
        <Closing />
      </main>
      <Footer />
    </div>
  );
}
