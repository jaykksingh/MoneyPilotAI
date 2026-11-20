// The sample household the landing page and the sign-in brand panel preview (DESIGN_SPEC §5.1.1).
// These are the engine's golden values for design/fixtures/rivera-household.json, copied here so the
// public pages need no API call. `sample.test.ts` fails if any of them drifts from the fixture's
// `expected` block, so the numbers still come from the engine (hard rule 4); they are only cached.
import { Temporal } from "@js-temporal/polyfill";
import { date, money } from "@mp/format";

export interface SampleRunwayDay {
  /** ISO date, household-local. */
  date: string;
  endOfDayCents: number;
  payday: boolean;
}

export const SAMPLE = {
  householdName: "Rivera household",
  today: "2026-10-27",
  payday: "2026-11-06",
  daysToPayday: 10,
  safeToSpendCents: 100_701,
  perDayCents: 10_070,
  cushionCents: 50_000,
  lowest: { date: "2026-11-05", balanceCents: 150_701 },
  billsBeforePayday: { count: 8, totalCents: 479_299, samCents: 179_399, jordanCents: 299_900 },
  carInsurance: { dueDate: "2026-11-04", amountCents: 68_400, safeToSpendIfMovedCents: 169_101 },
  rentCents: 215_000,
  daycareCents: 124_000,
  internetCents: 7_000,
  streamingPriceUpCents: 300,
  renewalsFound: 16,
  tasksDueThisWeek: 3,
  runway: [
    { date: "2026-10-27", endOfDayCents: 340_000, payday: false },
    { date: "2026-10-28", endOfDayCents: 340_000, payday: false },
    { date: "2026-10-29", endOfDayCents: 301_100, payday: false },
    { date: "2026-10-30", endOfDayCents: 591_100, payday: true },
    { date: "2026-10-31", endOfDayCents: 581_600, payday: false },
    { date: "2026-11-01", endOfDayCents: 366_600, payday: false },
    { date: "2026-11-02", endOfDayCents: 240_301, payday: false },
    { date: "2026-11-03", endOfDayCents: 226_101, payday: false },
    { date: "2026-11-04", endOfDayCents: 157_701, payday: false },
    { date: "2026-11-05", endOfDayCents: 150_701, payday: false },
    { date: "2026-11-06", endOfDayCents: 465_701, payday: true },
  ] satisfies SampleRunwayDay[],
} as const;

const TODAY = Temporal.PlainDate.from(SAMPLE.today);
const short = (iso: string): string => date(Temporal.PlainDate.from(iso), { relativeTo: TODAY });

/** Display strings, all through packages/format (hard rule 1). */
export const SAMPLE_TEXT = {
  safeToSpend: money(SAMPLE.safeToSpendCents, { mode: "headline" }),
  perDay: `≈ ${money(SAMPLE.perDayCents, { mode: "headline" })} a day`,
  payday: short(SAMPLE.payday),
  today: short(SAMPLE.today),
  lowest: money(SAMPLE.lowest.balanceCents, { mode: "headline" }),
  lowestDate: short(SAMPLE.lowest.date),
  cushion: money(SAMPLE.cushionCents, { mode: "headline" }),
  billsTotal: money(SAMPLE.billsBeforePayday.totalCents),
  samBills: money(SAMPLE.billsBeforePayday.samCents),
  jordanBills: money(SAMPLE.billsBeforePayday.jordanCents),
  carInsurance: money(SAMPLE.carInsurance.amountCents),
  carInsuranceDate: short(SAMPLE.carInsurance.dueDate),
  safeIfMoved: money(SAMPLE.carInsurance.safeToSpendIfMovedCents, { mode: "headline" }),
  rent: money(SAMPLE.rentCents),
  daycare: money(SAMPLE.daycareCents),
  internet: money(SAMPLE.internetCents),
  streamingPriceUp: money(SAMPLE.streamingPriceUpCents, { mode: "headline", rounding: "nearest" }),
} as const;

/** Sam's share of the bills before payday, as a percentage for the owner split bar. */
export const SAM_SHARE_PERCENT =
  (SAMPLE.billsBeforePayday.samCents / SAMPLE.billsBeforePayday.totalCents) * 100;

/** Bar heights for the mini runway, as a percentage of the highest day. */
export function runwayBars(): { date: string; percent: number; kind: "balance" | "payday" | "lowest" }[] {
  const max = Math.max(...SAMPLE.runway.map((d) => d.endOfDayCents));
  return SAMPLE.runway.map((d) => ({
    date: d.date,
    percent: (d.endOfDayCents / max) * 100,
    kind: d.date === SAMPLE.lowest.date ? "lowest" : d.payday ? "payday" : "balance",
  }));
}
