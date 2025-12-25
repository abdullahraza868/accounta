import { useParams, useNavigate } from "react-router-dom";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { ArrowLeft } from "lucide-react";
import { ActivityLog } from "../ActivityLog";

export function ProjectActivityLogView() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(`/projects/${projectId}`);
  };

  return (
    <div className="flex-1 p-6 overflow-auto bg-white dark:bg-gray-900">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="mt-1"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-slate-900 dark:text-white">Full Activity Log</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Complete history for Project #{projectId}
            </p>
          </div>
        </div>

        {/* Activity Log */}
        <Card className="p-6">
          <ActivityLog clientId={projectId || 'unknown'} compact={false} />
        </Card>
      </div>
    </div>
  );
}
