# 🎨 Household Spouse Linking - UI States Visual Guide

## 📋 Overview

This guide visually describes all four UI states of the Household Spouse Linking page.

---

## 🅰️ STATE 1: Empty (No Spouse Linked)

### **Layout**
```
┌─────────────────────────────────────────────────────────┐
│ Household – Spouse Linking                              │
│ Manage your spouse account for joint tax preparation    │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Spouse Linking                                          │
│                                                         │
│ Link your spouse to share documents and view            │
│ deliverables together.                                  │
│                                                         │
│ Spouse Email Address                                    │
│ ┌───────────────────────────────────────────────────┐  │
│ │ spouse@example.com                                │  │
│ └───────────────────────────────────────────────────┘  │
│                                                         │
│ ┌────────────────────┐                                 │
│ │ 👤 Send Invite     │                                 │
│ └────────────────────┘                                 │
└─────────────────────────────────────────────────────────┘
```

### **Components**
- **Card Header**: "Spouse Linking"
- **Description**: Informational text
- **Input Field**: Email address (with validation)
- **Primary Button**: "Send Invite" with UserPlus icon

### **User Actions**
1. Enter spouse email address
2. Click "Send Invite"
3. See loading state (spinner + "Sending...")
4. Toast: "Invite sent to [email]"
5. Transition to Pending state

### **Validation**
- Email required
- Valid email format
- Red border + error message on invalid input
- Button disabled when email empty or invalid

---

## 🅱️ STATE 2: Pending Invite

### **Layout**
```
┌─────────────────────────────────────────────────────────┐
│ Household – Spouse Linking                              │
│ Manage your spouse account for joint tax preparation    │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Spouse Linking                                          │
│                                                         │
│ ┌───────────────────────────────────────────────────┐  │
│ │ Pending Invite                                    │  │
│ │                                                   │  │
│ │ 📧 spouse@example.com                            │  │
│ │ ┌──────────────────────────┐                    │  │
│ │ │ Waiting for acceptance   │ (orange badge)     │  │
│ │ └──────────────────────────┘                    │  │
│ │                                                   │  │
│ │ ┌──────────────┐  ┌──────────────┐             │  │
│ │ │ 📧 Resend    │  │ Cancel       │             │  │
│ │ │   Invite     │  │ Invite       │             │  │
│ │ └──────────────┘  └──────────────┘             │  │
│ └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### **Components**
- **Nested Card**: "Pending Invite"
- **Email Display**: With Mail icon
- **Status Badge**: "Waiting for acceptance" (orange/warning color)
- **Action Buttons**:
  - "Resend Invite" (outline, with Mail icon)
  - "Cancel Invite" (outline, red/error color)

### **User Actions**

**Resend Invite:**
1. Click "Resend Invite"
2. See loading state (spinner + "Resending...")
3. Toast: "Invite resent."
4. Stay in Pending state

**Cancel Invite:**
1. Click "Cancel Invite"
2. See loading state
3. Toast: "Invite cancelled."
4. Return to Empty state

---

## 🅾️ STATE 3A: Linked Spouse (Unified/Separated - Editable)

### **Layout**
```
┌─────────────────────────────────────────────────────────┐
│ Household – Spouse Linking                              │
│ Manage your spouse account for joint tax preparation    │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Spouse Linking                                          │
│                                                         │
│ ┌───────────────────────────────────────────────────┐  │
│ │ Linked Spouse                                     │  │
│ │                                                   │  │
│ │ 👥 Jane Doe                                       │  │
│ │ 📧 spouse@example.com                            │  │
│ │ ┌────────┐                                       │  │
│ │ │ Active │ (green badge)                         │  │
│ │ └────────┘                                       │  │
│ │                                                   │  │
│ │ Household Mode                                    │  │
│ │ ┌─────────────────────────────────────┐          │  │
│ │ │ Unified                        ▼   │          │  │
│ │ └─────────────────────────────────────┘          │  │
│ │                                                   │  │
│ │ ┌───────────────────────────────────────────┐    │  │
│ │ │ Mode Descriptions:                        │    │  │
│ │ │ • Unified: Both spouses share docs &     │    │  │
│ │ │   deliverables.                           │    │  │
│ │ │ • Separated: Uploads are private to      │    │  │
│ │ │   uploader.                               │    │  │
│ │ │ • Divorced/Closed: Read-only, firm only. │    │  │
│ │ └───────────────────────────────────────────┘    │  │
│ │                                                   │  │
│ │ ┌──────────────┐                                │  │
│ │ │ Unlink       │ (red outline)                  │  │
│ │ │ Spouse       │                                │  │
│ │ └──────────────┘                                │  │
│ └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### **Components**
- **Nested Card**: "Linked Spouse"
- **Spouse Info**:
  - Name with Users icon
  - Email with Mail icon
  - "Active" badge (green/success color)
- **Mode Dropdown**: Select between Unified/Separated
- **Legend Box**: Mode descriptions (light purple background)
- **Unlink Button**: Red outline button

### **User Actions**

**Change Mode:**
1. Click dropdown
2. Select "Unified" or "Separated"
3. See loading state
4. Toast: "Mode updated."
5. Dropdown updates

**Unlink Spouse:**
1. Click "Unlink Spouse"
2. Confirmation dialog appears
3. Click "Unlink Spouse" in dialog
4. See loading state
5. Toast: "Spouse unlinked."
6. Return to Empty state

---

## 🅾️ STATE 3B: Linked Spouse (Divorced - Read-only)

### **Layout**
```
┌─────────────────────────────────────────────────────────┐
│ Household – Spouse Linking                              │
│ Manage your spouse account for joint tax preparation    │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Spouse Linking                                          │
│                                                         │
│ ┌───────────────────────────────────────────────────┐  │
│ │ Linked Spouse                                     │  │
│ │                                                   │  │
│ │ 👥 Jane Doe                                       │  │
│ │ 📧 spouse@example.com                            │  │
│ │ ┌────────┐                                       │  │
│ │ │ Active │ (green badge)                         │  │
│ │ └────────┘                                       │  │
│ │                                                   │  │
│ │ Household Mode                                    │  │
│ │ ┌──────────────────────────────────────────┐     │  │
│ │ │ Divorced/Closed (Read-only, firm only)  │     │  │
│ │ └──────────────────────────────────────────┘     │  │
│ │ (gray badge - no dropdown)                       │  │
│ │                                                   │  │
│ │ ┌───────────────────────────────────────────┐    │  │
│ │ │ Mode Descriptions:                        │    │  │
│ │ │ • Unified: Both spouses share docs &     │    │  │
│ │ │   deliverables.                           │    │  │
│ │ │ • Separated: Uploads are private to      │    │  │
│ │ │   uploader.                               │    │  │
│ │ │ • Divorced/Closed: Read-only, firm only. │    │  │
│ │ └───────────────────────────────────────────┘    │  │
│ │                                                   │  │
│ │ (No Unlink button shown)                         │  │
│ └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### **Components**
- **Nested Card**: "Linked Spouse"
- **Spouse Info**: Same as editable state
- **Mode Badge**: "Divorced/Closed (Read-only, firm only)" (gray)
- **Legend Box**: Same as editable state
- **No Unlink Button**: Hidden for divorced mode

### **Restrictions**
- ❌ Cannot change mode
- ❌ Cannot unlink spouse
- ℹ️ Mode can only be changed by firm admin

---

## 🔔 Confirmation Dialog (Unlink)

### **Layout**
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   Unlink Spouse?                                        │
│                                                         │
│   Are you sure you want to unlink your spouse? This    │
│   will remove shared access to documents and            │
│   deliverables. This action cannot be undone.           │
│                                                         │
│                                                         │
│              ┌──────────┐  ┌──────────────┐            │
│              │  Cancel  │  │ Unlink Spouse│            │
│              └──────────┘  └──────────────┘            │
│                            (red background)            │
└─────────────────────────────────────────────────────────┘
```

### **Components**
- **AlertDialog** component
- **Title**: "Unlink Spouse?"
- **Description**: Warning message
- **Cancel Button**: Gray outline
- **Confirm Button**: Red background (danger color)

---

## 🎨 Color Guide

### **Status Colors**
| Element | Color | Usage |
|---------|-------|-------|
| Active badge | Green (`successColor`) | Linked spouse |
| Pending badge | Orange (`warningColor`) | Pending invite |
| Error text | Red (`errorColor`) | Validation errors |
| Unlink button | Red (`errorColor`) | Destructive action |
| Info text | Muted (`mutedText`) | Secondary text |

### **Component Colors**
| Element | Color Variable |
|---------|---------------|
| Primary button | `primaryButton` |
| Button text | `primaryButtonText` |
| Card background | `cardBackground` |
| Border | `borderColor` |
| Heading | `headingText` |
| Body text | `bodyText` |
| Muted text | `mutedText` |
| Input background | `inputBackground` |
| Input border | `inputBorder` |

---

## 🔄 State Flow Diagram

```
┌─────────┐
│  Empty  │
└────┬────┘
     │ Send Invite
     ▼
┌─────────┐  Cancel Invite  ┌─────────┐
│ Pending │◄────────────────┤  Empty  │
└────┬────┘                 └─────────┘
     │ Accept Invite
     ▼
┌─────────┐  Unlink Spouse  ┌─────────┐
│ Linked  │────────────────►│  Empty  │
└─────────┘                 └─────────┘
     │
     │ Change Mode
     ▼
┌─────────┐
│ Linked  │ (with new mode)
└─────────┘
```

---

## ✨ Interactive Elements

### **Buttons**

| Button | State | Icon | Style |
|--------|-------|------|-------|
| Send Invite | Default | UserPlus | Primary (purple) |
| Send Invite | Loading | Loader2 (spin) | Primary (disabled) |
| Resend Invite | Default | Mail | Outline |
| Resend Invite | Loading | Loader2 (spin) | Outline (disabled) |
| Cancel Invite | Default | None | Outline (red) |
| Unlink Spouse | Default | None | Outline (red) |

### **Input Fields**

| Field | Type | Validation | Error Style |
|-------|------|------------|-------------|
| Email | email | Required, format | Red border + message |

### **Dropdowns**

| Dropdown | Options | Disabled When |
|----------|---------|---------------|
| Household Mode | Unified, Separated | Loading or Divorced |

---

## 📱 Responsive Behavior

- **Desktop**: Max-width 3xl (48rem / 768px)
- **Tablet**: Full width with padding
- **Mobile**: Single column, stacked buttons

---

## 🎉 Summary

The Household Spouse Linking page provides a complete, intuitive interface for managing spouse accounts with:
- Clear visual states
- Comprehensive validation
- Proper loading indicators
- Confirmation dialogs for destructive actions
- Full branding integration
- Responsive design

All UI elements follow Acounta design standards and use the centralized branding system!
