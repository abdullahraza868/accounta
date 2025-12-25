# Table Icon Standards

## Overview
Consistent icon usage across all tables for common actions and UI elements.

## Standard Icons from lucide-react

### View Toggle
**Use:** `LayoutGrid`

```tsx
import { LayoutGrid } from 'lucide-react';

// For view toggle buttons
<Button>
  <LayoutGrid className="w-3.5 h-3.5" />
  Single View
</Button>
```

**Purpose:** Indicates different view modes (Single View vs Split View)

### Send/Resend Actions
**Use:** `MailPlus` (NOT `Send`)

```tsx
import { MailPlus } from 'lucide-react';

// For resend actions
<Button variant="ghost" size="sm">
  <MailPlus className="w-4 h-4" />
</Button>

// For bulk send buttons
<Button variant="outline" size="sm" className="gap-1.5">
  <MailPlus className="w-3.5 h-3.5" />
  Bulk Send
</Button>
```

**Why MailPlus over Send:**
- MailPlus (✉️➕) clearly indicates "sending again" or "adding to send queue"
- Send (📤) is too generic and can be confused with export actions
- MailPlus is more semantically correct for email-related actions

### Other Common Icons

#### View/Preview Actions
```tsx
import { Eye } from 'lucide-react';
<Eye className="w-4 h-4" />
```

#### Download Actions
```tsx
import { Download } from 'lucide-react';
<Download className="w-4 h-4" />
```

#### Delete Actions
```tsx
import { Trash2 } from 'lucide-react';
<Trash2 className="w-4 h-4" />
```

#### Edit Actions
```tsx
import { Edit } from 'lucide-react';
<Edit className="w-4 h-4" />
```

#### Void Actions
```tsx
import { XCircle } from 'lucide-react';
<XCircle className="w-4 h-4" />
```

#### External Link (Open in folder)
```tsx
import { ExternalLink } from 'lucide-react';
<ExternalLink className="w-3.5 h-3.5" />
```

#### Settings
```tsx
import { Settings } from 'lucide-react';
<Settings className="w-4 h-4" />
```

## Icon Sizing Guidelines

### In Table Cells
- Standard actions: `w-4 h-4`
- Compact actions: `w-3.5 h-3.5`
- Inline badges: `w-3 h-3`

### In Buttons
- Regular buttons: `w-4 h-4`
- Small buttons: `w-3.5 h-3.5`
- Icon-only buttons: `w-4 h-4`

### In View Toggles
- Toggle buttons: `w-3.5 h-3.5`

## Color Guidelines

### Action Icons
- Default: `text-gray-600 dark:text-gray-400`
- Hover: Color changes via button hover states
- Destructive (delete): `text-red-600 dark:text-red-400`
- Warning (void): `text-orange-600 dark:text-orange-400`
- Resend: `text-orange-600 dark:text-orange-400`

### Status Icons
- Success: `text-green-600 dark:text-green-400`
- Warning: `text-orange-600 dark:text-orange-400`
- Error: `text-red-600 dark:text-red-400`
- Info: `text-blue-600 dark:text-blue-400`

## Complete Icon Reference

| Action | Icon | Import | Size in Actions | Color |
|--------|------|--------|----------------|-------|
| View Toggle | `LayoutGrid` | `lucide-react` | `w-3.5 h-3.5` | Primary |
| View/Preview | `Eye` | `lucide-react` | `w-3.5 h-3.5` | Gray |
| Send/Resend | `MailPlus` | `lucide-react` | `w-3.5 h-3.5` | Orange |
| Edit | `Edit` | `lucide-react` | `w-3.5 h-3.5` | Gray |
| Delete | `Trash2` | `lucide-react` | `w-3.5 h-3.5` | Red |
| Void | `XCircle` | `lucide-react` | `w-3.5 h-3.5` | Orange |
| Download | `Download` | `lucide-react` | `w-3.5 h-3.5` | Gray |
| External Link | `ExternalLink` | `lucide-react` | `w-3.5 h-3.5` | Primary |
| Settings | `Settings` | `lucide-react` | `w-4 h-4` | Gray |

## Reference Implementations
- Send/Resend: `/components/views/SignaturesView.tsx`
- View Toggle: `/components/views/SignaturesView.tsx` (lines 1063-1089)
- Action menus: `/components/views/SignaturesView.tsx` (DropdownMenu)
