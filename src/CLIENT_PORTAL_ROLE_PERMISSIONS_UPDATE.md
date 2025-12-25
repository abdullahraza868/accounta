# Client Portal - Role-Based Permissions & UI Updates

## Date: November 1, 2025

## Changes Implemented

### 1. Role-Based Page Access Presets

Implemented automatic page permission assignment based on user role selection:

#### Role Definitions:
- **Employee**: Profile, Documents, Signatures
- **Accountant**: Dashboard, Profile, Documents, Signatures (all except Invoices and Account Access)
- **Bookkeeper**: Documents, Invoices

When a role is selected in the Add User or Edit User dialog, the page permissions are automatically set according to these presets. Users can still manually adjust permissions after the preset is applied.

### 2. Access Duration Order Update

Reordered the access duration presets to show "Unlimited" after time-limited options:

**New Order:**
1. 1 Day
2. 1 Week
3. 1 Month
4. 3 Months
5. 6 Months
6. 1 Year
7. Custom Date
8. **Unlimited** (moved from position 7 to position 8)

This places unlimited access at the end, making time-limited options more prominent.

### 3. Roles & Permissions Summary Enhancement

Updated the summary section on the Access & Security tab to display a two-column layout:

**Left Column:**
- Portal Access status
- Access expiration date
- 2FA requirement
- Status (Edit User only)
- Page permission count
- Folder permission count

**Right Column:**
- "Portal Pages Access:" heading
- Complete list of all 6 portal pages with visual indicators:
  - ✓ (green) for granted access
  - ✗ (gray) for denied access
- Granted pages shown in normal opacity
- Denied pages shown at 50% opacity

This provides immediate visual feedback on which specific pages the user can access.

## Files Modified

1. `/components/client-portal/AddUserDialog.tsx`
   - Added `ROLE_PAGE_PRESETS` constant
   - Reordered `ACCESS_DURATION_PRESETS`
   - Added `handleRoleChange()` function
   - Updated role Select to use `handleRoleChange`
   - Enhanced summary section with two-column layout

2. `/components/client-portal/EditUserDialog.tsx`
   - Added `ROLE_PAGE_PRESETS` constant
   - Reordered `ACCESS_DURATION_PRESETS`
   - Added `handleRoleChange()` function
   - Updated role Select to use `handleRoleChange`
   - Enhanced summary section with two-column layout

## User Experience Impact

### Add User Flow:
1. Admin selects a role (Employee, Accountant, or Bookkeeper)
2. Page permissions automatically populate based on role
3. Admin can review permissions on Permissions tab
4. Final summary shows exactly which pages are accessible with visual indicators

### Edit User Flow:
1. Admin changes user role
2. Page permissions automatically update to match new role
3. Admin can override auto-assigned permissions
4. Summary shows current access state with clear visual indicators

### Access Duration Selection:
- Time-limited options appear first, encouraging finite access grants
- Unlimited access is still available but positioned last
- Custom date option allows precise expiration control

## Benefits

1. **Consistency**: Role-based presets ensure standard permissions across similar users
2. **Efficiency**: Reduces manual checkbox selection for common roles
3. **Clarity**: Visual page list in summary provides immediate confirmation
4. **Flexibility**: Users can still manually adjust permissions after preset application
5. **Best Practice**: Positioning unlimited access last encourages time-limited access

## Future Considerations

- Consider adding folder permission presets per role
- Add ability to save custom role templates
- Consider role-based default access durations
- Add permission change audit log
