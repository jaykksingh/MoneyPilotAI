import type { ReactNode } from "react";

// Each auth page brings its own frame: the split screen for sign in and create account (AuthSplit),
// the centered card for the invite page (AuthCardPage). DESIGN_SPEC §5.1.2.
export default function AuthLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
