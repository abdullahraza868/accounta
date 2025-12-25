import { useState } from "react";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import {
  Umbrella,
  Heart,
  TrendingUp,
  Calendar,
  Clock,
  Coffee,
  DollarSign,
  AlertCircle,
} from "lucide-react";
import { useWorkflowContext } from "./WorkflowContext";
import { cn } from "./ui/utils";

const SICK_LEAVE_TEMPLATES: Record<
  string,
  {
    name: string;
    accrualRate: number;
    annualLimit: number;
    cap: number;
  }
> = {
  "ca-sick-leave": {
    name: "California",
    accrualRate: 1,
    annualLimit: 40,
    cap: 48,
  },
  "ny-sick-leave": {
    name: "New York",
    accrualRate: 1,
    annualLimit: 56,
    cap: 56,
  },
  custom: {
    name: "Custom",
    accrualRate: 0,
    annualLimit: 0,
    cap: 0,
  },
};

export function MyHRBenefits() {
  const { firmSettings } = useWorkflowContext();

  // Mock user accrual data - in production, this would come from backend
  const userData = {
    ptoBalance: 42.5,
    ptoAccruedThisPeriod: 3.2,
    ptoUsedThisYear: 37.5,
    sickLeaveBalance: 28.0,
    sickLeaveAccruedThisPeriod: 2.0,
    sickLeaveUsedThisYear: 12.0,
    overtimeThisWeek: 0,
    overtimeThisMonth: 4.5,
    overtimeThisYear: 18.0,
    currentWeekHours: 35.0,
  };

  const ptoAnnualLimit = firmSettings?.ptoAnnualLimit || 80;
  const ptoUtilizationPercent =
    (userData.ptoUsedThisYear / ptoAnnualLimit) * 100;
  const ptoBalancePercent =
    (userData.ptoBalance / ptoAnnualLimit) * 100;

  const sickLeaveTemplate =
    SICK_LEAVE_TEMPLATES[
      firmSettings?.sickLeaveStateCompliance || "custom"
    ];
  const sickLeaveAnnualLimit =
    firmSettings?.sickLeaveAnnualLimit ||
    sickLeaveTemplate.annualLimit;
  const sickLeaveAccrualCap =
    firmSettings?.sickLeaveAccrualCap || sickLeaveTemplate.cap;
  const sickLeaveUtilizationPercent =
    (userData.sickLeaveUsedThisYear / sickLeaveAnnualLimit) *
    100;
  const sickLeaveBalancePercent =
    (userData.sickLeaveBalance / sickLeaveAccrualCap) * 100;

  const overtimeThreshold =
    firmSettings?.overtimeThreshold || 40;
  const hoursUntilOvertime = Math.max(
    0,
    overtimeThreshold - userData.currentWeekHours,
  );
  const overtimeMultiplier =
    firmSettings?.overtimeMultiplier || 1.5;

  return (
    <div className="space-y-6">
      {/* PTO Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-slate-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 px-6 py-4 border-b border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <Umbrella className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-gray-100">
                  Paid Time Off (PTO)
                </h3>
                <p className="text-sm text-slate-600 dark:text-gray-400">
                  Your vacation and personal time balance
                </p>
              </div>
            </div>
            <Badge className="bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-100">
              {firmSettings?.ptoAccrualMethod
                ?.replace(/-/g, " ")
                .toUpperCase() || "PER PAY PERIOD"}
            </Badge>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Balance Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg p-5 border-2 border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                Available Balance
              </p>
              <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                {userData.ptoBalance.toFixed(1)}
                <span className="text-lg text-blue-700 dark:text-blue-300 ml-1">
                  hrs
                </span>
              </p>
              <div className="mt-3">
                <Progress
                  value={ptoBalancePercent}
                  className="h-2 bg-blue-200 dark:bg-blue-800"
                />
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  {ptoBalancePercent.toFixed(0)}% of{" "}
                  {ptoAnnualLimit} hour cap
                </p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-gray-700 rounded-lg p-5 border-2 border-slate-200 dark:border-gray-600">
              <p className="text-sm text-slate-600 dark:text-gray-400 mb-2">
                Accrued This Period
              </p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-500">
                +{userData.ptoAccruedThisPeriod.toFixed(1)}
                <span className="text-lg text-green-600 dark:text-green-500 ml-1">
                  hrs
                </span>
              </p>
              <p className="text-xs text-slate-500 dark:text-gray-500 mt-3">
                At {firmSettings?.ptoAccrualRate || 0} hrs per
                period
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-gray-700 rounded-lg p-5 border-2 border-slate-200 dark:border-gray-600">
              <p className="text-sm text-slate-600 dark:text-gray-400 mb-2">
                Used This Year
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-gray-100">
                {userData.ptoUsedThisYear.toFixed(1)}
                <span className="text-lg text-slate-600 dark:text-gray-400 ml-1">
                  hrs
                </span>
              </p>
              <div className="mt-3">
                <Progress
                  value={ptoUtilizationPercent}
                  className="h-2"
                />
                <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">
                  {ptoUtilizationPercent.toFixed(0)}% of annual
                  limit
                </p>
              </div>
            </div>
          </div>

          {/* Policy Details */}
          <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              PTO Policy Details
            </h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-blue-700 dark:text-blue-300 font-medium">
                  Accrual Rate
                </p>
                <p className="text-blue-900 dark:text-blue-100">
                  {firmSettings?.ptoAccrualRate || 0} hours per{" "}
                  {firmSettings?.ptoAccrualMethod?.replace(
                    /-/g,
                    " ",
                  ) || "pay period"}
                </p>
              </div>
              <div>
                <p className="text-blue-700 dark:text-blue-300 font-medium">
                  Annual Limit
                </p>
                <p className="text-blue-900 dark:text-blue-100">
                  {ptoAnnualLimit} hours per year
                </p>
              </div>
              <div>
                <p className="text-blue-700 dark:text-blue-300 font-medium">
                  Rollover
                </p>
                <p className="text-blue-900 dark:text-blue-100">
                  {firmSettings?.ptoRollover !== false
                    ? "Allowed"
                    : "Not allowed"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sick Leave Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-slate-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/30 dark:to-pink-900/30 px-6 py-4 border-b border-rose-200 dark:border-rose-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-rose-100 dark:bg-rose-900 flex items-center justify-center">
                <Heart className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-gray-100">
                  Sick Leave
                </h3>
                <p className="text-sm text-slate-600 dark:text-gray-400">
                  Your sick time balance and accruals
                </p>
              </div>
            </div>
            <Badge className="bg-rose-100 text-rose-700 border-rose-300 hover:bg-rose-100">
              {sickLeaveTemplate.name} Compliant
            </Badge>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Balance Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-900/30 dark:to-rose-800/30 rounded-lg p-5 border-2 border-rose-200 dark:border-rose-800">
              <p className="text-sm text-rose-700 dark:text-rose-300 mb-2">
                Available Balance
              </p>
              <p className="text-3xl font-bold text-rose-900 dark:text-rose-100">
                {userData.sickLeaveBalance.toFixed(1)}
                <span className="text-lg text-rose-700 dark:text-rose-300 ml-1">
                  hrs
                </span>
              </p>
              <div className="mt-3">
                <Progress
                  value={sickLeaveBalancePercent}
                  className="h-2 bg-rose-200 dark:bg-rose-800"
                />
                <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">
                  {sickLeaveBalancePercent.toFixed(0)}% of{" "}
                  {sickLeaveAccrualCap} hour cap
                </p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-gray-700 rounded-lg p-5 border-2 border-slate-200 dark:border-gray-600">
              <p className="text-sm text-slate-600 dark:text-gray-400 mb-2">
                Accrued This Period
              </p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-500">
                +
                {userData.sickLeaveAccruedThisPeriod.toFixed(1)}
                <span className="text-lg text-green-600 dark:text-green-500 ml-1">
                  hrs
                </span>
              </p>
              <p className="text-xs text-slate-500 dark:text-gray-500 mt-3">
                At{" "}
                {firmSettings?.sickLeaveAccrualRate ||
                  sickLeaveTemplate.accrualRate}{" "}
                hr per{" "}
                {firmSettings?.sickLeaveAccrualMethod?.replace(
                  /-/g,
                  " ",
                ) || "hour worked"}
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-gray-700 rounded-lg p-5 border-2 border-slate-200 dark:border-gray-600">
              <p className="text-sm text-slate-600 dark:text-gray-400 mb-2">
                Used This Year
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-gray-100">
                {userData.sickLeaveUsedThisYear.toFixed(1)}
                <span className="text-lg text-slate-600 dark:text-gray-400 ml-1">
                  hrs
                </span>
              </p>
              <div className="mt-3">
                <Progress
                  value={sickLeaveUtilizationPercent}
                  className="h-2"
                />
                <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">
                  {sickLeaveUtilizationPercent.toFixed(0)}% of
                  annual limit
                </p>
              </div>
            </div>
          </div>

          {/* Policy Details */}
          <div className="bg-rose-50 dark:bg-rose-900/30 rounded-lg p-4 border border-rose-200 dark:border-rose-800">
            <h4 className="font-medium text-rose-900 dark:text-rose-100 mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Sick Leave Policy Details
            </h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-rose-700 dark:text-rose-300 font-medium">
                  Accrual Method
                </p>
                <p className="text-rose-900 dark:text-rose-100">
                  {firmSettings?.sickLeaveAccrualRate ||
                    sickLeaveTemplate.accrualRate}{" "}
                  hr per{" "}
                  {firmSettings?.sickLeaveAccrualMethod?.replace(
                    /-/g,
                    " ",
                  ) || "hour"}
                </p>
              </div>
              <div>
                <p className="text-rose-700 dark:text-rose-300 font-medium">
                  Annual Limit
                </p>
                <p className="text-rose-900 dark:text-rose-100">
                  {sickLeaveAnnualLimit} hours per year
                </p>
              </div>
              <div>
                <p className="text-rose-700 dark:text-rose-300 font-medium">
                  Accrual Cap
                </p>
                <p className="text-rose-900 dark:text-rose-100">
                  {sickLeaveAccrualCap} hours maximum
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overtime Tracking */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-slate-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 px-6 py-4 border-b border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-gray-100">
                  Overtime Tracking
                </h3>
                <p className="text-sm text-slate-600 dark:text-gray-400">
                  Monitor your overtime hours and threshold
                </p>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-700 border-green-300 hover:bg-green-100">
              {overtimeMultiplier}x Pay Rate
            </Badge>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Overtime Cards */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg p-5 border-2 border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                This Week
              </p>
              <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                {userData.currentWeekHours.toFixed(1)}
                <span className="text-lg text-blue-700 dark:text-blue-300 ml-1">
                  hrs
                </span>
              </p>
              <div className="mt-3">
                <Progress
                  value={
                    (userData.currentWeekHours /
                      overtimeThreshold) *
                    100
                  }
                  className="h-2 bg-blue-200 dark:bg-blue-800"
                />
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  {hoursUntilOvertime.toFixed(1)} hrs until OT
                </p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-gray-700 rounded-lg p-5 border-2 border-slate-200 dark:border-gray-600">
              <p className="text-sm text-slate-600 dark:text-gray-400 mb-2">
                OT This Week
              </p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-500">
                {userData.overtimeThisWeek.toFixed(1)}
                <span className="text-lg text-green-600 dark:text-green-500 ml-1">
                  hrs
                </span>
              </p>
              <p className="text-xs text-slate-500 dark:text-gray-500 mt-3">
                At {overtimeMultiplier}x rate
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-gray-700 rounded-lg p-5 border-2 border-slate-200 dark:border-gray-600">
              <p className="text-sm text-slate-600 dark:text-gray-400 mb-2">
                OT This Month
              </p>
              <p className="text-3xl font-bold text-amber-600 dark:text-amber-500">
                {userData.overtimeThisMonth.toFixed(1)}
                <span className="text-lg text-amber-600 dark:text-amber-500 ml-1">
                  hrs
                </span>
              </p>
              <p className="text-xs text-slate-500 dark:text-gray-500 mt-3">
                Current month
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-gray-700 rounded-lg p-5 border-2 border-slate-200 dark:border-gray-600">
              <p className="text-sm text-slate-600 dark:text-gray-400 mb-2">
                OT This Year
              </p>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-500">
                {userData.overtimeThisYear.toFixed(1)}
                <span className="text-lg text-purple-600 dark:text-purple-500 ml-1">
                  hrs
                </span>
              </p>
              <p className="text-xs text-slate-500 dark:text-gray-500 mt-3">
                Year to date
              </p>
            </div>
          </div>

          {/* OT Policy */}
          <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-4 border border-green-200 dark:border-green-800">
            <h4 className="font-medium text-green-900 dark:text-green-100 mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Overtime Policy
            </h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-green-700 dark:text-green-300 font-medium">
                  Weekly Threshold
                </p>
                <p className="text-green-900 dark:text-green-100">
                  {overtimeThreshold} hours per week
                </p>
              </div>
              <div>
                <p className="text-green-700 dark:text-green-300 font-medium">
                  Pay Multiplier
                </p>
                <p className="text-green-900 dark:text-green-100">
                  {overtimeMultiplier}x your regular rate
                </p>
              </div>
              <div>
                <p className="text-green-700 dark:text-green-300 font-medium">
                  Daily Threshold
                </p>
                <p className="text-green-900 dark:text-green-100">
                  {firmSettings?.dailyOvertimeThreshold
                    ? `${firmSettings.dailyOvertimeThreshold} hours`
                    : "Not set"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Other Firm Policies */}
      <div className="grid grid-cols-3 gap-4">
        {/* Holiday Policy */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-slate-200 dark:border-gray-700 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-900 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-gray-100">
                Holidays
              </h4>
              <p className="text-sm text-slate-600 dark:text-gray-400">
                Firm holiday policy
              </p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-gray-400">
                Firm Holidays
              </span>
              <span className="font-medium text-slate-900 dark:text-gray-100">
                {firmSettings?.firmHolidays?.length || 0} days
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-gray-400">
                Holiday Pay
              </span>
              <span className="font-medium text-slate-900 dark:text-gray-100">
                {firmSettings?.holidaysPaid
                  ? `${firmSettings.holidayPayRate}x rate`
                  : "Unpaid"}
              </span>
            </div>
          </div>
        </div>

        {/* Lunch Break Policy */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-slate-200 dark:border-gray-700 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
              <Coffee className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-gray-100">
                Lunch Break
              </h4>
              <p className="text-sm text-slate-600 dark:text-gray-400">
                Break policy
              </p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-gray-400">
                Default Break
              </span>
              <span className="font-medium text-slate-900 dark:text-gray-100">
                {firmSettings?.defaultLunchBreak || 30} minutes
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-gray-400">
                Deduction
              </span>
              <span className="font-medium text-slate-900 dark:text-gray-100">
                {firmSettings?.autoDeductLunch
                  ? "Auto-deduct"
                  : "Manual"}
              </span>
            </div>
          </div>
        </div>

        {/* Work Week */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-slate-200 dark:border-gray-700 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
              <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-gray-100">
                Work Week
              </h4>
              <p className="text-sm text-slate-600 dark:text-gray-400">
                Schedule details
              </p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-gray-400">
                Standard Week
              </span>
              <span className="font-medium text-slate-900 dark:text-gray-100">
                {firmSettings?.standardWorkWeek || 40} hours
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-gray-400">
                Pay Period
              </span>
              <span className="font-medium text-slate-900 dark:text-gray-100 capitalize">
                {firmSettings?.payPeriod?.replace(/-/g, " ") ||
                  "Biweekly"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}