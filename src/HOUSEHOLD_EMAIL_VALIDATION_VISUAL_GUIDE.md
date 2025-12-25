# Household Email Validation - Visual States

## Visual State Guide

### 1. Initial State (Untouched)
```
┌─────────────────────────────────────────────────┐
│ Spouse Email Address *                          │
│ ┌─────────────────────────────────────────────┐ │
│ │ 📧  spouse@example.com                      │ │
│ └─────────────────────────────────────────────┘ │
│ Enter your spouse's email address               │
│                                                 │
│            [Cancel]  [Send Invitation] ←disabled│
└─────────────────────────────────────────────────┘

State:
- Normal border (branding.colors.inputBorder)
- No error message
- Helper text shown
- Send button DISABLED (empty)
```

---

### 2. Typing Invalid Email (Not Touched)
```
┌─────────────────────────────────────────────────┐
│ Spouse Email Address *                          │
│ ┌─────────────────────────────────────────────┐ │
│ │ 📧  john                                    │ │← User typing
│ └─────────────────────────────────────────────┘ │
│ Enter your spouse's email address               │
│                                                 │
│            [Cancel]  [Send Invitation] ←disabled│
└─────────────────────────────────────────────────┘

State:
- Normal border (error stored internally)
- No error message (not touched yet)
- Helper text shown
- Send button DISABLED (has error)
```

---

### 3. Invalid Email After Blur (Error Shown)
```
┌─────────────────────────────────────────────────┐
│ Spouse Email Address *                          │
│ ┌─────────────────────────────────────────────┐ │
│ │ 📧  john                                    │ │← RED BORDER
│ └─────────────────────────────────────────────┘ │
│ ⚠️ Please enter a valid email address          │← RED ERROR
│                                                 │
│            [Cancel]  [Send Invitation] ←disabled│
└─────────────────────────────────────────────────┘

State:
- RED border (#EF4444)
- Error message with AlertCircle icon
- Send button DISABLED
- aria-invalid="true"
```

---

### 4. Fixing Email (Real-time Clear)
```
┌─────────────────────────────────────────────────┐
│ Spouse Email Address *                          │
│ ┌─────────────────────────────────────────────┐ │
│ │ 📧  john@example.com                        │ │← Valid!
│ └─────────────────────────────────────────────┘ │
│ Enter your spouse's email address               │
│                                                 │
│            [Cancel]  [Send Invitation] ←enabled │
└─────────────────────────────────────────────────┘

State:
- Normal border (error cleared)
- No error message
- Helper text shown
- Send button ENABLED
```

---

### 5. Empty Field After Blur
```
┌─────────────────────────────────────────────────┐
│ Spouse Email Address *                          │
│ ┌─────────────────────────────────────────────┐ │
│ │ 📧                                          │ │← RED BORDER
│ └─────────────────────────────────────────────┘ │
│ ⚠️ Email address is required                   │← RED ERROR
│                                                 │
│            [Cancel]  [Send Invitation] ←disabled│
└─────────────────────────────────────────────────┘

State:
- RED border
- "Email address is required" error
- Send button DISABLED
```

---

## Error Message Examples

### Invalid Format Errors
```
⚠️ Please enter a valid email address

Triggers:
- "john" (no @)
- "john@" (no domain)
- "john@example" (no TLD)
- "@example.com" (no username)
- "john@@example.com" (double @)
- "john @example.com" (space before @)
```

### Required Error
```
⚠️ Email address is required

Triggers:
- Empty field after blur
- Whitespace-only after blur
- Clicking Send with empty field
```

---

## Button States

### Disabled States (Gray)
```css
disabled={!spouseEmail || !!emailError}
```

**Disabled When:**
1. Email is empty
2. Email has validation error
3. While sending (householdState === 'sending')

**Visual:**
- Grayed out
- Not clickable
- Cursor: not-allowed

### Enabled State (Primary Purple)
```
[Send Invitation] ← Purple background, white text
```

**Enabled When:**
1. Email is not empty
2. Email has no validation error
3. Not currently sending

**Visual:**
- Primary button color
- Clickable
- Cursor: pointer

---

## Color Coding

### Input Border States
```css
Normal:  branding.colors.inputBorder  (gray)
Error:   #EF4444                      (red)
Focus:   Primary color                (purple)
```

### Text Colors
```css
Label:        branding.colors.bodyText
Error:        #DC2626 (red-600)
Helper:       branding.colors.mutedText
Required (*): #EF4444 (red-500)
```

### Icons
```css
Mail Icon:        branding.colors.mutedText (gray)
Error Icon:       #DC2626 (red-600)
AlertCircle:      Same as error text
```

---

## Animation & Transitions

### Error Message
```tsx
{emailError && emailTouched && (
  <p className="text-sm mt-1.5 flex items-center gap-1 text-red-600">
    <AlertCircle className="w-3.5 h-3.5" />
    {emailError}
  </p>
)}
```

**Behavior:**
- Appears immediately when conditions met
- No animation (instant)
- Disappears immediately when error clears

### Border Color
```css
transition: border-color 0.2s ease
```

**Behavior:**
- Smooth transition between states
- Changes on focus/blur
- Changes on validation state

---

## Full Form Visual Flow

### Step 1: Click "Manage Household"
```
┌────────────────────────────────────────────┐
│ 🏠 Household Linking                       │
│                                            │
│ Link your spouse to share documents...     │
│                                            │
│                        [Manage Household]  │← Click
└────────────────────────────────────────────┘
```

### Step 2: Form Appears with Progress
```
┌────────────────────────────────────────────┐
│  (1)          →         (2)         →  (3) │
│  📧                     ⏳              ✅  │
│ Enter Email        Sending      Invitation │
│                                     Sent   │
├────────────────────────────────────────────┤
│ Spouse Email Address *                     │
│ ┌────────────────────────────────────────┐ │
│ │ 📧                                     │ │
│ └────────────────────────────────────────┘ │
│ Enter your spouse's email address          │
│                                            │
│            [Cancel]  [Send Invitation]     │
└────────────────────────────────────────────┘
```

### Step 3: User Types Invalid Email
```
┌────────────────────────────────────────────┐
│  (1)          →         (2)         →  (3) │
│  📧                     ⏳              ✅  │
│ Enter Email        Sending      Invitation │
│                                     Sent   │
├────────────────────────────────────────────┤
│ Spouse Email Address *                     │
│ ┌────────────────────────────────────────┐ │
│ │ 📧  jane                               │ │← Typing
│ └────────────────────────────────────────┘ │
│ Enter your spouse's email address          │
│                                            │
│            [Cancel]  [Send Invitation]     │← Disabled
└────────────────────────────────────────────┘
```

### Step 4: User Tabs Out (Error Shows)
```
┌────────────────────────────────────────────┐
│  (1)          →         (2)         →  (3) │
│  📧                     ⏳              ✅  │
│ Enter Email        Sending      Invitation │
│                                     Sent   │
├────────────────────────────────────────────┤
│ Spouse Email Address *                     │
│ ┌────────────────────────────────────────┐ │
│ │ 📧  jane                               │ │← RED BORDER
│ └────────────────────────────────────────┘ │
│ ⚠️ Please enter a valid email address     │← ERROR
│                                            │
│            [Cancel]  [Send Invitation]     │← Disabled
└────────────────────────────────────────────┘
```

### Step 5: User Fixes Email
```
┌────────────────────────────────────────────┐
│  (1)          →         (2)         →  (3) │
│  📧                     ⏳              ✅  │
│ Enter Email        Sending      Invitation │
│                                     Sent   │
├────────────────────────────────────────────┤
│ Spouse Email Address *                     │
│ ┌────────────────────────────────────────┐ │
│ │ 📧  jane@example.com                   │ │← Valid
│ └────────────────────────────────────────┘ │
│ Enter your spouse's email address          │
│                                            │
│            [Cancel]  [Send Invitation]     │← Enabled
└────────────────────────────────────────────┘
```

### Step 6: Click Send (Success)
```
┌────────────────────────────────────────────┐
│  (✓)          →         (2)         →  (3) │
│  ✓                      ⏳              ✅  │
│ Enter Email        Sending      Invitation │
│                                     Sent   │
├────────────────────────────────────────────┤
│                                            │
│         ⏳ Sending invitation...           │
│                                            │
│   Please wait while we send the            │
│   invitation to jane@example.com           │
│                                            │
└────────────────────────────────────────────┘
```

---

## Comparison: Before vs After

### BEFORE (No Validation)
```
Problems:
❌ Could send invalid emails
❌ No visual feedback
❌ No error messages
❌ Button always enabled if not empty
❌ API errors on backend
❌ Wasted API calls
❌ Poor user experience
```

### AFTER (With Validation)
```
Benefits:
✅ Only valid emails accepted
✅ Real-time visual feedback
✅ Clear error messages
✅ Smart button enabling
✅ Client-side validation
✅ No wasted API calls
✅ Excellent user experience
```

---

## Mobile Responsive View

### Mobile (< 640px)
```
┌────────────────────┐
│ Spouse Email *     │
│ ┌────────────────┐ │
│ │📧 john@ex.com │ │
│ └────────────────┘ │
│ Enter spouse email │
│                    │
│ [Cancel]           │
│ [Send Invitation]  │← Full width
└────────────────────┘
```

### Desktop (> 640px)
```
┌──────────────────────────────────────┐
│ Spouse Email Address *               │
│ ┌──────────────────────────────────┐ │
│ │ 📧  john@example.com             │ │
│ └──────────────────────────────────┘ │
│ Enter your spouse's email address    │
│                                      │
│         [Cancel]  [Send Invitation]  │
└──────────────────────────────────────┘
```

---

## Implementation Code Summary

### Key Components
```tsx
// State
const [spouseEmail, setSpouseEmail] = useState('');
const [emailError, setEmailError] = useState('');
const [emailTouched, setEmailTouched] = useState(false);

// Handler
const handleEmailChange = (value: string) => {
  setSpouseEmail(value);
  const validation = validateEmail(value, true);
  setEmailError(validation.error || '');
};

// Input
<Input
  value={spouseEmail}
  onChange={(e) => handleEmailChange(e.target.value)}
  onBlur={() => setEmailTouched(true)}
  className={emailError && emailTouched ? 'border-red-500' : ''}
/>

// Error Display
{emailError && emailTouched && (
  <p className="text-red-600">
    <AlertCircle /> {emailError}
  </p>
)}

// Button
<Button disabled={!spouseEmail || !!emailError}>
  Send Invitation
</Button>
```

---

## Status
✅ **COMPLETE** - All validation states implemented and documented
