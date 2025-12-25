# Workflows Quick Reference Card

## First Login Workflows (Passwordless)

### 🟢 User HAS Phone Number

**Route:** `/workflows/first-login`  
**File:** `FirstLoginSetPasswordView.tsx`

**Flow:**
```
Auth (Google/MS/Magic) → OTP → Dashboard
```

**Steps:** 3  
**Time:** ~30 seconds

---

### 🔵 User NEEDS Phone Number

**Route:** `/workflows/first-login-add-phone`  
**File:** `FirstLoginAddPhoneView.tsx`

**Flow (Google/Microsoft):**
```
Auth → Add Phone → OTP → Dashboard
```

**Flow (Magic Link):**
```
Enter Email → Check Email → Add Phone → OTP → Dashboard
```

**Steps:** 4-5  
**Time:** ~60-90 seconds

---

## When to Use Which?

| Scenario | Use Workflow |
|----------|--------------|
| User invited, has phone in DB | 🟢 Has Phone |
| User invited, no phone in DB | 🔵 Needs Phone |
| Existing user, normal login | ❌ Use `/login` instead |
| Client portal user | ❌ Use `/client-portal/login` |

---

## Demo Testing

### Has Phone Workflow
```
http://localhost:5173/workflows/first-login
```
1. Click Google or Microsoft
2. Enter OTP: `123456`
3. Redirect to dashboard

### Needs Phone Workflow
```
http://localhost:5173/workflows/first-login-add-phone
```
1. Click Google or Microsoft
2. Enter phone: `(555) 123-4567`
3. Enter OTP: `123456`
4. Redirect to dashboard

### Magic Link Testing

**Has Phone:**
```
/workflows/first-login?email=user@example.com&token=abc123
```

**Needs Phone:**
```
/workflows/first-login-add-phone?email=user@example.com&token=abc123
```

---

## What We Removed ❌

- ✅ Reset Password workflow
- ✅ Password creation
- ✅ Password-based authentication
- ✅ "Forgot password" flow

**Why?** Passwordless is more secure and better UX!

---

## All Workflows Hub

**Route:** `/workflows/login`  
**File:** `LoginWorkflowsView.tsx`

Access all test workflows from one place.

---

## Quick Links

- **Has Phone Docs:** `FIRST_LOGIN_SIMPLIFIED_V2.md`
- **Needs Phone Docs:** `FIRST_LOGIN_ADD_PHONE_WORKFLOW.md`
- **Summary:** `PASSWORDLESS_WORKFLOWS_SUMMARY.md`
- **Troubleshooting:** `FIRST_LOGIN_SPINNER_FIX.md`
