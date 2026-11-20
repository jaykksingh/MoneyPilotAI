// Plans and prices from BACKEND_PLAN §7.10 (Free; Family Plus $7.99/mo or $59.99/yr).
// Partner sharing on Free vs Plus is an open product decision, so neither card lists it.
import { money } from "@mp/format";

export type BillingPeriod = "month" | "year";

export const FAMILY_PLUS = { monthlyCents: 799, yearlyCents: 5999 } as const;

/** The yearly price spread over 12 months, to the nearest whole dollar (integer cents throughout). */
const yearlyPerMonthCents = Math.round(FAMILY_PLUS.yearlyCents / 12);

export function familyPlusPrice(period: BillingPeriod): { price: string; per: string; note: string } {
  const perMonth = money(yearlyPerMonthCents, { mode: "headline", rounding: "nearest" });
  return period === "month"
    ? {
        price: money(FAMILY_PLUS.monthlyCents),
        per: "per month",
        note: `Or ${money(FAMILY_PLUS.yearlyCents)} a year, about ${perMonth} a month.`,
      }
    : {
        price: money(FAMILY_PLUS.yearlyCents),
        per: "per year",
        note: `About ${perMonth} a month, billed once a year.`,
      };
}

export const FREE_FEATURES = [
  "One household",
  "Bills calendar",
  "Manual entry and CSV import",
  "Your own forwarding address",
] as const;

export const PLUS_FEATURES = [
  "Everything in Free",
  "Gmail and Outlook connection, read-only",
  "Unlimited bills and renewals",
  "Goals and planned expenses",
  "Reminders and renewal alerts",
] as const;
