"use client";

import { Button, Card, ErrorBanner, StatusBanner, TextField } from "@mp/ui";
import { Lock, Mail, Smartphone } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties, FormEvent, ReactNode } from "react";
import { useAuth } from "../../../lib/auth/AuthProvider";
import { FIRST_NAME_MAX } from "../../../lib/auth/bootstrap";
import { AuthError, authMessage } from "../../../lib/auth/types";
import type { SignInStep } from "../../../lib/auth/types";
import { GOOGLE_SIGN_IN } from "../../../lib/config";
import { cx } from "../../../lib/components/cx";
import { FirstNameForm } from "../../../lib/components/FirstNameForm";
import { SignInAside, SignUpAside } from "../AuthAsides";
import { AuthSplit } from "../AuthSplit";
import { PasswordField } from "../PasswordField";
import { recallInviteToken } from "../invite/invite";
import styles from "../auth.module.css";

type Step = "sign_in" | "totp" | "sign_up" | "confirm_sign_up" | "forgot" | "reset";

const TITLES: Record<Step, { title: string; subtitle: string }> = {
  sign_in: { title: "Welcome back", subtitle: "Sign in to see what’s coming before payday." },
  totp: {
    title: "Check your authenticator app",
    subtitle: "Enter the 6-digit code it shows for MoneyPilot.",
  },
  sign_up: { title: "Create your account", subtitle: "You can invite your partner after this." },
  confirm_sign_up: { title: "Confirm your email", subtitle: "We sent a 6-digit code to your inbox." },
  forgot: { title: "Reset your password", subtitle: "We’ll email you a code." },
  reset: { title: "Choose a new password", subtitle: "Enter the code we emailed you." },
};

const SUBMIT: Record<Step, string> = {
  sign_in: "Sign in",
  totp: "Verify",
  sign_up: "Create account",
  confirm_sign_up: "Confirm email",
  forgot: "Send code",
  reset: "Change password",
};

/** What the submit button says while it works (§2.5.2). */
const BUSY: Record<Step, string> = {
  sign_in: "Signing in…",
  totp: "Checking the code…",
  sign_up: "Creating your account…",
  confirm_sign_up: "Confirming…",
  forgot: "Sending the code…",
  reset: "Changing your password…",
};

/** How long the "You're in" moment shows before the plan opens; a beat with reduced motion. */
const CELEBRATE_MS = 1100;
const CELEBRATE_REDUCED_MS = 300;

const prefersReducedMotion = () =>
  typeof window.matchMedia !== "function" || window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** The confirmation-code resend waits this long between sends. */
const RESEND_SECONDS = 30;

const SIGN_UP_STEPS = ["Your account", "Confirm email", "Your household"] as const;

const isSignUpStep = (step: Step) => step === "sign_up" || step === "confirm_sign_up";
const stagger = (n: number) => ({ "--step": n }) as CSSProperties;

function GoogleMark() {
  return (
    <svg
      className={styles.googleMark}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M20.5 12.2c0-.7-.1-1.3-.2-1.9H12v3.6h4.8a4.1 4.1 0 0 1-1.8 2.7" />
      <path d="M15 16.6A6.9 6.9 0 0 1 5.3 13" />
      <path d="M5.3 11A6.9 6.9 0 0 1 16.4 7.4" />
    </svg>
  );
}

function SignUpProgress({ step }: { step: Step }) {
  const current = step === "sign_up" ? 0 : 1;
  return (
    <div className={styles.progress}>
      <div className={styles.progressTrack} aria-hidden="true">
        <div
          className={styles.progressFill}
          style={{ width: `${((current + 1) / SIGN_UP_STEPS.length) * 100}%` }}
        />
      </div>
      <ol className={styles.progressSteps} aria-label="Sign-up steps">
        {SIGN_UP_STEPS.map((label, index) => (
          <li
            key={label}
            aria-current={index === current ? "step" : undefined}
            className={cx(
              styles.progressStep,
              index === current && styles.progressStepActive,
              index < current && styles.progressStepDone,
            )}
          >
            <span className={styles.progressMark} aria-hidden="true">
              {index < current ? "✓" : index + 1}
            </span>
            {label}
          </li>
        ))}
      </ol>
    </div>
  );
}

function SignedInMoment({ kind, firstName }: { kind: "returning" | "new"; firstName: string }) {
  return (
    <div className={styles.success} role="status">
      <span className={styles.successMark} aria-hidden="true">
        <svg
          width="34"
          height="34"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path className={styles.successCheck} d="M5 12l5 5L20 7" pathLength={1} />
        </svg>
      </span>
      <div className={cx(styles.heading, styles.in)} style={stagger(2)}>
        <h1 className={styles.title}>
          {kind === "new" ? `Welcome to MoneyPilot${firstName ? `, ${firstName}` : ""}` : "You’re in"}
        </h1>
        <p className={styles.subtitle}>
          {kind === "new" ? "Your account is ready. Let’s set up your household." : "Opening your plan…"}
        </p>
      </div>
      <div className={styles.successBar} aria-hidden="true">
        <span className={styles.successFill} />
      </div>
    </div>
  );
}

export interface SignInFlowProps {
  /** Which screen to open on (the invite page offers "Create account" and "Sign in" separately). */
  initialStep?: "sign_in" | "sign_up";
  /** Called once the person is signed in, instead of going to the Overview (the invite page accepts the invite). */
  onSignedIn?: () => void;
  /**
   * `split` (default) is the full sign-in page with the brand panel (DESIGN_SPEC §5.1.2), and keeps the address
   * bar on /sign-in or /sign-up. `card` is the form alone in a card, for the invite page.
   */
  layout?: "split" | "card";
}

export function SignInFlow({ initialStep = "sign_in", onSignedIn, layout = "split" }: SignInFlowProps = {}) {
  const { adapter, status, refresh } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<Step>(initialStep);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [code, setCode] = useState("");
  /** Authenticator code for a password reset, asked for only when the account has one. */
  const [mfaCode, setMfaCode] = useState("");
  const [needsMfa, setNeedsMfa] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  /** Seconds until the confirmation code can be sent again. */
  const [resendIn, setResendIn] = useState(0);
  const [googleBusy, setGoogleBusy] = useState(false);
  /** Bumped on every failure: replays the error entrance and shakes the form (§2.5.2). */
  const [failures, setFailures] = useState(0);
  const [shaking, setShaking] = useState(false);
  /** Set once signed in on the split page: shows the success moment before the plan opens. */
  const [celebrating, setCelebrating] = useState<"returning" | "new" | null>(null);
  /** The account was created in this visit, so the success moment says welcome. */
  const created = useRef(false);

  useEffect(() => {
    // Google sent the person back with a failure (the API redirects to /sign-in?error=oauth).
    if (new URLSearchParams(window.location.search).get("error") === "oauth") {
      setError("We couldn’t sign you in with Google. Try again, or use your email and password.");
    }
  }, []);

  useEffect(() => {
    if (status !== "signed_in") return;
    if (onSignedIn) {
      onSignedIn();
      return;
    }
    // A pending invite (the person left for Google and came back to /sign-in) goes back to the invitation.
    const next = recallInviteToken() ? "/invite" : "/overview";
    if (layout !== "split") {
      router.replace(next);
      return;
    }
    // A short success moment, so signing in feels like it landed (§2.5.2), then the plan opens.
    setCelebrating(created.current ? "new" : "returning");
    const timer = window.setTimeout(
      () => router.replace(next),
      prefersReducedMotion() ? CELEBRATE_REDUCED_MS : CELEBRATE_MS,
    );
    return () => window.clearTimeout(timer);
  }, [status, router, onSignedIn, layout]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = window.setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [resendIn]);

  if (status === "needs_name") {
    return layout === "split" ? (
      <AuthSplit aside={<SignInAside />}>
        <FirstNameForm />
      </AuthSplit>
    ) : (
      <FirstNameForm />
    );
  }

  function go(next: Step, message: string | null = null) {
    setStep(next);
    setCode("");
    setMfaCode("");
    setNeedsMfa(false);
    setError(null);
    setNotice(message);
    if (next === "confirm_sign_up") setResendIn(RESEND_SECONDS);
    // Keep the address bar honest on the standalone pages, without adding history entries.
    if (layout === "split" && (next === "sign_in" || next === "sign_up")) {
      const path = next === "sign_up" ? "/sign-up" : "/sign-in";
      if (window.location.pathname !== path) window.history.replaceState(null, "", path);
    }
  }

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await action();
    } catch (failure) {
      setError(authMessage(failure));
      setFailures((n) => n + 1);
      setShaking(true);
    } finally {
      setBusy(false);
    }
  }

  async function finish(result: SignInStep) {
    switch (result.step) {
      case "done":
        await refresh();
        return;
      case "totp":
        go("totp");
        return;
      case "confirm_sign_up":
        go("confirm_sign_up", "Enter the code we emailed you to confirm your address.");
        return;
      case "unsupported":
        setError(result.detail);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void run(async () => {
      switch (step) {
        case "sign_in":
          return finish(await adapter.signIn(email.trim(), password));
        case "totp":
          return finish(await adapter.confirmTotp(code.trim()));
        case "sign_up": {
          const result = await adapter.signUp({ email: email.trim(), password, firstName: firstName.trim() });
          created.current = true;
          return finish(result);
        }
        case "confirm_sign_up":
          await adapter.confirmSignUp(email.trim(), code.trim());
          created.current = true;
          // The real adapter signs the new account in: `refresh` picks that up and the effect above redirects.
          await refresh();
          return go("sign_in", "Your email is confirmed. Sign in to continue.");
        case "forgot":
          await adapter.requestPasswordReset(email.trim());
          return go("reset", "If that address has an account, a code is on its way.");
        case "reset":
          try {
            await adapter.confirmPasswordReset(
              email.trim(),
              code.trim(),
              password,
              mfaCode.trim() || undefined,
            );
          } catch (failure) {
            // An account with an authenticator app needs its code as well: ask for it, with a fresh email code.
            if (failure instanceof AuthError && failure.code === "mfa_required") setNeedsMfa(true);
            throw failure;
          }
          await refresh();
          return go("sign_in", "Your password is changed. Sign in with the new one.");
      }
    });
  }

  function resend() {
    void run(async () => {
      await adapter.resendSignUpCode(email.trim());
      setResendIn(RESEND_SECONDS);
      setNotice("A new code is on its way.");
    });
  }

  const showEmail = step === "sign_in" || step === "sign_up" || step === "forgot" || step === "reset";
  const showPassword = step === "sign_in" || step === "sign_up" || step === "reset";
  const showCode = step === "totp" || step === "confirm_sign_up" || step === "reset";
  // `process.env.NODE_ENV` is inlined by Next: in a production bundle the mock-only branches below are
  // constant `false` and are dropped, strings included (see lib/config.ts and the production-build test).
  const mockAuth = process.env.NODE_ENV !== "production" && adapter.kind === "mock";
  const googleAvailable = mockAuth || GOOGLE_SIGN_IN;
  const showGoogle = googleAvailable && (step === "sign_in" || step === "sign_up");
  const { title } = TITLES[step];
  const subtitle =
    step === "confirm_sign_up" && email.trim() !== ""
      ? `We sent a 6-digit code to ${email.trim()}.`
      : TITLES[step].subtitle;
  const split = layout === "split";

  const link = (label: string, to: Step): ReactNode => (
    <Button variant="text" size="compact" onClick={() => go(to)}>
      {label}
    </Button>
  );

  // Each field enters a beat after the one above it (§2.5.1); `order` counts them.
  let order = 2;
  const enter = () => ({ className: styles.in, style: stagger(order++) });

  const form = (
    <form
      className={cx(styles.form, shaking && styles.shake)}
      onSubmit={onSubmit}
      onAnimationEnd={(event) => {
        if (event.target === event.currentTarget) setShaking(false);
      }}
      noValidate
    >
      {notice && (
        <div key={`notice-${notice}`} className={styles.drop}>
          <StatusBanner>{notice}</StatusBanner>
        </div>
      )}
      {error && (
        <div key={`error-${failures}`} className={styles.drop}>
          <ErrorBanner title={error} />
        </div>
      )}
      {showGoogle && (
        <>
          <div {...enter()}>
            <Button
              variant="secondary"
              className={styles.full}
              busy={googleBusy}
              onClick={() =>
                void run(async () => {
                  setGoogleBusy(true);
                  try {
                    await adapter.signInWithGoogle(recallInviteToken() ? "/invite" : "/overview");
                  } finally {
                    setGoogleBusy(false);
                  }
                })
              }
            >
              {!googleBusy && <GoogleMark />}
              {googleBusy
                ? "Opening Google…"
                : step === "sign_up"
                  ? "Sign up with Google"
                  : "Continue with Google"}
            </Button>
          </div>
          <p className={cx(styles.divider, styles.in)} style={stagger(order++)}>
            or use your email
          </p>
        </>
      )}
      {step === "sign_up" && (
        <div {...enter()}>
          <TextField
            label="First name"
            autoComplete="given-name"
            value={firstName}
            maxLength={FIRST_NAME_MAX}
            onChange={(e) => setFirstName(e.target.value)}
            hint="Your partner sees it on the bills you own."
            required
          />
        </div>
      )}
      {showEmail && (
        <div {...enter()}>
          <TextField
            label="Email"
            type="email"
            autoComplete="username"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
      )}
      {showCode && (
        <div {...enter()}>
          <TextField
            label={step === "totp" ? "Authenticator code" : "Emailed code"}
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className={step === "reset" ? undefined : styles.codeInput}
            required
          />
        </div>
      )}
      {showPassword && (
        <div {...enter()}>
          <PasswordField
            label={step === "reset" ? "New password" : "Password"}
            autoComplete={step === "sign_in" ? "current-password" : "new-password"}
            value={password}
            onChange={setPassword}
            meter={step !== "sign_in"}
            labelAction={step === "sign_in" ? link("Forgot your password?", "forgot") : undefined}
            required
          />
        </div>
      )}
      {step === "reset" && needsMfa && (
        <TextField
          label="Authenticator code"
          inputMode="numeric"
          autoComplete="one-time-code"
          value={mfaCode}
          onChange={(e) => setMfaCode(e.target.value)}
          required
        />
      )}
      <div {...enter()}>
        <Button type="submit" className={styles.full} busy={busy && !googleBusy} disabled={googleBusy}>
          {busy && !googleBusy ? BUSY[step] : SUBMIT[step]}
        </Button>
      </div>
      {step === "confirm_sign_up" && (
        <div className={styles.resendRow}>
          {link("Change email", "sign_up")}
          {resendIn > 0 ? (
            <span className={styles.countdown} aria-live="off">
              Resend in 0:{String(resendIn).padStart(2, "0")}
            </span>
          ) : (
            <Button variant="text" size="compact" onClick={resend} disabled={busy}>
              Resend code
            </Button>
          )}
        </div>
      )}
      {step === "sign_in" && (
        <>
          <p className={cx(styles.trust, styles.in)} style={stagger(order++)}>
            <Lock size={14} strokeWidth={1.8} aria-hidden="true" />
            Read-only planning. MoneyPilot never moves money.
          </p>
          <div className={styles.links}>
            <span className={styles.note}>New to MoneyPilot?</span>
            {link("Create an account", "sign_up")}
          </div>
        </>
      )}
      {step === "sign_up" && (
        <div className={styles.links}>
          <span className={styles.note}>Already have an account?</span>
          {link("Sign in", "sign_in")}
        </div>
      )}
      {step !== "sign_in" && step !== "sign_up" && step !== "confirm_sign_up" && (
        <div className={styles.links}>{link("Back to sign in", "sign_in")}</div>
      )}
      {mockAuth && (
        <p className={styles.note}>
          Mock sign-in for local development: any password works. “mfa” asks for a code (123456).
        </p>
      )}
    </form>
  );

  if (!split) {
    return (
      <div className={styles.card}>
        <Card title={title} subtitle={subtitle}>
          {form}
        </Card>
      </div>
    );
  }

  if (celebrating) {
    return (
      <AuthSplit aside={celebrating === "new" ? <SignUpAside /> : <SignInAside />}>
        <SignedInMoment kind={celebrating} firstName={firstName.trim()} />
      </AuthSplit>
    );
  }

  const stepIcon = step === "totp" ? Smartphone : step === "confirm_sign_up" ? Mail : null;
  const StepIcon = stepIcon;
  return (
    <AuthSplit
      aside={isSignUpStep(step) ? <SignUpAside /> : <SignInAside />}
      topNote={
        isSignUpStep(step) ? (
          <>
            Already have an account? <Link href="/sign-in">Sign in</Link>
          </>
        ) : (
          <>
            New to MoneyPilot? <Link href="/sign-up">Create an account</Link>
          </>
        )
      }
    >
      <div key={step} className={styles.formColumn}>
        {isSignUpStep(step) && <SignUpProgress step={step} />}
        {StepIcon && (
          <span className={cx(styles.stepIcon, styles.in)} aria-hidden="true">
            <StepIcon
              size={26}
              strokeWidth={1.8}
              className={step === "confirm_sign_up" ? styles.bounce : undefined}
            />
          </span>
        )}
        <div className={cx(styles.heading, styles.in)} style={stagger(1)}>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>
        {form}
      </div>
    </AuthSplit>
  );
}
