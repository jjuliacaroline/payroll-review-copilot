import type { ReactNode } from "react";
import { requireDemoSession } from "@/lib/auth/require-demo-session";
import AppShell from "@/components/layout/app-shell";

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const session = await requireDemoSession();

  return <AppShell reviewerLabel={session.reviewerLabel}>{children}</AppShell>;
}
