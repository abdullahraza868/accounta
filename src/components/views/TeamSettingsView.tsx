import { useState } from "react";
import { StandaloneTeamSettings } from "../StandaloneTeamSettings";

export function TeamSettingsView() {
  return (
    <div className="flex-1 overflow-auto">
      <div className="min-h-screen bg-slate-50">
        <StandaloneTeamSettings />
      </div>
    </div>
  );
}