# Design Standard: Visual-First Approach

## Philosophy
**Always prefer visual, clickable elements over traditional form controls.** Users should be able to see their options and click to select, rather than using radio buttons, checkboxes, or dropdowns when possible.

## Core Principle
> "If you can make it visual and clickable, do it."

## Visual Components Priority

### 1. ✅ PREFER: Clickable Option Boxes
Use `ClickableOptionBox` component instead of radio buttons:

```tsx
// ❌ DON'T: Traditional radio buttons
<RadioGroup value={selected} onValueChange={setSelected}>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="option1" id="option1" />
    <Label htmlFor="option1">Option 1</Label>
  </div>
</RadioGroup>

// ✅ DO: Visual clickable boxes
<div className="grid grid-cols-3 gap-3">
  <ClickableOptionBox
    selected={selected === 'option1'}
    onClick={() => setSelected('option1')}
    label="Option 1"
  />
  <ClickableOptionBox
    selected={selected === 'option2'}
    onClick={() => setSelected('option2')}
    label="Option 2"
  />
  <ClickableOptionBox
    selected={selected === 'option3'}
    onClick={() => setSelected('option3')}
    label="Option 3"
  />
</div>
```

### 2. ✅ PREFER: Visual Status Cards
Instead of status dropdowns, use clickable status cards:

```tsx
// ❌ DON'T: Status dropdown
<Select value={status} onValueChange={setStatus}>
  <SelectTrigger>
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="active">Active</SelectItem>
    <SelectItem value="pending">Pending</SelectItem>
  </SelectContent>
</Select>

// ✅ DO: Visual status boxes
<div className="flex gap-3">
  <ClickableOptionBox
    selected={status === 'active'}
    onClick={() => setStatus('active')}
    label="Active"
    icon={<Check className="w-4 h-4" />}
  />
  <ClickableOptionBox
    selected={status === 'pending'}
    onClick={() => setStatus('pending')}
    label="Pending"
    icon={<Clock className="w-4 h-4" />}
  />
</div>
```

### 3. ✅ PREFER: Toggle Switches
For on/off or yes/no choices:

```tsx
// ✅ DO: Visual toggle
<div className="flex items-center justify-between">
  <Label>Enable Feature</Label>
  <Switch checked={enabled} onCheckedChange={setEnabled} />
</div>
```

### 4. ✅ PREFER: Segmented Controls
For 2-4 mutually exclusive options:

```tsx
// ✅ DO: Visual segmented control
<div className="inline-flex rounded-lg border p-1">
  <Button
    variant={view === 'grid' ? 'default' : 'ghost'}
    onClick={() => setView('grid')}
  >
    Grid
  </Button>
  <Button
    variant={view === 'list' ? 'default' : 'ghost'}
    onClick={() => setView('list')}
  >
    List
  </Button>
</div>
```

### 5. ✅ PREFER: Progress Steppers
For multi-step processes:

```tsx
// ✅ DO: Visual progress stepper (see TOOLBOX_CLICKABLE_PROGRESS_STEPPER.md)
<ClickableProgressStepper
  steps={[
    { id: 1, label: 'Details', completed: true },
    { id: 2, label: 'Review', completed: false },
    { id: 3, label: 'Complete', completed: false }
  ]}
  currentStep={2}
  onStepClick={(step) => navigateToStep(step)}
/>
```

## When Traditional Controls ARE Appropriate

### ✅ Use Radio Buttons When:
- Options have very long labels that don't fit in boxes
- There are more than 6 options (consider dropdown instead)
- Space is extremely limited

### ✅ Use Checkboxes When:
- Multiple selections are allowed
- The list is very long (10+ items)
- Part of a data table with many rows

### ✅ Use Dropdowns/Select When:
- More than 10 options
- Options are dynamic/searchable
- Space is very limited
- Options are well-known (like countries, states)

### ✅ Use Input Fields When:
- User needs to enter custom text
- Values are unpredictable
- Free-form entry is required

## Real-World Examples

### Example 1: Unlink Reason Selection
```tsx
// ❌ BEFORE: Radio buttons
<RadioGroup value={reason} onValueChange={setReason}>
  <div className="space-y-2">
    <div className="flex items-center space-x-2">
      <RadioGroupItem value="divorced" id="divorced" />
      <Label htmlFor="divorced">Divorced</Label>
    </div>
    <div className="flex items-center space-x-2">
      <RadioGroupItem value="separated" id="separated" />
      <Label htmlFor="separated">Separated</Label>
    </div>
    <div className="flex items-center space-x-2">
      <RadioGroupItem value="other" id="other" />
      <Label htmlFor="other">Other</Label>
    </div>
  </div>
</RadioGroup>

// ✅ AFTER: Visual clickable boxes
<div className="grid grid-cols-3 gap-3">
  <ClickableOptionBox
    selected={reason === 'divorced'}
    onClick={() => setReason('divorced')}
    label="Divorced"
  />
  <ClickableOptionBox
    selected={reason === 'separated'}
    onClick={() => setReason('separated')}
    label="Separated"
  />
  <ClickableOptionBox
    selected={reason === 'other'}
    onClick={() => setReason('other')}
    label="Other"
  />
</div>
```

### Example 2: Role Selection
```tsx
// ✅ DO: Visual role cards with icons
<div className="grid grid-cols-2 gap-4">
  <ClickableOptionBox
    selected={role === 'admin'}
    onClick={() => setRole('admin')}
    label="Administrator"
    description="Full access to all features"
    icon={<Shield className="w-5 h-5" />}
  />
  <ClickableOptionBox
    selected={role === 'user'}
    onClick={() => setRole('user')}
    label="User"
    description="Standard access"
    icon={<User className="w-5 h-5" />}
  />
</div>
```

### Example 3: Access Level
```tsx
// ✅ DO: Visual access level cards
<div className="space-y-3">
  <ClickableOptionBox
    selected={access === 'full'}
    onClick={() => setAccess('full')}
    label="Full Access"
    description="Can see all documents and returns"
    icon={<Eye className="w-5 h-5" />}
  />
  <ClickableOptionBox
    selected={access === 'limited'}
    onClick={() => setAccess('limited')}
    label="Limited Access"
    description="Can only see final deliverables"
    icon={<EyeOff className="w-5 h-5" />}
  />
</div>
```

## Layout Guidelines

### Grid Layouts
```tsx
// 2 options: Use grid-cols-2
<div className="grid grid-cols-2 gap-3">

// 3 options: Use grid-cols-3
<div className="grid grid-cols-3 gap-3">

// 4 options: Use grid-cols-2 or grid-cols-4 depending on width
<div className="grid grid-cols-2 md:grid-cols-4 gap-3">

// 5+ options: Consider if visual approach is still best
```

### Vertical Stacking
```tsx
// When options have descriptions, stack vertically
<div className="space-y-3">
  <ClickableOptionBox ... />
  <ClickableOptionBox ... />
  <ClickableOptionBox ... />
</div>
```

## Accessibility Considerations

All visual components MUST:
- ✅ Have proper keyboard navigation (Tab, Enter, Space)
- ✅ Have proper ARIA labels
- ✅ Have visible focus states
- ✅ Be screen reader friendly
- ✅ Support keyboard selection

The `ClickableOptionBox` component handles these automatically.

## Design Checklist

When creating any new form or selection interface:

- [ ] **Can this be a ClickableOptionBox?** (2-6 options with short labels)
- [ ] **Can this be a visual toggle/switch?** (Binary choice)
- [ ] **Can this be a segmented control?** (2-4 mutually exclusive options)
- [ ] **Can this be a progress stepper?** (Multi-step process)
- [ ] **Can this be visual cards?** (Options with icons/descriptions)
- [ ] **Only if above don't work:** Use traditional radio/checkbox/select

## Benefits of Visual-First

### User Experience
- ✅ Faster decision making (see all options at once)
- ✅ Clearer visual hierarchy
- ✅ More engaging interface
- ✅ Reduced cognitive load
- ✅ Better mobile experience

### Development
- ✅ Consistent patterns across app
- ✅ Reusable components
- ✅ Built-in accessibility
- ✅ Easier to maintain

### Business
- ✅ Higher conversion rates
- ✅ Reduced user errors
- ✅ Better user satisfaction
- ✅ More modern appearance

## Component Reference

### ClickableOptionBox
Location: `/components/ui/clickable-option-box.tsx`
Documentation: `/TOOLBOX_CLICKABLE_OPTION_BOX.md`

Props:
```tsx
interface ClickableOptionBoxProps {
  selected: boolean;
  onClick: () => void;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}
```

## Migration Strategy

When updating existing forms:

1. **Identify traditional controls** (radio buttons, checkboxes in dialogs)
2. **Count the options** (2-6 = good candidate for visual)
3. **Check label length** (short = visual works well)
4. **Convert to ClickableOptionBox**
5. **Test accessibility** (keyboard nav, screen reader)
6. **Update documentation**

## Standard Application

This visual-first approach should be applied to:

- ✅ All dialog option selections
- ✅ All settings toggles
- ✅ All status selections
- ✅ All role/permission selections
- ✅ All access level selections
- ✅ All preference selections
- ✅ All filter options (when 6 or fewer)
- ✅ All step indicators
- ✅ All view toggles (grid/list, card/table)

## Exception Cases

You may use traditional controls when:
- More than 10 options
- Options are dynamically loaded
- Space is severely constrained
- Options have very long multi-line labels
- Part of a complex data entry form

---

**Standard:** Always consider visual-first options before defaulting to traditional form controls. Add this to your development checklist.
