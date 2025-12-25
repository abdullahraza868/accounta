# Development Checklist

## Every Time You Create or Update a Component

### 1. Visual-First Design ✨
- [ ] **Can this use visual clickable boxes instead of radio buttons?**
  - Reference: `/DESIGN_VISUAL_FIRST_STANDARD.md`
  - Use `ClickableOptionBox` for 2-6 options
- [ ] **Can this use toggle switches instead of checkboxes?**
  - Binary choices = Switch component
- [ ] **Can this use segmented controls?**
  - 2-4 mutually exclusive options
- [ ] **Can this use progress steppers?**
  - Multi-step processes
  - Reference: `/TOOLBOX_CLICKABLE_PROGRESS_STEPPER.md`

### 2. Dialog/Popup Interactions 🪟
- [ ] **Add double-click-outside-to-close to all dialogs**
  - AlertDialog: Add `onDoubleClickOutsideClose` prop
  - Dialog: Add `onDoubleClickOutsideClose` prop
  - Reference: `/TOOLBOX_DOUBLE_CLICK_OUTSIDE_TO_CLOSE.md`
  - Example: `<AlertDialogContent onDoubleClickOutsideClose={() => setOpen(false)}>`

### 3. Form Validation 📝
- [ ] **All fields have proper validation**
  - Use `/lib/fieldValidation.ts` functions
  - Reference: `/VALIDATION_TOOLKIT_COMPLETE.md`
  - Show error states with icons
  - Use `aria-invalid` and `aria-describedby`

### 4. Date Formatting 📅
- [ ] **Use centralized date formatting from AppSettingsContext**
  - Import `useAppSettings()` hook
  - Use `formatDate()` function
  - Reference: `/TOOLBOX_DATE_FORMATTING_STANDARD.md`
  - Display format: MM-DD-YYYY with time on second line

### 5. Branding & Colors 🎨
- [ ] **Use branding colors, not hardcoded values**
  - Import `useBranding()` hook
  - Use `branding.colors.*` for all colors
  - Reference: `/contexts/BrandingContext.tsx`
  - Never use hardcoded purple/blue values

### 6. Dropdowns & Lists 📋
- [ ] **Alphabetize all dropdowns**
  - Unless explicitly requested otherwise
  - Unless there's a functional reason (like priority order)
  - Reference: `/DROPDOWN_ALPHABETIZATION_STANDARD.md`

### 7. Tables 📊
- [ ] **Follow table standards**
  - Header background: Use branding colors
  - Pagination: Bottom right
  - Items per page: Bottom left
  - Action buttons: Right-aligned
  - Reference: `/TABLE_STANDARDS_MASTER_CHECKLIST.md`

### 8. Typography 🔤
- [ ] **Don't use Tailwind typography classes unless needed**
  - No `text-2xl`, `font-bold`, `leading-none` 
  - Use defaults from `/styles/globals.css`
  - Only override when specifically requested

### 9. Accessibility ♿
- [ ] **Keyboard navigation works**
  - Tab through all interactive elements
  - Enter/Space to activate
- [ ] **ARIA labels present**
  - All form fields labeled
  - All buttons described
- [ ] **Focus states visible**
  - Outline or highlight on focus
- [ ] **Screen reader friendly**
  - Semantic HTML
  - Proper heading hierarchy

### 10. Mobile Responsiveness 📱
- [ ] **Test on mobile viewport**
  - Grid layouts adjust (grid-cols-3 → grid-cols-1)
  - Buttons stack vertically
  - Text doesn't overflow
  - Touch targets are large enough (44x44px minimum)

## Dialog-Specific Checklist

When creating ANY dialog/modal/popup:

- [ ] Import AlertDialog or Dialog from `/components/ui/`
- [ ] Add `open` and `onOpenChange` props
- [ ] Add `onDoubleClickOutsideClose={() => setOpen(false)}`
- [ ] Include AlertDialogTitle for screen readers
- [ ] Include AlertDialogDescription for context
- [ ] Use visual option boxes if applicable (not radio buttons)
- [ ] Add proper validation to all form fields
- [ ] Use branding colors throughout
- [ ] Test keyboard navigation (Tab, Enter, Escape)
- [ ] Test double-click outside to close

### Dialog Template
```tsx
const [open, setOpen] = useState(false);
const { branding } = useBranding();

<AlertDialog open={open} onOpenChange={setOpen}>
  <AlertDialogContent 
    onDoubleClickOutsideClose={() => setOpen(false)}
  >
    <AlertDialogHeader>
      <AlertDialogTitle>Dialog Title</AlertDialogTitle>
      <AlertDialogDescription>
        Dialog description
      </AlertDialogDescription>
    </AlertDialogHeader>
    
    {/* Use ClickableOptionBox for selections */}
    <div className="grid grid-cols-3 gap-3">
      <ClickableOptionBox
        selected={selected === 'option1'}
        onClick={() => setSelected('option1')}
        label="Option 1"
      />
    </div>
    
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction>Confirm</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

## Form-Specific Checklist

When creating ANY form:

- [ ] Use visual-first components (ClickableOptionBox, Switch, etc.)
- [ ] All fields have validation
- [ ] All required fields marked with `<span className="text-red-500">*</span>`
- [ ] Error messages show with icons
- [ ] Use branding colors for inputs
- [ ] Disable submit button when form invalid
- [ ] Show success toast on submit
- [ ] Reset form after successful submit
- [ ] Use proper input types (email, tel, number, date)
- [ ] Add autocomplete attributes

### Form Template
```tsx
const [formData, setFormData] = useState({ ... });
const [errors, setErrors] = useState({ ... });
const { branding } = useBranding();

const handleSubmit = () => {
  // Validate
  const emailValidation = validateEmail(formData.email, true);
  if (!emailValidation.isValid) {
    setErrors({ email: emailValidation.error });
    return;
  }
  
  // Submit
  toast.success('Form submitted!');
  setOpen(false);
};

<div className="space-y-4">
  <div>
    <Label>
      Email <span className="text-red-500">*</span>
    </Label>
    <Input
      type="email"
      value={formData.email}
      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      style={{
        background: branding.colors.inputBackground,
        borderColor: errors.email ? '#EF4444' : branding.colors.inputBorder,
        color: branding.colors.inputText,
      }}
    />
    {errors.email && (
      <p className="text-red-600 text-sm mt-1">
        <AlertCircle className="w-3 h-3 inline mr-1" />
        {errors.email}
      </p>
    )}
  </div>
</div>
```

## Testing Checklist

Before marking a feature complete:

- [ ] Visual design matches requirements
- [ ] Works on desktop (Chrome, Firefox, Safari)
- [ ] Works on mobile (responsive)
- [ ] Keyboard navigation works
- [ ] Screen reader announces properly
- [ ] All error states work
- [ ] All success states work
- [ ] Loading states work
- [ ] Empty states work
- [ ] Branding colors applied everywhere
- [ ] No console errors
- [ ] No console warnings
- [ ] Double-click outside closes dialogs
- [ ] Validation prevents invalid submissions

## Code Quality Checklist

- [ ] No hardcoded colors (use `branding.colors.*`)
- [ ] No hardcoded typography (use globals.css defaults)
- [ ] No `any` types in TypeScript
- [ ] Proper TypeScript interfaces
- [ ] Meaningful variable names
- [ ] Comments for complex logic
- [ ] No commented-out code
- [ ] Imports organized and clean
- [ ] No unused imports
- [ ] No unused variables

## Documentation Checklist

When creating a new pattern or component:

- [ ] Add to appropriate toolbox document
- [ ] Update relevant checklists
- [ ] Add examples to documentation
- [ ] Screenshot for visual reference
- [ ] Update quick reference guides

## Quick Reference Links

### Visual Design
- `/DESIGN_VISUAL_FIRST_STANDARD.md` - Visual-first philosophy
- `/TOOLBOX_CLICKABLE_OPTION_BOX.md` - Clickable option boxes
- `/TOOLBOX_CLICKABLE_PROGRESS_STEPPER.md` - Progress steppers

### Interactions
- `/TOOLBOX_DOUBLE_CLICK_OUTSIDE_TO_CLOSE.md` - Dialog close behavior

### Validation
- `/VALIDATION_TOOLKIT_COMPLETE.md` - Field validation
- `/lib/fieldValidation.ts` - Validation functions

### Formatting
- `/TOOLBOX_DATE_FORMATTING_STANDARD.md` - Date formatting
- `/contexts/AppSettingsContext.tsx` - App settings

### Branding
- `/contexts/BrandingContext.tsx` - Branding colors
- `/DESIGN_PALETTE_TABLE_STYLING.md` - Color usage

### Tables
- `/TABLE_STANDARDS_MASTER_CHECKLIST.md` - Table standards
- `/TOOLSET_PAGINATION.md` - Pagination

### Standards
- `/DROPDOWN_ALPHABETIZATION_STANDARD.md` - Dropdown sorting
- `/guidelines/Guidelines.md` - General guidelines

## Common Mistakes to Avoid

### ❌ DON'T
- Use radio buttons when ClickableOptionBox would work
- Hardcode colors instead of using branding
- Forget to add double-click-outside-to-close
- Skip validation on form fields
- Use Tailwind typography classes unnecessarily
- Forget to alphabetize dropdowns
- Ignore mobile responsiveness
- Skip accessibility features
- Leave console errors/warnings

### ✅ DO
- Think visual-first for all selections
- Use branding context for all colors
- Add double-click-outside-to-close to all dialogs
- Validate all form inputs
- Test keyboard navigation
- Test on mobile viewport
- Use semantic HTML
- Follow existing patterns
- Check documentation first

## Before Submitting Code

Run through this final checklist:

1. ✅ Feature works as expected
2. ✅ Visual-first design applied
3. ✅ Double-click outside closes dialogs
4. ✅ All validations in place
5. ✅ Branding colors used
6. ✅ Mobile responsive
7. ✅ Keyboard accessible
8. ✅ No console errors
9. ✅ Documentation updated
10. ✅ Code is clean and organized

---

**Remember:** Quality over speed. Take time to do it right the first time. These patterns make the codebase consistent, maintainable, and user-friendly.
