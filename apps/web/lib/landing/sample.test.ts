// The landing page's sample numbers must stay the engine's golden values (hard rules 4 and 10).
// This reads the fixture's `expected` block, which `pnpm test:engine` pins to the engine's output.
import { describe, expect, it } from "vitest";
import riveraFixture from "../../../../design/fixtures/rivera-household.json";
import { SAMPLE, SAMPLE_TEXT, runwayBars } from "./sample";

interface Fixture {
  today: string;
  bills: { id: string; amountCents: number; previousAmountCents?: number }[];
  expected: {
    planningWindow: { from: string; to: string; daysToPayday: number };
    runwayEndOfDayCents: Record<string, number>;
    lowest: { date: string; balanceCents: number };
    safeToSpendCents: number;
    safeToSpendDisplay: string;
    perDayDisplay: string;
    billsBeforePayday: { count: number; totalCents: number; byOwner: Record<string, number> };
    safeToSpendIfCarInsuranceMovedToPaydayCents: number;
    renewals: { foundAutomatically: number };
    tasks: { dueThisWeek: number };
  };
}

const fixture = riveraFixture as unknown as Fixture;
const { expected } = fixture;
const bill = (id: string) => fixture.bills.find((b) => b.id === id);

describe("landing sample household", () => {
  it("matches the golden planning window and runway", () => {
    expect(SAMPLE.today).toBe(fixture.today);
    expect(SAMPLE.today).toBe(expected.planningWindow.from);
    expect(SAMPLE.payday).toBe(expected.planningWindow.to);
    expect(SAMPLE.daysToPayday).toBe(expected.planningWindow.daysToPayday);
    expect(Object.fromEntries(SAMPLE.runway.map((d) => [d.date, d.endOfDayCents]))).toEqual(
      expected.runwayEndOfDayCents,
    );
    expect(SAMPLE.lowest).toEqual(expected.lowest);
  });

  it("matches the golden safe-to-spend, per day and bills before payday", () => {
    expect(SAMPLE.safeToSpendCents).toBe(expected.safeToSpendCents);
    expect(SAMPLE_TEXT.safeToSpend).toBe(expected.safeToSpendDisplay);
    expect(SAMPLE_TEXT.perDay).toBe(expected.perDayDisplay);
    expect(SAMPLE.billsBeforePayday).toEqual({
      count: expected.billsBeforePayday.count,
      totalCents: expected.billsBeforePayday.totalCents,
      samCents: expected.billsBeforePayday.byOwner["m-sam"],
      jordanCents: expected.billsBeforePayday.byOwner["m-jordan"],
    });
    expect(SAMPLE.carInsurance.safeToSpendIfMovedCents).toBe(
      expected.safeToSpendIfCarInsuranceMovedToPaydayCents,
    );
  });

  it("matches the golden renewal and task counts", () => {
    expect(SAMPLE.renewalsFound).toBe(expected.renewals.foundAutomatically);
    expect(SAMPLE.tasksDueThisWeek).toBe(expected.tasks.dueThisWeek);
  });

  it("uses the fixture's bill amounts", () => {
    expect(SAMPLE.rentCents).toBe(bill("b-rent")?.amountCents);
    expect(SAMPLE.daycareCents).toBe(bill("b-daycare")?.amountCents);
    expect(SAMPLE.internetCents).toBe(bill("b-internet")?.amountCents);
    expect(SAMPLE.carInsurance.amountCents).toBe(bill("b-carins")?.amountCents);
    const stream = bill("b-stream");
    expect(SAMPLE.streamingPriceUpCents).toBe(
      (stream?.amountCents ?? 0) - (stream?.previousAmountCents ?? 0),
    );
  });

  it("formats through packages/format", () => {
    expect(SAMPLE_TEXT).toMatchObject({
      safeToSpend: "$1,007",
      lowest: "$1,507",
      lowestDate: "Nov 5",
      payday: "Nov 6",
      billsTotal: "$4,792.99",
      safeIfMoved: "$1,691",
      streamingPriceUp: "$3",
    });
  });

  it("draws the lowest day and both paydays in their own colors", () => {
    const bars = runwayBars();
    expect(bars).toHaveLength(11);
    expect(bars.filter((b) => b.kind === "lowest").map((b) => b.date)).toEqual(["2026-11-05"]);
    expect(bars.filter((b) => b.kind === "payday").map((b) => b.date)).toEqual(["2026-10-30", "2026-11-06"]);
    expect(Math.max(...bars.map((b) => b.percent))).toBe(100);
  });
});
