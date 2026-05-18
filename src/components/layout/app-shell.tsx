import React from "react";
import type { ReactNode } from "react";
import Topbar from "./topbar";

type AppShellProps = {
  reviewerLabel: string;
  children: ReactNode;
};

export default function AppShell({ reviewerLabel, children }: AppShellProps) {
  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <Topbar reviewerLabel={reviewerLabel} />
      <main className="mx-auto max-w-6xl pb-10">{children}</main>
    </div>
  );
}
