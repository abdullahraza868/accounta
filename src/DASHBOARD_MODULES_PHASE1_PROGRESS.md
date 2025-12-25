# Dashboard Modules System - Phase 1 Progress

## 🎯 **Goal**
Build a comprehensive dashboard customization system where:
1. Admins can configure which modules are available and control role-based access
2. Individual team members can be granted additional access beyond their role
3. Users can customize which modules they want to display on their dashboard

---

## ✅ **COMPLETED - Phase 1A:**

### **1. Module Registry Created** (`/lib/dashboardModules.ts`)
- ✅ Centralized registry of all 13 existing dashboard modules
- ✅ Each module has metadata: id, name, description, icon, category, defaultSize, defaultRoles
- ✅ Helper functions for filtering and access control
- ✅ Category organization system (8 categories)

### **2. Dashboard Modules Settings Page** (`/components/views/settings/DashboardModulesView.tsx`)
- ✅ **Access:** Settings → Company Settings → Dashboard Modules
- ✅ **URL:** `/settings/company/dashboard`

**Features:**
- ✅ View all 13 dashboard modules organized by category
- ✅ Search and filter modules
- ✅ Enable/disable modules globally
- ✅ Configure which roles can access each module (Owner, Admin, Manager, Team Member)
- ✅ Visual indicators (Active/Hidden badges)
- ✅ Summary statistics (enabled count, total count)
- ✅ Reset to defaults functionality
- ✅ Dark mode support
- ✅ Fully responsive

**Module Categories:**
1. **Integrations** - Integration Status
2. **Tasks & Projects** - Task Overview, Project Tasks, My Tasks, Organizer
3. **Financial** - Invoices
4. **Documents** - New Signed Documents, Documents
5. **Communication** - Inbox
6. **Clients** - Leads, Client Overview
7. **Calendar & Meetings** - Calendar
8. **Analytics & Activity** - Recent Activity

### **3. Routing & Navigation**
- ✅ Added to `/routes/AppRoutes.tsx`
- ✅ Integrated into Company Settings sidebar (`/components/views/settings/CompanySettingsLayout.tsx`)
- ✅ Icon: LayoutGrid
- ✅ Path: `/settings/company/dashboard`

---

## 🚧 **TODO - Phase 1B:**

### **4. Dashboard Customization Page** (User-facing)
**Purpose:** Allow users to choose which modules they want to see

**Access:** Button on Dashboard page "⚙️ Customize Dashboard"

**Features Needed:**
- [ ] Show all modules user has access to (based on role + individual overrides)
- [ ] Checkbox-style selector with module icons (like toolbox clickable-option-box)
- [ ] Grid layout showing module previews
- [ ] Toggle visibility on/off
- [ ] Save preferences to local state/API
- [ ] Preview mode (see what dashboard will look like)

**UI Approach:**
```
┌─────────────────────────────────────────────┐
│   Customize Your Dashboard                  │
│                                              │
│   Select which modules to display:          │
│                                              │
│   ☑️ [Icon] Integration Status               │
│   ☑️ [Icon] Task Overview                    │
│   ☐ [Icon] Invoices                         │
│   ☑️ [Icon] My Tasks                         │
│   ...                                        │
│                                              │
│   [Cancel]  [Save Preferences]              │
└─────────────────────────────────────────────┘
```

---

### **5. Update DashboardView.tsx**
**Changes Needed:**
- [ ] Load user's module preferences
- [ ] Filter `cardIds` array based on visible modules
- [ ] Add "Customize Dashboard" button to header
- [ ] Keep existing drag/resize functionality
- [ ] Show empty state if no modules selected

**Code Changes:**
```typescript
// Load user preferences
const [visibleModules, setVisibleModules] = useState<string[]>([]);

// Filter cards based on preferences
const visibleCardIds = cardIds.filter(id => visibleModules.includes(id));

// Add button to header
<Button onClick={() => navigate('/dashboard/customize')}>
  <Settings className="w-4 h-4 mr-2" />
  Customize Dashboard
</Button>
```

---

### **6. User Preferences Storage**
**Options:**
- [ ] LocalStorage (quick prototype)
- [ ] API endpoint `/api/user/dashboard-preferences`
- [ ] Context provider for preferences

**Data Structure:**
```typescript
type DashboardPreferences = {
  userId: string;
  visibleModules: string[]; // Array of module IDs
  moduleOrder?: string[]; // Optional: custom order
  lastUpdated: Date;
};
```

---

## 🔮 **FUTURE - Phase 2:**

### **Team Member Individual Overrides**
**Access:** Settings → Company Settings → Team Members → [Edit Member] → Dashboard Modules tab

**Features:**
- [ ] Show member's role default modules
- [ ] Allow granting additional modules beyond role
- [ ] Allow hiding specific modules even if role allows
- [ ] Visual diff showing overrides vs role defaults

### **Advanced Features**
- [ ] Module size preferences (small/medium/large)
- [ ] Custom module order/positioning
- [ ] Module-specific configuration (date ranges, filters)
- [ ] Export/import dashboard layouts
- [ ] Dashboard templates (by role/department)
- [ ] Analytics on module usage

---

## 📊 **Current Module List:**

| ID | Name | Category | Default Roles | Status |
|----|------|----------|---------------|--------|
| `integrationStatus` | Integration Status | integration | Owner, Admin, Manager | ✅ |
| `taskOverview` | Task Overview | tasks | All | ✅ |
| `invoices` | Invoices | financial | Owner, Admin, Manager | ✅ |
| `signedDocs` | New Signed Documents | documents | All | ✅ |
| `inbox` | Inbox | communication | All | ✅ |
| `projectTask` | Project Tasks | tasks | All | ✅ |
| `calendar` | Calendar | calendar | All | ✅ |
| `documents` | Documents | documents | All | ✅ |
| `leads` | Leads | clients | Owner, Admin, Manager | ✅ |
| `myTasks` | My Tasks | tasks | All | ✅ |
| `organizer` | Organizer | tasks | All | ✅ |
| `recentActivity` | Recent Activity | analytics | Owner, Admin, Manager | ✅ |
| `clientOverview` | Client Overview | clients | Owner, Admin, Manager | ✅ |

---

## 🎨 **Design Decisions:**

### **Role-Based Access Control**
- **Role configuration** defines base access (what users CAN see)
- **Individual overrides** add/remove beyond role (Phase 2)
- **User preferences** determine what they DO see (within allowed modules)

### **Hierarchy:**
```
Global Module Config (enable/disable)
  ↓
Role Permissions (which roles can access)
  ↓
Individual Overrides (grant/revoke for specific users) [Phase 2]
  ↓
User Preferences (which modules to display)
```

### **Default Behavior:**
- New users see ALL modules their role allows
- Users can hide modules they don't need
- Admins can't force modules to be visible (users control preferences)

---

## 🔧 **Technical Stack:**

**Files Created:**
- `/lib/dashboardModules.ts` - Module registry
- `/components/views/settings/DashboardModulesView.tsx` - Settings page

**Files Modified:**
- `/routes/AppRoutes.tsx` - Added route
- `/components/views/settings/CompanySettingsLayout.tsx` - Already had navigation entry
- `/components/views/settings/CompanySettingsView.tsx` - Wired up component

**Files To Modify (Phase 1B):**
- `/components/views/DashboardView.tsx` - Filter modules, add customize button
- Create `/components/views/DashboardCustomizeView.tsx` - User customization page

---

## 📝 **Next Steps:**

### **Immediate (Complete Phase 1):**
1. Create Dashboard Customize page
2. Update DashboardView to filter modules
3. Add preferences storage (localStorage for now)
4. Test full flow: Admin configures → User customizes → Dashboard shows filtered modules

### **Later (Phase 2):**
1. Add Team Member individual overrides
2. Backend API integration
3. Advanced features (sizing, ordering, templates)

---

## 🎯 **Success Criteria:**

- [ ] Admin can enable/disable modules in settings
- [ ] Admin can configure which roles see which modules
- [ ] Users can access customization page from dashboard
- [ ] Users can select/deselect modules
- [ ] Dashboard only shows selected modules
- [ ] Preferences persist across sessions
- [ ] Dark mode works throughout
- [ ] Mobile responsive

---

**Status:** Phase 1A Complete ✅ | Phase 1B Ready to Start 🚀
