import { useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  DollarSign,
  TrendingUp,
  Edit2,
  Check,
  X,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Input } from "./ui/input";
import { cn } from "./ui/utils";
import { useWorkflowContext } from "./WorkflowContext";

interface TimeEntry {
  id: string;
  date: string;
  dayOfWeek: string;
  project: string;
  clientName: string;
  hoursWorked: number;
  billableHours: number;
  nonBillableHours: number;
  hourlyRate: number;
  revenue: number;
  status: "approved" | "pending" | "draft";
}

export function MyAnalytics() {
  const { firmSettings } = useWorkflowContext();
  const userCanEditTime =
    firmSettings?.userTimeEditPermission || "free-edit";

  const [currentWeekStart, setCurrentWeekStart] = useState(
    () => {
      const today = new Date();
      const day = today.getDay();
      const diff = today.getDate() - day;
      return new Date(today.setDate(diff));
    },
  );

  const [editingEntry, setEditingEntry] = useState<
    string | null
  >(null);
  const [editValues, setEditValues] = useState<any>({});

  // Mock data - replace with actual user's data
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([
    {
      id: "1",
      date: "2024-11-18",
      dayOfWeek: "Monday",
      project: "Tax Return - ABC Corp",
      clientName: "ABC Corp",
      hoursWorked: 8.0,
      billableHours: 7.5,
      nonBillableHours: 0.5,
      hourlyRate: 85,
      revenue: 637.5,
      status: "approved",
    },
    {
      id: "2",
      date: "2024-11-19",
      dayOfWeek: "Tuesday",
      project: "Quarterly Review - XYZ Inc",
      clientName: "XYZ Inc",
      hoursWorked: 7.5,
      billableHours: 7.5,
      nonBillableHours: 0,
      hourlyRate: 85,
      revenue: 637.5,
      status: "approved",
    },
    {
      id: "3",
      date: "2024-11-20",
      dayOfWeek: "Wednesday",
      project: "Audit Prep - DEF LLC",
      clientName: "DEF LLC",
      hoursWorked: 8.5,
      billableHours: 8.0,
      nonBillableHours: 0.5,
      hourlyRate: 85,
      revenue: 680.0,
      status: "pending",
    },
  ]);

  const totalHours = timeEntries.reduce(
    (sum, entry) => sum + entry.hoursWorked,
    0,
  );
  const totalBillable = timeEntries.reduce(
    (sum, entry) => sum + entry.billableHours,
    0,
  );
  const totalNonBillable = timeEntries.reduce(
    (sum, entry) => sum + entry.nonBillableHours,
    0,
  );
  const totalRevenue = timeEntries.reduce(
    (sum, entry) => sum + entry.revenue,
    0,
  );
  const utilization =
    totalHours > 0
      ? ((totalBillable / totalHours) * 100).toFixed(1)
      : "0.0";
  const effectiveRate =
    totalBillable > 0
      ? (totalRevenue / totalBillable).toFixed(2)
      : "0.00";

  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(
      newDate.getDate() + (direction === "next" ? 7 : -7),
    );
    setCurrentWeekStart(newDate);
  };

  const formatDateRange = () => {
    const end = new Date(currentWeekStart);
    end.setDate(end.getDate() + 6);
    return `${currentWeekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
  };

  const handleEdit = (entry: TimeEntry) => {
    if (userCanEditTime === "view-only") return;
    setEditingEntry(entry.id);
    setEditValues({
      billableHours: entry.billableHours,
      nonBillableHours: entry.nonBillableHours,
    });
  };

  const handleSaveEdit = (entryId: string) => {
    setTimeEntries(
      timeEntries.map((entry) => {
        if (entry.id === entryId) {
          const newBillable =
            parseFloat(editValues.billableHours) || 0;
          const newNonBillable =
            parseFloat(editValues.nonBillableHours) || 0;
          return {
            ...entry,
            billableHours: newBillable,
            nonBillableHours: newNonBillable,
            hoursWorked: newBillable + newNonBillable,
            revenue: newBillable * entry.hourlyRate,
            status:
              userCanEditTime === "requires-approval"
                ? "pending"
                : "approved",
          };
        }
        return entry;
      }),
    );
    setEditingEntry(null);
    setEditValues({});
  };

  const handleCancelEdit = () => {
    setEditingEntry(null);
    setEditValues({});
  };

  return (
    <div className="space-y-6">
      {/* Header with Week Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-slate-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-slate-900 dark:text-gray-100 mb-1">
              My Time Analytics
            </h2>
            <p className="text-slate-600 dark:text-gray-400">
              Track your time entries, billable hours, and
              revenue
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-gray-700 rounded-lg border border-slate-200 dark:border-gray-600">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateWeek("prev")}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium text-slate-900 dark:text-gray-100 px-4">
              {formatDateRange()}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateWeek("next")}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Weekly Stats */}
        <div className="grid grid-cols-5 gap-4">
          <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-lg p-4 border border-violet-200">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-violet-600" />
              <p className="text-sm text-violet-700">
                Total Hours
              </p>
            </div>
            <p className="text-2xl font-semibold text-violet-900">
              {totalHours.toFixed(1)}
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <p className="text-sm text-green-700">Billable</p>
            </div>
            <p className="text-2xl font-semibold text-green-900">
              {totalBillable.toFixed(1)}h
            </p>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-4 border border-amber-200">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <p className="text-sm text-amber-700">
                Non-Billable
              </p>
            </div>
            <p className="text-2xl font-semibold text-amber-900">
              {totalNonBillable.toFixed(1)}h
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <p className="text-sm text-blue-700">
                Utilization
              </p>
            </div>
            <p className="text-2xl font-semibold text-blue-900">
              {utilization}%
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-purple-600" />
              <p className="text-sm text-purple-700">Revenue</p>
            </div>
            <p className="text-2xl font-semibold text-purple-900">
              ${totalRevenue.toFixed(0)}
            </p>
          </div>
        </div>
      </div>

      {/* Time Entries Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-slate-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-slate-50 dark:bg-gray-700 px-6 py-4 border-b border-slate-200 dark:border-gray-600">
          <h3 className="font-semibold text-slate-900 dark:text-gray-100">
            Daily Time Breakdown
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-gray-700 border-b border-slate-200 dark:border-gray-600">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-slate-600 dark:text-gray-400">
                  Date
                </th>
                <th className="text-left px-6 py-3 text-sm font-medium text-slate-600 dark:text-gray-400">
                  Project
                </th>
                <th className="text-right px-6 py-3 text-sm font-medium text-slate-600 dark:text-gray-400">
                  Total Hours
                </th>
                <th className="text-right px-6 py-3 text-sm font-medium text-slate-600 dark:text-gray-400">
                  Billable
                </th>
                <th className="text-right px-6 py-3 text-sm font-medium text-slate-600 dark:text-gray-400">
                  Non-Billable
                </th>
                <th className="text-right px-6 py-3 text-sm font-medium text-slate-600 dark:text-gray-400">
                  Rate
                </th>
                <th className="text-right px-6 py-3 text-sm font-medium text-slate-600 dark:text-gray-400">
                  Revenue
                </th>
                <th className="text-center px-6 py-3 text-sm font-medium text-slate-600 dark:text-gray-400">
                  Status
                </th>
                {userCanEditTime !== "view-only" && (
                  <th className="text-center px-6 py-3 text-sm font-medium text-slate-600 dark:text-gray-400">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-gray-600">
              {timeEntries.length === 0 ? (
                <tr>
                  <td
                    colSpan={
                      userCanEditTime !== "view-only" ? 9 : 8
                    }
                    className="px-6 py-12 text-center text-slate-500 dark:text-gray-400"
                  >
                    No time entries for this week
                  </td>
                </tr>
              ) : (
                timeEntries.map((entry) => (
                  <tr
                    key={entry.id}
                    className="hover:bg-slate-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-gray-100">
                          {entry.dayOfWeek}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-gray-400">
                          {new Date(
                            entry.date,
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-gray-100">
                          {entry.project}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-gray-400">
                          {entry.clientName}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-slate-900 dark:text-gray-100">
                      {entry.hoursWorked.toFixed(1)}h
                    </td>
                    <td className="px-6 py-4 text-right">
                      {editingEntry === entry.id ? (
                        <Input
                          type="number"
                          step="0.5"
                          value={editValues.billableHours}
                          onChange={(e) =>
                            setEditValues({
                              ...editValues,
                              billableHours: e.target.value,
                            })
                          }
                          className="w-20 text-right"
                        />
                      ) : (
                        <span className="text-green-600 font-medium">
                          {entry.billableHours.toFixed(1)}h
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {editingEntry === entry.id ? (
                        <Input
                          type="number"
                          step="0.5"
                          value={editValues.nonBillableHours}
                          onChange={(e) =>
                            setEditValues({
                              ...editValues,
                              nonBillableHours: e.target.value,
                            })
                          }
                          className="w-20 text-right"
                        />
                      ) : (
                        <span className="text-amber-600 font-medium">
                          {entry.nonBillableHours.toFixed(1)}h
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right text-slate-700 dark:text-gray-400">
                      ${entry.hourlyRate}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-slate-900 dark:text-gray-100">
                      ${entry.revenue.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-center">
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
                          : "Pending"}
                      </Badge>
                    </td>
                    {userCanEditTime !== "view-only" && (
                      <td className="px-6 py-4 text-center">
                        {editingEntry === entry.id ? (
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                handleSaveEdit(entry.id)
                              }
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleCancelEdit}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(entry)}
                            disabled={
                              userCanEditTime === "view-only"
                            }
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
            {timeEntries.length > 0 && (
              <tfoot className="bg-slate-50 border-t-2 border-slate-300 dark:bg-gray-700 dark:border-gray-600">
                <tr>
                  <td
                    colSpan={2}
                    className="px-6 py-4 font-semibold text-slate-900 dark:text-gray-100"
                  >
                    Weekly Total
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-slate-900 dark:text-gray-100">
                    {totalHours.toFixed(1)}h
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-green-600 dark:text-green-500">
                    {totalBillable.toFixed(1)}h
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-amber-600 dark:text-amber-500">
                    {totalNonBillable.toFixed(1)}h
                  </td>
                  <td className="px-6 py-4 text-right text-slate-700 dark:text-gray-400">
                    ${effectiveRate}
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-slate-900 dark:text-gray-100">
                    ${totalRevenue.toFixed(2)}
                  </td>
                  <td
                    colSpan={
                      userCanEditTime !== "view-only" ? 2 : 1
                    }
                  ></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Historical Comparison */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-slate-200 dark:border-gray-700 p-6">
        <h3 className="font-semibold text-slate-900 dark:text-gray-100 mb-4">
          Performance Trends
        </h3>
        <div className="grid grid-cols-3 gap-6">
          <div className="space-y-2">
            <p className="text-sm text-slate-600 dark:text-gray-400">
              Avg Weekly Hours (Last 4 Weeks)
            </p>
            <p className="text-2xl font-semibold text-slate-900 dark:text-gray-100">
              36.2h
            </p>
            <p className="text-sm text-green-600 dark:text-green-500">
              ↑ 4.2% from previous period
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-slate-600 dark:text-gray-400">
              Avg Utilization Rate
            </p>
            <p className="text-2xl font-semibold text-slate-900 dark:text-gray-100">
              84.5%
            </p>
            <p className="text-sm text-green-600 dark:text-green-500">
              ↑ 2.3% from previous period
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-slate-600 dark:text-gray-400">
              Avg Weekly Revenue
            </p>
            <p className="text-2xl font-semibold text-slate-900 dark:text-gray-100">
              $2,856
            </p>
            <p className="text-sm text-green-600 dark:text-green-500">
              ↑ 6.1% from previous period
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}