# Table Header Styling Standard

## Overview
All tables throughout the application should use consistent header styling with proper visual treatment.

## Standard Implementation

### Structure
Tables should be wrapped in a Card component with proper overflow handling:

```tsx
<Card className="border border-gray-200/60 dark:border-gray-700 shadow-sm overflow-hidden">
  <table className="w-full">
    <thead>
      <tr 
        style={{
          background: 'linear-gradient(to right, var(--primaryColor), var(--secondaryColor, var(--primaryColor)))'
        }}
      >
        {/* Table headers */}
      </tr>
    </thead>
    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
      {/* Table rows */}
    </tbody>
  </table>
</Card>
```

### Key Features

1. **Card Wrapper**
   - `border border-gray-200/60 dark:border-gray-700` - Subtle border
   - `shadow-sm` - Light shadow
   - `overflow-hidden` - **CRITICAL**: This creates the rounded corners on the table header

2. **Table Header**
   - Use gradient background: `background: 'linear-gradient(to right, var(--primaryColor), var(--secondaryColor, var(--primaryColor)))'`
   - Text styling: `text-xs uppercase tracking-wide text-white/90`
   - Padding: `px-6 py-4` (or `px-4 py-3` for more compact)
   - Hover effect for sortable columns: `hover:text-white transition-colors`

3. **Table Body**
   - `bg-white dark:bg-gray-800` - Background color
   - `divide-y divide-gray-100 dark:divide-gray-700` - Row dividers

### ❌ What NOT to Do

**DON'T** use this pattern (squared-off header):
```tsx
<div className="flex-1 overflow-auto">
  <table className="w-full">
    <thead className="sticky top-0 text-white z-10" style={{ backgroundColor: 'var(--primaryColor)' }}>
      {/* This creates squared corners */}
    </thead>
  </table>
</div>
```

**Problems with this approach:**
- No rounded corners (looks sharp/harsh)
- Less visual polish
- Inconsistent with design system

### ✅ Correct Pattern

```tsx
<Card className="border border-gray-200/60 dark:border-gray-700 shadow-sm overflow-hidden">
  <table className="w-full">
    <thead>
      <tr 
        style={{
          background: 'linear-gradient(to right, var(--primaryColor), var(--secondaryColor, var(--primaryColor)))'
        }}
      >
        {/* Rounded corners automatically applied via Card's overflow-hidden */}
      </tr>
    </thead>
  </table>
</Card>
```

## Reference Implementation
See `/components/views/SignaturesView.tsx` for the definitive reference implementation.

## Checklist
- [ ] Table wrapped in Card component
- [ ] Card has `overflow-hidden` class
- [ ] Header uses gradient background with primaryColor
- [ ] Header text is white with proper sizing
- [ ] Body has proper background and dividers
