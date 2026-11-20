import type { Metadata } from "next";
import { SignInFlow } from "../sign-in/SignInFlow";

export const metadata: Metadata = { title: "Create account" };

export default function SignUpPage() {
  return <SignInFlow initialStep="sign_up" />;
}
