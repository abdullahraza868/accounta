# Table Header Background Standard

## 📅 Last Updated: 2025-01-30

## ⚠️ CRITICAL: Solid Primary Color Only (No Gradients!)

Table headers MUST use **solid primary color background** - NOT gradients.

---

## ✅ CORRECT Implementation

```tsx
<thead>
  <tr 
    style={{
      backgroundColor: 'var(--primaryColor)'
    }}
  >
    <th className="px-4 py-4 text-left text-xs uppercase tracking-wide text-white/90">
      Column Name
    </th>
  </tr>
</thead>
```

---

## ❌ WRONG Implementation (Do NOT Use)

```tsx
{/* ❌ NEVER USE GRADIENTS - This is wrong! */}
<thead>
  <tr 
    style={{
      background: 'linear-gradient(to right, var(--primaryColor), var(--secondaryColor, var(--primaryColor)))'
    }}
  >
    {/* ... */}
  </tr>
</thead>
```

---

## 🚨 Why This Matters

1. **Brand Consistency** - We use solid primary color as our "normal" state
2. **Accessibility** - Gradients can affect text readability
3. **Simplicity** - Solid colors are cleaner and more professional
4. **Performance** - Solid colors render faster than gradients

---

## 📝 History / Context

- **Issue:** Gradient was previously used and kept being re-introduced
- **Root Cause:** AI/developers forgetting the standard
- **Solution:** This document serves as committed memory
- **Status:** Fixed in BillingView and SignaturesView (2025-01-30)

### Previous Incorrect Code
This was used before and is **WRONG**:
```tsx
background: 'linear-gradient(to right, var(--primaryColor), var(--secondaryColor, var(--primaryColor)))'
```

### Current Correct Code
```tsx
backgroundColor: 'var(--primaryColor)'
```

---

## 🎯 Apply To

ALL table headers across the entire application:

### ✅ Fixed
- [x] BillingView.tsx
- [x] SignaturesView.tsx
- [x] ClientPortalAccountAccess.tsx (Client Portal)

### ⚠️ Needs Audit
- [ ] BillingViewSplit.tsx
- [ ] SignaturesViewSplit.tsx
- [ ] ClientManagementView.tsx
- [ ] Form8879View.tsx
- [ ] SignatureTemplatesView.tsx
- [ ] IncomingDocumentsView.tsx
- [ ] All client folder tabs
- [ ] All team member tabs
- [ ] All company settings tabs
- [ ] Other client portal pages

---

## 🔍 How to Audit

1. Search for `background:` or `background-image:` in table headers
2. Look for `linear-gradient` in table headers
3. Replace with `backgroundColor: 'var(--primaryColor)'`
4. Test in light and dark mode
5. Verify text remains legible (white/90 opacity)

### Search Pattern
```
style={{.*background.*gradient
```

---

## 💡 Text Color on Primary Background

When using primary color background, text should be:
```tsx
className="text-white/90"  {/* 90% opacity white */}
```

**NOT** pure white (`text-white`), and **NOT** gray colors.

---

## ✅ Complete Header Example

```tsx
<thead>
  <tr 
    style={{
      backgroundColor: 'var(--primaryColor)'
    }}
  >
    <th className="px-6 py-4 text-left text-xs uppercase tracking-wide text-white/90 w-[240px]">
      Client Name
    </th>
    <th className="px-4 py-4 text-left text-xs uppercase tracking-wide text-white/90 w-[160px]">
      Invoice #
    </th>
    <th className="px-4 py-4 text-left text-xs uppercase tracking-wide text-white/90 w-[160px]">
      Created / Sent
    </th>
    {/* ... more columns ... */}
  </tr>
</thead>
```

---

## 🔗 Related Standards

- **BRANDING_CONTEXT.md** - How primary color is managed
- **TABLE_HEADER_STYLING_STANDARD.md** - General header styling
- **TABLE_STANDARDS_MASTER_CHECKLIST.md** - All table standards

---

## 🎨 Visual Comparison

### ❌ Gradient (Wrong)
```
┌─────────────────────────────────────┐
│  Purple → Blue gradient header      │ ← Looks dated, inconsistent
├─────────────────────────────────────┤
```

### ✅ Solid Color (Correct)
```
┌─────────────────────────────────────┐
│  Solid Primary Color Header         │ ← Clean, professional, consistent
├─────────────────────────────────────┤
```

---

## 📌 Commit to Memory

**ALWAYS remember:**
- ✅ Table headers = `backgroundColor: 'var(--primaryColor)'`
- ❌ Table headers ≠ gradients
- ✅ This is our "normal" state
- ❌ Gradients were a mistake that got fixed

**If you see a gradient in a table header, it's a bug - fix it immediately!**

---

**Standard Status:** ✅ Active & Critical  
**Enforcement Level:** MANDATORY  
**Last Known Issue:** 2025-01-30 (now fixed)  
**Next Audit:** When adding new table pages
