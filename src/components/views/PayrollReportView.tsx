import { useState } from "react";
import { StandalonePayrollReport } from "../StandalonePayrollReport";

export function PayrollReportView() {
  return (
    <div className="flex-1 overflow-auto">
      <div className="min-h-screen bg-slate-50">
        <StandalonePayrollReport />
      </div>
    </div>
  );
}