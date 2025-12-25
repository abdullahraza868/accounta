# Workflow Wizard Pattern

## Overview
This document defines the standard pattern for creating multi-step workflow wizards in the application. This pattern should be used consistently across all features that require step-by-step user input (signatures, invoices, templates, etc.).

## Key Components

### 1. StepNavigation Component (`/components/StepNavigation.tsx`)
The reusable navigation component that displays steps horizontally across the page.

**Features:**
- Shows numbered circles for each step
- Displays checkmarks for completed steps
- Highlights current step with primary color
- Allows clicking back to previously visited steps
- Shows connecting lines between steps
- Disables future steps until visited

**Usage:**
```tsx
import { StepNavigation, Step as StepConfig } from './StepNavigation';

const stepConfigs: StepConfig[] = [
  { id: 'step1', label: 'Step 1 Name', number: 1 },
  { id: 'step2', label: 'Step 2 Name', number: 2 },
  { id: 'step3', label: 'Step 3 Name', number: 3 },
];

<StepNavigation
  steps={stepConfigs}
  currentStepId={currentStep}
  visitedStepIds={visitedSteps}
  onStepClick={handleStepNavigation}
/>
```

### 2. Layout Structure

The wizard should be a **full-page inline view** (not a modal) with this structure:

```tsx
<div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
  {/* Header with Step Navigation */}
  <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
    <div className="flex items-center justify-between mb-4">
      <div>
        <h1 className="text-xl font-semibold">Workflow Title</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Step {currentStepNumber} of {totalSteps}: Current Step Description
        </p>
      </div>
      <Button variant="ghost" size="sm" onClick={onClose}>
        <X className="w-4 h-4" />
        Cancel
      </Button>
    </div>

    {/* Step Navigation Component */}
    <StepNavigation
      steps={stepConfigs}
      currentStepId={currentStep}
      visitedStepIds={visitedSteps}
      onStepClick={handleStepNavigation}
    />
  </div>

  {/* Scrollable Content Area */}
  <div className="flex-1 overflow-y-auto bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
    {/* Step content goes here */}
  </div>
</div>
```

### 3. State Management

**Required State Variables:**
```tsx
const [currentStep, setCurrentStep] = useState<'step1' | 'step2' | 'step3'>('step1');
const [visitedSteps, setVisitedSteps] = useState<Set<string>>(new Set(['step1']));
```

**Auto-Focus Pattern (REQUIRED for all input fields):**
```tsx
import { useRef, useEffect } from 'react';

// Create ref for first input
const firstInputRef = useRef<HTMLInputElement>(null);

// Auto-focus and select on mount
useEffect(() => {
  if (currentStep === 'yourStep' && firstInputRef.current) {
    setTimeout(() => {
      firstInputRef.current?.focus();
      firstInputRef.current?.select();
    }, 100);
  }
}, [currentStep]);

// Apply to input
<input
  ref={firstInputRef}
  type="text"
  value={value}
  onChange={(e) => setValue(e.target.value)}
  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
/>
```

**Step Navigation Handler:**
```tsx
const handleStepNavigation = (stepId: string) => {
  const step = stepId as YourStepType;
  setCurrentStep(step);
};
```

**Advancing to Next Step:**
```tsx
const handleContinue = () => {
  // Validation logic here
  if (!isValid) {
    alert('Please complete required fields');
    return;
  }
  
  // Add next step to visited steps
  setVisitedSteps(new Set([...visitedSteps, 'nextStep']));
  setCurrentStep('nextStep');
};
```

### 4. Visual Design Standards

**Header:**
- White background with border-bottom
- Title on left, close button on right
- Step description below title
- StepNavigation component spans full width below

**Content Area:**
- Gradient background: `bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950`
- Scrollable with padding
- Max-width containers for content (max-w-4xl or max-w-6xl)
- White cards with rounded corners for content sections

**Navigation Buttons:**
- "Back" button on left (outline variant)
- "Continue" or "Save" button on right (primary color)
- Disable continue button until requirements met

### 5. Content Step Patterns

**For Selection Steps (Choose Client, Choose Template, etc.):**
- Large clickable cards/boxes
- Visual icons
- Clear selection state with border highlight
- Grid layout for multiple options

**For Form Steps:**
- White card containers with padding
- Clear section headers
- Labels above inputs
- Required field indicators (*)
- Validation feedback

**For List Building Steps (Line Items, Recipients, etc.):**
- Add button in header
- List of items with inline editing
- Delete buttons on hover
- Summary totals if applicable
- Empty state with call-to-action

## Examples in Codebase

### Implemented Wizards:
1. **New Signature Template** (`/components/views/NewTemplateView.tsx`)
   - 4 steps: Details → Upload → Recipients → Fields
   - Complex field placement interface
   
2. **Add Invoice** (`/components/views/AddInvoiceView.tsx`)
   - 3 steps: Client → Template → Line Items
   - Includes template selection and line item management

3. **Create Invoice Template** (`/components/CreateInvoiceTemplateWizard.tsx`)
   - 2 steps: Basic Info → Line Items
   - Includes "start from scratch" vs "use template" pattern

## Common Patterns

### "Start From Scratch" vs "Use Template" Choice
When a workflow can start from an existing item or create new:

```tsx
<div className="grid grid-cols-2 gap-4">
  <button
    onClick={() => setStartMethod('scratch')}
    className={`p-6 rounded-xl border-2 transition-all text-left ${
      startMethod === 'scratch'
        ? 'border-[var(--primaryColor)] bg-blue-50/50 dark:bg-gray-900'
        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
    }`}
  >
    <div className="text-3xl mb-3">📝</div>
    <h3 className="font-medium mb-1">Start from Scratch</h3>
    <p className="text-sm text-gray-600 dark:text-gray-400">
      Build from the ground up
    </p>
  </button>

  <button
    onClick={() => setStartMethod('template')}
    className={/* same classes */}
  >
    <div className="text-3xl mb-3">📋</div>
    <h3 className="font-medium mb-1">Use Template</h3>
    <p className="text-sm text-gray-600 dark:text-gray-400">
      Start with existing template
    </p>
  </button>
</div>
```

### Template/Item Selection with Filters
When showing a list of selectable items:

```tsx
{/* Category Filters */}
<div className="mb-4 flex items-center gap-2 overflow-x-auto">
  <button
    onClick={() => setSelectedCategory('All')}
    className={`px-3 py-1.5 rounded text-xs transition-colors ${
      selectedCategory === 'All'
        ? 'text-white shadow-sm'
        : 'text-gray-600 border border-gray-300'
    }`}
    style={selectedCategory === 'All' ? { backgroundColor: 'var(--primaryColor)' } : {}}
  >
    All ({totalCount})
  </button>
  {/* Category buttons */}
</div>

{/* Selectable Items Grid */}
<div className="grid grid-cols-1 gap-3">
  {items.map(item => (
    <button
      key={item.id}
      onClick={() => setSelectedItem(item)}
      className={`p-4 rounded-lg border-2 transition-all text-left ${
        selectedItem?.id === item.id
          ? 'border-[var(--primaryColor)] bg-blue-50/50'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      {/* Item content */}
    </button>
  ))}
</div>
```

## Best Practices

1. **Always use full-page inline view** - Never use modal overlays for multi-step workflows
2. **Show progress clearly** - Display "Step X of Y" and current step description
3. **Allow backward navigation** - Users should be able to go back to previous steps
4. **Validate before advancing** - Check requirements before allowing step progression
5. **Save progress** - Consider auto-saving or warning before closing
6. **Consistent styling** - Use the same colors, spacing, and patterns across all wizards
7. **Mobile responsive** - Ensure steps collapse appropriately on small screens
8. **Clear CTAs** - Make it obvious what the next action is
9. **Auto-focus inputs** - When a step loads, auto-focus and select the first input field
10. **Red asterisks for required fields** - ALWAYS use `<span className="text-red-500">*</span>` for required fields
11. **Auto-advance when possible** - Don't require "Continue" buttons if selection should immediately advance
12. **Visual selections over dropdowns** - Use clickable boxes/cards for categories and options instead of dropdowns
13. **Consistent grid layouts** - Use 3-column grids for item selection (matches manage templates pattern)

## When to Use This Pattern

✅ Use workflow wizard when:
- Process has 2+ distinct steps
- Each step requires different information
- Steps build upon each other
- User needs to see progress

❌ Don't use workflow wizard when:
- Single simple form is sufficient
- Information doesn't need to be staged
- Process is non-linear

## Checklist for New Wizard

- [ ] Import and configure `StepNavigation` component
- [ ] Set up step state management (currentStep, visitedSteps)
- [ ] Create full-page layout structure (header + scrollable content)
- [ ] Implement step navigation handler
- [ ] Add validation before advancing steps
- [ ] Style content area with gradient background
- [ ] Add back/continue buttons to each step
- [ ] Test backward navigation
- [ ] Ensure mobile responsiveness
- [ ] Add proper close/cancel handling