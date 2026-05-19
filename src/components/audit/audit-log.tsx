import React from "react";
import type { AuditEvent } from "@/lib/audit/types";
import AuditEventRow from "./audit-event-row";

type AuditLogProps = {
  events: AuditEvent[];
};

export default function AuditLog({ events }: AuditLogProps) {
  const sortedEvents = [...events].sort(
    (left, right) => new Date(right.at).getTime() - new Date(left.at).getTime(),
  );

  return (
    <section aria-labelledby="audit-timeline-title" className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="audit-timeline-title" className="text-lg font-semibold text-slate-900">
            Audit timeline
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Track how the AI assistant and reviewer decisions changed the payroll review.
          </p>
        </div>
        <p className="text-sm font-medium text-slate-500">{sortedEvents.length} entries</p>
      </div>
      <div className="rounded-3xl border border-slate-200 bg-white/90 px-5 py-2 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        {sortedEvents.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
            No audit activity has been recorded yet.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {sortedEvents.map((event) => (
              <AuditEventRow key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
