import type { EmployeeRecord, PayrollAnomaly } from "@/lib/domain/types";

type AnomalyEvidencePanelProps = {
  anomaly: PayrollAnomaly;
  employee: EmployeeRecord;
};

export default function AnomalyEvidencePanel({ anomaly, employee }: AnomalyEvidencePanelProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Evidence</p>
        <p className="mt-2 text-sm leading-7 text-slate-700">{anomaly.evidence}</p>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
          Suggested next action
        </p>
        <p className="mt-2 text-sm leading-7 text-slate-700">{anomaly.suggestedNextAction}</p>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Employee context</p>
        <p className="mt-2 text-sm text-slate-700">{employee.fullName}</p>
        <p className="text-sm text-slate-500">{employee.roleTitle}</p>
        <p className="text-sm text-slate-500">{employee.team} team</p>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
          Previous month context
        </p>
        <p className="mt-2 text-sm text-slate-700">
          {anomaly.previousMonthContext ?? "No comparison note for the prior payroll run."}
        </p>
      </div>
    </div>
  );
}
