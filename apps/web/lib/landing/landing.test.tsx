import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { renderApp } from "../../test/render";
import { Landing } from "./Landing";

describe("landing page", () => {
  it("reads the headline as one sentence, without the rotating words", () => {
    renderApp(<Landing />, { signedIn: false });
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading.textContent).toContain("See what’s coming before");
    // The rotating words are hidden from assistive tech; the hidden copy says "payday."
    expect(within(heading).getAllByText("payday.")).toHaveLength(2);
  });

  it("links to create an account and to sign in", () => {
    renderApp(<Landing />, { signedIn: false });
    const create = screen.getAllByRole("link", { name: /Create (your household|account)/ });
    expect(create.length).toBeGreaterThan(0);
    for (const link of create) expect(link.getAttribute("href")).toBe("/sign-up");
    expect(screen.getAllByRole("link", { name: "Sign in" })[0]?.getAttribute("href")).toBe("/sign-in");
  });

  it("offers a way back into the app when already signed in", async () => {
    renderApp(<Landing />, { signedIn: true });
    const open = await screen.findByRole("link", { name: "Open MoneyPilot" });
    expect(open.getAttribute("href")).toBe("/overview");
  });

  it("switches Family Plus between monthly and yearly prices", async () => {
    renderApp(<Landing />, { signedIn: false });
    expect(screen.getByText("$7.99")).toBeTruthy();
    await userEvent.click(screen.getByRole("button", { name: "Yearly" }));
    expect(screen.getByText("$59.99")).toBeTruthy();
    expect(screen.getByText("About $5 a month, billed once a year.")).toBeTruthy();
  });

  it("describes the product preview in words and never offers to move money", () => {
    renderApp(<Landing />, { signedIn: false });
    expect(screen.getByText(/a household with \$1,007 safe to spend before their Nov 6 payday/)).toBeTruthy();
    const text = document.body.textContent ?? "";
    expect(text).not.toMatch(/\b(Pay now|Transfer|Send money)\b/);
  });
});
