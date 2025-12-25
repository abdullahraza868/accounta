# Card Hover Effect Standard

## Overview
All interactive cards throughout the application must implement a consistent hover effect that includes shadow enhancement and subtle upward movement to provide visual feedback.

## Standard Pattern

### Basic Card Hover Effect
```tsx
<Card className={cn(
  "p-3.5 border-gray-200/60 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer"
)}>
  {/* Card content */}
</Card>
```

### Key Classes Explained
- `shadow-sm` - Base shadow state (subtle)
- `hover:shadow-lg` - Enhanced shadow on hover (more prominent)
- `hover:-translate-y-0.5` - Subtle upward movement (2px)
- `transition-all` - Smooth animation for all properties
- `cursor-pointer` - Indicates interactivity

### With Conditional Styling
```tsx
<Card className={cn(
  "p-3.5 border-gray-200/60 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer",
  isActive && "border-purple-300 ring-2 ring-purple-100"
)}>
  {/* Card content */}
</Card>
```

## Application Areas

### 1. Stats/Metric Cards
Used in dashboard and view pages for clickable summary cards:
```tsx
// Examples: BillingView stats cards, Dashboard overview cards
<Card className={cn(
  "p-3.5 border-gray-200/60 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer",
  statusFilter === 'paid' && "border-green-300 ring-2 ring-green-100"
)}>
```

### 2. Content Cards  
Used for documents, projects, organizers, etc.:
```tsx
// Examples: DocumentsTab, ProjectsTab, OrganizersTab
<Card className="p-4 hover:shadow-md transition-shadow">
```

### 3. Note Cards
Used for user-generated content:
```tsx
// Pinned notes - with accent border
<Card className="p-4 border border-purple-200/60 bg-purple-50/20 shadow-sm hover:shadow-md transition-shadow">

// Regular notes
<Card className="p-4 border border-gray-200/60 shadow-sm hover:shadow-md transition-shadow">
```

## DO's and DON'Ts

### ✅ DO
- Use `transition-all` for stats/clickable cards
- Use `transition-shadow` for content/document cards
- Include `cursor-pointer` for clickable cards
- Keep movement subtle (`-translate-y-0.5` = 2px)
- Use `shadow-sm` to `shadow-lg` for prominent cards
- Use `hover:shadow-md` for content cards

### ❌ DON'T
- Use `transition-shadow` on cards with movement (use `transition-all`)
- Exaggerate movement (no more than `-translate-y-0.5`)
- Apply to non-interactive cards (e.g., static containers)
- Mix shadow levels inconsistently

## Movement Variants

| Use Case | Shadow Transition | Movement | Transition Class |
|----------|------------------|-----------|------------------|
| **Stats/Metric Cards** | `shadow-sm` → `shadow-lg` | `-translate-y-0.5` | `transition-all` |
| **Content Cards** | `shadow-sm` → `shadow-md` | None | `transition-shadow` |
| **Static Cards** | None | None | None |

## Checklist for Implementation

When adding or updating cards with hover effects:

- [ ] Determine if card is interactive (clickable/actionable)
- [ ] If interactive:
  - [ ] Add `cursor-pointer`
  - [ ] Add base shadow: `shadow-sm`
  - [ ] Add hover shadow: `hover:shadow-lg` (stats) or `hover:shadow-md` (content)
  - [ ] For stats cards: add `hover:-translate-y-0.5`
  - [ ] Add transition: `transition-all` (with movement) or `transition-shadow` (shadow only)
- [ ] If non-interactive: no hover effects needed

## Pages to Audit

Use this checklist to ensure all pages follow the standard:

- [x] BillingView.tsx - Stats cards ✅
- [ ] DashboardView.tsx - Dashboard cards
- [ ] SignaturesView.tsx - Stats cards
- [ ] DocumentsTab.tsx - Document cards
- [ ] ProjectsTab.tsx - Project cards
- [ ] OrganizersTab.tsx - Organizer cards
- [ ] SnapshotTab.tsx - Info cards
- [ ] NotesTab.tsx - Note cards
- [ ] InvoicesTab.tsx - Invoice cards
- [ ] All other views with clickable cards

## Related Standards
- TABLE_STANDARDS_MASTER_CHECKLIST.md
- DESIGN_SYSTEM_REFERENCE.md
- DRAG_DROP_CARD_PREFERENCE.md

---

**Last Updated:** 2025-01-30
**Status:** Active Standard
