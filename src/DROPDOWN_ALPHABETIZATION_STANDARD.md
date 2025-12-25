# Dropdown Alphabetization Standard

## Overview
All dropdown menus throughout the application should have their options alphabetized unless there's a specific logical or functional reason not to (e.g., "All" options appearing first, or severity-based ordering).

## Standard Applied

### Date: Current Session
**Files Updated:**
- `/components/views/BillingView.tsx`
- `/components/views/BillingViewSplit.tsx`

---

## Billing Payment Method Dropdowns

### 1. Paid Via Filter (Filter Dropdown)
**Location:** Toolbar filters section
**Alphabetical Order:**
1. All Payments (stays first - special case)
2. ACH
3. Cash
4. Check
5. Klarna
6. PayPal
7. Stripe ⚡ (included in filter - handles both manual and automatic payments)
8. Venmo
9. Wire
10. Zelle

**Notes:**
- "All Payments" remains first as it's the default/reset option
- All payment methods alphabetized after "All Payments"
- Stripe INCLUDED in filter to show all Stripe payments (both automatic and manual)

---

### 2. Mark Paid Dropdown (Action Dropdown)
**Location:** Outstanding invoices table - "Mark Paid" button
**Alphabetical Order:**
1. ACH
2. Cash
3. Check
4. Klarna
5. PayPal
6. Venmo
7. Wire
8. Zelle

**Notes:**
- Stripe EXCLUDED from Mark Paid dropdown
- Reason: Stripe payments are handled automatically via API/webhook when paid through Stripe gateway
- Manual entry only needed for other payment methods
- All included methods are alphabetized

---

## Implementation Details

### Code Pattern for Filters
```tsx
<SelectContent>
  <SelectItem value="all">All Payments</SelectItem>
  <SelectItem value="ACH">🏦 ACH</SelectItem>
  <SelectItem value="Cash">💵 Cash</SelectItem>
  <SelectItem value="Check">✅ Check</SelectItem>
  <SelectItem value="Klarna">🛍️ Klarna</SelectItem>
  <SelectItem value="PayPal">🅿️ PayPal</SelectItem>
  <SelectItem value="Stripe">⚡ Stripe</SelectItem>
  <SelectItem value="Venmo">📱 Venmo</SelectItem>
  <SelectItem value="Wire">🔗 Wire</SelectItem>
  <SelectItem value="Zelle">💳 Zelle</SelectItem>
</SelectContent>
```

### Code Pattern for Mark Paid
```tsx
<DropdownMenuContent>
  <div>Select Payment Method</div>
  <DropdownMenuItem onClick={() => handleMarkAsPaid(id, 'ACH')}>
    🏦 ACH
  </DropdownMenuItem>
  <DropdownMenuItem onClick={() => handleMarkAsPaid(id, 'Cash')}>
    💵 Cash
  </DropdownMenuItem>
  <DropdownMenuItem onClick={() => handleMarkAsPaid(id, 'Check')}>
    ✅ Check
  </DropdownMenuItem>
  <DropdownMenuItem onClick={() => handleMarkAsPaid(id, 'Klarna')}>
    🛍️ Klarna
  </DropdownMenuItem>
  <DropdownMenuItem onClick={() => handleMarkAsPaid(id, 'PayPal')}>
    🅿️ PayPal
  </DropdownMenuItem>
  <DropdownMenuItem onClick={() => handleMarkAsPaid(id, 'Venmo')}>
    📱 Venmo
  </DropdownMenuItem>
  <DropdownMenuItem onClick={() => handleMarkAsPaid(id, 'Wire')}>
    🔗 Wire
  </DropdownMenuItem>
  <DropdownMenuItem onClick={() => handleMarkAsPaid(id, 'Zelle')}>
    💳 Zelle
  </DropdownMenuItem>
</DropdownMenuContent>
```

---

## Global Dropdown Guidelines

### When to Alphabetize
✅ **DO alphabetize:**
- Payment methods (except special options like "All")
- Status filters (after "All" option)
- Category selections
- General list selections
- Country/State/Region dropdowns
- Department/Team selections

### When NOT to Alphabetize
❌ **DON'T alphabetize:**
- Time-based options (e.g., Today, Yesterday, Last 7 days, Last 30 days)
- Severity/Priority levels (Critical, High, Medium, Low)
- Workflow stages (Draft, In Progress, Review, Complete)
- Options with logical progression
- "All" or "None" options (these stay first/last)

---

## Dual View Sync Protocol
When updating dropdowns in dual-view files:
1. Update BillingView.tsx first
2. Update BillingViewSplit.tsx with IDENTICAL changes
3. Test both views to ensure consistency
4. Document changes in this file

See: `/guidelines/DUAL_VIEW_SYNC_PROTOCOL.md`

---

## Future Considerations

### Other Areas to Review for Alphabetization
- [ ] Client groups/categories dropdowns
- [ ] Team member role selections
- [ ] Document type filters
- [ ] Tax year selections (special case - chronological may be better)
- [ ] Service type dropdowns
- [ ] Invoice status filters
- [ ] Signature request type filters

### Action Items
- Review all existing dropdowns for alphabetization
- Update style guide to include dropdown ordering standard
- Add to component library documentation
- Create linting rule to flag non-alphabetized dropdowns (future enhancement)

---

## Related Standards
- `/guidelines/TABLE_UNIVERSAL_CHECKLIST.md` - Table component standards
- `/guidelines/DUAL_VIEW_SYNC_PROTOCOL.md` - Keeping dual views in sync
- `/DESIGN_SYSTEM_REFERENCE.md` - Overall design system guidelines
