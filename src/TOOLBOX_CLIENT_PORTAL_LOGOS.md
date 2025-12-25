# 🧰 Toolbox: Client Portal Logo System

## Overview

Centralized logo management system for the client portal with desktop and mobile logos configured in Application Settings and displayed throughout the portal.

## Pattern

Logos are stored in **AppSettingsContext** and used across the client portal for consistent branding. The system includes fallbacks and responsive behavior.

## Components

### 1. Logo Storage (AppSettingsContext)

```typescript
export type AppSettings = {
  dateFormat: DateFormat;
  timeFormat: TimeFormat;
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;         // Desktop logo
  mobileLogoUrl: string;   // Mobile logo
};
```

### 2. Logo Upload (Application Settings)

Located in: `/components/views/ApplicationSettingsView.tsx`

```tsx
<Card className="p-6">
  <div className="flex items-start gap-3 mb-6">
    <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
      <Image className="w-5 h-5 text-indigo-600" />
    </div>
    <div className="flex-1">
      <h2>Client Portal Logos</h2>
      <p>Upload custom logos to display in the client portal</p>
    </div>
  </div>

  <div className="grid grid-cols-2 gap-6">
    {/* Desktop Logo */}
    <div className="space-y-2">
      <Label>Desktop Logo URL</Label>
      <div className="flex gap-2">
        <Input
          value={logoUrl}
          onChange={(e) => setLogoUrl(e.target.value)}
          placeholder="https://example.com/logo.png"
        />
        <Button variant="outline" size="icon">
          <Upload className="w-4 h-4" />
        </Button>
      </div>
      <p className="text-xs text-gray-500">
        Recommended: 200x50px
      </p>
    </div>

    {/* Mobile Logo */}
    <div className="space-y-2">
      <Label>Mobile Logo URL</Label>
      <div className="flex gap-2">
        <Input
          value={mobileLogoUrl}
          onChange={(e) => setMobileLogoUrl(e.target.value)}
          placeholder="https://example.com/mobile-logo.png"
        />
        <Button variant="outline" size="icon">
          <Upload className="w-4 h-4" />
        </Button>
      </div>
      <p className="text-xs text-gray-500">
        Recommended: 40x40px
      </p>
    </div>
  </div>

  {/* Preview */}
  {(logoUrl || mobileLogoUrl) && (
    <div className="bg-indigo-50 border rounded-lg p-4 mt-4">
      <p className="text-sm font-medium mb-3">Logo Preview</p>
      <div className="flex gap-6">
        {logoUrl && (
          <div>
            <p className="text-xs mb-2">Desktop</p>
            <div className="bg-white rounded-lg p-4 border">
              <img 
                src={logoUrl} 
                alt="Desktop Logo" 
                className="h-12 w-auto max-w-[200px]"
              />
            </div>
          </div>
        )}
        {mobileLogoUrl && (
          <div>
            <p className="text-xs mb-2">Mobile</p>
            <div className="bg-white rounded-lg p-4 border">
              <img 
                src={mobileLogoUrl} 
                alt="Mobile Logo" 
                className="h-10 w-10"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )}
</Card>
```

### 3. Logo Display (Client Portal Layout)

Located in: `/components/client-portal/ClientPortalLayout.tsx`

```tsx
import { useAppSettings } from '../../contexts/AppSettingsContext';
import accountaLogo from 'figma:asset/30eae3907a12e58c0f2fee0d1b43b11006b4eed4.png';

export function ClientPortalLayout({ children }: Props) {
  const { branding } = useBranding();
  const { settings } = useAppSettings();

  return (
    <aside className="sidebar">
      {/* Logo Section - With Fallbacks */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          {settings.logoUrl ? (
            {/* AppSettings logo (first priority) */}
            <img 
              src={settings.logoUrl} 
              alt="Logo" 
              className="h-8 w-auto max-w-[160px] object-contain" 
            />
          ) : branding.logoUrl ? (
            {/* Platform Branding logo (second priority) */}
            <img 
              src={branding.logoUrl} 
              alt="Logo" 
              className="h-8 w-auto max-w-[160px] object-contain" 
            />
          ) : (
            {/* Fallback color block */}
            <div
              className="h-8 w-8 rounded-lg flex-shrink-0"
              style={{ background: branding.colors.primaryButton }}
            />
          )}
          {/* Only show text if no logo */}
          {!settings.logoUrl && (
            <div>
              <div className="text-sm font-medium">Client Portal</div>
              <div className="text-xs">{branding.companyName}</div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation... */}

      {/* Footer - Powered by Acounta */}
      <div className="p-4 pt-0">
        <div className="text-center py-3 px-2 rounded-lg">
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-xs">Powered by</span>
            <img src={accountaLogo} alt="Acounta" className="h-4" />
          </div>
        </div>
      </div>
    </aside>
  );
}
```

## Logo Fallback Hierarchy

```
1. AppSettings logoUrl          ← First priority (customizable)
   ↓
2. BrandingContext logoUrl      ← Second priority (platform default)
   ↓
3. Color block + text           ← Final fallback
```

## Acounta Logo

### Import
```typescript
import accountaLogo from 'figma:asset/30eae3907a12e58c0f2fee0d1b43b11006b4eed4.png';
```

### Usage
```tsx
<div className="flex items-center gap-1.5">
  <span className="text-xs">Powered by</span>
  <img src={accountaLogo} alt="Acounta" className="h-4" />
</div>
```

### Where to Use
- ✅ Client portal footer (always visible)
- ✅ Login pages
- ✅ Public-facing pages
- ❌ Main application sidebar (uses company branding only)

## Recommended Sizes

### Desktop Logo
```
Dimensions: 200x50px (4:1 ratio)
Format: PNG with transparency
Max width: 160px on display
Height: 32px (8 in Tailwind)
```

### Mobile Logo
```
Dimensions: 40x40px (1:1 ratio)
Format: PNG with transparency
Size: 40px × 40px (10 in Tailwind)
```

## Responsive Behavior

```tsx
{/* Desktop */}
<div className="hidden md:block">
  {settings.logoUrl && (
    <img 
      src={settings.logoUrl} 
      alt="Logo"
      className="h-8 w-auto max-w-[160px]"
    />
  )}
</div>

{/* Mobile */}
<div className="md:hidden">
  {settings.mobileLogoUrl ? (
    <img 
      src={settings.mobileLogoUrl} 
      alt="Logo"
      className="h-10 w-10"
    />
  ) : settings.logoUrl && (
    <img 
      src={settings.logoUrl} 
      alt="Logo"
      className="h-8 w-auto max-w-[120px]"
    />
  )}
</div>
```

## CSS Classes

```tsx
// Desktop logo
className="h-8 w-auto max-w-[160px] object-contain"

// Mobile logo
className="h-10 w-10 object-contain"

// Fallback block
className="h-8 w-8 rounded-lg flex-shrink-0"
```

## State Management

```typescript
// In ApplicationSettingsView
const [logoUrl, setLogoUrl] = useState<string>(settings.logoUrl);
const [mobileLogoUrl, setMobileLogoUrl] = useState<string>(settings.mobileLogoUrl);

const handleSave = () => {
  updateSettings({
    logoUrl,
    mobileLogoUrl,
    // ... other settings
  });
};
```

## Validation

```typescript
const isValidImageUrl = (url: string): boolean => {
  try {
    new URL(url);
    return /\.(jpg|jpeg|png|gif|svg|webp)$/i.test(url);
  } catch {
    return false;
  }
};
```

## Error Handling

```tsx
<img 
  src={logoUrl} 
  alt="Logo"
  className="h-8 w-auto"
  onError={(e) => {
    // Hide broken image
    e.currentTarget.style.display = 'none';
  }}
/>
```

## Complete Integration Flow

```
┌─────────────────────────────────────┐
│ 1. User uploads logo URL            │
│    in Application Settings          │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│ 2. Save to AppSettingsContext       │
│    localStorage persists data       │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│ 3. ClientPortalLayout reads from    │
│    useAppSettings hook              │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│ 4. Display with fallback hierarchy  │
│    AppSettings → Branding → Block   │
└─────────────────────────────────────┘
```

## Future File Upload

```tsx
const handleLogoUpload = async (file: File, type: 'desktop' | 'mobile') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);
  
  try {
    const response = await uploadLogo(formData);
    const url = response.data.url;
    
    if (type === 'desktop') {
      setLogoUrl(url);
    } else {
      setMobileLogoUrl(url);
    }
    
    toast.success('Logo uploaded successfully');
  } catch (error) {
    toast.error('Failed to upload logo');
  }
};

// In UI
<input
  type="file"
  accept="image/*"
  onChange={(e) => {
    const file = e.target.files?.[0];
    if (file) handleLogoUpload(file, 'desktop');
  }}
/>
```

## Best Practices

1. **Always provide alt text** - Accessibility requirement
2. **Use object-contain** - Prevents image distortion
3. **Set max-width** - Prevents logo from being too large
4. **Include fallbacks** - Graceful degradation
5. **Test with different aspect ratios** - Ensure it works
6. **Use PNG with transparency** - Best format for logos
7. **Optimize file size** - Under 100KB recommended

## Files

- `/contexts/AppSettingsContext.tsx` - Logo storage
- `/components/views/ApplicationSettingsView.tsx` - Logo upload UI
- `/components/client-portal/ClientPortalLayout.tsx` - Logo display
- `/components/Sidebar.tsx` - Acounta logo reference

## Related Patterns

- Platform Branding System
- Image Upload Pattern
- Fallback UI Pattern

---

*Pattern: Client Portal Logo System*  
*Category: Branding*  
*Status: ✅ Production Ready*
