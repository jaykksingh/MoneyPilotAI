"use client";

import Link from "next/link";
import { useAuth } from "../auth/AuthProvider";
import { cx } from "../components/cx";
import styles from "./landing.module.css";

/** Header actions: "Sign in" and "Create account", or a way back into the app when already signed in. */
export function NavActions() {
  const { status } = useAuth();
  if (status === "signed_in" || status === "needs_name") {
    return (
      <div className={styles.navActions}>
        <Link href="/overview" className={cx(styles.btn, styles.btnPrimary)}>
          Open MoneyPilot
        </Link>
      </div>
    );
  }
  return (
    <div className={styles.navActions}>
      <Link href="/sign-in" className={cx(styles.btn, styles.btnText)}>
        Sign in
      </Link>
      <Link href="/sign-up" className={cx(styles.btn, styles.btnPrimary)}>
        Create account
      </Link>
    </div>
  );
}
