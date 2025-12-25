import { useState } from 'react';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Card } from '../../ui/card';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog';
import {
  ShoppingCart,
  Users,
  CreditCard,
  Check,
  AlertTriangle,
  Info,
  Plus,
  Minus,
  DollarSign,
  Calendar,
  TrendingUp,
  Package,
} from 'lucide-react';
import { cn } from '../../ui/utils';
import { toast } from 'sonner@2.0.3';
import type { FirmSubscription } from '../../../types/subscription';

type SeatPurchaseFlowProps = {
  subscription: FirmSubscription;
  onPurchaseComplete: (quantity: number, totalCost: number, billingCycle: 'monthly' | 'yearly') => void;
};

export function SeatPurchaseFlow({ subscription, onPurchaseComplete }: SeatPurchaseFlowProps) {
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [quantity, setQuantity] = useState(5);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'select' | 'checkout' | 'success'>('select');

  const calculateCost = () => {
    const monthlyCost = quantity * subscription.perSeatPrice;
    return billingCycle === 'yearly' ? monthlyCost * 12 * 0.85 : monthlyCost; // 15% discount for yearly
  };

  const calculateMonthlyCost = () => {
    return quantity * subscription.perSeatPrice;
  };

  const calculateYearlySavings = () => {
    const monthlyTotal = quantity * subscription.perSeatPrice * 12;
    const yearlyTotal = monthlyTotal * 0.85;
    return monthlyTotal - yearlyTotal;
  };

  const handleOpenPurchase = () => {
    setPurchaseDialogOpen(true);
    setStep('select');
    setQuantity(5);
    setBillingCycle('monthly');
  };

  const handleProceedToCheckout = () => {
    if (quantity < 1) {
      toast.error('Please select at least 1 seat');
      return;
    }
    setStep('checkout');
  };

  const handleConfirmPurchase = async () => {
    setIsProcessing(true);

    try {
      // Simulate Stripe checkout
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock success
      setStep('success');
      
      // After a brief delay, close and update parent
      setTimeout(() => {
        onPurchaseComplete(quantity, calculateCost(), billingCycle);
        setPurchaseDialogOpen(false);
        toast.success(`Successfully purchased ${quantity} seat${quantity > 1 ? 's' : ''}!`, {
          description: `${quantity} seats added to your account. You can now invite team members.`,
        });
      }, 1500);
    } catch (error) {
      toast.error('Purchase failed', {
        description: 'Please try again or contact support.',
      });
      setStep('select');
    } finally {
      setIsProcessing(false);
    }
  };

  const incrementQuantity = () => setQuantity(prev => Math.min(prev + 1, 100));
  const decrementQuantity = () => setQuantity(prev => Math.max(prev - 1, 1));

  return (
    <>
      {/* Purchase Button - Prominent CTA */}
      <Button
        onClick={handleOpenPurchase}
        size="lg"
        className="gap-2 bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg"
      >
        <ShoppingCart className="w-5 h-5" />
        Purchase Seats
      </Button>

      {/* Purchase Flow Dialog */}
      <Dialog open={purchaseDialogOpen} onOpenChange={setPurchaseDialogOpen}>
        <DialogContent className="sm:max-w-2xl" aria-describedby="purchase-seats-flow-description">
          {/* Step 1: Select Quantity */}
          {step === 'select' && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Package className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  Purchase Team Seats
                </DialogTitle>
                <DialogDescription id="purchase-seats-flow-description" className="text-gray-600 dark:text-gray-400">
                  Buy seats upfront, then assign them to team members when you send invitations.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Current Seat Status */}
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Current Seats</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{subscription.totalSeats}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Total</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">{subscription.usedSeats}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Active</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{subscription.availableSeats}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Available</div>
                    </div>
                  </div>
                </div>

                {/* Quantity Selector */}
                <div className="space-y-3">
                  <Label className="text-gray-700 dark:text-gray-300">How many seats do you want to purchase?</Label>
                  
                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={decrementQuantity}
                      disabled={quantity <= 1}
                      className="h-12 w-12"
                    >
                      <Minus className="w-5 h-5" />
                    </Button>

                    <div className="flex-1">
                      <Input
                        type="number"
                        min="1"
                        max="100"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                        className="text-center text-3xl font-bold h-16"
                      />
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={incrementQuantity}
                      disabled={quantity >= 100}
                      className="h-12 w-12"
                    >
                      <Plus className="w-5 h-5" />
                    </Button>
                  </div>

                  {/* Quick Select Buttons */}
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(5)}
                      className={cn(quantity === 5 && 'border-purple-600 bg-purple-50 dark:bg-purple-900/20')}
                    >
                      5 seats
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(10)}
                      className={cn(quantity === 10 && 'border-purple-600 bg-purple-50 dark:bg-purple-900/20')}
                    >
                      10 seats
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(25)}
                      className={cn(quantity === 25 && 'border-purple-600 bg-purple-50 dark:bg-purple-900/20')}
                    >
                      25 seats
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(50)}
                      className={cn(quantity === 50 && 'border-purple-600 bg-purple-50 dark:bg-purple-900/20')}
                    >
                      50 seats
                    </Button>
                  </div>
                </div>

                {/* Billing Cycle Selector */}
                <div className="space-y-3">
                  <Label className="text-gray-700 dark:text-gray-300">Choose Billing Cycle</Label>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {/* Monthly Option */}
                    <button
                      type="button"
                      onClick={() => setBillingCycle('monthly')}
                      className={cn(
                        'relative rounded-lg border-2 p-4 text-left transition-all',
                        billingCycle === 'monthly'
                          ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      )}
                    >
                      {billingCycle === 'monthly' && (
                        <div className="absolute top-3 right-3">
                          <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        <span className="font-semibold text-gray-900 dark:text-gray-100">Monthly</span>
                      </div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                        ${subscription.perSeatPrice}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">per seat/month</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Billed monthly
                      </div>
                    </button>

                    {/* Yearly Option */}
                    <button
                      type="button"
                      onClick={() => setBillingCycle('yearly')}
                      className={cn(
                        'relative rounded-lg border-2 p-4 text-left transition-all',
                        billingCycle === 'yearly'
                          ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      )}
                    >
                      {billingCycle === 'yearly' && (
                        <div className="absolute top-3 right-3">
                          <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        </div>
                      )}
                      <Badge className="absolute top-3 left-3 bg-green-500 text-white border-0 text-xs">
                        Save 15%
                      </Badge>
                      <div className="flex items-center gap-2 mb-1 mt-5">
                        <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        <span className="font-semibold text-gray-900 dark:text-gray-100">Yearly</span>
                      </div>
                      <div className="flex items-baseline gap-1 mb-1">
                        <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          ${(subscription.perSeatPrice * 0.85).toFixed(0)}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                          ${subscription.perSeatPrice}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">per seat/month</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Billed annually
                      </div>
                    </button>
                  </div>

                  {/* Yearly Savings Badge */}
                  {billingCycle === 'yearly' && (
                    <div className="flex items-center gap-2 text-sm bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
                      <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                      <span className="text-green-900 dark:text-green-100">
                        You'll save <strong className="font-bold">${calculateYearlySavings().toFixed(2)}</strong> per year with annual billing!
                      </span>
                    </div>
                  )}
                </div>

                {/* Cost Summary */}
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-5 border border-purple-200 dark:border-purple-800">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        {billingCycle === 'monthly' ? 'Monthly price per seat' : 'Effective monthly price per seat'}
                      </span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {billingCycle === 'monthly' 
                          ? `$${subscription.perSeatPrice}/month`
                          : `$${(subscription.perSeatPrice * 0.85).toFixed(0)}/month`
                        }
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Quantity</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{quantity} seats</span>
                    </div>
                    {billingCycle === 'yearly' && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Billing frequency</span>
                        <Badge className="bg-green-500 text-white border-0">Annual (Save 15%)</Badge>
                      </div>
                    )}
                    <div className="border-t border-purple-200 dark:border-purple-700 pt-3 flex items-center justify-between">
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {billingCycle === 'monthly' ? 'Monthly Cost' : 'Annual Cost'}
                      </span>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                          ${calculateCost().toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {billingCycle === 'monthly' ? 'billed monthly' : 'billed annually'}
                        </div>
                      </div>
                    </div>
                    {billingCycle === 'yearly' && (
                      <div className="text-xs text-center text-gray-500 dark:text-gray-400 pt-2 border-t border-purple-200 dark:border-purple-700">
                        Equivalent to ${(calculateCost() / 12).toFixed(2)}/month
                      </div>
                    )}
                  </div>
                </div>

                {/* New Total */}
                <div className="flex items-center gap-2 text-sm bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                  <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <div>
                    <span className="text-blue-900 dark:text-blue-100">
                      After purchase, you'll have{' '}
                      <strong className="font-bold">{subscription.totalSeats + quantity}</strong> total seats
                      {' '}(
                      <strong className="font-bold">{subscription.availableSeats + quantity}</strong> available for invitations)
                    </span>
                  </div>
                </div>

                {/* Info Notice */}
                <div className="flex items-start gap-2 text-sm bg-gray-50 dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                  <Info className="w-4 h-4 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Seats are purchased immediately and billed monthly. After purchase, you can invite team members to fill these seats.
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setPurchaseDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleProceedToCheckout}
                  className="gap-2 bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
                >
                  <CreditCard className="w-4 h-4" />
                  Proceed to Checkout
                </Button>
              </DialogFooter>
            </>
          )}

          {/* Step 2: Checkout (Mock Stripe Checkout) */}
          {step === 'checkout' && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <CreditCard className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  Complete Purchase
                </DialogTitle>
                <DialogDescription className="text-gray-600 dark:text-gray-400">
                  Review your order and complete the payment
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Order Summary */}
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Order Summary</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                          <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {quantity} Team Seat{quantity > 1 ? 's' : ''}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            ${subscription.perSeatPrice}/month per seat
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900 dark:text-gray-100">
                          ${calculateCost()}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">per month</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mock Payment Method */}
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Payment Method</h4>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-8 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">Visa ending in 4242</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Expires 12/2027</div>
                    </div>
                    <Badge variant="outline" className="ml-auto">Default</Badge>
                  </div>
                </div>

                {/* Billing Information */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-600 dark:text-gray-400">First charge (today)</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">${calculateCost()}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-600 dark:text-gray-400">Recurring monthly charge</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">${calculateCost()}/month</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">Next billing date</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {new Date(subscription.nextBillingDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Terms Notice */}
                <div className="flex items-start gap-2 text-xs bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 border border-yellow-200 dark:border-yellow-800">
                  <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                  <p className="text-yellow-900 dark:text-yellow-100">
                    By completing this purchase, you agree to be charged ${calculateCost()}/month until you cancel these seats. You can manage or cancel seats anytime from your billing settings.
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setStep('select')} disabled={isProcessing}>
                  Back
                </Button>
                <Button
                  onClick={handleConfirmPurchase}
                  disabled={isProcessing}
                  className="gap-2 bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
                >
                  <DollarSign className="w-4 h-4" />
                  {isProcessing ? 'Processing...' : `Pay $${calculateCost()}`}
                </Button>
              </DialogFooter>
            </>
          )}

          {/* Step 3: Success */}
          {step === 'success' && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  Purchase Successful!
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 py-8 text-center">
                <div className="space-y-2">
                  <p className="text-lg text-gray-900 dark:text-gray-100">
                    You've successfully purchased <strong>{quantity} seat{quantity > 1 ? 's' : ''}</strong>
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    These seats are now available for team member invitations
                  </p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-6 border border-green-200 dark:border-green-800">
                  <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
                    {subscription.availableSeats + quantity}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Available seats ready for invitations
                  </div>
                </div>

                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <p>A receipt has been sent to your email.</p>
                  <p>Billing starts at ${calculateCost()}/month on {new Date(subscription.nextBillingDate).toLocaleDateString()}</p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}