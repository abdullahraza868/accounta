import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import {
  Users,
  UserPlus,
  UserCheck,
  UserX,
  Clock,
  AlertTriangle,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Info
} from 'lucide-react';
import { cn } from './ui/utils';
import { toast } from 'sonner@2.0.3';
import type { FirmSubscription, SeatUsageSummary } from '../types/subscription';
import { PurchaseSeatsWizard } from './PurchaseSeatsWizard';

type SeatManagementCardProps = {
  subscription: FirmSubscription;
  onPurchaseSeats: (quantity: number, billingCycle: 'monthly' | 'yearly') => Promise<void>;
  className?: string;
};

export function SeatManagementCard({ subscription, onPurchaseSeats, className }: SeatManagementCardProps) {
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [seatsToAdd, setSeatsToAdd] = useState(1);
  const [isPurchasing, setIsPurchasing] = useState(false);

  // Calculate usage summary
  const usageSummary: SeatUsageSummary = {
    total: subscription.totalSeats,
    used: subscription.usedSeats,
    available: subscription.availableSeats,
    reserved: subscription.reservedSeats,
    utilizationPercentage: (subscription.usedSeats / subscription.totalSeats) * 100,
    warningThreshold: (subscription.usedSeats / subscription.totalSeats) >= 0.8,
    criticalThreshold: subscription.availableSeats === 0,
  };

  const handlePurchaseClick = () => {
    setPurchaseDialogOpen(true);
    setSeatsToAdd(1);
  };

  const handleConfirmPurchase = async () => {
    if (seatsToAdd < 1) {
      toast.error('Please enter a valid number of seats');
      return;
    }

    setIsPurchasing(true);
    try {
      await onPurchaseSeats(seatsToAdd, 'monthly');
      toast.success(`Successfully purchased ${seatsToAdd} seat${seatsToAdd > 1 ? 's' : ''}`, {
        description: 'Your new seats are now available for team member invitations.',
      });
      setPurchaseDialogOpen(false);
      setSeatsToAdd(1);
    } catch (error) {
      toast.error('Failed to purchase seats', {
        description: error instanceof Error ? error.message : 'Please try again or contact support.',
      });
    } finally {
      setIsPurchasing(false);
    }
  };

  const calculateNewCost = () => {
    const additionalCost = seatsToAdd * subscription.perSeatPrice;
    return subscription.totalMonthlyCost + additionalCost;
  };

  return (
    <>
      <Card className={cn('p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700', className)}>
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">Team Seats</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage your team member seats and subscription
            </p>
          </div>
        </div>

        {/* Available Seats - Prominent Display */}
        <div className="mb-6">
          <div 
            className={cn(
              "rounded-xl p-6 border-2 transition-all",
              subscription.availableSeats === 0 
                ? "bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/30 border-red-300 dark:border-red-700"
                : subscription.availableSeats <= 2
                ? "bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/30 border-yellow-300 dark:border-yellow-700"
                : "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/30 border-blue-300 dark:border-blue-700"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Users className={cn(
                    "w-5 h-5",
                    subscription.availableSeats === 0 ? "text-red-600 dark:text-red-400"
                    : subscription.availableSeats <= 2 ? "text-yellow-600 dark:text-yellow-400"
                    : "text-blue-600 dark:text-blue-400"
                  )} />
                  <span className={cn(
                    "text-sm font-semibold",
                    subscription.availableSeats === 0 ? "text-red-700 dark:text-red-300"
                    : subscription.availableSeats <= 2 ? "text-yellow-700 dark:text-yellow-300"
                    : "text-blue-700 dark:text-blue-300"
                  )}>
                    Available Seats
                  </span>
                </div>
                <p className={cn(
                  "text-5xl font-bold mb-1",
                  subscription.availableSeats === 0 ? "text-red-900 dark:text-red-100"
                  : subscription.availableSeats <= 2 ? "text-yellow-900 dark:text-yellow-100"
                  : "text-blue-900 dark:text-blue-100"
                )}>
                  {subscription.availableSeats}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Ready for new team member invitations
                </p>
              </div>
              
              {/* Mini Stats */}
              <div className="text-right">
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg px-4 py-2 mb-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Total Seats</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{subscription.totalSeats}</p>
                </div>
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg px-4 py-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400">In Use</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {subscription.usedSeats}
                  </p>
                  {subscription.reservedSeats > 0 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {subscription.reservedSeats} pending
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Warning Message inside the card */}
            {subscription.availableSeats === 0 && (
              <div className="mt-4 pt-4 border-t border-red-300 dark:border-red-700">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                  <p className="text-sm font-medium text-red-900 dark:text-red-100">
                    All seats in use. Purchase more to invite additional team members.
                  </p>
                </div>
              </div>
            )}
            {subscription.availableSeats > 0 && subscription.availableSeats <= 2 && (
              <div className="mt-4 pt-4 border-t border-yellow-300 dark:border-yellow-700">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                  <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                    Running low. Only {subscription.availableSeats} seat{subscription.availableSeats !== 1 ? 's' : ''} remaining.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pricing Options with Purchase Button */}
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
          <p className="text-sm font-semibold text-purple-900 dark:text-purple-100 mb-4">
            Pricing Options
          </p>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
            {/* Monthly Pricing */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
              <p className="text-xs text-purple-600 dark:text-purple-400 mb-1">Monthly</p>
              <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                $65<span className="text-sm font-normal text-gray-600 dark:text-gray-400">/seat</span>
              </p>
            </div>

            {/* Yearly Pricing */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-green-200 dark:border-green-700">
              <p className="text-xs text-green-600 dark:text-green-400 mb-1">Yearly (Save 31%)</p>
              <p className="text-3xl font-bold text-green-700 dark:text-green-300">
                $45<span className="text-sm font-normal text-gray-600 dark:text-gray-400">/seat</span>
              </p>
            </div>

            {/* Purchase Button */}
            <Button
              onClick={handlePurchaseClick}
              size="lg"
              className="w-full gap-2 h-16 text-base font-bold shadow-lg hover:shadow-xl transition-all lg:col-span-1!"
              style={{ 
                background: 'linear-gradient(135deg, var(--primaryColor) 0%, #6d28d9 100%)',
                color: 'white'
              }}
            >
              <ShoppingCart className="w-5 h-5" />
              Purchase Seats
            </Button>
          </div>

          {/* Billing Info */}
          <div className="mt-4 pt-4 border-t border-purple-200 dark:border-purple-700">
            <p className="text-xs text-purple-700 dark:text-purple-300 text-center">
              Next billing: <strong>{new Date(subscription.nextBillingDate).toLocaleDateString()}</strong>
              {' • '}
              Current cost: <strong>${subscription.totalMonthlyCost.toFixed(2)}/mo</strong>
            </p>
          </div>
        </div>
      </Card>

      {/* Purchase Seats Wizard - 3 Step Flow */}
      <PurchaseSeatsWizard
        open={purchaseDialogOpen}
        onOpenChange={setPurchaseDialogOpen}
        subscription={subscription}
        onPurchaseSeats={onPurchaseSeats}
      />
    </>
  );
}