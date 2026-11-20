"use client";

import { Check } from "lucide-react";
import { useId, useState } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { cx } from "../../lib/components/cx";
import styles from "./password-field.module.css";

/** The API's rule (packages/contracts auth `Password`): 8 to 72 characters. */
export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 72;

const STRENGTH = ["", "Too short", "Okay", "Good", "Strong"] as const;

/** 0 = empty, 1 = under the minimum, then 2–4 by length and variety. Guidance only; the API decides. */
export function passwordStrength(password: string): 0 | 1 | 2 | 3 | 4 {
  const length = password.length;
  if (length === 0) return 0;
  if (length < PASSWORD_MIN) return 1;
  const variety = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((re) => re.test(password)).length;
  if (length >= 16 || (length >= 12 && variety >= 3)) return 4;
  if (length >= 12 || variety >= 3) return 3;
  return 2;
}

export interface PasswordFieldProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "className" | "value" | "onChange"
> {
  label: string;
  value: string;
  onChange: (value: string) => void;
  /** A link or button on the label row, such as "Forgot password?". */
  labelAction?: ReactNode;
  /** Sign-up shows the minimum length and a strength meter under the field. */
  meter?: boolean;
}

export function PasswordField({
  label,
  value,
  onChange,
  labelAction,
  meter = false,
  id,
  ...input
}: PasswordFieldProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const helpId = `${inputId}-help`;
  const [shown, setShown] = useState(false);
  const level = passwordStrength(value);
  const longEnough = value.length >= PASSWORD_MIN;

  return (
    <div className={styles.field}>
      <div className={styles.labelRow}>
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
        {labelAction}
      </div>
      <div className={styles.control}>
        <input
          id={inputId}
          type={shown ? "text" : "password"}
          className={styles.input}
          value={value}
          maxLength={PASSWORD_MAX}
          onChange={(e) => onChange(e.target.value)}
          aria-describedby={meter ? helpId : undefined}
          {...input}
        />
        <button
          type="button"
          className={styles.toggle}
          aria-label={shown ? "Hide password" : "Show password"}
          aria-pressed={shown}
          onClick={() => setShown((s) => !s)}
        >
          {shown ? "Hide" : "Show"}
        </button>
      </div>
      {meter && (
        <>
          <div className={styles.meter} aria-hidden="true">
            {[1, 2, 3, 4].map((segment) => (
              <span
                key={segment}
                className={cx(styles.segment, segment <= level && (level === 1 ? styles.weak : styles.on))}
              />
            ))}
          </div>
          <p id={helpId} className={styles.help} aria-live="polite">
            <span className={cx(styles.rule, longEnough && styles.ruleMet)}>
              {longEnough && <Check size={14} strokeWidth={2.4} aria-hidden="true" />}
              {PASSWORD_MIN} or more characters
            </span>
            <span className={styles.strength}>{STRENGTH[level]}</span>
          </p>
        </>
      )}
    </div>
  );
}
