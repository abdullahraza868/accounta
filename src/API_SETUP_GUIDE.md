# API Setup Guide

## Current Status: Mock Mode

The application is currently running in **Mock Mode**. This means:
- ✅ You can use all UI features and test the interface
- ✅ Login works with any email/password combination
- ✅ Tenant selection accepts any firm name
- ✅ All data is simulated and stored in browser localStorage
- ⚠️ No real data is persisted to a backend
- ⚠️ Data will be lost when you clear browser storage

## Mock Mode Features

When the API is not available, the following happens automatically:
1. **Login** - Accepts any credentials and creates a mock session
2. **Tenant Selection** - Accepts any firm name and generates a mock tenant ID
3. **2FA** - Accepts any 6-digit code
4. **API Calls** - Return mock data for development

## How to Connect to Your Real API

### Step 1: Update API Configuration

Edit `/config/api.config.ts`:

```typescript
export const API_CONFIG = {
  // Change this to your actual API URL
  baseUrl: 'http://localhost:21021', // or your API URL
  
  // For production:
  // baseUrl: 'https://api.yourdomain.com',
  
  // ... rest of config
};
```

### Step 2: Verify Your API is Running

Make sure your ASP.NET Boilerplate backend is running and accessible:

```bash
# Test if API is accessible
curl http://localhost:21021/api/services/app/Account/IsTenantAvailable

# Or open in browser:
# http://localhost:21021/swagger
```

### Step 3: Generate API Client (Optional but Recommended)

For type-safe API calls, generate the NSwag client:

#### On Windows:
```cmd
scripts\generate-api-client.bat
```

#### On Linux/Mac:
```bash
chmod +x scripts/generate-api-client.sh
./scripts/generate-api-client.sh
```

This will:
1. Download your API's Swagger JSON
2. Generate TypeScript client code in `/services/generated/ServiceProxies.ts`
3. Provide type-safe API calls

### Step 4: Update ApiService

After generating the client, uncomment the real implementations in `/services/ApiService.ts`:

```typescript
// TODO: Uncomment after generating NSwag client
import { 
  TokenAuthServiceProxy, 
  AuthenticateModel,
  // ... other imports
} from './generated/ServiceProxies';
```

And replace mock implementations with real calls:

```typescript
async authenticate(usernameOrEmailAddress: string, password: string) {
  // Replace mock implementation
  const model = new AuthenticateModel({
    userNameOrEmailAddress: usernameOrEmailAddress,
    password: password,
    rememberClient: true
  });
  return await this.tokenAuthService.authenticate(model);
}
```

### Step 5: Test the Connection

1. Start your backend API
2. Refresh the frontend application
3. The yellow "Mock Mode" banner should disappear
4. Try logging in with real credentials

## API Endpoints Used

The application expects these ASP.NET Boilerplate endpoints:

### Authentication
- `POST /api/TokenAuth/Authenticate` - Login
- `POST /api/services/app/Account/IsTenantAvailable` - Check tenant

### Session
- `GET /api/services/app/Session/GetCurrentLoginInformations` - Get user info

### Clients
- `GET /api/services/app/Client/GetAll` - List clients
- `GET /api/services/app/Client/Get?Id={id}` - Get client

### Signatures
- `GET /api/services/app/Signature/GetAll` - List signatures

### Billing
- `GET /api/services/app/Billing/GetAllInvoices` - List invoices

### Platform Branding
- `GET /api/services/app/PlatformBranding/Get` - Get branding
- `POST /api/services/app/PlatformBranding/Update` - Update branding

## Troubleshooting

### API Connection Issues

**Problem:** "Network error - unable to reach the server"

**Solutions:**
1. Verify your API is running: `curl http://localhost:21021`
2. Check CORS settings in your API
3. Verify the baseUrl in `/config/api.config.ts`
4. Check browser console for detailed error messages

### CORS Errors

If you see CORS errors in the console:

1. Add CORS configuration to your ASP.NET Core Startup.cs:

```csharp
public void ConfigureServices(IServiceCollection services)
{
    services.AddCors(options =>
    {
        options.AddPolicy("AllowAll",
            builder =>
            {
                builder
                    .AllowAnyOrigin()
                    .AllowAnyMethod()
                    .AllowAnyHeader();
            });
    });
}

public void Configure(IApplicationBuilder app)
{
    app.UseCors("AllowAll");
    // ... rest of configuration
}
```

### 401 Unauthorized Errors

Make sure:
1. You're sending the correct tenant header: `Abp.TenantId`
2. The Bearer token is included in the Authorization header
3. The token hasn't expired

### Tenant Selection Not Working

Verify your API's IsTenantAvailable endpoint returns:

```json
{
  "state": 1,  // 1=Available, 2=InActive, 3=NotFound
  "tenantId": 123
}
```

## Mock Mode vs Real API

| Feature | Mock Mode | Real API |
|---------|-----------|----------|
| Login | Any credentials work | Validates against database |
| Tenant | Accepts any name | Validates against tenants |
| Data | Temporary (localStorage) | Persistent (database) |
| Multi-user | No | Yes |
| Permissions | All granted | Based on roles |

## Disabling Mock Mode

To require a real API connection (disable mock fallback):

Edit `/config/api.config.ts`:

```typescript
export const API_CONFIG = {
  // ... other config
  useMockMode: false, // Set to false
};
```

Now the app will show errors if the API is not available instead of falling back to mock data.

## Development Workflow

### Phase 1: UI Development (Current - Mock Mode)
- Develop and test UI components
- Design user flows
- Test layouts and responsiveness
- Use mock data for rapid iteration

### Phase 2: API Integration
1. Set up ASP.NET Boilerplate backend
2. Update API configuration
3. Generate NSwag client
4. Replace mock implementations
5. Test with real data

### Phase 3: Production
- Deploy backend API
- Update baseUrl to production URL
- Set `useMockMode: false`
- Test thoroughly

## Need Help?

- Check `/services/ApiService.ts` for API service implementation
- Review `/config/axios.config.ts` for request interceptor configuration
- See `/contexts/AuthContext.tsx` for authentication flow
- Read ASP.NET Boilerplate documentation: https://aspnetboilerplate.com/

## Environment Variables (Optional)

You can use environment variables for different environments:

Create `.env.local`:
```
VITE_API_BASE_URL=http://localhost:21021
```

Update `/config/api.config.ts`:
```typescript
baseUrl: import.meta.env.VITE_API_BASE_URL || 'https://api.acounta.com',
```
