import { useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Separator } from "./ui/separator";
import {
  Clock,
  PlayCircle,
  StopCircle,
  Coffee,
  Calendar,
  Edit2,
  Check,
  X,
  AlertCircle,
} from "lucide-react";
import { cn } from "./ui/utils";
import { useWorkflowContext } from "./WorkflowContext";

export function MyTimeEntry() {
  const { firmSettings } = useWorkflowContext();
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState<Date | null>(
    null,
  );
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [breakStart, setBreakStart] = useState<Date | null>(
    null,
  );
  const [totalBreakTime, setTotalBreakTime] = useState(0); // in minutes

  // Manual entry state
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [manualEntries, setManualEntries] = useState<any[]>([
    {
      id: "1",
      date: new Date().toISOString().split("T")[0],
      project: "Project A",
      startTime: "09:00",
      endTime: "12:00",
      breakMinutes: 0,
      status: "approved",
    },
    {
      id: "2",
      date: new Date(Date.now() - 86400000)
        .toISOString()
        .split("T")[0],
      project: "Project B",
      startTime: "13:00",
      endTime: "17:30",
      breakMinutes: 30,
      status: "pending",
    },
  ]);
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [newEntry, setNewEntry] = useState({
    project: "",
    startTime: "",
    endTime: "",
    breakMinutes: 0,
  });

  // Time entry method from firm settings
  const timeEntryMethod =
    firmSettings?.timeEntryMethod || "hybrid";
  const userCanEditTime =
    firmSettings?.userTimeEditPermission || "free-edit";

  // Calculate current shift duration
  const getCurrentShiftDuration = () => {
    if (!clockInTime) return "0h 0m";
    const now = new Date();
    const diff = now.getTime() - clockInTime.getTime();
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  };

  // Calculate break duration
  const getCurrentBreakDuration = () => {
    if (!breakStart) return totalBreakTime;
    const now = new Date();
    const diff = now.getTime() - breakStart.getTime();
    return totalBreakTime + Math.floor(diff / 60000);
  };

  const handleClockIn = () => {
    setIsClockedIn(true);
    setClockInTime(new Date());
    setTotalBreakTime(0);
  };

  const handleClockOut = () => {
    setIsClockedIn(false);
    setClockInTime(null);
    setIsOnBreak(false);
    setBreakStart(null);
    setTotalBreakTime(0);
  };

  const handleStartBreak = () => {
    setIsOnBreak(true);
    setBreakStart(new Date());
  };

  const handleEndBreak = () => {
    if (breakStart) {
      const now = new Date();
      const diff = now.getTime() - breakStart.getTime();
      setTotalBreakTime(
        totalBreakTime + Math.floor(diff / 60000),
      );
    }
    setIsOnBreak(false);
    setBreakStart(null);
  };

  const handleAddManualEntry = () => {
    if (
      !newEntry.project ||
      !newEntry.startTime ||
      !newEntry.endTime
    )
      return;

    const entry = {
      id: Date.now().toString(),
      date: selectedDate,
      project: newEntry.project,
      startTime: newEntry.startTime,
      endTime: newEntry.endTime,
      breakMinutes: newEntry.breakMinutes,
      status:
        userCanEditTime === "requires-approval"
          ? "pending"
          : "approved",
    };

    setManualEntries([...manualEntries, entry]);
    setNewEntry({
      project: "",
      startTime: "",
      endTime: "",
      breakMinutes: 0,
    });
    setIsAddingEntry(false);
  };

  const calculateHours = (
    start: string,
    end: string,
    breakMins: number,
  ) => {
    const [startHr, startMin] = start.split(":").map(Number);
    const [endHr, endMin] = end.split(":").map(Number);
    const totalMinutes =
      endHr * 60 +
      endMin -
      (startHr * 60 + startMin) -
      breakMins;
    return (totalMinutes / 60).toFixed(2);
  };

  return (
    <div className="space-y-6">
      {/* Clock In/Out Section */}
      {(timeEntryMethod === "clock-in-out" ||
        timeEntryMethod === "hybrid") && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-slate-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-900/30 dark:to-indigo-900/30 px-6 py-4 border-b border-slate-200 dark:border-violet-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-900 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-gray-100">
                    Clock In/Out
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-gray-400">
                    Track your work hours in real-time
                  </p>
                </div>
              </div>
              <Badge
                variant={isClockedIn ? "default" : "secondary"}
                className={cn(
                  "px-3 py-1",
                  isClockedIn
                    ? "bg-green-500 hover:bg-green-600"
                    : "",
                )}
              >
                {isClockedIn ? "Clocked In" : "Clocked Out"}
              </Badge>
            </div>
          </div>

          <div className="p-6">
            {!isClockedIn ? (
              <div className="text-center py-8">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-900/30 dark:to-indigo-900/30 flex items-center justify-center mx-auto mb-4">
                  <PlayCircle className="w-10 h-10 text-violet-600 dark:text-violet-400" />
                </div>
                <h4 className="font-semibold text-slate-900 dark:text-gray-100 mb-2">
                  Ready to start your day?
                </h4>
                <p className="text-sm text-slate-600 dark:text-gray-400 mb-6">
                  Clock in to begin tracking your work time
                </p>
                <Button
                  onClick={handleClockIn}
                  className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
                >
                  <PlayCircle className="w-4 h-4" />
                  Clock In
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Current Shift Info */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-slate-50 dark:bg-gray-700 rounded-lg p-4 border border-slate-200 dark:border-gray-600">
                    <p className="text-sm text-slate-600 dark:text-gray-400 mb-1">
                      Clock In Time
                    </p>
                    <p className="font-semibold text-slate-900 dark:text-gray-100">
                      {clockInTime?.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="bg-slate-50 dark:bg-gray-700 rounded-lg p-4 border border-slate-200 dark:border-gray-600">
                    <p className="text-sm text-slate-600 dark:text-gray-400 mb-1">
                      Current Duration
                    </p>
                    <p className="font-semibold text-slate-900 dark:text-gray-100">
                      {getCurrentShiftDuration()}
                    </p>
                  </div>
                  <div className="bg-slate-50 dark:bg-gray-700 rounded-lg p-4 border border-slate-200 dark:border-gray-600">
                    <p className="text-sm text-slate-600 dark:text-gray-400 mb-1">
                      Break Time
                    </p>
                    <p className="font-semibold text-slate-900 dark:text-gray-100">
                      {getCurrentBreakDuration()} min
                    </p>
                  </div>
                </div>

                {/* Break Controls */}
                <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Coffee className="w-5 h-5 text-amber-600" />
                      <div>
                        <p className="font-medium text-slate-900">
                          Lunch Break
                        </p>
                        <p className="text-sm text-slate-600">
                          {isOnBreak
                            ? "Break in progress..."
                            : "Take a break when needed"}
                        </p>
                      </div>
                    </div>
                    {!isOnBreak ? (
                      <Button
                        onClick={handleStartBreak}
                        variant="outline"
                        className="gap-2 border-amber-300 hover:bg-amber-100"
                      >
                        <Coffee className="w-4 h-4" />
                        Start Break
                      </Button>
                    ) : (
                      <Button
                        onClick={handleEndBreak}
                        className="gap-2 bg-amber-600 hover:bg-amber-700"
                      >
                        <Check className="w-4 h-4" />
                        End Break
                      </Button>
                    )}
                  </div>
                </div>

                {/* Clock Out */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                  <p className="text-sm text-slate-600">
                    Ready to end your day? Clock out to complete
                    your timesheet.
                  </p>
                  <Button
                    onClick={handleClockOut}
                    variant="outline"
                    className="gap-2 border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <StopCircle className="w-4 h-4" />
                    Clock Out
                  </Button>
                </div>

                {/* Edit Permission Notice */}
                {userCanEditTime === "requires-approval" && (
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-900">
                      <p className="font-medium mb-1">
                        Manual Adjustments Require Approval
                      </p>
                      <p className="text-blue-700">
                        If you forget to clock out, you can
                        manually adjust your time entry. Your
                        manager will need to approve any
                        changes.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Manual Entry Section */}
      {(timeEntryMethod === "manual-entry" ||
        timeEntryMethod === "hybrid") && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-slate-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 px-6 py-4 border-b border-slate-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-gray-100">
                    Manual Time Entry
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-gray-400">
                    Enter or edit your time for specific days
                  </p>
                </div>
              </div>
              {userCanEditTime !== "view-only" && (
                <Button
                  onClick={() => setIsAddingEntry(true)}
                  disabled={isAddingEntry}
                  className="gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                >
                  <Edit2 className="w-4 h-4" />
                  Add Entry
                </Button>
              )}
            </div>
          </div>

          <div className="p-6 space-y-4">
            {/* Date Selector */}
            <div className="flex items-center gap-4">
              <Label>Select Date</Label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) =>
                  setSelectedDate(e.target.value)
                }
                max={new Date().toISOString().split("T")[0]}
                className="w-auto"
              />
            </div>

            {/* Add New Entry Form */}
            {isAddingEntry &&
              userCanEditTime !== "view-only" && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 space-y-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-slate-900">
                      New Time Entry
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIsAddingEntry(false);
                        setNewEntry({
                          project: "",
                          startTime: "",
                          endTime: "",
                          breakMinutes: 0,
                        });
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label>Project</Label>
                      <Select
                        value={newEntry.project}
                        onValueChange={(value) =>
                          setNewEntry({
                            ...newEntry,
                            project: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select project" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Project A">
                            Project A
                          </SelectItem>
                          <SelectItem value="Project B">
                            Project B
                          </SelectItem>
                          <SelectItem value="Project C">
                            Project C
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Start Time</Label>
                      <Input
                        type="time"
                        value={newEntry.startTime}
                        onChange={(e) =>
                          setNewEntry({
                            ...newEntry,
                            startTime: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <Label>End Time</Label>
                      <Input
                        type="time"
                        value={newEntry.endTime}
                        onChange={(e) =>
                          setNewEntry({
                            ...newEntry,
                            endTime: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="col-span-2">
                      <Label>Break Time (minutes)</Label>
                      <Input
                        type="number"
                        value={newEntry.breakMinutes}
                        onChange={(e) =>
                          setNewEntry({
                            ...newEntry,
                            breakMinutes:
                              parseInt(e.target.value) || 0,
                          })
                        }
                        min="0"
                      />
                    </div>
                  </div>

                  {userCanEditTime === "requires-approval" && (
                    <div className="bg-amber-50 rounded p-3 border border-amber-200 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-amber-900">
                        This entry will be submitted for manager
                        approval
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={handleAddManualEntry}
                      className="gap-2"
                    >
                      <Check className="w-4 h-4" />
                      {userCanEditTime === "requires-approval"
                        ? "Submit for Approval"
                        : "Save Entry"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsAddingEntry(false);
                        setNewEntry({
                          project: "",
                          startTime: "",
                          endTime: "",
                          breakMinutes: 0,
                        });
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

            {/* Time Entries List */}
            <div className="space-y-3">
              {manualEntries.filter(
                (e) => e.date === selectedDate,
              ).length === 0 ? (
                <div className="text-center py-12 bg-slate-50 dark:bg-gray-700 rounded-lg border border-slate-200 dark:border-gray-600">
                  <Calendar className="w-12 h-12 text-slate-400 dark:text-gray-500 mx-auto mb-3" />
                  <p className="text-slate-600 dark:text-gray-400">
                    No time entries for this date
                  </p>
                  <p className="text-sm text-slate-500 dark:text-gray-500 mt-1">
                    Click "Add Entry" to log your time
                  </p>
                </div>
              ) : (
                manualEntries
                  .filter((e) => e.date === selectedDate)
                  .map((entry) => (
                    <div
                      key={entry.id}
                      className="bg-slate-50 dark:bg-gray-700 rounded-lg p-4 border border-slate-200 dark:border-gray-600"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <p className="font-medium text-slate-900 dark:text-gray-100">
                              {entry.project}
                            </p>
                            <Badge
                              variant={
                                entry.status === "approved"
                                  ? "default"
                                  : "secondary"
                              }
                              className={cn(
                                "text-xs",
                                entry.status === "pending" &&
                                  "bg-amber-100 text-amber-700 border-amber-300",
                              )}
                            >
                              {entry.status === "approved"
                                ? "Approved"
                                : "Pending Approval"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-6 text-sm text-slate-600 dark:text-gray-400">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>
                                {entry.startTime} -{" "}
                                {entry.endTime}
                              </span>
                            </div>
                            {entry.breakMinutes > 0 && (
                              <div className="flex items-center gap-2">
                                <Coffee className="w-4 h-4" />
                                <span>
                                  {entry.breakMinutes} min break
                                </span>
                              </div>
                            )}
                            <div className="font-medium text-slate-900 dark:text-gray-100">
                              {calculateHours(
                                entry.startTime,
                                entry.endTime,
                                entry.breakMinutes,
                              )}{" "}
                              hours
                            </div>
                          </div>
                        </div>
                        {userCanEditTime !== "view-only" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-2"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
              )}
            </div>

            {/* View Only Notice */}
            {userCanEditTime === "view-only" && (
              <div className="bg-slate-100 dark:bg-gray-700 rounded-lg p-4 border border-slate-300 dark:border-gray-600 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-slate-600 dark:text-gray-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-slate-700 dark:text-gray-300">
                  <p className="font-medium mb-1">
                    View Only Mode
                  </p>
                  <p>
                    You can view your time entries but cannot
                    edit them. Contact your manager to make
                    changes.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-2 border-slate-200 dark:border-gray-700">
          <p className="text-sm text-slate-600 dark:text-gray-400 mb-1">
            This Week
          </p>
          <p className="text-2xl font-semibold text-slate-900 dark:text-gray-100">
            32.5h
          </p>
          <p className="text-xs text-green-600 dark:text-green-500 mt-1">
            ↑ 2.5h from last week
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-2 border-slate-200 dark:border-gray-700">
          <p className="text-sm text-slate-600 dark:text-gray-400 mb-1">
            Billable
          </p>
          <p className="text-2xl font-semibold text-green-600 dark:text-green-500">
            28h
          </p>
          <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">
            86% utilization
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-2 border-slate-200 dark:border-gray-700">
          <p className="text-sm text-slate-600 dark:text-gray-400 mb-1">
            Non-Billable
          </p>
          <p className="text-2xl font-semibold text-amber-600 dark:text-amber-500">
            4.5h
          </p>
          <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">
            14% of total
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-2 border-slate-200 dark:border-gray-700">
          <p className="text-sm text-slate-600 dark:text-gray-400 mb-1">
            Until OT
          </p>
          <p className="text-2xl font-semibold text-blue-600 dark:text-blue-500">
            7.5h
          </p>
          <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">
            40h threshold
          </p>
        </div>
      </div>
    </div>
  );
}