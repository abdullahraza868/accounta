# 🔌 Household Spouse Linking - API Integration Guide

## 📋 Overview

This guide provides everything you need to integrate the Household Spouse Linking feature with your ASP.NET Boilerplate backend API.

---

## 🎯 Quick Integration Checklist

- [ ] Create database table/entity
- [ ] Create DTOs
- [ ] Create Application Service
- [ ] Add endpoints to controller
- [ ] Update ApiService.ts
- [ ] Test with real API
- [ ] Remove mock data from component

---

## 📊 Backend Implementation

### **1. Create Entity**

**File**: `YourProject.Core/Entities/HouseholdLink.cs`

```csharp
using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using System;

namespace YourProject.Entities
{
    public class HouseholdLink : FullAuditedEntity<Guid>, IMayHaveTenant
    {
        public int? TenantId { get; set; }
        
        public Guid ClientId { get; set; }
        public virtual User Client { get; set; }
        
        public Guid? SpouseClientId { get; set; }
        public virtual User SpouseClient { get; set; }
        
        public string InviteEmail { get; set; }
        
        public HouseholdStatus Status { get; set; }
        
        public HouseholdMode Mode { get; set; }
        
        public DateTime? InvitedAt { get; set; }
        
        public DateTime? LinkedAt { get; set; }
        
        public string InviteToken { get; set; } // For email verification
    }
    
    public enum HouseholdStatus
    {
        None = 0,
        Pending = 1,
        Linked = 2
    }
    
    public enum HouseholdMode
    {
        Unified = 0,
        Separated = 1,
        Divorced = 2
    }
}
```

---

### **2. Create DTOs**

**File**: `YourProject.Application/Household/Dto/HouseholdDtos.cs`

```csharp
using Abp.Application.Services.Dto;
using System;

namespace YourProject.Household.Dto
{
    // Input DTOs
    public class SendHouseholdInviteInput
    {
        public string Email { get; set; }
    }
    
    public class ResendHouseholdInviteInput
    {
        public string Email { get; set; }
    }
    
    public class CancelHouseholdInviteInput
    {
        public string Email { get; set; }
    }
    
    public class UpdateHouseholdModeInput
    {
        public HouseholdMode Mode { get; set; }
    }
    
    // Output DTOs
    public class HouseholdStatusDto
    {
        public HouseholdStatus Status { get; set; }
        public SpouseDto Spouse { get; set; }
    }
    
    public class SpouseDto
    {
        public string Name { get; set; }
        public string Email { get; set; }
        public HouseholdMode Mode { get; set; }
    }
}
```

---

### **3. Create Application Service**

**File**: `YourProject.Application/Household/HouseholdAppService.cs`

```csharp
using Abp.Application.Services;
using Abp.Authorization;
using Abp.Domain.Repositories;
using Abp.UI;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using YourProject.Entities;
using YourProject.Household.Dto;

namespace YourProject.Household
{
    [AbpAuthorize]
    public class HouseholdAppService : ApplicationService, IHouseholdAppService
    {
        private readonly IRepository<HouseholdLink, Guid> _householdRepository;
        private readonly IRepository<User, long> _userRepository;
        // Inject email service for sending invites
        
        public HouseholdAppService(
            IRepository<HouseholdLink, Guid> householdRepository,
            IRepository<User, long> userRepository)
        {
            _householdRepository = householdRepository;
            _userRepository = userRepository;
        }
        
        public async Task<HouseholdStatusDto> GetStatus()
        {
            var userId = AbpSession.GetUserId();
            
            var link = await _householdRepository.GetAll()
                .Include(x => x.SpouseClient)
                .FirstOrDefaultAsync(x => x.ClientId == userId);
            
            if (link == null)
            {
                return new HouseholdStatusDto
                {
                    Status = HouseholdStatus.None
                };
            }
            
            return new HouseholdStatusDto
            {
                Status = link.Status,
                Spouse = link.SpouseClient != null ? new SpouseDto
                {
                    Name = link.SpouseClient.FullName,
                    Email = link.SpouseClient.EmailAddress,
                    Mode = link.Mode
                } : new SpouseDto
                {
                    Email = link.InviteEmail,
                    Mode = link.Mode
                }
            };
        }
        
        public async Task SendInvite(SendHouseholdInviteInput input)
        {
            var userId = AbpSession.GetUserId();
            
            // Check if already has a household link
            var existing = await _householdRepository.FirstOrDefaultAsync(x => x.ClientId == userId);
            if (existing != null)
            {
                throw new UserFriendlyException("You already have a pending or active household link.");
            }
            
            // Validate email doesn't belong to current user
            var currentUser = await _userRepository.GetAsync(userId);
            if (currentUser.EmailAddress.Equals(input.Email, StringComparison.OrdinalIgnoreCase))
            {
                throw new UserFriendlyException("You cannot invite yourself.");
            }
            
            // Create invite token
            var token = Guid.NewGuid().ToString("N");
            
            // Create household link
            var link = new HouseholdLink
            {
                ClientId = userId,
                InviteEmail = input.Email,
                Status = HouseholdStatus.Pending,
                Mode = HouseholdMode.Unified,
                InvitedAt = Clock.Now,
                InviteToken = token
            };
            
            await _householdRepository.InsertAsync(link);
            
            // TODO: Send email with invite link
            // await _emailService.SendHouseholdInvite(input.Email, token);
        }
        
        public async Task ResendInvite(ResendHouseholdInviteInput input)
        {
            var userId = AbpSession.GetUserId();
            
            var link = await _householdRepository.FirstOrDefaultAsync(
                x => x.ClientId == userId && x.Status == HouseholdStatus.Pending);
            
            if (link == null)
            {
                throw new UserFriendlyException("No pending invite found.");
            }
            
            link.InvitedAt = Clock.Now;
            await _householdRepository.UpdateAsync(link);
            
            // TODO: Resend email
            // await _emailService.SendHouseholdInvite(link.InviteEmail, link.InviteToken);
        }
        
        public async Task CancelInvite(CancelHouseholdInviteInput input)
        {
            var userId = AbpSession.GetUserId();
            
            var link = await _householdRepository.FirstOrDefaultAsync(
                x => x.ClientId == userId && x.Status == HouseholdStatus.Pending);
            
            if (link == null)
            {
                throw new UserFriendlyException("No pending invite found.");
            }
            
            await _householdRepository.DeleteAsync(link);
        }
        
        public async Task UpdateMode(UpdateHouseholdModeInput input)
        {
            var userId = AbpSession.GetUserId();
            
            var link = await _householdRepository.FirstOrDefaultAsync(
                x => x.ClientId == userId && x.Status == HouseholdStatus.Linked);
            
            if (link == null)
            {
                throw new UserFriendlyException("No linked spouse found.");
            }
            
            if (link.Mode == HouseholdMode.Divorced)
            {
                throw new UserFriendlyException("Cannot change mode for divorced/closed households.");
            }
            
            link.Mode = input.Mode;
            await _householdRepository.UpdateAsync(link);
        }
        
        public async Task UnlinkSpouse()
        {
            var userId = AbpSession.GetUserId();
            
            var link = await _householdRepository.FirstOrDefaultAsync(
                x => x.ClientId == userId && x.Status == HouseholdStatus.Linked);
            
            if (link == null)
            {
                throw new UserFriendlyException("No linked spouse found.");
            }
            
            if (link.Mode == HouseholdMode.Divorced)
            {
                throw new UserFriendlyException("Cannot unlink divorced/closed households.");
            }
            
            await _householdRepository.DeleteAsync(link);
        }
        
        // Method for spouse to accept invite (called from email link)
        public async Task AcceptInvite(string token)
        {
            var userId = AbpSession.GetUserId();
            
            var link = await _householdRepository.FirstOrDefaultAsync(
                x => x.InviteToken == token && x.Status == HouseholdStatus.Pending);
            
            if (link == null)
            {
                throw new UserFriendlyException("Invalid or expired invite.");
            }
            
            var user = await _userRepository.GetAsync(userId);
            if (!user.EmailAddress.Equals(link.InviteEmail, StringComparison.OrdinalIgnoreCase))
            {
                throw new UserFriendlyException("This invite was sent to a different email address.");
            }
            
            link.SpouseClientId = userId;
            link.Status = HouseholdStatus.Linked;
            link.LinkedAt = Clock.Now;
            
            await _householdRepository.UpdateAsync(link);
        }
    }
}
```

---

### **4. Create Interface**

**File**: `YourProject.Application/Household/IHouseholdAppService.cs`

```csharp
using Abp.Application.Services;
using System.Threading.Tasks;
using YourProject.Household.Dto;

namespace YourProject.Household
{
    public interface IHouseholdAppService : IApplicationService
    {
        Task<HouseholdStatusDto> GetStatus();
        Task SendInvite(SendHouseholdInviteInput input);
        Task ResendInvite(ResendHouseholdInviteInput input);
        Task CancelInvite(CancelHouseholdInviteInput input);
        Task UpdateMode(UpdateHouseholdModeInput input);
        Task UnlinkSpouse();
        Task AcceptInvite(string token);
    }
}
```

---

## 🔌 Frontend Integration

### **5. Update ApiService.ts**

**File**: `/services/ApiService.ts`

Add these methods to the `ApiService` class:

```typescript
/**
 * Get household status
 */
async getHouseholdStatus() {
  // TODO: Replace with actual NSwag client call
  // return await this.householdService.getStatus();

  // Mock implementation (remove when API is ready)
  logMockAction('getHouseholdStatus', {});
  return {
    status: 'none', // 'none' | 'pending' | 'linked'
    spouse: null
  };
}

/**
 * Send household invite
 */
async sendHouseholdInvite(email: string) {
  // TODO: Replace with actual NSwag client call
  // return await this.householdService.sendInvite({ email });

  // Mock implementation (remove when API is ready)
  logMockAction('sendHouseholdInvite', { email });
  return { success: true };
}

/**
 * Resend household invite
 */
async resendHouseholdInvite(email: string) {
  // TODO: Replace with actual NSwag client call
  // return await this.householdService.resendInvite({ email });

  // Mock implementation (remove when API is ready)
  logMockAction('resendHouseholdInvite', { email });
  return { success: true };
}

/**
 * Cancel household invite
 */
async cancelHouseholdInvite(email: string) {
  // TODO: Replace with actual NSwag client call
  // return await this.householdService.cancelInvite({ email });

  // Mock implementation (remove when API is ready)
  logMockAction('cancelHouseholdInvite', { email });
  return { success: true };
}

/**
 * Update household mode
 */
async updateHouseholdMode(mode: 'unified' | 'separated' | 'divorced') {
  // TODO: Replace with actual NSwag client call
  // return await this.householdService.updateMode({ mode });

  // Mock implementation (remove when API is ready)
  logMockAction('updateHouseholdMode', { mode });
  return { success: true };
}

/**
 * Unlink spouse
 */
async unlinkSpouse() {
  // TODO: Replace with actual NSwag client call
  // return await this.householdService.unlinkSpouse();

  // Mock implementation (remove when API is ready)
  logMockAction('unlinkSpouse', {});
  return { success: true };
}
```

---

### **6. Update Component to Use API**

**File**: `/pages/client-portal/settings/ClientPortalHousehold.tsx`

Add this at the top:
```typescript
import { apiService } from '../../../services/ApiService';
```

Add this `useEffect` to load initial data:
```typescript
useEffect(() => {
  loadHouseholdStatus();
}, []);

const loadHouseholdStatus = async () => {
  try {
    const status = await apiService.getHouseholdStatus();
    setStatus(status.status);
    if (status.spouse) {
      setSpouse(status.spouse);
      if (status.spouse.mode) {
        setSelectedMode(status.spouse.mode);
      }
    }
  } catch (error) {
    console.error('Failed to load household status:', error);
  }
};
```

Replace the mock API calls in handlers:
```typescript
// In handleSendInvite
await apiService.sendHouseholdInvite(email);

// In handleResendInvite
await apiService.resendHouseholdInvite(spouse.email);

// In handleCancelInvite
await apiService.cancelHouseholdInvite(spouse.email);

// In handleChangeMode
await apiService.updateHouseholdMode(mode);

// In handleUnlink
await apiService.unlinkSpouse();
```

---

## 📧 Email Template

Create an email template for household invites:

**Subject**: You've been invited to link your household account

**Body**:
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background: #7c3aed; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">Household Invite</h1>
    </div>
    
    <div style="padding: 30px; background: #f9fafb;">
        <p>Hi there,</p>
        
        <p><strong>{{InviterName}}</strong> has invited you to link your household account for joint tax preparation.</p>
        
        <p>By accepting this invite, you will be able to:</p>
        <ul>
            <li>Share documents with your spouse</li>
            <li>View deliverables together</li>
            <li>Collaborate on tax preparation</li>
        </ul>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{AcceptInviteUrl}}" 
               style="background: #7c3aed; color: white; padding: 12px 30px; 
                      text-decoration: none; border-radius: 6px; display: inline-block;">
                Accept Invite
            </a>
        </div>
        
        <p style="color: #6b7280; font-size: 14px;">
            This invite will expire in 7 days. If you didn't expect this invite, you can safely ignore this email.
        </p>
    </div>
    
    <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
        <p>&copy; 2025 {{CompanyName}}. All rights reserved.</p>
    </div>
</body>
</html>
```

---

## 🧪 Testing Checklist

### **Backend Testing**
- [ ] Test GetStatus endpoint
- [ ] Test SendInvite with valid email
- [ ] Test SendInvite with invalid email
- [ ] Test SendInvite when already linked
- [ ] Test ResendInvite
- [ ] Test CancelInvite
- [ ] Test UpdateMode
- [ ] Test UpdateMode for divorced household (should fail)
- [ ] Test UnlinkSpouse
- [ ] Test UnlinkSpouse for divorced household (should fail)
- [ ] Test AcceptInvite with valid token
- [ ] Test AcceptInvite with invalid token

### **Frontend Testing**
- [ ] Load page with no household link
- [ ] Send invite successfully
- [ ] View pending invite
- [ ] Resend invite
- [ ] Cancel invite
- [ ] View linked spouse
- [ ] Change household mode
- [ ] Unlink spouse
- [ ] Test error scenarios

### **Integration Testing**
- [ ] Full workflow: Send invite → Accept → Link established
- [ ] Email delivery
- [ ] Email link works correctly
- [ ] Permissions work correctly
- [ ] Multi-tenant isolation

---

## 🚀 Deployment Steps

1. **Database Migration**
   - Run migration to create HouseholdLink table
   - Verify table created successfully

2. **Backend Deployment**
   - Deploy Application Service
   - Verify endpoints in Swagger
   - Test endpoints with Postman

3. **Frontend Deployment**
   - Remove mock data from component
   - Update ApiService with real calls
   - Test with real backend

4. **Email Configuration**
   - Configure email service
   - Test email delivery
   - Verify invite links work

5. **Documentation**
   - Update user documentation
   - Create support articles
   - Train support team

---

## 📝 Additional Features to Consider

### **Future Enhancements**
- [ ] Invite expiration (auto-cancel after 7 days)
- [ ] Multiple household members (not just spouse)
- [ ] Household activity log
- [ ] Email notifications for mode changes
- [ ] Spouse can also unlink
- [ ] Bi-directional linking (both parties link to each other)
- [ ] Household document sharing preferences
- [ ] Separate permissions for unified vs separated mode

### **Security Enhancements**
- [ ] Rate limiting on invite sends
- [ ] Token expiration
- [ ] Email verification before accepting
- [ ] Audit trail for household changes
- [ ] Admin override for divorced mode

---

## ✅ Completion Checklist

- [ ] Backend entity created
- [ ] Database migration complete
- [ ] DTOs created
- [ ] Application service implemented
- [ ] Interface defined
- [ ] Endpoints tested in Swagger
- [ ] ApiService.ts updated
- [ ] Component integrated with real API
- [ ] Email templates created
- [ ] Email service configured
- [ ] Frontend testing complete
- [ ] Backend testing complete
- [ ] Integration testing complete
- [ ] Documentation updated
- [ ] Deployed to production

---

## 🎉 Summary

This guide provides everything needed to integrate the Household Spouse Linking feature with your ASP.NET Boilerplate backend. Follow the steps in order, test thoroughly, and you'll have a fully functional spouse linking system ready for production!

**Questions or Issues?**
Refer to the main documentation file: `CLIENT_PORTAL_HOUSEHOLD_SPOUSE_LINKING_COMPLETE.md`
