import React from "react";
import { getAuditActionLabel } from "@/lib/audit/labels";
import type { AuditEvent } from "@/lib/audit/types";

type ActionHistoryInlineProps = {
  events: AuditEvent[];
};

function formatAuditTimestamp(value: string) {
  return new Intl.DateTimeFormat("fi-FI", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(new Date(value));
}

export default function ActionHistoryInline({ events }: ActionHistoryInlineProps) {
  return (
    <section className="space-y-3">
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
          Action history
        </h4>
        <p className="mt-1 text-sm text-slate-600">
          Review actions and audit entries for this anomaly.
        </p>
      </div>
      {events.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
          No audit events yet.
        </p>
      ) : (
        <ol className="space-y-3">
          {events.map((event) => (
            <li key={event.id} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-slate-900">{getAuditActionLabel(event.action)}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{event.detail}</p>
                </div>
                <time className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                  {formatAuditTimestamp(event.at)}
                </time>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
