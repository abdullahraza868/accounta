# 🧰 Toolbox: Clickable Progress Stepper

## Overview

A clickable progress stepper component that allows users to navigate between completed steps while preventing forward navigation to incomplete steps. Used in multi-step workflows like Add User, Upload Document, etc.

## Pattern

Users can click on any **visited/completed** step to go back and review or edit information, but cannot skip ahead to future steps.

## Visual Example

```
┌────┐      ┌────┐      ┌────┐      ┌────┐      ┌────┐
│ ✓  │  →   │ 👤 │  →   │ 📁 │  →   │ ⏰ │  →   │ 🔑 │
└────┘      └────┘      └────┘      └────┘      └────┘
Done        Active      Not        Not        Not
(clickable) (clickable) visited   visited    visited
```

## Implementation

### 1. State Management

```typescript
const [currentStep, setCurrentStep] = useState<Step>(1);
const [visitedSteps, setVisitedSteps] = useState<Set<Step>>(new Set([1]));
```

### 2. Track Visited Steps

```typescript
const handleNext = () => {
  if (currentStep < maxSteps) {
    const nextStep = (currentStep + 1) as Step;
    setCurrentStep(nextStep);
    setVisitedSteps((prev) => new Set(prev).add(nextStep));
  }
};
```

### 3. Click Handler

```typescript
const handleStepClick = (step: Step) => {
  // Only allow clicking on visited steps
  if (visitedSteps.has(step)) {
    setCurrentStep(step);
  }
};
```

### 4. Render with Clickable Buttons

```tsx
<button
  onClick={() => handleStepClick(step.number)}
  disabled={!visitedSteps.has(step.number)}
  className={`flex flex-col items-center flex-1 transition-all ${
    visitedSteps.has(step.number) 
      ? 'cursor-pointer hover:opacity-80' 
      : 'cursor-not-allowed opacity-50'
  }`}
>
  <div
    className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
      isCompleted
        ? 'border-green-500 bg-green-50'
        : isActive
        ? 'bg-white shadow-sm'
        : 'bg-gray-50'
    }`}
    style={
      isActive
        ? {
            borderColor: branding.colors.primaryButton,
            background: `${branding.colors.primaryButton}10`,
          }
        : isCompleted
        ? {}
        : { borderColor: branding.colors.borderColor }
    }
  >
    {isCompleted ? (
      <Check className="w-5 h-5 text-green-600" />
    ) : (
      <Icon
        className="w-5 h-5"
        style={{
          color: isActive
            ? branding.colors.primaryButton
            : visitedSteps.has(step.number)
            ? branding.colors.mutedText
            : '#cbd5e0',
        }}
      />
    )}
  </div>
  <p
    className="text-xs mt-2 text-center"
    style={{
      color: isActive || isCompleted
        ? branding.colors.headingText
        : visitedSteps.has(step.number)
        ? branding.colors.mutedText
        : '#cbd5e0',
    }}
  >
    {step.title}
  </p>
</button>
```

## Complete Example

```tsx
import { useState } from 'react';
import { Check, User, Shield, Folder, Calendar, Key } from 'lucide-react';
import { useBranding } from '../contexts/BrandingContext';

type Step = 1 | 2 | 3 | 4 | 5;

export default function MultiStepForm() {
  const { branding } = useBranding();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [visitedSteps, setVisitedSteps] = useState<Set<Step>>(new Set([1]));

  const steps = [
    { number: 1, title: 'Basic Info', icon: User },
    { number: 2, title: 'Permissions', icon: Shield },
    { number: 3, title: 'Folders', icon: Folder },
    { number: 4, title: 'Duration', icon: Calendar },
    { number: 5, title: 'Review', icon: Key },
  ];

  const handleNext = () => {
    if (currentStep < 5) {
      const nextStep = (currentStep + 1) as Step;
      setCurrentStep(nextStep);
      setVisitedSteps((prev) => new Set(prev).add(nextStep));
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step);
    }
  };

  const handleStepClick = (step: Step) => {
    if (visitedSteps.has(step)) {
      setCurrentStep(step);
    }
  };

  return (
    <div>
      {/* Progress Stepper */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === step.number;
          const isCompleted = visitedSteps.has(step.number) && !isActive;
          const isVisited = visitedSteps.has(step.number);
          
          return (
            <div key={step.number} className="flex items-center flex-1">
              <button
                onClick={() => handleStepClick(step.number)}
                disabled={!isVisited}
                className={`flex flex-col items-center flex-1 transition-all ${
                  isVisited ? 'cursor-pointer hover:opacity-80' : 'cursor-not-allowed opacity-50'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                    isCompleted
                      ? 'border-green-500 bg-green-50'
                      : isActive
                      ? 'bg-white shadow-sm'
                      : 'bg-gray-50'
                  }`}
                  style={
                    isActive
                      ? {
                          borderColor: branding.colors.primaryButton,
                          background: `${branding.colors.primaryButton}10`,
                        }
                      : isCompleted
                      ? {}
                      : { borderColor: branding.colors.borderColor }
                  }
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : (
                    <Icon
                      className="w-5 h-5"
                      style={{
                        color: isActive
                          ? branding.colors.primaryButton
                          : isVisited
                          ? branding.colors.mutedText
                          : '#cbd5e0',
                      }}
                    />
                  )}
                </div>
                <p
                  className="text-xs mt-2 text-center"
                  style={{
                    color: isActive || isCompleted
                      ? branding.colors.headingText
                      : isVisited
                      ? branding.colors.mutedText
                      : '#cbd5e0',
                  }}
                >
                  {step.title}
                </p>
              </button>
              {index < steps.length - 1 && (
                <div 
                  className="w-16 h-px mx-2" 
                  style={{ background: branding.colors.borderColor }} 
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <div className="min-h-[400px]">
        {currentStep === 1 && <div>Step 1 Content</div>}
        {currentStep === 2 && <div>Step 2 Content</div>}
        {/* ... more steps */}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <button onClick={handleBack} disabled={currentStep === 1}>
          Back
        </button>
        <button onClick={handleNext} disabled={currentStep === 5}>
          Next
        </button>
      </div>
    </div>
  );
}
```

## States

### Not Visited (Future Step)
```
┌────┐
│ ⏰ │ ← Gray icon, gray text
└────┘   Not clickable (disabled)
         opacity-50
```

### Current/Active
```
┌────┐
│ 👤 │ ← Primary color icon
└────┘   Primary color border
         Light background tint
         Clickable
```

### Completed
```
┌────┐
│ ✓  │ ← Green checkmark
└────┘   Green border
         Green background
         Clickable
```

## Features

✅ **Click visited steps** - Users can go back to any completed step  
✅ **Can't skip ahead** - Future steps are disabled  
✅ **Visual feedback** - Hover states for clickable steps  
✅ **Checkmarks** - Completed steps show green checkmark  
✅ **Color coding** - Active (primary), Completed (green), Future (gray)  
✅ **Responsive** - Works on all screen sizes  

## Use Cases

- Multi-step forms (Add User, Create Invoice)
- Upload workflows (Upload Document, Add Signature)
- Setup wizards (Account Setup, Client Onboarding)
- Review processes (Approval Workflow, Verification)

## Accessibility

```tsx
<button
  onClick={() => handleStepClick(step.number)}
  disabled={!visitedSteps.has(step.number)}
  aria-label={`Step ${step.number}: ${step.title}`}
  aria-current={currentStep === step.number ? 'step' : undefined}
  className={...}
>
```

## Best Practices

1. **Always track visited steps** - Use a Set for efficient lookups
2. **Start with step 1 visited** - Initial step should be accessible
3. **Add visited steps on forward navigation** - Not on back navigation
4. **Disable future steps** - Visual and functional indication
5. **Show completion state** - Green checkmark for completed steps
6. **Use branded colors** - Tie to BrandingContext
7. **Provide hover feedback** - Only on clickable steps

## Related Patterns

- **Progress Bar** - Linear progress indicator
- **Wizard Navigation** - Back/Next buttons
- **Breadcrumb Navigation** - Similar but for pages

## Files Using This Pattern

- `/pages/client-portal/account-access/AddUser.tsx`
- `/components/views/UploadDocumentView.tsx`
- (Add more as implemented)

---

*Pattern: Clickable Progress Stepper*  
*Category: Navigation*  
*Status: ✅ Production Ready*
