import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { StandaloneTasksView } from "../StandaloneTasksView";
import { Toaster } from "../ui/sonner";

export function TasksView() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="min-h-screen bg-slate-50">
        <Toaster />
        <StandaloneTasksView />
      </div>
    </div>
  );
}