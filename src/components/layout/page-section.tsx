import React from "react";
import type { ReactNode } from "react";

type PageSectionProps = {
  children: ReactNode;
};

export default function PageSection({ children }: PageSectionProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.1)] sm:p-8">
      {children}
    </section>
  );
}
