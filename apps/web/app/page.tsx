import type { Metadata } from "next";
import { Landing } from "../lib/landing/Landing";

// The public landing page (DESIGN_SPEC §5.1.1). Signed-in people get "Open MoneyPilot" in the header.
export const metadata: Metadata = {
  title: { absolute: "MoneyPilot · Plan before payday, together" },
  description:
    "See every bill due before your next paycheck, how much is safe to spend, and who owns what. Read-only: MoneyPilot never moves money.",
};

export default function Home() {
  return <Landing />;
}
