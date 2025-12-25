# SignaturesView Backup Information

## Backup Date
Created before implementing "completed on bottom" principle and Split View

## Files
1. **SignaturesView.tsx** - Main signatures page (single table, completed on bottom)
2. **SignaturesViewSplit.tsx** - NEW Split view (two separate tables)

## What Changed

### Phase 1: Completed on Bottom
Modified the signature requests rendering to show:
1. **Active/Pending signatures first** (sent, viewed, partial, unsigned)
2. **Completed signatures at the bottom**

### Phase 2: Split View
Created alternate Split View (`/signatures/split`) with:
1. **Two Separate Tables**:
   - Active/Pending table (top) - standard purple styling
   - Completed table (bottom) - subtle green styling (matches SignatureTab.tsx)
2. **Subtle Green Theme for Completed** (exactly matches SignatureTab.tsx):
   - Very subtle green header: `rgb(240, 253, 244)` (green-50)
   - Green text headers: `text-green-700/70`
   - Subtle green backgrounds: `bg-green-50/20` and `bg-green-100/20`
   - Green borders: `border-green-200/30`
   - Green hover states and expanded rows
   - Archive/success feel for completed items
3. **Separate Pagination** for each table (compact design)
4. **Shared Filters** - All filters control both tables
5. **Toggle Button** - Switch between Single View and Split View

## Routes
- `/signatures` - Default single table view (completed on bottom)
- `/signatures/split` - Split view with two tables

## How to Switch Views
- Use the "Split View" button in the toolbar (Single View)
- Use the "Single View" button in the toolbar (Split View)

## Design System
- **Single View**: Purple branding, completed items at bottom
- **Split View**: Purple for active, Subtle green for completed (matches SignatureTab.tsx exactly)

## Notes
- Split View pagination is compact (page indicator + nav arrows)
- Both views maintain all existing functionality (sorting, filtering, search)
- Green completed table matches the style from client folder SignatureTab
- Default view remains the single table view for consistency
