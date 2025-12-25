# Table Action Button Alignment Standard

## Overview
When action columns contain conditional buttons (like resend), the three-dot menu button MUST remain in a consistent position across all rows. This is achieved using a fixed-width container with right alignment.

## The Problem
Without fixed width, conditional buttons cause the three-dot menu to shift:
```
Row 1: [Resend] [⋮]  ← 72px total width
Row 2:          [⋮]  ← 32px total width (menu shifts left)
```

## The Solution ✅
Use a fixed-width container with right alignment and individual button widths:
```tsx
<td className="px-4 py-4">
  <div className="flex justify-end items-center gap-1 w-[72px] ml-auto">
    {/* Conditional button */}
    {isOverdue(item) && (
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"  {/* Fixed 32px width */}
      >
        <MailPlus className="w-4 h-4" />
      </Button>
    )}
    
    {/* Dropdown menu - always in same position */}
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">  {/* Fixed 32px width */}
          <MoreVertical className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      {/* ... */}
    </DropdownMenu>
  </div>
</td>
```

## Key Classes Explained

### Container
- `flex justify-end items-center gap-1` - Right-align with 4px gap
- `w-[72px]` - Fixed width (32px button + 4px gap + 32px menu + 4px padding = 72px)
- `ml-auto` - Push container to right edge

### Buttons
- `h-8 w-8 p-0` - Fixed 32px × 32px button
- Both conditional and menu buttons must use same size

## Width Calculation

| Component | Width | Notes |
|-----------|-------|-------|
| Conditional Button | 32px | `w-8` |
| Gap | 4px | `gap-1` |
| Menu Button | 32px | `w-8` |
| Extra Padding | 4px | Breathing room |
| **Total Container** | **72px** | `w-[72px]` |

If you have 2 conditional buttons:
```
w-[112px]  = 32px + 4px + 32px + 4px + 32px + 8px
```

## Visual Result

### ✅ Correct (Fixed Width)
```
┌─ Actions (72px fixed) ─┐
Row 1: [Resend] [⋮]       │
Row 2:          [⋮]       │  ← Menu stays aligned
Row 3: [Resend] [⋮]       │
└────────────────────────-┘
```

### ❌ Wrong (No Fixed Width)
```
Row 1: [Resend] [⋮]
Row 2:       [⋮]         ← Menu shifts left!
Row 3: [Resend] [⋮]
```

## Implementation Pattern

### Step 1: Replace justify-center with justify-end
```tsx
// ❌ Before
<div className="flex justify-center gap-1">

// ✅ After
<div className="flex justify-end items-center gap-1 w-[72px] ml-auto">
```

### Step 2: Fix button widths
```tsx
// ❌ Before
<Button className="h-8 px-2">  {/* Variable width! */}

// ✅ After
<Button className="h-8 w-8 p-0">  {/* Fixed 32px */}
```

### Step 3: Ensure all buttons match
```tsx
// Both buttons must have same size
<Button className="h-8 w-8 p-0">  {/* Conditional */}
<Button className="h-8 w-8 p-0">  {/* Menu */}
```

## Applied To

- [x] BillingView.tsx - Invoice actions
- [x] SignaturesView.tsx - Signature request actions

## Related Scenarios

### Single Conditional Button
```tsx
<div className="flex justify-end items-center gap-1 w-[72px] ml-auto">
  {showAction && <Button className="h-8 w-8 p-0">⚡</Button>}
  <DropdownMenu>
    <DropdownMenuTrigger>
      <Button className="h-8 w-8 p-0">⋮</Button>
    </DropdownMenuTrigger>
  </DropdownMenu>
</div>
```

### Two Conditional Buttons
```tsx
<div className="flex justify-end items-center gap-1 w-[112px] ml-auto">
  {showAction1 && <Button className="h-8 w-8 p-0">📧</Button>}
  {showAction2 && <Button className="h-8 w-8 p-0">⚠️</Button>}
  <DropdownMenu>
    <DropdownMenuTrigger>
      <Button className="h-8 w-8 p-0">⋮</Button>
    </DropdownMenuTrigger>
  </DropdownMenu>
</div>
```

### No Conditional Buttons
```tsx
<div className="flex justify-center gap-1">
  {/* No fixed width needed - menu is always alone */}
  <DropdownMenu>
    <DropdownMenuTrigger>
      <Button className="h-8 w-8 p-0">⋮</Button>
    </DropdownMenuTrigger>
  </DropdownMenu>
</div>
```

## DO's and DON'Ts

### ✅ DO
- Use fixed width container (`w-[72px]`)
- Use `justify-end` for right alignment
- Use `ml-auto` to push container right
- Use `h-8 w-8 p-0` for all buttons (32px fixed)
- Calculate container width: (buttons × 32px) + (gaps × 4px) + 8px padding

### ❌ DON'T
- Use `justify-center` with conditional buttons
- Use `px-2` or variable padding on buttons
- Mix button sizes (h-8 w-8 vs h-8 px-2)
- Forget `ml-auto` on container
- Eyeball the container width - calculate it!

## Testing Checklist

After implementing:

- [ ] View table with mix of conditional and non-conditional rows
- [ ] Verify three-dot menu stays in same position on all rows
- [ ] Check that conditional button appears on correct rows
- [ ] Ensure gap between buttons is consistent (4px)
- [ ] Test on different screen sizes
- [ ] Verify alignment when scrolling table

## Troubleshooting

**Problem:** Menu still shifts
**Solution:** Check that container has `w-[72px]` and `ml-auto`

**Problem:** Buttons overlap
**Solution:** Increase container width (`w-[112px]` for 3 buttons)

**Problem:** Too much space on left
**Solution:** Remove `ml-auto` if not needed, or adjust `w-[Xpx]`

**Problem:** Buttons not aligned vertically
**Solution:** Add `items-center` to container

---

**Last Updated:** 2025-01-30  
**Status:** Active Standard  
**Applies To:** All tables with conditional action buttons
