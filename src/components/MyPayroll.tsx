import { useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  DollarSign,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  Clock,
  TrendingUp,
  Umbrella,
  Heart,
  Coffee,
} from "lucide-react";
import { Separator } from "./ui/separator";

interface PayPeriod {
  id: string;
  startDate: string;
  endDate: string;
  payDate: string;
  status: "current" | "paid" | "processing";
  regularHours: number;
  overtimeHours: number;
  ptoHours: number;
  sickHours: number;
  regularPay: number;
  overtimePay: number;
  ptoPay: number;
  sickPay: number;
  lunchDeduction: number;
  grossPay: number;
  netPay: number;
  hourlyRate: number;
}

export function MyPayroll() {
  const [selectedPeriod, setSelectedPeriod] =
    useState("current");

  // Mock pay periods - in production this would come from backend
  const payPeriods: PayPeriod[] = [
    {
      id: "current",
      startDate: "2024-11-11",
      endDate: "2024-11-24",
      payDate: "2024-11-29",
      status: "current",
      regularHours: 72.0,
      overtimeHours: 4.0,
      ptoHours: 8.0,
      sickHours: 0,
      regularPay: 6120.0,
      overtimePay: 510.0,
      ptoPay: 680.0,
      sickPay: 0,
      lunchDeduction: -50.0,
      grossPay: 7260.0,
      netPay: 5432.4,
      hourlyRate: 85.0,
    },
    {
      id: "period-1",
      startDate: "2024-10-28",
      endDate: "2024-11-10",
      payDate: "2024-11-15",
      status: "paid",
      regularHours: 80.0,
      overtimeHours: 0,
      ptoHours: 0,
      sickHours: 8.0,
      regularPay: 6800.0,
      overtimePay: 0,
      ptoPay: 0,
      sickPay: 680.0,
      lunchDeduction: -60.0,
      grossPay: 7420.0,
      netPay: 5551.0,
      hourlyRate: 85.0,
    },
    {
      id: "period-2",
      startDate: "2024-10-14",
      endDate: "2024-10-27",
      payDate: "2024-11-01",
      status: "paid",
      regularHours: 76.0,
      overtimeHours: 2.5,
      ptoHours: 0,
      sickHours: 0,
      regularPay: 6460.0,
      overtimePay: 318.75,
      ptoPay: 0,
      sickPay: 0,
      lunchDeduction: -55.0,
      grossPay: 6723.75,
      netPay: 5032.81,
      hourlyRate: 85.0,
    },
  ];

  const currentPeriod =
    payPeriods.find((p) => p.id === selectedPeriod) ||
    payPeriods[0];
  const totalHours =
    currentPeriod.regularHours +
    currentPeriod.overtimeHours +
    currentPeriod.ptoHours +
    currentPeriod.sickHours;

  const navigatePeriod = (direction: "prev" | "next") => {
    const currentIndex = payPeriods.findIndex(
      (p) => p.id === selectedPeriod,
    );
    if (direction === "next" && currentIndex > 0) {
      setSelectedPeriod(payPeriods[currentIndex - 1].id);
    } else if (
      direction === "prev" &&
      currentIndex < payPeriods.length - 1
    ) {
      setSelectedPeriod(payPeriods[currentIndex + 1].id);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with Period Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-slate-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-slate-900 dark:text-gray-100 mb-1">
              My Payroll
            </h2>
            <p className="text-slate-600 dark:text-gray-400">
              View your current and historical pay periods
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigatePeriod("prev")}
              disabled={
                selectedPeriod ===
                payPeriods[payPeriods.length - 1].id
              }
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Select
              value={selectedPeriod}
              onValueChange={setSelectedPeriod}
            >
              <SelectTrigger className="w-[280px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {payPeriods.map((period) => (
                  <SelectItem key={period.id} value={period.id}>
                    {formatDate(period.startDate)} -{" "}
                    {formatDate(period.endDate)}
                    {period.status === "current" &&
                      " (Current)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigatePeriod("next")}
              disabled={selectedPeriod === payPeriods[0].id}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Pay Period Details */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left Column - Pay Summary */}
        <div className="col-span-2 space-y-6">
          {/* Pay Period Info */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-slate-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-900/30 dark:to-indigo-900/30 px-6 py-4 border-b border-violet-200 dark:border-violet-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-900 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-gray-100">
                      Pay Period
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-gray-400">
                      {formatDate(currentPeriod.startDate)} -{" "}
                      {formatDate(currentPeriod.endDate)}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={
                    currentPeriod.status === "current"
                      ? "default"
                      : "secondary"
                  }
                  className={
                    currentPeriod.status === "current"
                      ? "bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-100"
                      : currentPeriod.status === "processing"
                        ? "bg-amber-100 text-amber-700 border-amber-300 hover:bg-amber-100"
                        : "bg-green-100 text-green-700 border-green-300 hover:bg-green-100"
                  }
                >
                  {currentPeriod.status === "current"
                    ? "In Progress"
                    : currentPeriod.status === "processing"
                      ? "Processing"
                      : "Paid"}
                </Badge>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-gray-400">
                    Pay Date
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-gray-100">
                    {formatDate(currentPeriod.payDate)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-gray-400">
                    Total Hours
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-gray-100">
                    {totalHours.toFixed(1)} hours
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-gray-400">
                    Hourly Rate
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-gray-100">
                    {formatCurrency(currentPeriod.hourlyRate)}
                    /hr
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Hours Breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-slate-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-slate-50 dark:bg-gray-700 px-6 py-4 border-b border-slate-200 dark:border-gray-600">
              <h3 className="font-semibold text-slate-900 dark:text-gray-100">
                Hours Breakdown
              </h3>
            </div>

            <div className="p-6 space-y-4">
              {/* Regular Hours */}
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-gray-700 rounded-lg border border-slate-200 dark:border-gray-600">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-gray-100">
                      Regular Hours
                    </p>
                    <p className="text-sm text-slate-600 dark:text-gray-400">
                      {currentPeriod.regularHours.toFixed(1)}{" "}
                      hours @{" "}
                      {formatCurrency(currentPeriod.hourlyRate)}
                      /hr
                    </p>
                  </div>
                </div>
                <p className="font-semibold text-slate-900 dark:text-gray-100">
                  {formatCurrency(currentPeriod.regularPay)}
                </p>
              </div>

              {/* Overtime Hours */}
              {currentPeriod.overtimeHours > 0 && (
                <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium text-green-900 dark:text-green-100">
                        Overtime Hours
                      </p>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        {currentPeriod.overtimeHours.toFixed(1)}{" "}
                        hours @{" "}
                        {formatCurrency(
                          currentPeriod.hourlyRate * 1.5,
                        )}
                        /hr (1.5x)
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold text-green-900 dark:text-green-100">
                    {formatCurrency(currentPeriod.overtimePay)}
                  </p>
                </div>
              )}

              {/* PTO Hours */}
              {currentPeriod.ptoHours > 0 && (
                <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <Umbrella className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium text-blue-900 dark:text-blue-100">
                        PTO Used
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        {currentPeriod.ptoHours.toFixed(1)}{" "}
                        hours @{" "}
                        {formatCurrency(
                          currentPeriod.hourlyRate,
                        )}
                        /hr
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold text-blue-900 dark:text-blue-100">
                    {formatCurrency(currentPeriod.ptoPay)}
                  </p>
                </div>
              )}

              {/* Sick Hours */}
              {currentPeriod.sickHours > 0 && (
                <div className="flex items-center justify-between p-4 bg-rose-50 dark:bg-rose-900/30 rounded-lg border border-rose-200 dark:border-rose-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-rose-100 dark:bg-rose-900 flex items-center justify-center">
                      <Heart className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                    </div>
                    <div>
                      <p className="font-medium text-rose-900 dark:text-rose-100">
                        Sick Leave Used
                      </p>
                      <p className="text-sm text-rose-700 dark:text-rose-300">
                        {currentPeriod.sickHours.toFixed(1)}{" "}
                        hours @{" "}
                        {formatCurrency(
                          currentPeriod.hourlyRate,
                        )}
                        /hr
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold text-rose-900 dark:text-rose-100">
                    {formatCurrency(currentPeriod.sickPay)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Deductions */}
          {currentPeriod.lunchDeduction !== 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-slate-200 dark:border-gray-700 overflow-hidden">
              <div className="bg-slate-50 dark:bg-gray-700 px-6 py-4 border-b border-slate-200 dark:border-gray-600">
                <h3 className="font-semibold text-slate-900 dark:text-gray-100">
                  Deductions
                </h3>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-900/30 rounded-lg border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                      <Coffee className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="font-medium text-amber-900 dark:text-amber-100">
                        Lunch Break Deduction
                      </p>
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        Unpaid break time
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold text-amber-900 dark:text-amber-100">
                    {formatCurrency(
                      currentPeriod.lunchDeduction,
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Pay Summary Card */}
        <div className="space-y-6">
          {/* Net Pay Card */}
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-700 rounded-xl border-2 border-green-600 dark:border-green-700 p-6 text-white shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-green-100 text-sm">
                  Net Pay
                </p>
                <p className="text-xs text-green-200">
                  After deductions
                </p>
              </div>
            </div>
            <p className="text-4xl font-bold mb-2">
              {formatCurrency(currentPeriod.netPay)}
            </p>
            <Separator className="my-4 bg-white/20" />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-green-100">
                  Gross Pay
                </span>
                <span className="font-medium">
                  {formatCurrency(currentPeriod.grossPay)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-100">
                  Deductions
                </span>
                <span className="font-medium">
                  {formatCurrency(
                    currentPeriod.grossPay -
                      currentPeriod.netPay,
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-slate-200 dark:border-gray-700 p-6">
            <h3 className="font-semibold text-slate-900 dark:text-gray-100 mb-4">
              Quick Stats
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-600 dark:text-gray-400 mb-1">
                  Gross Pay
                </p>
                <p className="text-2xl font-semibold text-slate-900 dark:text-gray-100">
                  {formatCurrency(currentPeriod.grossPay)}
                </p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-slate-600 dark:text-gray-400 mb-1">
                  Effective Rate
                </p>
                <p className="text-xl font-semibold text-slate-900 dark:text-gray-100">
                  {formatCurrency(
                    currentPeriod.grossPay / totalHours,
                  )}
                  /hr
                </p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-slate-600 dark:text-gray-400 mb-1">
                  Total Hours
                </p>
                <p className="text-xl font-semibold text-slate-900 dark:text-gray-100">
                  {totalHours.toFixed(1)} hrs
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <Button className="w-full gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700">
            <Download className="w-4 h-4" />
            Download Pay Stub
          </Button>
        </div>
      </div>

      {/* Year-to-Date Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-slate-200 dark:border-gray-700 p-6">
        <h3 className="font-semibold text-slate-900 dark:text-gray-100 mb-4">
          Year-to-Date Summary
        </h3>
        <div className="grid grid-cols-5 gap-6">
          <div>
            <p className="text-sm text-slate-600 dark:text-gray-400 mb-1">
              Total Earnings
            </p>
            <p className="text-2xl font-semibold text-slate-900 dark:text-gray-100">
              {formatCurrency(21403.75)}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-600 dark:text-gray-400 mb-1">
              Regular Pay
            </p>
            <p className="text-2xl font-semibold text-blue-600 dark:text-blue-400">
              {formatCurrency(19380.0)}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-600 dark:text-gray-400 mb-1">
              Overtime Pay
            </p>
            <p className="text-2xl font-semibold text-green-600 dark:text-green-400">
              {formatCurrency(828.75)}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-600 dark:text-gray-400 mb-1">
              PTO Pay
            </p>
            <p className="text-2xl font-semibold text-blue-600 dark:text-blue-400">
              {formatCurrency(680.0)}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-600 dark:text-gray-400 mb-1">
              Sick Pay
            </p>
            <p className="text-2xl font-semibold text-rose-600 dark:text-rose-400">
              {formatCurrency(680.0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}