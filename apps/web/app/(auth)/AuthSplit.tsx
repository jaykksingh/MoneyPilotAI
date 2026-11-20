// The split screen for sign in and create account (DESIGN_SPEC §5.1.2): the form on one side, the navy
// brand panel on the other. Under 800 px the panel is hidden and the logo moves into the top bar.
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { CompassMark } from "../../lib/components/CompassMark";
import styles from "./auth.module.css";

export interface AuthSplitProps {
  /** The brand panel (SignInAside or SignUpAside). */
  aside: ReactNode;
  /** Top-right note: "New to MoneyPilot? Create an account" or "Already have an account? Sign in". */
  topNote?: ReactNode;
  children: ReactNode;
}

export function AuthSplit({ aside, topNote, children }: AuthSplitProps) {
  return (
    <div className={styles.split}>
      <main className={styles.formSide}>
        <div className={styles.topBar}>
          <Link href="/" className={styles.backLink}>
            <ChevronLeft size={16} strokeWidth={1.8} aria-hidden="true" />
            Back to home
          </Link>
          <Link href="/" className={`${styles.brand} ${styles.mobileBrand}`} aria-label="MoneyPilot home">
            <CompassMark />
            <span className={styles.wordmark}>MoneyPilot</span>
          </Link>
          {topNote && <span className={styles.topNote}>{topNote}</span>}
        </div>
        <div className={styles.formCenter}>
          <div className={styles.formColumn}>{children}</div>
        </div>
      </main>
      {aside}
    </div>
  );
}

/** The centered card page the invite flow uses (the previous sign-in layout). */
export function AuthCardPage({ children }: { children: ReactNode }) {
  return (
    <main className={styles.page}>
      <Link href="/" className={styles.brand}>
        <CompassMark />
        {/* The page's level-one heading, as in the previous sign-in layout; the cards below use h2. */}
        <h1 className={styles.wordmark}>MoneyPilot</h1>
      </Link>
      {children}
    </main>
  );
}
