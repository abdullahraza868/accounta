# Toolbox: Clickable Option Box Component

## Overview
A reusable, branded component for creating clickable option cards with icons, titles, descriptions, and checkboxes. Perfect for settings pages, permission toggles, and feature selections.

## Location
`/components/ui/clickable-option-box.tsx`

## Features
- ✅ **Full Box Clickability** - Entire card is clickable for better UX
- ✅ **Visual Feedback** - Dynamic border and background highlighting on selection
- ✅ **Icon Integration** - Supports Lucide icons with dynamic colors
- ✅ **Checkbox Integration** - Built-in checkbox with proper click event handling
- ✅ **Hover Effects** - Shadow effect on hover for better interactivity
- ✅ **Brand Color Support** - Fully customizable with your branding colors
- ✅ **Accessibility** - Proper event handling and visual states

## Usage

### Basic Example
```tsx
import { ClickableOptionBox } from './components/ui/clickable-option-box';
import { Key } from 'lucide-react';
import { useBranding } from '../contexts/BrandingContext';

function MyComponent() {
  const { branding } = useBranding();
  const [hasPortalAccess, setHasPortalAccess] = useState(true);

  return (
    <ClickableOptionBox
      isChecked={hasPortalAccess}
      onToggle={() => setHasPortalAccess(!hasPortalAccess)}
      icon={Key}
      title="Enable Portal Access"
      description="Allow this user to log into the client portal"
      primaryColor={branding.colors.primaryButton}
      cardBackground={branding.colors.cardBackground}
      borderColor={branding.colors.borderColor}
      headingColor={branding.colors.headingText}
      mutedColor={branding.colors.mutedText}
    />
  );
}
```

### With Additional Content
```tsx
<ClickableOptionBox
  isChecked={sendNotifications}
  onToggle={() => setSendNotifications(!sendNotifications)}
  icon={Bell}
  title="Email Notifications"
  description="Receive updates about account activity"
  primaryColor={branding.colors.primaryButton}
>
  {/* Additional content inside the box */}
  <div className="text-xs" style={{ color: branding.colors.mutedText }}>
    Last notification sent: {lastNotificationDate}
  </div>
</ClickableOptionBox>
```

### Multiple Options in a Group
```tsx
<div className="space-y-4">
  <ClickableOptionBox
    isChecked={hasPortalAccess}
    onToggle={() => setHasPortalAccess(!hasPortalAccess)}
    icon={Key}
    title="Enable Portal Access"
    description="Allow this user to log into the client portal"
    primaryColor={branding.colors.primaryButton}
  />

  {hasPortalAccess && (
    <ClickableOptionBox
      isChecked={sendCredentials}
      onToggle={() => setSendCredentials(!sendCredentials)}
      icon={Mail}
      title="Send Login Credentials"
      description="Email login credentials to the user"
      primaryColor={branding.colors.primaryButton}
    />
  )}
</div>
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `isChecked` | `boolean` | ✅ | - | Whether the option is currently selected |
| `onToggle` | `() => void` | ✅ | - | Callback when option is toggled |
| `icon` | `LucideIcon` | ✅ | - | Lucide icon component to display |
| `title` | `string` | ✅ | - | Main title/label for the option |
| `description` | `string` | ❌ | - | Optional description text |
| `primaryColor` | `string` | ✅ | - | Primary brand color (hex format) |
| `cardBackground` | `string` | ❌ | `#ffffff` | Background color for unchecked state |
| `borderColor` | `string` | ❌ | `#e5e7eb` | Border color for unchecked state |
| `headingColor` | `string` | ❌ | `#111827` | Text color for title |
| `mutedColor` | `string` | ❌ | `#6b7280` | Text color for description |
| `children` | `ReactNode` | ❌ | - | Additional content to display |
| `className` | `string` | ❌ | `''` | Additional CSS classes |

## Visual States

### Unchecked State
- Light gray border
- White/card background
- Gray icon
- Normal text colors

### Checked State
- Primary color border (2px)
- Primary color background (10% opacity)
- Primary color icon
- Primary color icon background (20% opacity)
- Enhanced visual presence

### Hover State
- Shadow effect (md)
- Smooth transition

## Common Use Cases

1. **Permission Toggles** - Grant or revoke specific permissions
2. **Feature Flags** - Enable/disable application features
3. **Access Control** - Portal access, login credentials, etc.
4. **Settings Pages** - User preferences and configurations
5. **Wizard Steps** - Multi-step form option selection

## Integration with Client Portal

This component is used in the **Client Portal Account Access** flow:

### Step 5: Review & Finalize
```tsx
// pages/client-portal/account-access/AddUser.tsx - Step 5
<div className="space-y-4">
  <ClickableOptionBox
    isChecked={hasPortalAccess}
    onToggle={() => setHasPortalAccess(!hasPortalAccess)}
    icon={Key}
    title="Enable Portal Access"
    description="Allow this user to log into the client portal"
    primaryColor={branding.colors.primaryButton}
    cardBackground={branding.colors.cardBackground}
    borderColor={branding.colors.borderColor}
    headingColor={branding.colors.headingText}
    mutedColor={branding.colors.mutedText}
  />

  {hasPortalAccess && (
    <ClickableOptionBox
      isChecked={sendCredentials}
      onToggle={() => setSendCredentials(!sendCredentials)}
      icon={Mail}
      title="Send Login Credentials"
      description={`Email login credentials to ${email || 'the user'}`}
      primaryColor={branding.colors.primaryButton}
      cardBackground={branding.colors.cardBackground}
      borderColor={branding.colors.borderColor}
      headingColor={branding.colors.headingText}
      mutedColor={branding.colors.mutedText}
    />
  )}
</div>
```

## Best Practices

1. **Always use branding colors** - Pass colors from `useBranding()` context
2. **Group related options** - Use consistent spacing (space-y-4)
3. **Conditional rendering** - Show/hide dependent options based on parent selection
4. **Clear descriptions** - Provide helpful context in the description prop
5. **Meaningful icons** - Choose icons that clearly represent the option
6. **Dynamic text** - Include user context in descriptions when relevant

## Related Components
- `/components/ui/checkbox.tsx` - Used internally
- `/components/client-portal/AddUserDialog.tsx` - Uses ClickableOptionBox
- `/pages/client-portal/account-access/AddUser.tsx` - Primary implementation

## Design Principles
- **Clickability**: Entire box is clickable, not just the checkbox
- **Visual Hierarchy**: Clear distinction between checked/unchecked states
- **Consistency**: Matches the application's design system
- **Accessibility**: Proper click event handling prevents conflicts
- **Responsiveness**: Works well on all screen sizes

## Version History
- **v1.0** - Initial implementation with full branding support
- Used in Client Portal Account Access feature (November 2025)
