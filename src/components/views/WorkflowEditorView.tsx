import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { Button } from "../ui/button";
import { WorkflowBuilder } from "../WorkflowBuilder";
import { WorkflowProvider } from "../WorkflowContext";

export function WorkflowEditorView() {
  return (
    <WorkflowProvider>
      <div className="min-h-screen bg-slate-50 flex">
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="mb-6">
              <Button variant="ghost" className="gap-2 -ml-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Projects
              </Button>
            </div>
            <WorkflowBuilder />
          </div>
        </div>
      </div>
    </WorkflowProvider>
  );
}