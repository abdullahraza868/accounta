# Table Dual View Synchronization Principle

## Core Principle
**ALL table changes MUST be applied to BOTH single view and split view files simultaneously to avoid duplicate work.**

## Affected Files
When working on Billing tables:
- `/components/views/BillingView.tsx` (Single View)
- `/components/views/BillingViewSplit.tsx` (Split View)

When working on Signatures tables:
- `/components/views/SignaturesView.tsx` (Single View)
- `/components/views/SignaturesViewSplit.tsx` (Split View)

## Workflow
1. **Before making ANY table change**, identify if it affects both views
2. **Make the change to BOTH files simultaneously**
3. **Test both views** to ensure consistency
4. **Document the change** once (not separately for each view)

## Examples of Changes That Must Be Synced
- Column headers
- Column widths
- Cell content and formatting
- Icons and badges
- Tooltips and previews
- Status indicators
- Action buttons
- Hover effects
- Date formatting
- Any visual or functional change to table rows/cells

## Key Areas to Keep Synchronized

### 1. Table Headers
Both views must have identical:
- Column names
- Column widths (w-[XXXpx])
- Header styling
- Uppercase/tracking settings

### 2. Table Cells
Both views must have identical:
- Cell content structure
- Icons and badges
- Text sizing and colors
- Gap spacing
- Flex layouts

### 3. Interactive Elements
Both views must have identical:
- Hover previews
- Tooltips
- Click actions
- Dropdown menus

### 4. Status Indicators
Both views must have identical:
- Badge styles
- Icon placements
- Conditional rendering logic

## Exception: Split View Unique Elements
The ONLY differences between views should be:
- Split view has separate tables for Outstanding vs Paid/Complete
- Split view uses different table header colors (purple for outstanding, green for paid)
- Split view has separate pagination for each table

**Everything else must be identical!**

## Testing Checklist
When making changes, verify:
- [ ] Both views display the same columns
- [ ] Both views have matching column widths
- [ ] Both views show the same badges/icons
- [ ] Both views have the same tooltips
- [ ] Both views respond to interactions identically
- [ ] Both views handle edge cases the same way

## Benefits
- Reduces development time (change once, not twice)
- Ensures consistent user experience
- Prevents bugs from inconsistency
- Makes maintenance easier
- Simplifies testing
