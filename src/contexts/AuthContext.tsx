import React, { createContext, useContext, useState, useEffect } from 'react';

export type User = {
  id: number;
  userName: string;
  name: string;
  surname: string;
  emailAddress: string;
  tenantId?: number;
  grantedPermissions?: string[];
  role?: 'client' | 'admin'; // Client portal users have 'client', admin users don't have this or have 'admin'
};

export type Tenant = {
  id: number;
  tenancyName: string;
  name: string;
};

type AuthContextType = {
  user: User | null;
  tenant: Tenant | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (usernameOrEmailAddress: string, password: string, tenancyName?: string) => Promise<void>;
  logout: () => void;
  switchTenant: (tenantId: number) => Promise<void>;
  setAuthData: (token: string, user: User, tenant?: Tenant) => void;
  hasPermission: (permission: string | string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load auth data from localStorage on mount
  useEffect(() => {
    console.log('🔐 AuthContext: Initializing...');
    
    // DEVELOPMENT MODE: Auto-login bypass
    console.log('🚀 DEV MODE: Bypassing authentication, auto-logging in...');
    
    const mockUser: User = {
      id: 1,
      userName: 'dev@acounta.com',
      name: 'Dev',
      surname: 'User',
      emailAddress: 'dev@acounta.com',
      tenantId: 1,
      grantedPermissions: [
        'Pages.Dashboard',
        'Pages.Firm.Client',
        'Pages.Users',
        'Pages.Signatures',
        'Pages.Documents',
        'Pages.Calendar',
        'Pages.Billing',
        'Pages.Chat',
        'Pages.Settings',
        'Pages.PlatformBranding',
        'Pages.EmailCustomization'
      ]
    };
    
    const mockTenant: Tenant = {
      id: 1,
      tenancyName: 'dev',
      name: 'Development Tenant'
    };
    
    const mockToken = 'dev_token_' + Date.now();
    
    setAccessToken(mockToken);
    setUser(mockUser);
    setTenant(mockTenant);
    
    localStorage.setItem('accessToken', mockToken);
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('tenant', JSON.stringify(mockTenant));
    
    console.log('✅ AuthContext: Auto-login complete');
    setIsLoading(false);
  }, []);

  const setAuthData = (token: string, userData: User, tenantData?: Tenant) => {
    setAccessToken(token);
    setUser(userData);
    if (tenantData) {
      setTenant(tenantData);
    }
    
    localStorage.setItem('accessToken', token);
    localStorage.setItem('user', JSON.stringify(userData));
    if (tenantData) {
      localStorage.setItem('tenant', JSON.stringify(tenantData));
    }
  };

  const login = async (usernameOrEmailAddress: string, password: string, tenancyName?: string) => {
    try {
      console.log('🔐 AuthContext.login: Starting login process');
      console.log('📧 Email:', usernameOrEmailAddress);
      console.log('🏢 Tenant:', tenancyName || 'none');
      
      // This will be replaced with actual NSwag client call
      // Example: const result = await tokenAuthService.authenticate({
      //   userNameOrEmailAddress: usernameOrEmailAddress,
      //   password: password,
      //   tenancyName: tenancyName
      // });
      
      // For now, simulate API call
      setIsLoading(true);
      
      // Mock implementation - replace with actual NSwag client
      const mockAuthResult = {
        accessToken: 'mock_jwt_token_' + Date.now(),
        encryptedAccessToken: 'encrypted_mock_token',
        expireInSeconds: 86400,
        userId: 1,
        is2StepVerificationRequired: false, // Change to true to test 2FA flow
        email: usernameOrEmailAddress,
        provider: 'Default',
        userName: usernameOrEmailAddress,
        isImpersonated: false
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Process authentication result
      if (mockAuthResult.accessToken) {
        // Successfully logged in
        const mockUser: User = {
          id: mockAuthResult.userId,
          userName: mockAuthResult.userName,
          name: 'John',
          surname: 'Doe',
          emailAddress: mockAuthResult.email,
          tenantId: tenancyName ? 1 : undefined,
          grantedPermissions: [
            'Pages.Dashboard',
            'Pages.Firm.Client',
            'Pages.Users',
            'Pages.Signatures',
            'Pages.Documents',
            'Pages.Calendar',
            'Pages.Billing',
            'Pages.Chat',
            'Pages.Settings',
            'Pages.PlatformBranding',
            'Pages.EmailCustomization'
          ]
        };
        
        const mockTenant: Tenant | undefined = tenancyName ? {
          id: 1,
          tenancyName: tenancyName,
          name: tenancyName
        } : undefined;

        console.log('✅ AuthContext.login: Setting auth data');
        console.log('👤 User permissions:', mockUser.grantedPermissions);
        setAuthData(mockAuthResult.accessToken, mockUser, mockTenant);
        console.log('✅ AuthContext.login: Login complete');
        setIsLoading(false);
      } else if (mockAuthResult.is2StepVerificationRequired) {
        // 2FA required - store temporary data and redirect
        localStorage.setItem('userEmail', mockAuthResult.email);
        localStorage.setItem('userAuthProvider', mockAuthResult.provider);
        localStorage.setItem('userName', mockAuthResult.userName);
        
        setIsLoading(false);
        // The component should handle navigation to 2FA page
        throw new Error('2FA_REQUIRED');
      } else {
        setIsLoading(false);
        throw new Error('Unexpected authentication result');
      }
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const logout = () => {
    setAccessToken(null);
    setUser(null);
    setTenant(null);
    // Clear ALL auth-related data from localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    localStorage.removeItem('tenant');
    localStorage.removeItem('tenantId');
    localStorage.removeItem('tenantName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userAuthProvider');
    localStorage.removeItem('userName');
    // Clear any portal preference
    localStorage.removeItem('preferredPortal');
    console.log('✅ Logout: All auth data cleared from localStorage');
  };

  const switchTenant = async (tenantId: number) => {
    try {
      // This will be replaced with actual NSwag client call
      // Example: const result = await sessionService.switchTenant({ tenantId });
      
      setIsLoading(true);
      
      // Mock implementation
      const mockTenant: Tenant = {
        id: tenantId,
        tenancyName: `tenant_${tenantId}`,
        name: `Tenant ${tenantId}`
      };
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setTenant(mockTenant);
      localStorage.setItem('tenant', JSON.stringify(mockTenant));
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const hasPermission = (permission: string | string[]): boolean => {
    if (!user || !user.grantedPermissions) return false;
    
    if (typeof permission === 'string') {
      return user.grantedPermissions.includes(permission);
    }
    
    // If array, check if user has ANY of the permissions
    return permission.some(p => user.grantedPermissions!.includes(p));
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    if (!user || !user.grantedPermissions) return false;
    return permissions.every(p => user.grantedPermissions!.includes(p));
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    if (!user || !user.grantedPermissions) return false;
    return permissions.some(p => user.grantedPermissions!.includes(p));
  };

  const value: AuthContextType = {
    user,
    tenant,
    accessToken,
    isAuthenticated: !!accessToken && !!user,
    isLoading,
    login,
    logout,
    switchTenant,
    setAuthData,
    hasPermission,
    hasAllPermissions,
    hasAnyPermission
  };

  console.log('🔐 AuthProvider render - isLoading:', isLoading, 'isAuthenticated:', value.isAuthenticated);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}