import type { Metadata } from "next";
import { AuthCardPage } from "../AuthSplit";
import { InviteAccept } from "./InviteAccept";

export const metadata: Metadata = { title: "Join a household", robots: { index: false } };

export default function InvitePage() {
  return (
    <AuthCardPage>
      <InviteAccept />
    </AuthCardPage>
  );
}
