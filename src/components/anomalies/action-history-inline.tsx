import type { AuditEvent } from "@/lib/audit/types";
import { getAuditActionLabel, getAuditActorLabel } from "@/lib/audit/labels";

type ActionHistoryInlineProps = {
  events: AuditEvent[];
};

function formatAuditTimestamp(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(value));
}

export default function ActionHistoryInline({ events }: ActionHistoryInlineProps) {
  const sortedEvents = [...events].sort(
    (left, right) => new Date(right.at).getTime() - new Date(left.at).getTime(),
  );

  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between">
        <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Action history</h4>
        <span className="text-xs text-slate-400">{sortedEvents.length} entries</span>
      </div>
      {sortedEvents.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
          No actions recorded yet.
        </p>
      ) : (
        <div className="space-y-3">
          {sortedEvents.map((event) => (
            <article key={event.id} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-500">
                <span>{getAuditActorLabel(event.actor)}</span>
                <span>·</span>
                <span>{getAuditActionLabel(event.action)}</span>
              </div>
              <p className="mt-2 text-sm text-slate-700">{event.detail}</p>
              <p className="mt-2 text-xs text-slate-400">{formatAuditTimestamp(event.at)}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
