import React from "react";
import type { Severity } from "@/lib/domain/types";

const severityCopy: Record<
  Severity,
  {
    label: string;
    className: string;
  }
> = {
  critical: {
    label: "Critical",
    className: "border-rose-200 bg-rose-100 text-rose-900",
  },
  warning: {
    label: "Warning",
    className: "border-amber-200 bg-amber-100 text-amber-900",
  },
  info: {
    label: "Info",
    className: "border-sky-200 bg-sky-100 text-sky-900",
  },
};

type SeverityBadgeProps = {
  severity: Severity;
};

export default function SeverityBadge({ severity }: SeverityBadgeProps) {
  const copy = severityCopy[severity];

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${copy.className}`}
    >
      {copy.label}
    </span>
  );
}

