import React from "react";
import type { AuditActor } from "@/lib/audit/types";
import { getAuditActorLabel } from "@/lib/audit/labels";

type AuditActorBadgeProps = {
  actor: AuditActor;
};

export default function AuditActorBadge({ actor }: AuditActorBadgeProps) {
  const label = getAuditActorLabel(actor);
  const variantClass =
    actor === "system_ai"
      ? "border-indigo-200 bg-indigo-50 text-indigo-700"
      : "border-emerald-200 bg-emerald-50 text-emerald-700";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${variantClass}`}
    >
      {label}
    </span>
  );
}
