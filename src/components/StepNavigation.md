# StepNavigation Component

## Overview
The `StepNavigation` component provides a reusable, horizontal step indicator for multi-step workflows. It displays numbered circles for each step connected by lines, with visual indicators for current, completed, and upcoming steps.

## Features
- **Visual Progress**: Shows numbered circles (1, 2, 3, etc.) for each step
- **Completion Status**: Displays checkmarks (✓) for completed steps
- **Interactive Navigation**: Allows clicking on visited steps to navigate back
- **Dynamic Styling**: Uses platform branding colors for the current step
- **Dark Mode Support**: Fully responsive to light/dark mode
- **Flexible Width**: Uses `flex-1` on divider lines to stretch across available width

## Usage

### Import
```typescript
import { StepNavigation, Step } from '../StepNavigation';
```

### Basic Implementation

```typescript
export function YourWorkflowView() {
  // Define your step type
  type WorkflowStep = 'step1' | 'step2' | 'step3';
  
  // State management
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('step1');
  const [visitedSteps, setVisitedSteps] = useState<Set<WorkflowStep>>(new Set(['step1']));

  // Step configuration
  const stepConfigs: Step[] = [
    { id: 'step1', label: 'Details', number: 1 },
    { id: 'step2', label: 'Recipients', number: 2 },
    { id: 'step3', label: 'Review', number: 3 },
  ];

  // Navigation handler
  const handleStepNavigation = (stepId: string) => {
    const step = stepId as WorkflowStep;
    setCurrentStep(step);
    // Add any additional logic (e.g., showing/hiding panels)
  };

  // When advancing to next step, mark it as visited
  const goToNextStep = () => {
    setCurrentStep('step2');
    setVisitedSteps(prev => new Set([...prev, 'step2']));
  };

  return (
    <div className="border-b border-gray-200 dark:border-gray-800 px-8 py-4 bg-white dark:bg-gray-900">
      <div className="flex items-center gap-4 mb-4">
        {/* Your header content */}
      </div>

      {/* Step Navigation */}
      <StepNavigation
        steps={stepConfigs}
        currentStepId={currentStep}
        visitedStepIds={visitedSteps}
        onStepClick={handleStepNavigation}
      />
    </div>
  );
}
```

## Props

### `StepNavigation` Component

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `steps` | `Step[]` | Yes | Array of step configurations |
| `currentStepId` | `string` | Yes | ID of the currently active step |
| `visitedStepIds` | `Set<string>` | Yes | Set of step IDs that have been visited |
| `onStepClick` | `(stepId: string) => void` | Yes | Callback function when a step is clicked |

### `Step` Type

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | `string` | Yes | Unique identifier for the step |
| `label` | `string` | Yes | Display label for the step |
| `number` | `number` | Yes | Step number to display in the circle |

## Visual States

### 1. Current Step (Active)
- **Circle**: Filled with `var(--primaryColor)` (platform branding color)
- **Text**: Shows the step number in white
- **Label**: Normal text color (not grayed out)
- **Behavior**: Not clickable (disabled)

### 2. Completed Step (Visited)
- **Circle**: Light green background (`bg-green-100` / `dark:bg-green-900/30`)
- **Text**: Green checkmark (✓) instead of number
- **Label**: Gray text (`text-gray-500 dark:text-gray-400`)
- **Behavior**: Clickable with hover effect

### 3. Upcoming Step (Not Visited)
- **Circle**: Gray background (`bg-gray-200 dark:bg-gray-700`)
- **Text**: Shows the step number in gray
- **Label**: Gray text (`text-gray-500 dark:text-gray-400`)
- **Behavior**: Not clickable (disabled)

### 4. Divider Lines
- **Style**: Horizontal line (`h-px`) with gray color
- **Width**: Uses `flex-1` to stretch and fill available space
- **Minimum Width**: `min-w-[40px]` to ensure visibility

## Implementation Patterns

### Pattern 1: Mark Steps as Visited When Advancing

```typescript
const handleSelectClient = (client: Client) => {
  setSelectedClient(client);
  setCurrentStep('template');
  // Mark the next step as visited when advancing
  setVisitedSteps(prev => new Set([...prev, 'template']));
};
```

### Pattern 2: Initialize with First Step Visited

```typescript
const [visitedSteps, setVisitedSteps] = useState<Set<WorkflowStep>>(
  new Set(['step1'])
);
```

### Pattern 3: Handle Step Navigation with Side Effects

```typescript
const handleStepNavigation = (stepId: string) => {
  const step = stepId as WorkflowStep;
  setCurrentStep(step);
  
  // Add side effects based on step
  if (step === 'client') {
    setShowClientSelector(true);
  }
};
```

## Layout Integration

### Full Width Layout (Recommended)
The step navigation stretches across the available width:

```tsx
<div className="border-b border-gray-200 dark:border-gray-800 px-8 py-4">
  <div className="flex items-center gap-4 mb-4">
    {/* Header content */}
  </div>
  
  {/* Step Navigation - Full Width */}
  <StepNavigation
    steps={stepConfigs}
    currentStepId={currentStep}
    visitedStepIds={visitedSteps}
    onStepClick={handleStepNavigation}
  />
</div>
```

### Constrained Width Layout
To limit the width of the step navigation:

```tsx
<div className="border-b border-gray-200 dark:border-gray-800 px-8 py-4">
  <div className="flex items-center gap-4 mb-4">
    {/* Header content */}
  </div>
  
  {/* Step Navigation - Constrained */}
  <div className="max-w-2xl">
    <StepNavigation
      steps={stepConfigs}
      currentStepId={currentStep}
      visitedStepIds={visitedSteps}
      onStepClick={handleStepNavigation}
    />
  </div>
</div>
```

## Examples in Codebase

### AddInvoiceView
Three-step invoice creation workflow:
1. Client Selection
2. Template Selection  
3. Invoice Details

Location: `/components/views/AddInvoiceView.tsx`

### UploadDocumentView
Three-step document signing workflow:
1. Document Details
2. Add Recipients
3. Place Fields

Location: `/components/views/UploadDocumentView.tsx`

### EditSignatureView
Three-step signature editing workflow:
1. Edit Details
2. Update Recipients
3. Modify Fields

Location: `/components/views/EditSignatureView.tsx`

## Styling Notes

- **Platform Colors**: The active step uses `var(--primaryColor)` to match your platform's branding
- **Responsive**: Works seamlessly in both light and dark modes
- **Accessibility**: Includes proper disabled states and cursor changes
- **Hover Effects**: Completed steps show opacity change on hover (`.hover:opacity-80`)
- **Transitions**: Smooth opacity transitions (`.transition-opacity`)

## Best Practices

1. **Always mark the first step as visited** when initializing `visitedSteps`
2. **Add the next step to visited steps** when advancing forward in the workflow
3. **Handle side effects** in the `onStepClick` handler (e.g., showing/hiding UI elements)
4. **Keep step IDs consistent** between your step type and Step configuration
5. **Use meaningful labels** that clearly describe each step
6. **Place in header area** above the main content, with proper spacing

## Common Pitfalls

❌ **Don't** forget to add steps to visitedSteps when advancing:
```typescript
// Wrong - step2 won't be clickable later
setCurrentStep('step2');
```

✅ **Do** mark steps as visited when advancing:
```typescript
// Correct - step2 will be clickable
setCurrentStep('step2');
setVisitedSteps(prev => new Set([...prev, 'step2']));
```

❌ **Don't** use max-width without considering the design:
```typescript
// May look cramped
<div className="max-w-md">
  <StepNavigation ... />
</div>
```

✅ **Do** let it stretch naturally or use appropriate constraints:
```typescript
// Better - full width or reasonable max-width
<StepNavigation ... />
// or
<div className="max-w-2xl">
  <StepNavigation ... />
</div>
```
