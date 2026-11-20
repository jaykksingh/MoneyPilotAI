import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { renderApp } from "../../../test/render";
import { state } from "../../../mocks/state";
import { router } from "../../../test/setup";
import { SignInFlow } from "./SignInFlow";

async function fillSignIn(password: string) {
  await userEvent.type(screen.getByLabelText("Email"), "sam@rivera-household.example");
  await userEvent.type(screen.getByLabelText("Password"), password);
  await userEvent.click(screen.getByRole("button", { name: "Sign in" }));
}

describe("sign-in screens", () => {
  beforeEach(() => router.replace.mockClear());

  it("signs in, then syncs the user with POST /me/bootstrap", async () => {
    renderApp(<SignInFlow />, { signedIn: false });
    await fillSignIn("correct horse");
    await expect.poll(() => state.bootstrapCalls).toBe(1);
  });

  it("shows a short “You’re in” moment, then opens the plan", async () => {
    renderApp(<SignInFlow />, { signedIn: false });
    await fillSignIn("correct horse");
    expect((await screen.findByRole("status")).textContent).toContain("You’re in");
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/overview"), { timeout: 2000 });
  });

  it("opens the plan at once inside the invite card", async () => {
    renderApp(<SignInFlow layout="card" />, { signedIn: false });
    await fillSignIn("correct horse");
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/overview"));
    expect(screen.queryByText("You’re in")).toBeNull();
  });

  it("shows a calm error for the wrong password and keeps what was typed", async () => {
    renderApp(<SignInFlow />, { signedIn: false });
    await fillSignIn("wrong");
    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toContain("That email and password don’t match");
    expect((screen.getByLabelText("Email") as HTMLInputElement).value).toBe("sam@rivera-household.example");
    expect(state.bootstrapCalls).toBe(0);
  });

  it("asks for the authenticator code when the account has MFA", async () => {
    renderApp(<SignInFlow />, { signedIn: false });
    await fillSignIn("mfa");
    await screen.findByRole("heading", { name: "Check your authenticator app" });
    await userEvent.type(screen.getByLabelText("Authenticator code"), "000000");
    await userEvent.click(screen.getByRole("button", { name: "Verify" }));
    expect((await screen.findByRole("alert")).textContent).toContain("That code isn’t right");
    await userEvent.clear(screen.getByLabelText("Authenticator code"));
    await userEvent.type(screen.getByLabelText("Authenticator code"), "123456");
    await userEvent.click(screen.getByRole("button", { name: "Verify" }));
    await expect.poll(() => state.bootstrapCalls).toBe(1);
  });

  it("walks through password reset and back to sign-in", async () => {
    renderApp(<SignInFlow />, { signedIn: false });
    await userEvent.click(screen.getByRole("button", { name: "Forgot your password?" }));
    await userEvent.type(screen.getByLabelText("Email"), "sam@rivera-household.example");
    await userEvent.click(screen.getByRole("button", { name: "Send code" }));
    await screen.findByRole("heading", { name: "Choose a new password" });
    await userEvent.type(screen.getByLabelText("Emailed code"), "123456");
    await userEvent.type(screen.getByLabelText("New password"), "A-new-password-1");
    await userEvent.click(screen.getByRole("button", { name: "Change password" }));
    await screen.findByRole("heading", { name: "Welcome back" });
    expect(screen.getByRole("status").textContent).toContain("Your password is changed");
  });

  it("creates an account and confirms the email", async () => {
    renderApp(<SignInFlow />, { signedIn: false });
    await userEvent.click(screen.getByRole("button", { name: "Create an account" }));
    await userEvent.type(screen.getByLabelText("First name"), "Sam");
    await userEvent.type(screen.getByLabelText("Email"), "sam@rivera-household.example");
    await userEvent.type(screen.getByLabelText("Password"), "A-new-password-1");
    await userEvent.click(screen.getByRole("button", { name: "Create account" }));
    await screen.findByRole("heading", { name: "Confirm your email" });
    await userEvent.type(screen.getByLabelText("Emailed code"), "123456");
    await userEvent.click(screen.getByRole("button", { name: "Confirm email" }));
    await screen.findByRole("heading", { name: "Welcome back" });
  });

  it("says it can't reach sign-in when the API doesn't answer", async () => {
    const { createApiAuthAdapter } = await import("../../../lib/auth/api-adapter");
    const adapter = createApiAuthAdapter({
      baseUrl: "http://localhost:4000",
      fetch: async () => new Response(null, { status: 503 }),
    });
    renderApp(<SignInFlow />, { adapter, signedIn: false });
    await screen.findByRole("heading", { name: "Welcome back" });
    await userEvent.type(screen.getByLabelText("Email"), "a@b.example");
    await userEvent.type(screen.getByLabelText("Password"), "pw");
    await userEvent.click(screen.getByRole("button", { name: "Sign in" }));
    expect((await screen.findByRole("alert")).textContent).toContain("couldn’t reach the sign-in service");
  });

  it("shows and hides the password", async () => {
    renderApp(<SignInFlow />, { signedIn: false });
    const field = screen.getByLabelText("Password") as HTMLInputElement;
    expect(field.type).toBe("password");
    await userEvent.click(screen.getByRole("button", { name: "Show password" }));
    expect(field.type).toBe("text");
    expect(screen.getByRole("button", { name: "Hide password" }).getAttribute("aria-pressed")).toBe("true");
  });

  it("keeps the address bar on /sign-up while creating an account", async () => {
    window.history.replaceState(null, "", "/sign-in");
    renderApp(<SignInFlow />, { signedIn: false });
    await userEvent.click(screen.getByRole("button", { name: "Create an account" }));
    expect(window.location.pathname).toBe("/sign-up");
    await userEvent.click(screen.getByRole("button", { name: "Sign in" }));
    expect(window.location.pathname).toBe("/sign-in");
  });

  it("guides the password on sign-up and shows where you are in the steps", async () => {
    renderApp(<SignInFlow initialStep="sign_up" />, { signedIn: false });
    const steps = screen.getByRole("list", { name: "Sign-up steps" });
    expect(steps.querySelector('[aria-current="step"]')?.textContent).toContain("Your account");
    await userEvent.type(screen.getByLabelText("Password"), "short");
    expect(screen.getByText("Too short")).toBeTruthy();
    await userEvent.type(screen.getByLabelText("Password"), "-and-Long-1!");
    expect(screen.getByText("Strong")).toBeTruthy();
  });

  it("waits before the confirmation code can be sent again", async () => {
    renderApp(<SignInFlow initialStep="sign_up" />, { signedIn: false });
    await userEvent.type(screen.getByLabelText("First name"), "Sam");
    await userEvent.type(screen.getByLabelText("Email"), "sam@rivera-household.example");
    await userEvent.type(screen.getByLabelText("Password"), "A-new-password-1");
    await userEvent.click(screen.getByRole("button", { name: "Create account" }));
    await screen.findByRole("heading", { name: "Confirm your email" });
    expect(screen.getByText(/We sent a 6-digit code to sam@rivera-household\.example/)).toBeTruthy();
    expect(screen.getByText(/Resend in 0:30/)).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Resend code" })).toBeNull();
    const steps = screen.getByRole("list", { name: "Sign-up steps" });
    expect(steps.querySelector('[aria-current="step"]')?.textContent).toContain("Confirm email");
  });

  it("renders the form alone in a card for the invite page", () => {
    renderApp(<SignInFlow layout="card" />, { signedIn: false });
    expect(screen.queryByRole("complementary")).toBeNull();
    expect(screen.getByRole("heading", { name: "Welcome back" })).toBeTruthy();
  });

  it("shows the brand panel beside the form on the sign-in page", () => {
    renderApp(<SignInFlow />, { signedIn: false });
    expect(screen.getByRole("complementary", { name: "About MoneyPilot" })).toBeTruthy();
  });
});
