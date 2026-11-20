"use client";

import { money } from "@mp/format";
import { SegmentedControl } from "@mp/ui";
import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { cx } from "../components/cx";
import styles from "./landing.module.css";
import { FREE_FEATURES, PLUS_FEATURES, familyPlusPrice } from "./plans";
import type { BillingPeriod } from "./plans";

const PERIODS = [
  { value: "month", label: "Monthly" },
  { value: "year", label: "Yearly" },
] as const;

function Features({ items }: { items: readonly string[] }) {
  return (
    <ul className={styles.features}>
      {items.map((item) => (
        <li key={item} className={styles.feature}>
          <Check size={16} strokeWidth={2} className={styles.featureIcon} aria-hidden="true" />
          {item}
        </li>
      ))}
    </ul>
  );
}

export function PricingPlans() {
  const [period, setPeriod] = useState<BillingPeriod>("month");
  const plus = familyPlusPrice(period);
  return (
    <>
      <div className={cx(styles.sectionHead, styles.centered, styles.reveal)}>
        <span className={styles.kicker}>Pricing</span>
        <h2 className={styles.h2}>Start free. Upgrade when it clicks.</h2>
        <SegmentedControl
          label="Billing period"
          options={PERIODS}
          value={period}
          onChange={setPeriod}
          onCanvas
          className={styles.billing}
        />
      </div>
      <div className={cx(styles.plans, styles.sectionBody)}>
        <article className={cx(styles.plan, styles.reveal)}>
          <div className={styles.planHead}>
            <h3 className={styles.planName}>Free</h3>
            <div className={styles.priceRow}>
              <span className={styles.price}>{money(0, { mode: "headline" })}</span>
              <span className={styles.muted}>forever</span>
            </div>
            <span className={styles.planNote}>Everything you need to see the month ahead.</span>
          </div>
          <Features items={FREE_FEATURES} />
          <Link
            href="/sign-up"
            className={cx(styles.btn, styles.btnLarge, styles.btnSecondary, styles.full, styles.planCta)}
          >
            Start free
          </Link>
        </article>
        <article className={cx(styles.plan, styles.planFeatured, styles.reveal)}>
          <div className={styles.planHead}>
            <h3 className={styles.planName}>Family Plus</h3>
            <div className={styles.priceRow} aria-live="polite">
              <span className={styles.price}>{plus.price}</span>
              <span className={styles.muted}>{plus.per}</span>
            </div>
            <span className={styles.planNote}>{plus.note}</span>
          </div>
          <Features items={PLUS_FEATURES} />
          <Link
            href="/sign-up"
            className={cx(styles.btn, styles.btnLarge, styles.btnPrimary, styles.full, styles.planCta)}
          >
            Choose Family Plus
            <ArrowRight size={16} strokeWidth={1.8} className={styles.arrow} aria-hidden="true" />
          </Link>
        </article>
      </div>
      <p className={styles.footnote}>Prices in US dollars.</p>
    </>
  );
}
