# Tenant Not Found Workflow

## Overview
This workflow handles the case when a user tries to access an accounting firm portal that doesn't exist (wrong subdomain/tenant name).

## Access
- **Test Link**: Available on the admin login page at `/login`
- **Direct URL**: `/tenant-not-found`

## User Flow

### 1. Initial State - "Firm Not Found"
When a user arrives at this page, they see:
- Purple alert icon
- "Firm Not Found" heading
- Message: "The accounting firm '[attempted-name]' was not found. Let's help you get to the right place."
- Email input field
- "Find My Firm" button

### 2. Email Entry
User enters their email address:
- **Real-time validation** using `/lib/fieldValidation.ts`
- Red border shows if email is invalid
- Help text: "We'll search our system to find your accounting firm"

### 3. Searching State
After clicking "Find My Firm":
- Animated spinner
- "Searching for your firm..." message
- 1.5 second delay to simulate API call

### 4. Two Possible Outcomes

#### A. Email Found ✅
- **Green checkmark icon**
- "Firm Found!" heading
- Message: "This is the correct URL for your accounting firm:"
- **Highlighted box** with green border showing:
  - Firm name
  - "Please note this URL:" message in green
  - The full URL in a gray background box
- Helper text: "Bookmark this URL for easy access in the future"
- "Go to Portal" button to navigate to the firm

#### B. Email Not Found ❌
- **Red alert icon**
- "Email Not Found" heading
- Shows the email that was searched
- "What to do next:" section with help:
  - Contact firm directly for correct portal address
  - Call accountant to verify email is registered
- **One button:**
  - "Try Again" - Returns to initial state with cleared email field

## Technical Implementation

### Component Location
`/components/views/TenantNotFoundView.tsx`

### Key Features
1. **Platform Branding Colors** - Uses CSS variables throughout
2. **Email Validation** - Uses centralized validation toolkit
3. **Responsive Design** - Mobile-friendly centered layout
4. **Dark Mode Support** - All text colors have dark variants
5. **State Management** - Four states: `initial`, `searching`, `found`, `not-found`

### API Integration (TODO)
Currently uses mock data. When implementing with NSwag client:

```typescript
// Replace the mock implementation with:
const result = await tenantService.findTenantByEmail({ 
  emailAddress: email 
});

if (result.found) {
  // Redirect to tenant URL
  window.location.href = result.tenantUrl;
} else {
  // Show not found state
  setViewState('not-found');
}
```

### Mock Behavior (For Testing)
- Emails containing "test" or "demo" = FOUND
- All other emails = NOT FOUND

## Design Standards Compliance

✅ **Platform Branding Colors** - All colors use CSS variables
✅ **Field Validation** - Uses `/lib/fieldValidation.ts`
✅ **Visual-First UI** - Clear icons and visual feedback
✅ **Mobile Responsive** - Max-width container, proper padding
✅ **Dark Mode Support** - All text has dark variants
✅ **Inter Font** - Inherits from global styles
✅ **Consistent Layout** - Centered card design

## User Experience

### Visual Feedback
- **Icons**: Different colored icons for each state (purple, green, red)
- **Animations**: Spinner during search, smooth transitions
- **Auto-redirect**: 3-second countdown with "Go Now" option
- **Helpful Information**: Clear next steps when email not found

### Accessibility
- Proper labels for form fields
- Keyboard support (Enter to submit)
- Focus states on inputs
- Screen reader friendly text

## Support Information

Footer includes:
- Copyright notice only (no phone number to prevent users calling Acounta support)

## Testing Checklist

- [ ] Navigate to `/login` and click "Test: Tenant Not Found Workflow" link
- [ ] Verify initial state shows correctly
- [ ] Enter invalid email - should show validation error
- [ ] Enter valid email with "test" - should find firm and redirect
- [ ] Enter valid email without "test" - should show not found
- [ ] Test "Try Again" button - should reset to initial state and clear email
- [ ] Test Enter key to submit form
- [ ] Verify all colors use CSS variables
- [ ] Test in dark mode
- [ ] Test on mobile viewport

## Future Enhancements

1. **Real API Integration**
   - Connect to tenant lookup endpoint
   - Handle API errors gracefully
   - Add loading states

2. **Analytics**
   - Track failed tenant lookups
   - Monitor success rate
   - Identify common misspellings

3. **Smart Suggestions**
   - "Did you mean...?" for similar tenant names
   - Most common firms suggestion
   - Fuzzy matching for typos

4. **Multi-language Support**
   - Translate messages
   - Regional phone numbers
   - Locale-specific help resources
