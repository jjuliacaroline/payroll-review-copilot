import Link from "next/link";
import type { ReactNode } from "react";

type AccessStateCardProps = {
  eyebrow?: string;
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
  children?: ReactNode;
};

export function AccessStateCard({
  actionHref,
  actionLabel,
  description,
  eyebrow,
  children,
  title,
}: AccessStateCardProps) {
  return (
    <section className="mx-auto flex min-h-[100svh] max-w-xl items-center px-6 py-10">
      <div className="w-full rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur">
        {eyebrow ? (
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">{title}</h1>
        <p className="mt-4 text-base leading-7 text-slate-600">{description}</p>
        {children ? <div className="mt-2">{children}</div> : null}
        {actionHref && actionLabel ? (
          <div className="mt-8">
            <Link
              className="inline-flex items-center rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
              href={actionHref}
            >
              {actionLabel}
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
