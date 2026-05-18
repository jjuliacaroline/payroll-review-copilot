import React from "react";
import type { PayrollRunSummary } from "@/lib/payroll/summary";
import { formatNumber } from "@/lib/format/number";
import SummaryCard from "./summary-card";

type PayrollRunSummaryProps = {
  summary: PayrollRunSummary;
};

export default function PayrollRunSummary({ summary }: PayrollRunSummaryProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-900">Run highlights</h2>
      <p className="mt-1 text-sm text-slate-600">
        Key metrics for this payroll run.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <SummaryCard
          label="Total employees"
          value={`${formatNumber(summary.employeeCount)}`}
        />
        <SummaryCard
          label="Detected anomalies"
          value={`${formatNumber(summary.detectedAnomalies)}`}
        />
        <SummaryCard
          label="Critical issues"
          value={`${formatNumber(summary.criticalIssues)}`}
        />
        <SummaryCard
          label="Waiting for customer"
          value={`${formatNumber(summary.waitingForCustomerInput)}`}
        />
        <SummaryCard
          label="Time saved"
          value={`${formatNumber(summary.estimatedTimeSavedMinutes)} min`}
          helper="Estimated specialist time saved"
        />
      </div>
    </div>
  );
}
