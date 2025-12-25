import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { X, Clock, Building2, User, Briefcase, Pause, Play, Square, Minimize2, Maximize2 } from 'lucide-react';
import { useWorkflowContext, ProjectTask, Project } from './WorkflowContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface FloatingTimerWidgetProps {
  task: ProjectTask;
  project: Project;
  onClose: () => void;
}

export function FloatingTimerWidget({ task, project, onClose }: FloatingTimerWidgetProps) {
  const { 
    getTimerElapsed, 
    activeTimer, 
    pauseTimer, 
    resumeTimer,
    updateTimerTask,
    projects,
    stopTimer 
  } = useWorkflowContext();
  const [elapsed, setElapsed] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    const updateElapsed = () => {
      setElapsed(getTimerElapsed());
    };
    
    // Update immediately
    updateElapsed();
    
    // Then update every second
    const interval = setInterval(updateElapsed, 1000);

    return () => clearInterval(interval);
  }, [getTimerElapsed]);

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const handlePauseResume = () => {
    if (activeTimer?.isPaused) {
      resumeTimer();
    } else {
      pauseTimer();
    }
  };

  const handleStop = () => {
    const duration = stopTimer();
    const minutes = Math.floor(duration / 60);
    onClose();
  };

  const handleProjectChange = (newProjectId: string) => {
    updateTimerTask(newProjectId);
  };

  const availableProjects = projects.filter(p => p.workflowId === project.workflowId);

  // Minimized view
  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <div 
          className={`bg-gradient-to-br ${ 
            activeTimer?.isPaused 
              ? 'from-slate-500 to-slate-600' 
              : 'from-violet-600 to-violet-700'
          } text-white shadow-2xl rounded-lg overflow-hidden transition-all duration-300 cursor-pointer hover:scale-105`}
          onClick={() => setIsMinimized(false)}
        >
          <div className="relative">
            {/* Animated background pulse - only when not paused */}
            {!activeTimer?.isPaused && (
              <div className="absolute inset-0 bg-white/10 animate-pulse opacity-30" />
            )}
            
            <div className="relative p-3 flex items-center gap-3">
              <div className={`p-2 ${
                activeTimer?.isPaused ? 'bg-white/15' : 'bg-white/20'
              } rounded-lg backdrop-blur-sm flex-shrink-0`}>
                <Clock className="w-4 h-4" />
              </div>
              
              <div className="flex flex-col">
                <div className="text-lg font-mono tabular-nums tracking-tight">
                  {formatTime(elapsed)}
                </div>
                <div className="text-xs text-violet-100 truncate max-w-[150px]">
                  {task.name}
                </div>
              </div>

              {!activeTimer?.isPaused && (
                <div className="relative flex h-2 w-2 ml-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Full view
  return (
    <div className="fixed bottom-6 right-6 z-50 w-96">
      <div className={`bg-gradient-to-br ${
        activeTimer?.isPaused 
          ? 'from-slate-500 to-slate-600' 
          : 'from-violet-600 to-violet-700'
      } text-white shadow-2xl border-violet-500 rounded-lg overflow-hidden transition-all duration-300`}>
        <div className="relative">
          {/* Animated background pulse - only when not paused */}
          {!activeTimer?.isPaused && (
            <div className="absolute inset-0 bg-white/10 animate-pulse opacity-30" />
          )}
          
          <div className="relative p-5">
            {/* Header with controls */}
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3 flex-1">
                <div className={`p-2.5 ${
                  activeTimer?.isPaused ? 'bg-white/15' : 'bg-white/20'
                } rounded-lg backdrop-blur-sm flex-shrink-0`}>
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-violet-100 mb-1">
                    {activeTimer?.isPaused ? 'Timer Paused' : 'Timer Running'}
                  </div>
                  <div className="text-3xl font-mono tabular-nums tracking-tight">
                    {formatTime(elapsed)}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(true)}
                  className="text-white hover:bg-white/20 hover:text-white h-8 w-8 p-0 flex-shrink-0"
                  title="Minimize"
                >
                  <Minimize2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleStop}
                  className="text-white hover:bg-white/20 hover:text-white h-8 w-8 p-0 flex-shrink-0"
                  title="Stop and close"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex gap-2 mb-4">
              <Button
                onClick={handlePauseResume}
                variant="secondary"
                size="sm"
                className="flex-1 gap-2 bg-white/20 hover:bg-white/30 text-white border-white/20"
              >
                {activeTimer?.isPaused ? (
                  <>
                    <Play className="w-4 h-4" />
                    Resume
                  </>
                ) : (
                  <>
                    <Pause className="w-4 h-4" />
                    Pause
                  </>
                )}
              </Button>
              <Button
                onClick={handleStop}
                variant="secondary"
                size="sm"
                className="flex-1 gap-2 bg-red-500/80 hover:bg-red-600/90 text-white border-red-400/30"
              >
                <Square className="w-4 h-4" />
                Stop
              </Button>
            </div>

            {/* Task Info */}
            <div className="space-y-3 p-3 bg-black/10 rounded-lg backdrop-blur-sm">
              <div className="flex items-start gap-2">
                <Briefcase className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-violet-200" />
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-violet-100 mb-1">Task</div>
                  <div className="text-sm">{task.name}</div>
                </div>
              </div>

              {/* Project Selector */}
              <div className="flex items-start gap-2">
                <Briefcase className="w-3.5 h-3.5 mt-2.5 flex-shrink-0 text-violet-200" />
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-violet-100 mb-1.5">Project</div>
                  <Select value={project.id} onValueChange={handleProjectChange}>
                    <SelectTrigger className="w-full h-9 bg-white/10 border-white/20 text-white hover:bg-white/15">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableProjects.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          <div className="flex flex-col">
                            <span>{p.name}</span>
                            {p.clientName && (
                              <span className="text-xs text-slate-500">{p.clientName}</span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {project.clientName && (
                <div className="flex items-start gap-2">
                  {project.clientName.includes('Corp') || 
                   project.clientName.includes('LLC') || 
                   project.clientName.includes('Industries') || 
                   project.clientName.includes('Co') ? (
                    <Building2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-violet-200" />
                  ) : (
                    <User className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-violet-200" />
                  )}
                  <div className="min-w-0">
                    <div className="text-xs text-violet-100 mb-1">Client</div>
                    <div className="text-sm truncate">{project.clientName}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Status indicator */}
            {!activeTimer?.isPaused && (
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/20">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </div>
                <span className="text-xs text-violet-100">Recording time...</span>
              </div>
            )}

            {activeTimer?.isPaused && (
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/20">
                <Pause className="w-3.5 h-3.5 text-violet-200" />
                <span className="text-xs text-violet-100">Timer paused</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
