import React from "react";
import type { AuditEvent } from "@/lib/audit/types";
import { formatAuditEvent } from "@/lib/audit/format-event";
import AuditActorBadge from "./audit-actor-badge";

type AuditEventRowProps = {
  event: AuditEvent;
};

export default function AuditEventRow({ event }: AuditEventRowProps) {
  const { actionLabel, timestampLabel } = formatAuditEvent(event);

  return (
    <article className="flex flex-col gap-3 py-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <AuditActorBadge actor={event.actor} />
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            {actionLabel}
          </span>
        </div>
        <p className="text-sm leading-7 text-slate-700">{event.detail}</p>
      </div>
      <time
        className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400"
        dateTime={event.at}
      >
        {timestampLabel}
      </time>
    </article>
  );
}
