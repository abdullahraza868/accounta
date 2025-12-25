import { useState } from "react";
import { StandaloneUtilizationAnalytics } from "../StandaloneUtilizationAnalytics";

export function UtilizationAnalyticsView() {
  return (
    <div className="flex-1 overflow-auto">
      <div className="min-h-screen bg-slate-50">
        <StandaloneUtilizationAnalytics />;
      </div>
    </div>
  );
}