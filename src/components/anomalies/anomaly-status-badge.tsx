import React from "react";
import type { AnomalyStatus } from "@/lib/domain/types";

const statusCopy: Record<
  AnomalyStatus,
  {
    label: string;
    className: string;
  }
> = {
  open: {
    label: "Open",
    className: "border-slate-200 bg-slate-100 text-slate-800",
  },
  reviewed: {
    label: "Reviewed",
    className: "border-emerald-200 bg-emerald-100 text-emerald-900",
  },
  waiting_for_customer: {
    label: "Waiting for customer",
    className: "border-amber-200 bg-amber-100 text-amber-900",
  },
  ignored: {
    label: "Ignored",
    className: "border-slate-200 bg-slate-100 text-slate-600",
  },
  message_drafted: {
    label: "Message drafted",
    className: "border-sky-200 bg-sky-100 text-sky-900",
  },
  message_sent: {
    label: "Message sent",
    className: "border-emerald-200 bg-emerald-100 text-emerald-900",
  },
};

type AnomalyStatusBadgeProps = {
  status: AnomalyStatus;
};

export default function AnomalyStatusBadge({ status }: AnomalyStatusBadgeProps) {
  const copy = statusCopy[status];

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold tracking-[0.18em] ${copy.className}`}
    >
      {copy.label}
    </span>
  );
}

