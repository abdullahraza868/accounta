/**
 * API Service for NSwag Client Integration
 * 
 * This file provides a wrapper around the NSwag generated client.
 * 
 * SETUP INSTRUCTIONS:
 * 1. Generate NSwag client from your ASP.NET Boilerplate API using NSwag Studio or CLI
 * 2. Place the generated client file in /services/generated/ServiceProxies.ts
 * 3. Uncomment the imports below and replace mock implementations with real client calls
 * 
 * Example NSwag generation command:
 * nswag openapi2tsclient /input:http://your-api/swagger/v1/swagger.json /output:services/generated/ServiceProxies.ts
 */

import { getApiBaseUrl } from '../config/api.config';
import { logMockAction } from '../lib/startupInfo';
import defaultLogo from 'figma:asset/30eae3907a12e58c0f2fee0d1b43b11006b4eed4.png';

// TODO: Uncomment after generating NSwag client
// import { 
//   TokenAuthServiceProxy, 
//   AuthenticateModel,
//   AuthenticateResultModel,
//   SessionServiceProxy,
//   AccountServiceProxy,
//   TenantServiceProxy
// } from './generated/ServiceProxies';

export class ApiService {
  private baseUrl: string;
  private static instance: ApiService;

  // TODO: Uncomment and initialize after generating NSwag client
  // private tokenAuthService: TokenAuthServiceProxy;
  // private sessionService: SessionServiceProxy;
  // private accountService: AccountServiceProxy;
  // private tenantService: TenantServiceProxy;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    
    // TODO: Uncomment after generating NSwag client
    // this.tokenAuthService = new TokenAuthServiceProxy(baseUrl);
    // this.sessionService = new SessionServiceProxy(baseUrl);
    // this.accountService = new AccountServiceProxy(baseUrl);
    // this.tenantService = new TenantServiceProxy(baseUrl);
  }

  static getInstance(baseUrl?: string): ApiService {
    if (!ApiService.instance) {
      // Use provided URL, or get from config
      const defaultUrl = baseUrl || getApiBaseUrl();
      ApiService.instance = new ApiService(defaultUrl);
    }
    return ApiService.instance;
  }

  /**
   * Set authorization header for all API calls
   */
  setAuthToken(token: string) {
    // TODO: Uncomment after generating NSwag client
    // Configure the token for all service proxies
    // this.tokenAuthService.bearerToken = token;
    // this.sessionService.bearerToken = token;
    // this.accountService.bearerToken = token;
    // this.tenantService.bearerToken = token;
  }

  /**
   * Authenticate user
   */
  async authenticate(usernameOrEmailAddress: string, password: string, tenancyName?: string, rememberClient: boolean = true) {
    // TODO: Replace with actual NSwag client call
    // const model = new AuthenticateModel({
    //   userNameOrEmailAddress: usernameOrEmailAddress,
    //   password: password,
    //   tenancyName: tenancyName,
    //   rememberClient: rememberClient
    // });
    // return await this.tokenAuthService.authenticate(model);

    // Mock implementation
    logMockAction('authenticate', { usernameOrEmailAddress, tenancyName });
    return {
      accessToken: 'mock_token_' + Date.now(),
      encryptedAccessToken: 'encrypted_mock_token',
      expireInSeconds: 86400,
      userId: 1,
      is2StepVerificationRequired: false,
      email: usernameOrEmailAddress,
      provider: 'Default',
      userName: usernameOrEmailAddress,
      isImpersonated: false
    };
  }

  /**
   * Check if tenant is available
   */
  async isTenantAvailable(tenancyName: string) {
    // TODO: Replace with actual NSwag client call
    // return await this.accountService.isTenantAvailable({ tenancyName });

    // Mock implementation
    logMockAction('isTenantAvailable', { tenancyName });
    return {
      state: 1, // Available
      tenantId: Math.floor(Math.random() * 100) + 1
    };
  }

  /**
   * Get current login info
   */
  async getCurrentLoginInformations() {
    // TODO: Replace with actual NSwag client call
    // return await this.sessionService.getCurrentLoginInformations();

    // Mock implementation
    return {
      user: {
        id: 1,
        userName: 'admin',
        name: 'Admin',
        surname: 'User',
        emailAddress: 'admin@example.com'
      },
      tenant: null,
      application: {
        version: '1.0.0',
        releaseDate: new Date(),
        features: {}
      }
    };
  }

  /**
   * Get all available tenants (for tenant selection)
   */
  async getTenants() {
    // TODO: Replace with actual NSwag client call
    // return await this.tenantService.getTenants();

    // Mock implementation
    return {
      items: [
        { id: 1, tenancyName: 'Default', name: 'Default Tenant' },
        { id: 2, tenancyName: 'Tenant1', name: 'Tenant 1' },
        { id: 3, tenancyName: 'Tenant2', name: 'Tenant 2' }
      ]
    };
  }

  /**
   * Switch to different tenant
   */
  async switchToTenant(tenantId: number) {
    // TODO: Replace with actual NSwag client call
    // return await this.sessionService.switchToTenant({ tenantId });

    // Mock implementation
    console.log('Mock switchToTenant:', tenantId);
    return { success: true };
  }

  /**
   * Register new user/tenant
   */
  async register(input: {
    name: string;
    surname: string;
    userName: string;
    emailAddress: string;
    password: string;
    tenancyName?: string;
  }) {
    // TODO: Replace with actual NSwag client call
    // return await this.accountService.register(input);

    // Mock implementation
    console.log('Mock register:', input);
    return { success: true };
  }

  /**
   * Reset password
   */
  async resetPassword(input: {
    emailAddress: string;
    tenancyName?: string;
  }) {
    // TODO: Replace with actual NSwag client call
    // return await this.accountService.sendPasswordResetCode(input);

    // Mock implementation
    console.log('Mock resetPassword:', input);
    return { success: true };
  }

  /**
   * Get all clients
   */
  async getClients(params?: {
    skipCount?: number;
    maxResultCount?: number;
    sorting?: string;
  }) {
    // TODO: Replace with actual NSwag client call
    // return await this.clientService.getAll(params);

    // Mock implementation
    console.log('Mock getClients:', params);
    return {
      items: [],
      totalCount: 0
    };
  }

  /**
   * Get client by ID
   */
  async getClient(id: number) {
    // TODO: Replace with actual NSwag client call
    // return await this.clientService.get(id);

    // Mock implementation
    console.log('Mock getClient:', id);
    return null;
  }

  /**
   * Get all invoices
   */
  async getInvoices(params?: {
    skipCount?: number;
    maxResultCount?: number;
    sorting?: string;
  }) {
    // TODO: Replace with actual NSwag client call
    // return await this.billingService.getAllInvoices(params);

    // Mock implementation
    console.log('Mock getInvoices:', params);
    return {
      items: [],
      totalCount: 0
    };
  }

  /**
   * Get all signatures with server-side pagination, filtering, and sorting
   */
  async getSignatures(params?: {
    skipCount?: number;
    maxResultCount?: number;
    sorting?: string;
    statusFilter?: string;
    clientTypeFilter?: string;
    documentNameFilter?: string;
    searchQuery?: string;
  }) {
    // TODO: Replace with actual NSwag client call
    // return await this.signatureService.getAll(params);

    // Mock implementation with filtering, sorting, and pagination
    logMockAction('getSignatures', params);
    
    // Simulate async delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Mock data
    const mockData = [
      {
        id: '0',
        documentName: 'Form 8879',
        documentType: '8879',
        clientName: 'Robert & Lisa Martinez',
        clientId: '009',
        clientType: 'Individual',
        year: 2024,
        sentAt: '2025-11-21T14:15:00',
        recipients: [
          {
            id: 'r0a',
            name: 'Robert Martinez',
            email: 'robert@email.com',
            role: 'Primary Taxpayer',
            viewedAt: '2025-11-21T15:30:00',
            signedAt: '2025-11-21T16:15:00',
            ipAddress: '192.168.1.150'
          },
          {
            id: 'r0b',
            name: 'Lisa Martinez',
            email: 'lisa@email.com',
            role: 'Spouse',
            viewedAt: '2025-11-21T16:20:00',
            signedAt: '2025-11-21T16:45:00',
            ipAddress: '192.168.1.151'
          }
        ],
        totalSent: 2,
        totalSigned: 2,
        status: 'completed',
        createdBy: 'Sarah Johnson',
        source: 'manual',
        sentBy: 'Sarah Johnson'
      },
      {
        id: '0-recent-1',
        documentName: 'Engagement Letter 2025',
        documentType: 'template',
        clientName: 'Wilson Technologies Inc',
        clientId: '012',
        clientType: 'Business',
        year: 2025,
        sentAt: '2025-11-20T10:30:00',
        recipients: [
          {
            id: 'r0c',
            name: 'James Wilson',
            email: 'james@wilsontech.com',
            role: 'CEO',
            viewedAt: '2025-11-20T11:00:00',
            signedAt: '2025-11-20T11:45:00',
            ipAddress: '192.168.2.100'
          }
        ],
        totalSent: 1,
        totalSigned: 1,
        status: 'completed',
        createdBy: 'Sarah Johnson',
        source: 'manual',
        sentBy: 'Sarah Johnson'
      },
      {
        id: '0-recent-2',
        documentName: 'Form 8879',
        documentType: '8879',
        clientName: 'Patricia & Kevin Thompson',
        clientId: '013',
        clientType: 'Individual',
        year: 2024,
        sentAt: '2025-11-19T09:00:00',
        recipients: [
          {
            id: 'r0d',
            name: 'Patricia Thompson',
            email: 'patricia@email.com',
            role: 'Primary Taxpayer',
            viewedAt: '2025-11-19T14:15:00',
            signedAt: '2025-11-19T15:00:00',
            ipAddress: '192.168.3.50'
          },
          {
            id: 'r0e',
            name: 'Kevin Thompson',
            email: 'kevin@email.com',
            role: 'Spouse',
            viewedAt: '2025-11-19T15:05:00',
            signedAt: '2025-11-19T15:20:00',
            ipAddress: '192.168.3.51'
          }
        ],
        totalSent: 2,
        totalSigned: 2,
        status: 'completed',
        createdBy: 'Michael Chen',
        source: 'manual',
        sentBy: 'Michael Chen'
      },
      {
        id: '0-recent-3',
        documentName: 'Tax Authorization 2025',
        documentType: 'custom',
        clientName: 'Green Valley Farms LLC',
        clientId: '014',
        clientType: 'Business',
        year: 2025,
        sentAt: '2025-11-16T01:30:00',
        recipients: [
          {
            id: 'r0f',
            name: 'Susan Green',
            email: 'susan@greenvalley.com',
            role: 'Managing Partner',
            viewedAt: '2025-11-16T02:00:00',
            signedAt: '2025-11-16T02:45:00',
            ipAddress: '10.20.30.100'
          }
        ],
        totalSent: 1,
        totalSigned: 1,
        status: 'completed',
        createdBy: 'Emily Davis',
        source: 'manual',
        sentBy: 'Emily Davis'
      },
      {
        id: '0-recent-4',
        documentName: 'Engagement Letter 2025',
        documentType: 'template',
        clientName: 'Michael & Janet Rodriguez',
        clientId: '015',
        clientType: 'Individual',
        year: 2025,
        sentAt: '2025-11-15T11:20:00',
        recipients: [
          {
            id: 'r0g',
            name: 'Michael Rodriguez',
            email: 'michael.r@email.com',
            role: 'Primary',
            viewedAt: '2025-11-15T03:30:00',
            signedAt: '2025-11-15T04:00:00',
            ipAddress: '192.168.5.25'
          }
        ],
        totalSent: 1,
        totalSigned: 1,
        status: 'completed',
        createdBy: 'New Client Onboarding',
        source: 'workflow',
        sentBy: 'New Client Onboarding',
        workflowName: 'New Client Onboarding'
      },
      {
        id: '0-recent-5',
        documentName: 'Privacy Policy 2025',
        documentType: 'custom',
        clientName: 'Riverside Consulting Group',
        clientId: '016',
        clientType: 'Business',
        year: 2025,
        sentAt: '2025-11-14T08:45:00',
        recipients: [
          {
            id: 'r0h',
            name: 'Andrew Rivers',
            email: 'andrew@riverside.com',
            role: 'Director',
            viewedAt: '2025-11-14T09:30:00',
            signedAt: '2025-11-14T10:15:00',
            ipAddress: '172.20.10.50'
          },
          {
            id: 'r0i',
            name: 'Linda Rivers',
            email: 'linda@riverside.com',
            role: 'Co-Director',
            viewedAt: '2025-11-14T10:20:00',
            signedAt: '2025-11-14T10:45:00',
            ipAddress: '172.20.10.51'
          }
        ],
        totalSent: 2,
        totalSigned: 2,
        status: 'completed',
        createdBy: 'Sarah Johnson',
        source: 'manual',
        sentBy: 'Sarah Johnson'
      },
      {
        id: '1',
        documentName: 'Engagement Letter 2024',
        documentType: 'template',
        clientName: 'Troy Business Services LLC',
        clientId: '001',
        clientType: 'Business',
        year: 2024,
        sentAt: '2024-10-26T09:21:00',
        recipients: [
          {
            id: 'r1',
            name: 'Sarah Johnson',
            email: 'sarah@troy.com',
            role: 'Primary Contact',
            signedAt: '2024-10-26T10:30:00',
          }
        ],
        totalSent: 1,
        totalSigned: 1,
        status: 'completed',
        createdBy: 'Sarah Johnson',
        source: 'manual',
        sentBy: 'Sarah Johnson'
      },
      {
        id: '2',
        documentName: 'Form 8879',
        documentType: '8879',
        clientName: 'John & Mary Smith',
        clientId: '002',
        clientType: 'Individual',
        year: 2024,
        sentAt: '2024-10-18T02:38:00',
        recipients: [
          {
            id: 'r2',
            name: 'John Smith',
            email: 'john@email.com',
            role: 'Primary Taxpayer',
            viewedAt: '2024-10-18T09:15:00',
            signedAt: '2024-10-18T10:30:00',
            ipAddress: '192.168.1.100'
          },
          {
            id: 'r3',
            name: 'Mary Smith',
            email: 'mary@email.com',
            role: 'Spouse',
            viewedAt: '2024-10-18T10:45:00',
            signedAt: '2024-10-18T11:00:00',
            ipAddress: '192.168.1.101'
          }
        ],
        totalSent: 2,
        totalSigned: 2,
        status: 'completed',
        createdBy: 'Tax Season Auto-Send',
        source: 'workflow',
        sentBy: 'Tax Season Auto-Send',
        workflowName: 'Tax Filing Auto-Send'
      },
      {
        id: '3',
        documentName: 'Tax Authorization 2024',
        documentType: 'custom',
        clientName: 'Best Face Forward',
        clientId: '003',
        clientType: 'Business',
        year: 2024,
        sentAt: '2025-11-21T11:08:00', // Changed to 1 day ago
        recipients: [
          {
            id: 'r4',
            name: 'Michael Brown',
            email: 'michael@bestface.com',
            role: 'CEO',
            viewedAt: '2025-11-21T12:30:00',
            signedAt: '2025-11-21T02:00:00',
            ipAddress: '10.0.0.50'
          },
          {
            id: 'r5',
            name: 'Lisa Chen',
            email: 'lisa@bestface.com',
            role: 'CFO',
            viewedAt: '2025-11-21T09:00:00',
            ipAddress: '10.0.0.51'
          }
        ],
        totalSent: 2,
        totalSigned: 1,
        status: 'partial',
        createdBy: 'Sarah Johnson',
        source: 'manual',
        sentBy: 'Sarah Johnson'
      },
      {
        id: '4',
        documentName: 'Privacy Policy 2024',
        documentType: 'custom',
        clientName: 'Cleveland Business Services, LLC',
        clientId: '004',
        clientType: 'Business',
        year: 2024,
        sentAt: '2024-10-30T10:00:00',
        recipients: [
          {
            id: 'r6',
            name: 'Mike Brown',
            email: 'mike@cleveland.com',
          }
        ],
        totalSent: 1,
        totalSigned: 0,
        status: 'sent',
        createdBy: 'Mike Brown',
        source: 'manual',
        sentBy: 'Mike Brown'
      },
      {
        id: '4a',
        documentName: 'W-9 Form',
        documentType: 'custom',
        clientName: 'Anderson Consulting Group',
        clientId: '010',
        clientType: 'Business',
        year: 2024,
        sentAt: '2025-11-15T01:45:00', // OVERDUE - 7 days ago
        recipients: [
          {
            id: 'r6a',
            name: 'Thomas Anderson',
            email: 'thomas@anderson.com',
            role: 'Principal',
            viewedAt: '2025-11-15T02:30:00',
            viewedIpAddress: '172.16.0.100'
          },
          {
            id: 'r6b',
            name: 'Emily Anderson',
            email: 'emily@anderson.com',
            role: 'Partner',
            viewedAt: '2025-11-15T03:15:00',
            viewedIpAddress: '172.16.0.101'
          }
        ],
        totalSent: 2,
        totalSigned: 0,
        status: 'viewed',
        createdBy: 'Sarah Johnson',
        source: 'manual',
        sentBy: 'Sarah Johnson'
      },
      {
        id: '5',
        documentName: 'Engagement Letter 2024',
        documentType: 'template',
        clientName: 'Jennifer Lee',
        clientId: '005',
        clientType: 'Individual',
        year: 2024,
        sentAt: '2024-10-25T03:35:00',
        recipients: [
          {
            id: 'r7',
            name: 'Jennifer Lee',
            email: 'jennifer@email.com',
            signedAt: '2024-10-25T09:00:00',
          }
        ],
        totalSent: 1,
        totalSigned: 1,
        status: 'completed',
        createdBy: 'New Client Onboarding',
        source: 'workflow',
        sentBy: 'New Client Onboarding',
        workflowName: 'New Client Onboarding'
      },
      {
        id: '6',
        documentName: 'Form 8879',
        documentType: '8879',
        clientName: 'David & Lisa Park',
        clientId: '006',
        clientType: 'Individual',
        year: 2024,
        sentAt: '2024-10-23T09:00:00',
        recipients: [
          {
            id: 'r8',
            name: 'David Park',
            email: 'david@email.com',
            role: 'Primary Taxpayer',
            viewedAt: '2024-10-23T02:15:00',
            ipAddress: '172.16.0.25'
          },
          {
            id: 'r9',
            name: 'Lisa Park',
            email: 'lisa@email.com',
            role: 'Spouse',
            ipAddress: '172.16.0.26'
          }
        ],
        totalSent: 2,
        totalSigned: 0,
        status: 'sent',
        createdBy: 'Tax Season Auto-Send',
        source: 'workflow',
        sentBy: 'Tax Season Auto-Send',
        workflowName: 'Tax Filing Auto-Send'
      },
      {
        id: '7',
        documentName: 'Tax Organizer Sign-off',
        documentType: 'custom',
        clientName: 'Count on Cooley Bookkeeping',
        clientId: '007',
        clientType: 'Business',
        year: 2024,
        sentAt: '2024-10-22T01:30:00',
        recipients: [
          {
            id: 'r10',
            name: 'Emily Davis',
            email: 'emily@cooley.com',
          }
        ],
        totalSent: 1,
        totalSigned: 0,
        status: 'sent',
        createdBy: 'Emily Davis',
        source: 'manual',
        sentBy: 'Emily Davis'
      },
      {
        id: '8',
        documentName: 'Form 8879',
        documentType: '8879',
        clientName: 'Sarah Williams',
        clientId: '011',
        clientType: 'Individual',
        year: 2024,
        sentAt: '2025-11-16T10:20:00', // OVERDUE - 6 days ago
        recipients: [
          {
            id: 'r11',
            name: 'Sarah Williams',
            email: 'sarah.w@email.com',
            role: 'Primary Taxpayer',
            viewedAt: '2025-11-16T11:45:00',
            ipAddress: '192.168.2.50'
          }
        ],
        totalSent: 1,
        totalSigned: 0,
        status: 'viewed',
        createdBy: 'Sarah Johnson',
        source: 'manual',
        sentBy: 'Sarah Johnson'
      },
      {
        id: '9',
        documentName: 'Engagement Letter 2024',
        documentType: 'template',
        clientName: 'Tech Innovators Inc',
        clientId: '012',
        clientType: 'Business',
        year: 2024,
        sentAt: '2024-10-27T03:30:00',
        recipients: [
          {
            id: 'r12',
            name: 'James Chen',
            email: 'james@techinnovators.com',
            role: 'CEO',
            viewedAt: '2024-10-27T04:15:00',
            signedAt: '2024-10-27T05:00:00',
            ipAddress: '10.5.8.100'
          }
        ],
        totalSent: 1,
        totalSigned: 1,
        status: 'completed',
        createdBy: 'New Client Onboarding',
        source: 'workflow',
        sentBy: 'New Client Onboarding',
        workflowName: 'New Client Onboarding'
      },
      {
        id: '10',
        documentName: 'Tax Authorization 2024',
        documentType: 'custom',
        clientName: 'Green Valley Farms LLC',
        clientId: '013',
        clientType: 'Business',
        year: 2024,
        sentAt: '2024-10-26T08:00:00',
        recipients: [
          {
            id: 'r13',
            name: 'Robert Green',
            email: 'robert@greenvalley.com',
            role: 'Owner',
            viewedAt: '2024-10-26T09:30:00',
            ipAddress: '172.20.1.50'
          }
        ],
        totalSent: 1,
        totalSigned: 0,
        status: 'viewed',
        createdBy: 'Mike Brown',
        source: 'manual',
        sentBy: 'Mike Brown'
      },
      {
        id: '11',
        documentName: 'W-9 Form',
        documentType: 'custom',
        clientName: 'Martinez Construction',
        clientId: '014',
        clientType: 'Business',
        year: 2024,
        sentAt: '2024-10-25T02:15:00',
        recipients: [
          {
            id: 'r14',
            name: 'Carlos Martinez',
            email: 'carlos@martinez-construction.com',
            role: 'Principal'
          }
        ],
        totalSent: 1,
        totalSigned: 0,
        status: 'sent',
        createdBy: 'Sarah Johnson',
        source: 'manual',
        sentBy: 'Sarah Johnson'
      },
      {
        id: '12',
        documentName: 'Privacy Policy 2024',
        documentType: 'custom',
        clientName: 'Summit Consulting Group',
        clientId: '015',
        clientType: 'Business',
        year: 2024,
        sentAt: '2024-10-24T11:30:00',
        recipients: [
          {
            id: 'r15',
            name: 'Rachel Summit',
            email: 'rachel@summitconsulting.com',
            role: 'Managing Partner',
            viewedAt: '2024-10-24T02:00:00',
            signedAt: '2024-10-24T03:45:00',
            ipAddress: '192.168.5.100'
          }
        ],
        totalSent: 1,
        totalSigned: 1,
        status: 'completed',
        createdBy: 'Emily Davis',
        source: 'manual',
        sentBy: 'Emily Davis'
      },
      {
        id: '13',
        documentName: 'Form 8879',
        documentType: '8879',
        clientName: 'Kevin & Amanda Taylor',
        clientId: '016',
        clientType: 'Individual',
        year: 2024,
        sentAt: '2024-10-23T04:20:00',
        recipients: [
          {
            id: 'r16',
            name: 'Kevin Taylor',
            email: 'kevin@email.com',
            role: 'Primary Taxpayer'
          },
          {
            id: 'r17',
            name: 'Amanda Taylor',
            email: 'amanda@email.com',
            role: 'Spouse'
          }
        ],
        totalSent: 2,
        totalSigned: 0,
        status: 'sent',
        createdBy: 'Tax Season Auto-Send',
        source: 'workflow',
        sentBy: 'Tax Season Auto-Send',
        workflowName: 'Tax Filing Auto-Send'
      },
      {
        id: '14',
        documentName: 'Engagement Letter 2024',
        documentType: 'template',
        clientName: 'Pacific Northwest Properties',
        clientId: '017',
        clientType: 'Business',
        year: 2024,
        sentAt: '2025-11-21T09:45:00', // Changed to 1 day ago
        recipients: [
          {
            id: 'r18',
            name: 'Daniel Northwest',
            email: 'daniel@pnwproperties.com',
            role: 'Director',
            viewedAt: '2025-11-21T01:00:00',
            ipAddress: '10.8.5.200'
          },
          {
            id: 'r19',
            name: 'Maria Northwest',
            email: 'maria@pnwproperties.com',
            role: 'Co-Director',
            viewedAt: '2025-11-21T02:15:00',
            signedAt: '2025-11-21T03:30:00',
            ipAddress: '10.8.5.201'
          }
        ],
        totalSent: 2,
        totalSigned: 1,
        status: 'partial',
        createdBy: 'Sarah Johnson',
        source: 'manual',
        sentBy: 'Sarah Johnson'
      },
      {
        id: '15',
        documentName: 'Tax Organizer Sign-off',
        documentType: 'custom',
        clientName: 'Riverside Medical Center',
        clientId: '018',
        clientType: 'Business',
        year: 2024,
        sentAt: '2025-11-17T10:10:00', // OVERDUE - 5 days ago
        recipients: [
          {
            id: 'r20',
            name: 'Dr. Patricia Rivers',
            email: 'patricia@riversidemedical.com',
            role: 'Administrator',
            viewedAt: '2025-11-17T11:30:00',
            ipAddress: '172.25.10.50'
          }
        ],
        totalSent: 1,
        totalSigned: 0,
        status: 'viewed',
        createdBy: 'Mike Brown',
        source: 'manual',
        sentBy: 'Mike Brown'
      },
      {
        id: '16',
        documentName: 'W-9 Form',
        documentType: 'custom',
        clientName: 'Harper & Associates',
        clientId: '019',
        clientType: 'Business',
        year: 2024,
        sentAt: '2024-10-20T03:00:00',
        recipients: [
          {
            id: 'r21',
            name: 'William Harper',
            email: 'william@harperassociates.com',
            role: 'Managing Partner'
          }
        ],
        totalSent: 1,
        totalSigned: 0,
        status: 'sent',
        createdBy: 'Emily Davis',
        source: 'manual',
        sentBy: 'Emily Davis'
      },
      {
        id: '17',
        documentName: 'Form 8879',
        documentType: '8879',
        clientName: 'Christopher Brown',
        clientId: '020',
        clientType: 'Individual',
        year: 2024,
        sentAt: '2024-10-19T01:45:00',
        recipients: [
          {
            id: 'r22',
            name: 'Christopher Brown',
            email: 'chris.brown@email.com',
            role: 'Primary Taxpayer',
            viewedAt: '2024-10-19T03:00:00',
            signedAt: '2024-10-19T04:20:00',
            ipAddress: '192.168.7.25'
          }
        ],
        totalSent: 1,
        totalSigned: 1,
        status: 'completed',
        createdBy: 'Sarah Johnson',
        source: 'manual',
        sentBy: 'Sarah Johnson'
      },
      {
        id: '18',
        documentName: 'Privacy Policy 2024',
        documentType: 'custom',
        clientName: 'Oakwood Financial Services',
        clientId: '021',
        clientType: 'Business',
        year: 2024,
        sentAt: '2024-10-18T08:30:00',
        recipients: [
          {
            id: 'r23',
            name: 'Victoria Oak',
            email: 'victoria@oakwoodfinancial.com',
            role: 'CFO',
            viewedAt: '2024-10-18T10:00:00',
            ipAddress: '10.15.20.100'
          }
        ],
        totalSent: 1,
        totalSigned: 0,
        status: 'viewed',
        createdBy: 'Mike Brown',
        source: 'manual',
        sentBy: 'Mike Brown'
      },
      {
        id: '19',
        documentName: 'Engagement Letter 2024',
        documentType: 'template',
        clientName: 'Metropolitan Retail Group',
        clientId: '022',
        clientType: 'Business',
        year: 2024,
        sentAt: '2024-10-17T02:20:00',
        recipients: [
          {
            id: 'r24',
            name: 'Anthony Metro',
            email: 'anthony@metroretail.com',
            role: 'CEO'
          }
        ],
        totalSent: 1,
        totalSigned: 0,
        status: 'sent',
        createdBy: 'New Client Onboarding',
        source: 'workflow',
        sentBy: 'New Client Onboarding',
        workflowName: 'New Client Onboarding'
      },
      {
        id: '20',
        documentName: 'Tax Authorization 2024',
        documentType: 'custom',
        clientName: 'Horizon Technology Partners',
        clientId: '023',
        clientType: 'Business',
        year: 2024,
        sentAt: '2024-10-16T11:15:00',
        recipients: [
          {
            id: 'r25',
            name: 'Michelle Horizon',
            email: 'michelle@horizontech.com',
            role: 'Partner',
            viewedAt: '2024-10-16T01:45:00',
            signedAt: '2024-10-16T03:00:00',
            ipAddress: '172.30.5.150'
          },
          {
            id: 'r26',
            name: 'Steven Horizon',
            email: 'steven@horizontech.com',
            role: 'Partner',
            viewedAt: '2024-10-16T02:30:00',
            signedAt: '2024-10-16T04:15:00',
            ipAddress: '172.30.5.151'
          }
        ],
        totalSent: 2,
        totalSigned: 2,
        status: 'completed',
        createdBy: 'Emily Davis',
        source: 'manual',
        sentBy: 'Emily Davis'
      },
      {
        id: '21',
        documentName: 'Form 8879',
        documentType: '8879',
        clientName: 'Brandon & Nicole White',
        clientId: '024',
        clientType: 'Individual',
        year: 2024,
        sentAt: '2024-10-15T09:50:00',
        recipients: [
          {
            id: 'r27',
            name: 'Brandon White',
            email: 'brandon@email.com',
            role: 'Primary Taxpayer',
            viewedAt: '2024-10-15T11:20:00',
            ipAddress: '192.168.9.75'
          },
          {
            id: 'r28',
            name: 'Nicole White',
            email: 'nicole@email.com',
            role: 'Spouse'
          }
        ],
        totalSent: 2,
        totalSigned: 0,
        status: 'viewed',
        createdBy: 'Tax Season Auto-Send',
        source: 'workflow',
        sentBy: 'Tax Season Auto-Send',
        workflowName: 'Tax Filing Auto-Send'
      },
      {
        id: '22',
        documentName: 'W-9 Form',
        documentType: 'custom',
        clientName: 'Stellar Design Studio',
        clientId: '025',
        clientType: 'Business',
        year: 2024,
        sentAt: '2024-10-14T04:35:00',
        recipients: [
          {
            id: 'r29',
            name: 'Alexandra Stellar',
            email: 'alex@stellardesign.com',
            role: 'Creative Director'
          }
        ],
        totalSent: 1,
        totalSigned: 0,
        status: 'sent',
        createdBy: 'Sarah Johnson',
        source: 'manual',
        sentBy: 'Sarah Johnson'
      }
    ];

    // Apply server-side filtering
    let filtered = [...mockData];
    
    if (params?.searchQuery) {
      const query = params.searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.documentName.toLowerCase().includes(query) ||
        item.clientName.toLowerCase().includes(query)
      );
    }

    if (params?.statusFilter && params.statusFilter !== 'all') {
      if (params.statusFilter === 'recent') {
        const now = new Date();
        filtered = filtered.filter(item => {
          if (item.status !== 'completed') return false;
          const sentDate = new Date(item.sentAt);
          const daysDiff = (now.getTime() - sentDate.getTime()) / (1000 * 60 * 60 * 24);
          return daysDiff <= 7;
        });
      } else if (params.statusFilter === 'pending') {
        // Pending includes 'sent', 'viewed', and 'partial' statuses
        filtered = filtered.filter(item => item.status === 'sent' || item.status === 'viewed' || item.status === 'partial');
      } else {
        filtered = filtered.filter(item => item.status === params.statusFilter);
      }
    }

    if (params?.clientTypeFilter && params.clientTypeFilter !== 'all') {
      filtered = filtered.filter(item => item.clientType === params.clientTypeFilter);
    }

    if (params?.documentNameFilter && params.documentNameFilter !== 'all') {
      if (params.documentNameFilter === '8879') {
        filtered = filtered.filter(item => item.documentType === '8879');
      } else {
        filtered = filtered.filter(item => item.documentName === params.documentNameFilter);
      }
    }

    // Apply server-side sorting
    if (params?.sorting) {
      const [column, direction] = params.sorting.split(' ');
      filtered.sort((a: any, b: any) => {
        let aValue = a[column];
        let bValue = b[column];

        if (column === 'sentAt') {
          aValue = new Date(a.sentAt).getTime();
          bValue = new Date(b.sentAt).getTime();
        } else if (column === 'status') {
          const statusOrder: any = { completed: 0, partial: 1, viewed: 2, sent: 3, unsigned: 4 };
          aValue = statusOrder[a.status];
          bValue = statusOrder[b.status];
        } else if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) return direction === 'ASC' ? -1 : 1;
        if (aValue > bValue) return direction === 'ASC' ? 1 : -1;
        return 0;
      });
    }

    const totalCount = filtered.length;
    const skipCount = params?.skipCount || 0;
    const maxResultCount = params?.maxResultCount || 25;
    
    const items = filtered.slice(skipCount, skipCount + maxResultCount);

    return {
      items,
      totalCount
    };
  }

  /**
   * Get platform branding settings
   */
  async getPlatformBranding() {
    // TODO: Replace with actual NSwag client call
    // return await this.brandingService.get();

    // Mock implementation - using default Acounta logo
    logMockAction('getPlatformBranding');
    
    return {
      primaryColor: '#7c3aed',
      secondaryColor: '#6d28d9',
      logoUrl: defaultLogo,
      companyName: 'Acounta'
    };
  }

  /**
   * Update platform branding settings
   */
  async updatePlatformBranding(input: {
    primaryColor?: string;
    secondaryColor?: string;
    logoUrl?: string;
    companyName?: string;
  }) {
    // TODO: Replace with actual NSwag client call
    // return await this.brandingService.update(input);

    // Mock implementation
    console.log('Mock updatePlatformBranding:', input);
    return { success: true };
  }

  /**
   * Update user profile
   */
  async updateProfile(input: {
    name?: string;
    surname?: string;
    emailAddress?: string;
    phoneNumber?: string;
  }) {
    // TODO: Replace with actual NSwag client call
    // return await this.accountService.updateProfile(input);

    // Mock implementation
    console.log('Mock updateProfile:', input);
    return { success: true };
  }

  /**
   * Change password
   */
  async changePassword(input: {
    currentPassword: string;
    newPassword: string;
  }) {
    // TODO: Replace with actual NSwag client call
    // return await this.accountService.changePassword(input);

    // Mock implementation
    console.log('Mock changePassword');
    return { success: true };
  }
}

// Export singleton instance
export const apiService = ApiService.getInstance();