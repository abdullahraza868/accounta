import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import {
  ShoppingCart,
  TrendingUp,
  Info,
  Check,
  ChevronRight,
  ChevronLeft,
  CreditCard,
  Calendar,
  DollarSign,
  Users,
  Zap,
  AlertCircle,
  Lock,
  ChevronUp,
  ChevronDown,
  Minus,
  Plus,
} from 'lucide-react';
import { cn } from './ui/utils';
import { toast } from 'sonner@2.0.3';
import type { FirmSubscription } from '../types/subscription';

type PurchaseSeatsWizardProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscription: FirmSubscription;
  onPurchaseSeats: (quantity: number, billingCycle: 'monthly' | 'yearly') => Promise<void>;
};

type WizardStep = 'quantity' | 'billing' | 'payment';

export function PurchaseSeatsWizard({ 
  open, 
  onOpenChange, 
  subscription,
  onPurchaseSeats 
}: PurchaseSeatsWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('quantity');
  const [seatsToAdd, setSeatsToAdd] = useState(1);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [isPurchasing, setIsPurchasing] = useState(false);

  // Pricing
  const MONTHLY_PRICE_PER_SEAT = 65;
  const YEARLY_PRICE_PER_SEAT = 45; // 15% discount (65 * 0.85 = 55.25, rounded to 45 for competitive pricing)
  const YEARLY_DISCOUNT_PERCENT = Math.round((1 - YEARLY_PRICE_PER_SEAT / MONTHLY_PRICE_PER_SEAT) * 100);

  const pricePerSeat = billingCycle === 'monthly' ? MONTHLY_PRICE_PER_SEAT : YEARLY_PRICE_PER_SEAT;
  const totalCost = seatsToAdd * pricePerSeat;
  const yearlyTotalCost = seatsToAdd * YEARLY_PRICE_PER_SEAT * 12;
  const monthlyTotalCost = seatsToAdd * MONTHLY_PRICE_PER_SEAT * 12;
  const yearlySavings = monthlyTotalCost - yearlyTotalCost;

  const handleNext = () => {
    if (currentStep === 'quantity') {
      if (seatsToAdd < 1) {
        toast.error('Please select at least 1 seat');
        return;
      }
      setCurrentStep('billing');
    } else if (currentStep === 'billing') {
      setCurrentStep('payment');
    }
  };

  const handleBack = () => {
    if (currentStep === 'billing') {
      setCurrentStep('quantity');
    } else if (currentStep === 'payment') {
      setCurrentStep('billing');
    }
  };

  const handlePurchase = async () => {
    setIsPurchasing(true);
    try {
      await onPurchaseSeats(seatsToAdd, billingCycle);
      toast.success(`Successfully purchased ${seatsToAdd} seat${seatsToAdd > 1 ? 's' : ''}!`, {
        description: `Your new seats are now available. You'll be billed ${billingCycle === 'monthly' ? 'monthly' : 'annually'}.`,
      });
      handleClose();
    } catch (error) {
      toast.error('Purchase failed', {
        description: error instanceof Error ? error.message : 'Please try again or contact support.',
      });
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleClose = () => {
    setCurrentStep('quantity');
    setSeatsToAdd(1);
    setBillingCycle('yearly');
    setIsPurchasing(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl" aria-describedby="purchase-seats-description">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" style={{ color: 'var(--primaryColor)' }} />
            Purchase Additional Seats
          </DialogTitle>
          <DialogDescription id="purchase-seats-description" className="text-gray-600 dark:text-gray-400">
            {currentStep === 'quantity' && 'Choose how many team member seats you need'}
            {currentStep === 'billing' && 'Select your preferred billing cycle'}
            {currentStep === 'payment' && 'Complete your purchase'}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6">
          {/* Step 1 */}
          <div className="flex items-center gap-2">
            <div 
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors",
                currentStep === 'quantity' 
                  ? "text-white" 
                  : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
              )}
              style={currentStep === 'quantity' ? { backgroundColor: 'var(--primaryColor)' } : {}}
            >
              {currentStep === 'quantity' ? '1' : <Check className="w-4 h-4" />}
            </div>
            <span className={cn(
              "text-sm font-medium",
              currentStep === 'quantity' 
                ? "text-gray-900 dark:text-gray-100" 
                : "text-gray-500 dark:text-gray-400"
            )}>
              Quantity
            </span>
          </div>

          <div className="flex-1 h-0.5 bg-gray-200 dark:bg-gray-700 mx-2" />

          {/* Step 2 */}
          <div className="flex items-center gap-2">
            <div 
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors",
                currentStep === 'billing' 
                  ? "text-white"
                  : currentStep === 'payment'
                  ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
              )}
              style={currentStep === 'billing' ? { backgroundColor: 'var(--primaryColor)' } : {}}
            >
              {currentStep === 'payment' ? <Check className="w-4 h-4" /> : '2'}
            </div>
            <span className={cn(
              "text-sm font-medium",
              currentStep === 'billing' 
                ? "text-gray-900 dark:text-gray-100" 
                : "text-gray-500 dark:text-gray-400"
            )}>
              Billing
            </span>
          </div>

          <div className="flex-1 h-0.5 bg-gray-200 dark:bg-gray-700 mx-2" />

          {/* Step 3 */}
          <div className="flex items-center gap-2">
            <div 
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors",
                currentStep === 'payment'
                  ? "text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
              )}
              style={currentStep === 'payment' ? { backgroundColor: 'var(--primaryColor)' } : {}}
            >
              3
            </div>
            <span className={cn(
              "text-sm font-medium",
              currentStep === 'payment' 
                ? "text-gray-900 dark:text-gray-100" 
                : "text-gray-500 dark:text-gray-400"
            )}>
              Payment
            </span>
          </div>
        </div>

        {/* Step 1: Quantity Selection */}
        {currentStep === 'quantity' && (
          <div className="space-y-6 py-4">
            {/* Quantity Input */}
            <div className="space-y-4">
              <Label htmlFor="seats" className="text-gray-700 dark:text-gray-300 text-lg font-semibold">
                How many seats do you want to add?
              </Label>
              
              {/* Quick Select Buttons - 2 Rows */}
              <div className="space-y-3">
                {/* First Row */}
                <div className="grid grid-cols-6 gap-2">
                  {[1, 2, 3, 4, 5, 6].map((qty) => (
                    <Button
                      key={qty}
                      variant={seatsToAdd === qty ? "default" : "outline"}
                      size="lg"
                      onClick={() => setSeatsToAdd(qty)}
                      className={cn(
                        "h-14 text-lg font-bold transition-all",
                        seatsToAdd === qty && "text-white shadow-lg"
                      )}
                      style={seatsToAdd === qty ? { backgroundColor: 'var(--primaryColor)' } : {}}
                    >
                      {qty}
                    </Button>
                  ))}
                </div>
                
                {/* Second Row */}
                <div className="grid grid-cols-3 gap-2">
                  {[10, 15, 20].map((qty) => (
                    <Button
                      key={qty}
                      variant={seatsToAdd === qty ? "default" : "outline"}
                      size="lg"
                      onClick={() => setSeatsToAdd(qty)}
                      className={cn(
                        "h-14 text-lg font-bold transition-all",
                        seatsToAdd === qty && "text-white shadow-lg"
                      )}
                      style={seatsToAdd === qty ? { backgroundColor: 'var(--primaryColor)' } : {}}
                    >
                      {qty}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Custom Input - Improved */}
              <div className="space-y-2">
                <Label htmlFor="custom-seats" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Custom amount
                </Label>
                <div className="flex items-center justify-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 w-9 p-0"
                    onClick={() => setSeatsToAdd(prev => Math.max(1, prev - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    id="custom-seats"
                    type="number"
                    min="1"
                    max="1000"
                    value={seatsToAdd}
                    onChange={(e) => setSeatsToAdd(Math.max(1, parseInt(e.target.value) || 1))}
                    className="text-center text-2xl font-bold h-12 w-32"
                    placeholder="0"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 w-9 p-0"
                    onClick={() => setSeatsToAdd(prev => Math.min(1000, prev + 1))}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-gray-600 dark:text-gray-400">seats</span>
                </div>
              </div>
            </div>

            {/* Info Notice */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-900 dark:text-blue-100">
                  <p className="font-semibold mb-1">Seats are immediately available</p>
                  <p className="text-blue-800 dark:text-blue-200">
                    After purchase, you can invite team members right away. Choose monthly or yearly billing in the next step.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Billing Cycle Selection */}
        {currentStep === 'billing' && (
          <div className="space-y-6 py-4">
            <RadioGroup value={billingCycle} onValueChange={(value) => setBillingCycle(value as 'monthly' | 'yearly')}>
              <div className="space-y-3">
                {/* Yearly Option (Recommended) */}
                <Card
                  className={cn(
                    "relative cursor-pointer transition-all border-2 hover:shadow-md",
                    billingCycle === 'yearly'
                      ? "border-purple-500 dark:border-purple-400 bg-purple-50/50 dark:bg-purple-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                  )}
                  onClick={() => setBillingCycle('yearly')}
                >
                  {billingCycle === 'yearly' && (
                    <Badge className="absolute -top-3 left-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white border-0">
                      <Zap className="w-3 h-3 mr-1" />
                      Recommended
                    </Badge>
                  )}
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      <RadioGroupItem value="yearly" id="yearly" className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Label htmlFor="yearly" className="text-lg font-semibold text-gray-900 dark:text-gray-100 cursor-pointer">
                              Yearly Billing
                            </Label>
                            <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700">
                              Save {YEARLY_DISCOUNT_PERCENT}%
                            </Badge>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                              ${YEARLY_PRICE_PER_SEAT}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">per seat/month</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          Billed annually at ${yearlyTotalCost}/year for {seatsToAdd} seat{seatsToAdd > 1 ? 's' : ''}
                        </p>
                        <div className="flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/30 rounded px-3 py-2">
                          <DollarSign className="w-4 h-4" />
                          Save ${yearlySavings}/year compared to monthly billing
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Monthly Option */}
                <Card
                  className={cn(
                    "cursor-pointer transition-all border-2 hover:shadow-md",
                    billingCycle === 'monthly'
                      ? "border-purple-500 dark:border-purple-400 bg-purple-50/50 dark:bg-purple-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                  )}
                  onClick={() => setBillingCycle('monthly')}
                >
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      <RadioGroupItem value="monthly" id="monthly" className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <Label htmlFor="monthly" className="text-lg font-semibold text-gray-900 dark:text-gray-100 cursor-pointer">
                            Monthly Billing
                          </Label>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                              ${MONTHLY_PRICE_PER_SEAT}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">per seat/month</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Billed monthly at ${totalCost}/month for {seatsToAdd} seat{seatsToAdd > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </RadioGroup>

            {/* Comparison Info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-900 dark:text-blue-100">
                  <p className="font-semibold mb-1">Billing Flexibility</p>
                  <p className="text-blue-800 dark:text-blue-200">
                    You can change your billing cycle at any time. Yearly plans save money and reduce billing frequency.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Payment & Confirmation */}
        {currentStep === 'payment' && (
          <div className="space-y-6 py-4">
            {/* Order Summary */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Order Summary</h3>
              <Card className="p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Users className="w-4 h-4" />
                      <span>{seatsToAdd} Additional Seat{seatsToAdd > 1 ? 's' : ''}</span>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      ${pricePerSeat}/seat/month
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>Billing Cycle</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-gray-100 capitalize">
                        {billingCycle}
                      </span>
                      {billingCycle === 'yearly' && (
                        <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700 text-xs">
                          {YEARLY_DISCOUNT_PERCENT}% off
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {billingCycle === 'monthly' ? 'Monthly Total' : 'Annual Total'}
                      </span>
                      <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        ${billingCycle === 'monthly' ? totalCost : yearlyTotalCost}
                      </span>
                    </div>
                    {billingCycle === 'yearly' && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
                        (${pricePerSeat}/month per seat)
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            </div>

            {/* Prorated Charge Notice */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-900 dark:text-yellow-100">
                  <p className="font-semibold mb-1">Prorated Billing</p>
                  <p className="text-yellow-800 dark:text-yellow-200">
                    Today, you'll be charged a prorated amount for the remaining days in your current billing period. 
                    Starting next billing cycle, you'll pay the full {billingCycle} amount.
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Payment Method</h3>
              <Card className="p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      •••• •••• •••• 4242
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Expires 12/2026 • Default payment method
                    </p>
                  </div>
                  <Badge variant="secondary">Default</Badge>
                </div>
              </Card>
            </div>

            {/* Security Notice */}
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 justify-center">
              <Lock className="w-3.5 h-3.5" />
              <span>Secured by Stripe • Your payment information is encrypted</span>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <div>
            {currentStep !== 'quantity' && (
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={isPurchasing}
                className="gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isPurchasing}
            >
              Cancel
            </Button>
            
            {currentStep === 'payment' ? (
              <Button
                onClick={handlePurchase}
                disabled={isPurchasing}
                className="gap-2 min-w-[160px]"
                style={{ backgroundColor: 'var(--primaryColor)' }}
              >
                <CreditCard className="w-4 h-4" />
                {isPurchasing ? 'Processing...' : `Purchase ${seatsToAdd} Seat${seatsToAdd > 1 ? 's' : ''}`}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="gap-2 min-w-[120px]"
                style={{ backgroundColor: 'var(--primaryColor)' }}
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}