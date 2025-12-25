# Table Document Icon Hover Preview Standard

## Overview
Document/invoice icons in tables should display a hover preview to give users a quick visual of the document without navigating away. This pattern provides excellent UX for document-heavy interfaces.

## Visual Pattern

```
┌─────────────────────────┐
│ Invoice #               │
│  📄 INV-001  [hover]    │ ← Icon scales up
│    │                    │
│    └──→ ┌──────────┐   │ ← Preview appears below
│         │ ┌──────┐ │   │
│         │ │ 📄   │ │   │
│         │ │ Doc  │ │   │
│         │ │ Info │ │   │
│         │ └──────┘ │   │
│         │ Preview  │   │
│         └──────────┘   │
└─────────────────────────┘
```

## Implementation Pattern

### Complete Example
```tsx
<td className="px-4 py-4">
  <div className="flex items-center gap-2">
    {/* Document Icon with Hover Preview */}
    <div className="relative group/preview">
      <div 
        className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-sm flex-shrink-0 cursor-pointer hover:scale-110 transition-transform"
      >
        📄
      </div>
      
      {/* Preview on Hover */}
      <div className="absolute left-0 top-10 z-50 hidden group-hover/preview:block pointer-events-none">
        <div className="w-64 h-80 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border-2 border-purple-200 dark:border-purple-700 p-4">
          <div className="w-full h-full bg-gray-100 dark:bg-gray-900 rounded flex items-center justify-center overflow-hidden">
            {/* Preview content */}
            <div className="text-center p-4">
              <div className="text-6xl mb-2">📄</div>
              <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                {document.number}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {document.client}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatCurrency(document.amount)}
              </p>
            </div>
          </div>
          <p className="text-xs text-center mt-2 text-gray-500 dark:text-gray-400">
            Document Preview
          </p>
        </div>
      </div>
    </div>
    
    {/* Document name/number */}
    <div className="flex flex-col">
      <button
        onClick={() => openDocument(document.id)}
        className="text-xs text-gray-900 dark:text-gray-100 hover:underline"
      >
        {document.number}
      </button>
    </div>
  </div>
</td>
```

## Key Classes Explained

### Icon Container
```tsx
<div className="relative group/preview">
```
- `relative` - Positions preview relative to icon
- `group/preview` - Named group for hover state (Tailwind group feature)

### Icon Element
```tsx
<div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-sm flex-shrink-0 cursor-pointer hover:scale-110 transition-transform">
```
- `w-7 h-7` - 28px × 28px icon
- `rounded-lg` - Rounded corners
- `bg-purple-50` - Light background (brand color)
- `cursor-pointer` - Shows it's interactive
- `hover:scale-110` - Scales to 110% on hover (subtle zoom)
- `transition-transform` - Smooth scale animation
- `flex-shrink-0` - Prevents icon from shrinking

### Preview Container
```tsx
<div className="absolute left-0 top-10 z-50 hidden group-hover/preview:block pointer-events-none">
```
- `absolute` - Positions preview over content
- `left-0 top-10` - 40px below icon (prevents overlap)
- `z-50` - High z-index (above table content)
- `hidden` - Hidden by default
- `group-hover/preview:block` - Shows when hovering icon
- `pointer-events-none` - Preview doesn't intercept mouse events

### Preview Card
```tsx
<div className="w-64 h-80 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border-2 border-purple-200 dark:border-purple-700 p-4">
```
- `w-64 h-80` - 256px × 320px card
- `shadow-2xl` - Dramatic shadow for depth
- `border-2` - Prominent border
- `border-purple-200` - Brand color accent

## Size Variants

### Compact Preview (Signatures)
```tsx
w-48 h-64  // 192px × 256px
```

### Standard Preview (Invoices)
```tsx
w-64 h-80  // 256px × 320px (default)
```

### Large Preview (Documents)
```tsx
w-80 h-96  // 320px × 384px
```

## Content Patterns

### Invoice Preview
```tsx
<div className="text-center p-4">
  <div className="text-6xl mb-2">📄</div>
  <p className="text-sm font-medium">{invoice.number}</p>
  <p className="text-xs text-gray-500 mt-1">{invoice.client}</p>
  <p className="text-xs text-gray-500">{formatCurrency(invoice.amount)}</p>
</div>
```

### Signature Document Preview
```tsx
<img 
  src={document.thumbnail} 
  alt={document.name}
  className="w-full h-full object-contain"
/>
```

### File Document Preview
```tsx
<div className="text-center">
  <FileIcon className="w-16 h-16 mx-auto mb-2" />
  <p className="text-sm font-medium">{file.name}</p>
  <p className="text-xs text-gray-500">{file.size}</p>
</div>
```

## Applied To

- [x] BillingView.tsx - Invoice icons
- [x] SignatureTab.tsx - Document thumbnails
- [ ] IncomingDocumentsView.tsx - Document previews
- [ ] DocumentsTab.tsx - Document previews

## DO's and DON'Ts

### ✅ DO
- Use `group/preview` for named hover groups
- Include `pointer-events-none` on preview
- Position preview with `top-10` (40px below icon)
- Use high z-index (`z-50`) for overlay
- Add subtle scale on hover (`hover:scale-110`)
- Use smooth transitions
- Show relevant document info in preview

### ❌ DON'T
- Use click events on preview (it should be display-only)
- Position preview too close to icon (causes flicker)
- Forget `hidden` default state
- Use low z-index (preview will be hidden behind content)
- Make preview too large (blocks view)
- Forget dark mode styles

## Browser Considerations

### Hover vs Touch
```tsx
{/* Desktop: hover preview */}
<div className="hidden md:block group/preview">
  {/* ... preview ... */}
</div>

{/* Mobile: click to view */}
<Button 
  onClick={() => openPreview()} 
  className="md:hidden"
>
  View
</Button>
```

## Performance

### Image Loading
```tsx
<img 
  src={thumbnail}
  loading="lazy"  {/* Lazy load thumbnails */}
  alt={name}
/>
```

### Preview Optimization
- Use thumbnails, not full images
- Limit preview content to essentials
- Consider lazy loading for image previews

## Accessibility

### Screen Readers
```tsx
<div 
  className="relative group/preview"
  role="button"
  aria-label={`Preview ${document.name}`}
  tabIndex={0}
>
  {/* ... */}
</div>
```

### Keyboard Navigation
```tsx
<div 
  onMouseEnter={() => setShowPreview(true)}
  onMouseLeave={() => setShowPreview(false)}
  onFocus={() => setShowPreview(true)}
  onBlur={() => setShowPreview(false)}
>
```

## Testing Checklist

- [ ] Icon scales smoothly on hover
- [ ] Preview appears 40px below icon
- [ ] Preview doesn't flicker when moving mouse
- [ ] Preview displays correct document info
- [ ] Preview has proper z-index (not hidden)
- [ ] Dark mode styling works correctly
- [ ] Mobile touch doesn't trigger hover (or has alternative)
- [ ] Preview doesn't block important content
- [ ] Multiple previews work independently (named groups)

## Troubleshooting

**Problem:** Preview flickers on hover
**Solution:** Increase `top-` value (e.g., `top-12` instead of `top-10`)

**Problem:** Preview appears behind content
**Solution:** Increase z-index (`z-50` → `z-[60]`)

**Problem:** Preview blocks other content
**Solution:** Add `pointer-events-none` to preview container

**Problem:** Multiple icons trigger same preview
**Solution:** Use unique group names (`group/preview-{id}`)

**Problem:** Icon doesn't scale smoothly
**Solution:** Add `transition-transform` class

---

**Last Updated:** 2025-01-30  
**Status:** Active Standard  
**Applies To:** All tables with document/file icons
