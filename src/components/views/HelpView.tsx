import { useState } from 'react';
import { Search, BookOpen, Users, FileText, MessageSquare, CreditCard, Settings, Palette, Moon, FolderOpen, FileSignature, Upload, ChevronRight, ArrowLeft, Home } from 'lucide-react';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { cn } from '../ui/utils';

type HelpArticle = {
  id: string;
  title: string;
  category: string;
  icon: any;
  content: string;
  tags: string[];
};

const helpArticles: HelpArticle[] = [
  {
    id: 'getting-started',
    title: 'Getting Started with Acounta',
    category: 'Getting Started',
    icon: Home,
    tags: ['basics', 'overview', 'introduction'],
    content: `
# Getting Started with Acounta

Welcome to Acounta! This guide will help you understand the basics of the platform and get you up and running quickly.

## Overview

Acounta is a comprehensive client management platform designed for accounting firms and financial professionals. It helps you manage clients, documents, signatures, billing, and communications all in one place.

## Main Features

### 1. Client Management
Manage both individual and business clients with detailed profiles, custom tags, and team assignments.

### 2. Client Folders
Each client has a dedicated folder with multiple tabs including Details, Documents, Invoices, Signatures, Chat, and more.

### 3. Signatures
Create and send signature requests, track status, and manage document signing workflows.

### 4. Incoming Documents
Receive, organize, and process documents from clients with bulk actions and sorting capabilities.

### 5. Billing & Invoices
Create invoices, track payments, and manage billing for all your clients.

### 6. Chat System
Communicate with clients and team members through an integrated messaging system with urgent message monitoring.

### 7. Company Settings
Configure your firm's branding, manage team members, set up roles and permissions.

## Navigation

The interface is divided into three main sections:

- **Left Sidebar**: Main navigation menu to access different sections (Clients, Signatures, Billing, etc.)
- **Middle Column**: List view of clients, documents, or items based on your current section
- **Right Panel**: Detailed view of selected items (Client Folder, Document Preview, etc.)

## Quick Tips

- Use the search bar in the header to quickly find clients
- Click folder icons next to items to open the related client folder
- Use bulk actions in list views to work with multiple items at once
- Toggle between Card View and Table View for different viewing experiences
- Enable Dark Mode from the settings for comfortable night-time work
    `
  },
  {
    id: 'client-management',
    title: 'Managing Clients',
    category: 'Clients',
    icon: Users,
    tags: ['clients', 'create', 'edit', 'tags', 'assignment'],
    content: `
# Managing Clients

Learn how to create, organize, and manage your clients effectively.

## Client Types

Acounta supports two types of clients:

### Individual Clients
- Personal clients (individuals, families)
- Displayed with a green icon and User symbol
- Suitable for personal tax returns, individual consultations

### Business Clients
- Companies, LLCs, corporations
- Displayed with a blue icon and Building symbol
- Suitable for corporate accounting, business tax services

## Creating a New Client

1. Click the "**+ Add Client**" button in the Client Management view
2. Choose client type (Individual or Business)
3. Fill in required information:
   - Name
   - Email
   - Phone
   - Contact person (for businesses)
4. Assign to a team member
5. Add relevant tags
6. Save

## Client Tags & Groups

Tags help you organize and categorize clients:

- **VIP**: High-priority clients
- **Trial**: Clients on trial period
- **Premium**: Premium service clients
- **Tax Services**: Clients using tax services
- **Bookkeeping**: Bookkeeping clients
- **Quarterly Review**: Clients with quarterly reviews
- **New Client**: Recently added clients

### Managing Tags
- Click the "+" button next to tags on any client card
- Select/deselect tags from the dropdown menu
- Tags are immediately applied

## Assigning Clients to Team Members

1. Expand a client card by clicking on it
2. Click on the assigned team member name
3. Select a different team member from the dropdown
4. Assignment is saved automatically

## Searching and Filtering

### Search Bar
Use the search bar to find clients by:
- Name
- Email
- Phone number
- Tags

### Type Filter
Filter by client type:
- All: Show all clients
- Individual: Show only individual clients
- Business: Show only business clients

## View Types

### Card View
- Displays clients as expandable cards
- Shows key information at a glance
- Click to expand for more details
- Best for browsing and quick access

### Table View
- Displays clients in a spreadsheet-like format
- Sortable columns
- Resizable columns (drag column edges)
- Best for data analysis and bulk operations

## Bulk Actions

Select multiple clients using checkboxes to:
- Add tags to multiple clients
- Assign multiple clients to a team member
- Export client data
- Perform batch operations

## Client Card Details

When a client card is expanded, you can see:
- Full contact information
- All assigned tags
- Assigned team member (editable)
- Quick action buttons (folder, edit, more options)
    `
  },
  {
    id: 'client-folders',
    title: 'Understanding Client Folders',
    category: 'Clients',
    icon: FolderOpen,
    tags: ['folder', 'tabs', 'details', 'documents', 'navigation'],
    content: `
# Understanding Client Folders

Client Folders provide a comprehensive view of all information related to a specific client.

## Opening a Client Folder

There are several ways to open a client folder:

1. **From Client List**: Click on a client card in the Clients view
2. **From Signatures**: Click the folder icon next to any signature
3. **From Incoming Documents**: Click the folder icon next to any document
4. **From Billing**: Click the folder icon next to any invoice
5. **From Header Search**: Search for and select a client from the header dropdown

When you open a folder, it appears in the right panel while maintaining your current view on the left.

## Folder Tabs

Each client folder contains multiple tabs:

### Snapshot
- Quick overview of client information
- Recent activity summary
- Key metrics and stats
- Upcoming tasks and deadlines

### Details
- Complete client profile
- Contact information
- Business details (for business clients)
- Custom fields
- Edit client information

### Documents
- All documents related to the client
- Upload new documents
- Download, preview, or delete documents
- Organize into folders

### Files
- File management system
- Folder structure
- Drag-and-drop upload
- File versioning

### Signatures
- Signature requests for this client
- Create new signature requests
- Track signature status
- Download signed documents

### Invoices
- All invoices for the client
- Create new invoices
- Track payment status
- Send payment reminders

### Projects
- Active and completed projects
- Project timelines
- Task assignments
- Project budgets

### Organizers
- Tax organizers
- Information gathering forms
- Client questionnaires
- Annual review documents

### Notes
- Internal notes about the client
- Meeting notes
- Follow-up reminders
- Private team communications

### Communication
- Email history with the client
- SMS messages
- Communication log
- Scheduled communications

### Chat
- Real-time messaging with the client
- Internal team chat about the client
- Message history
- Urgent message flags

### Activity
- Complete activity timeline
- All interactions and changes
- System-generated events
- User actions log

### Demographics
- Detailed demographic information
- Family members (for individuals)
- Company structure (for businesses)
- Statistical data

### Teams
- Team members assigned to this client
- Roles and responsibilities
- Access permissions
- Collaboration settings

## Navigation Tips

- The folder stays open as you navigate between tabs
- Click outside the folder or the X button to close it
- The folder remembers your last viewed tab
- Use keyboard shortcuts for faster navigation (coming soon)

## Multi-Client Comparison

While viewing a client folder, you can:
- Keep the folder open and browse other sections
- Click another client to switch folders quickly
- Use the back button to return to the list view
    `
  },
  {
    id: 'signatures',
    title: 'Managing Signatures',
    category: 'Signatures',
    icon: FileSignature,
    tags: ['signatures', 'e-sign', 'documents', 'workflow'],
    content: `
# Managing Signatures

The Signatures feature allows you to send documents for electronic signature and track their progress.

## Signature Workflow

### 1. Create Signature Request
- Click "**+ New Signature Request**" button
- Select the client
- Upload the document to be signed
- Add signers (client and/or other parties)
- Set signing order (sequential or parallel)
- Add custom message

### 2. Send for Signature
- Review all details
- Click "Send Request"
- Email notifications sent automatically
- Reminder schedule activated

### 3. Track Progress
- Monitor signature status in real-time
- See who has signed and who is pending
- View when each signer opened the document
- Receive notifications on completion

### 4. Download Completed Documents
- Once all parties sign, download the final document
- Original and signed copies stored automatically
- Audit trail included

## Signature Status

### Pending
- Document sent but not yet signed
- Yellow/orange indicator
- Awaiting action from signers

### In Progress
- At least one signer has signed
- Blue indicator
- Partial completion

### Completed
- All required signatures collected
- Green indicator
- Document finalized and archived

### Declined
- Signer declined to sign
- Red indicator
- Requires follow-up action

### Expired
- Signature request exceeded deadline
- Gray indicator
- Needs to be resent

## Features

### Multi-Signer Support
- Add multiple signers to one document
- Set signing order (signer 1 must sign before signer 2)
- Assign different roles (signer, approver, CC)

### Templates
- Save commonly used documents as templates
- Quick-send for recurring signatures
- Pre-filled fields

### Reminders
- Automatic reminders to pending signers
- Customize reminder frequency
- Manual reminder option

### Client Folder Integration
- Click folder icon to view client details
- Access all signatures for a specific client
- Seamless navigation between views

## Best Practices

1. **Clear Subject Lines**: Use descriptive titles for signature requests
2. **Deadline Management**: Set realistic deadlines and monitor expiration
3. **Follow-up**: Send reminders to pending signers after 3-5 days
4. **Organization**: Use tags or folders to categorize signature requests
5. **Verification**: Always verify signer email addresses before sending

## Bulk Actions

Select multiple signature requests to:
- Send reminder emails
- Download multiple completed documents
- Archive old requests
- Export signature logs
    `
  },
  {
    id: 'incoming-documents',
    title: 'Managing Incoming Documents',
    category: 'Documents',
    icon: Upload,
    tags: ['documents', 'upload', 'organize', 'workflow'],
    content: `
# Managing Incoming Documents

The Incoming Documents section helps you receive, organize, and process documents from clients and external sources.

## Receiving Documents

Documents can arrive through several channels:

### 1. Client Portal Upload
- Clients upload documents directly through their portal
- Automatic notification when new documents arrive
- Client information automatically linked

### 2. Email Import
- Forward emails with attachments to your dedicated email address
- Documents automatically extracted and added
- Email metadata preserved

### 3. Manual Upload
- Click "**Upload Documents**" button
- Drag and drop files
- Select client and document type
- Add notes or tags

### 4. Scan Import
- Connect scanner or mobile app
- Scan documents directly into the system
- OCR text extraction (if enabled)

## Document Organization

### Document Types
Categorize documents for easy retrieval:
- **Tax Documents**: W-2s, 1099s, receipts
- **Financial Statements**: Bank statements, credit card statements
- **Legal Documents**: Contracts, agreements
- **Personal Documents**: IDs, SSN cards, certificates
- **Business Documents**: Licenses, registrations
- **Correspondence**: Letters, notices, communications

### Assigning to Clients
- Link documents to specific clients
- Auto-detection based on email or portal upload
- Manual assignment for ambiguous documents
- Multi-client document sharing

### Tags and Labels
- Add custom tags for organization
- Year/period labels (e.g., "2024 Tax Year")
- Status tags (e.g., "Needs Review", "Processed", "Filed")

## Document Actions

### Individual Actions
- **Preview**: View document without downloading
- **Download**: Save to your local machine
- **Open Folder**: View related client folder
- **Move**: Reassign to different client
- **Rename**: Update document name
- **Add Notes**: Attach internal notes
- **Delete**: Remove document (with confirmation)

### Bulk Actions
Select multiple documents to:
- Download as ZIP file
- Assign to client
- Apply tags
- Mark as processed
- Archive or delete

## Sorting and Filtering

### Sort Options
- By Date (newest/oldest first)
- By Client Name (A-Z, Z-A)
- By Document Type
- By Status

### Filter Options
- Filter by client
- Filter by document type
- Filter by date range
- Filter by status (processed/pending)
- Filter by tags

## View Options

### List View
- Compact list showing key information
- Multiple columns (drag to resize)
- Quick actions in each row

### Grid View
- Thumbnail preview of documents
- Visual browsing experience
- Larger preview images

### Table View
- Spreadsheet-like interface
- Sortable columns
- Ideal for processing large batches

## Document Processing Workflow

Recommended workflow for incoming documents:

1. **Review New Documents**
   - Check the incoming documents daily
   - Preview to identify document type

2. **Assign & Categorize**
   - Link to correct client
   - Set document type
   - Add relevant tags

3. **Process**
   - Extract needed information
   - Update client records
   - File in appropriate folder

4. **Mark Complete**
   - Update status to "Processed"
   - Add processing notes
   - Archive if needed

5. **Client Communication**
   - Notify client of document receipt
   - Request additional information if needed
   - Confirm document was processed

## Multi-Select Features

Use checkboxes to select multiple documents:
- Select All (checkbox in header)
- Select individual documents
- Shift+Click for range selection
- Apply bulk actions to selection

## Notifications

Stay informed about incoming documents:
- Desktop notifications for new uploads
- Email digest of daily incoming documents
- Urgent document alerts
- Processing deadline reminders
    `
  },
  {
    id: 'billing-invoices',
    title: 'Billing & Invoices',
    category: 'Billing',
    icon: CreditCard,
    tags: ['billing', 'invoices', 'payments', 'finance'],
    content: `
# Billing & Invoices

Manage your firm's billing, create invoices, and track payments.

## Creating an Invoice

1. Click "**+ New Invoice**" button
2. Select the client
3. Add line items:
   - Service description
   - Quantity
   - Rate
   - Amount (auto-calculated)
4. Set invoice details:
   - Invoice number (auto-generated or manual)
   - Invoice date
   - Due date
   - Payment terms
5. Add notes or payment instructions
6. Preview and send

## Invoice Status

### Draft
- Invoice created but not sent
- Can be edited freely
- Not visible to client

### Sent
- Invoice sent to client
- Awaiting payment
- Client can view in portal

### Partial Payment
- Client paid part of the invoice
- Remaining balance shown
- Payment reminders continue

### Paid
- Full payment received
- Invoice marked as complete
- Receipt generated

### Overdue
- Past due date
- Automatic status change
- Overdue reminders sent

### Cancelled
- Invoice cancelled
- No payment expected
- Archived for records

## Payment Methods

Configure accepted payment methods:
- **Credit/Debit Cards**: Online payment processing
- **ACH/Bank Transfer**: Direct bank transfers
- **Check**: Traditional check payments
- **Wire Transfer**: For large amounts
- **Cash**: In-person payments

## Payment Tracking

- Record payments as they come in
- Partial payment support
- Payment history log
- Payment method tracking
- Receipt generation

## Recurring Invoices

Set up automatic recurring billing:

1. Create a template invoice
2. Set recurrence pattern:
   - Weekly
   - Monthly
   - Quarterly
   - Annually
   - Custom schedule
3. Set start and end dates
4. Enable auto-send
5. Review generated invoices before sending

## Invoice Templates

Create custom invoice templates:
- Firm branding and logo
- Custom color schemes
- Header and footer text
- Payment terms and conditions
- Bank account details

## Late Payment Management

### Reminder Schedule
- 1st reminder: 3 days before due date
- 2nd reminder: On due date
- 3rd reminder: 7 days after due date
- Final notice: 14 days after due date

### Late Fees
- Configure automatic late fee calculation
- Percentage or fixed amount
- Applied after grace period
- Clearly shown on invoice

## Financial Reports

Generate reports for:
- Total revenue (by period)
- Outstanding invoices
- Overdue invoices
- Payment history
- Client payment trends
- Service breakdown

## Client Portal Integration

Clients can:
- View all their invoices
- Download invoices as PDF
- Make online payments
- View payment history
- Set up auto-pay

## Best Practices

1. **Clear Descriptions**: Use detailed service descriptions
2. **Prompt Invoicing**: Send invoices immediately after service
3. **Flexible Payment**: Offer multiple payment methods
4. **Regular Follow-up**: Don't hesitate to send reminders
5. **Professional Templates**: Use well-designed invoice templates
6. **Record Keeping**: Maintain detailed payment records

## Tax Integration

- Export for accounting software
- Tax-ready reports
- 1099 preparation data
- Sales tax calculation (if applicable)
    `
  },
  {
    id: 'chat-system',
    title: 'Using the Chat System',
    category: 'Communication',
    icon: MessageSquare,
    tags: ['chat', 'messaging', 'communication', 'urgent'],
    content: `
# Using the Chat System

The integrated chat system enables real-time communication with clients and team members.

## Chat Types

### Client Chat
- Direct messaging with clients
- Visible to assigned team members
- Client can access through portal
- Full message history

### Internal Team Chat
- Private team discussions about a client
- Not visible to clients
- Perfect for case collaboration
- Secure internal communication

### Group Chat
- Multi-person conversations
- Include team members and/or clients
- Topic-based discussions
- Shared document access

## Starting a Conversation

### From Client Folder
1. Open a client folder
2. Navigate to the "Chat" tab
3. Type your message in the input box
4. Press Enter or click Send

### From Chat View
1. Click "Chat" in the left sidebar
2. Click "**+ New Conversation**"
3. Select recipients (clients/team members)
4. Start typing your message

### From Notifications
- Click on a chat notification
- Automatically opens the conversation
- Unread messages highlighted

## Message Features

### Rich Text
- **Bold**, *italic*, ~~strikethrough~~
- Bullet points and numbered lists
- Links and mentions
- Code snippets

### Attachments
- Attach documents, images, PDFs
- Drag and drop support
- Multiple file upload
- Preview before sending

### Mentions
- @mention team members
- Receive notification when mentioned
- Quick access to mentioned messages

### Reactions
- React to messages with emoji
- Quick acknowledgment
- No need for reply message

## Urgent Messages

Mark important messages as urgent:

### Sending Urgent Messages
1. Type your message
2. Click the "Mark as Urgent" option
3. Message sent with high priority flag
4. Recipients get immediate notification

### Urgent Message Monitoring
- Urgent messages highlighted in red
- Appear at top of chat list
- Special notification sound
- Require acknowledgment

### Response Time
- Track when urgent messages were read
- See if client/team member responded
- Escalation options if no response

## Chat Organization

### Pinned Conversations
- Pin important chats to the top
- Quick access to frequent conversations
- Stays visible regardless of activity

### Archived Chats
- Archive completed conversations
- Keeps inbox clean
- Still searchable and accessible
- Can be unarchived anytime

### Search
- Search across all conversations
- Filter by sender
- Filter by date range
- Search attachments and content

## Notifications

Configure chat notifications:
- Desktop notifications
- Email notifications
- Mobile push notifications (if app installed)
- Customize notification sounds
- Set quiet hours

## Status Indicators

### Online Status
- Green dot: Currently online
- Yellow dot: Away (inactive 15+ min)
- Gray dot: Offline
- Red dot: Do not disturb

### Message Status
- Sent: Message delivered to server
- Delivered: Message reached recipient
- Read: Recipient opened the message
- Typing indicator: Someone is typing

## File Sharing

Share files directly in chat:
- Drag and drop files
- Preview images in chat
- Download shared files
- Files automatically linked to client folder

## Best Practices

1. **Professional Tone**: Maintain professionalism in client chats
2. **Response Time**: Try to respond within 2-4 hours during business hours
3. **Use Urgency Wisely**: Reserve urgent flags for truly time-sensitive matters
4. **Document Sharing**: Share documents directly rather than describing them
5. **Follow-up**: If expecting a response, set a reminder to follow up
6. **Archive Regularly**: Keep your inbox organized by archiving old chats

## Integration with Other Features

- Chat messages appear in client Activity timeline
- Shared documents appear in client Documents
- Create tasks from chat messages
- Schedule meetings from chat
- Log time from chat conversations
    `
  },
  {
    id: 'company-settings',
    title: 'Company Settings',
    category: 'Settings',
    icon: Settings,
    tags: ['settings', 'configuration', 'admin', 'firm'],
    content: `
# Company Settings

Configure your firm's settings, branding, team members, and system preferences.

## Accessing Company Settings

1. Click your profile picture in the top right
2. Select "Settings" from the dropdown
3. Or click the Settings icon in the header

## Settings Tabs

### Firm Information
- Company name
- Business address
- Phone and fax numbers
- Email address
- Website
- Tax ID / EIN
- Business hours

### Platform Branding
- **Primary Color**: Main brand color
- **Secondary Color**: Accent color
- **Logo Upload**: Company logo (appears throughout the system)
- **Favicon**: Browser tab icon
- **Login Page**: Custom login page branding

### Team Management
- **Add Team Members**: Invite new users
- **Edit Profiles**: Update team member information
- **Roles & Permissions**: Assign roles
- **Deactivate Users**: Remove access
- **Team Structure**: Organize by departments

### Roles & Permissions
Configure what each role can do:

#### Admin
- Full system access
- Manage all settings
- Manage team members
- Access all clients
- Billing and invoicing

#### Manager
- Manage assigned clients
- View reports
- Manage team workload
- Limited settings access

#### Team Member
- Access assigned clients
- View and edit client information
- Upload documents
- Chat with clients

#### Read-Only
- View client information
- View documents
- No editing capabilities
- No client communication

### Global Settings
- **Date Format**: MM/DD/YYYY or DD/MM/YYYY
- **Time Zone**: Select your time zone
- **Currency**: Default currency
- **Fiscal Year**: Set fiscal year start
- **Language**: Interface language

### Multi-Factor Authentication
- Enable 2FA for all users
- Require 2FA for admin accounts
- Backup codes
- SMS or authenticator app
- Recovery options

### Integrations
- Accounting software integration
- Email integration
- Calendar sync
- Cloud storage (Google Drive, Dropbox)
- CRM integration

### Notifications
Configure email notifications:
- New client signups
- Document uploads
- Signature completions
- Payment received
- Task deadlines
- System updates

### Security
- Password requirements
- Session timeout
- IP whitelist
- Login attempt limits
- Audit logs
- Data encryption settings

## Platform Branding

### Customizing Your Brand

1. **Upload Logo**
   - Click "Choose File" under Logo Upload
   - Select your logo image (PNG, JPG, SVG)
   - Recommended size: 500x200px
   - Logo appears in header and login page

2. **Set Primary Color**
   - Click the color picker
   - Choose your brand's primary color
   - Updates buttons, highlights, and accents
   - Hex code input available

3. **Set Secondary Color**
   - Choose a complementary color
   - Used for hover states and secondary elements
   - Should contrast well with primary color

4. **Preview Changes**
   - See live preview of your branding
   - Check all pages for consistency
   - Make adjustments as needed

5. **Save Changes**
   - Click "Save Branding Settings"
   - Changes apply immediately
   - All users see updated branding

### Branding Best Practices

- Use high-contrast colors for accessibility
- Keep logo simple and readable at small sizes
- Choose colors that represent your firm
- Test on both light and dark modes
- Consider colorblind-friendly palettes

## Managing Team Members

### Adding a Team Member

1. Go to Company Settings → Team
2. Click "**+ Add Team Member**"
3. Enter information:
   - Full name
   - Email address
   - Role
   - Department (optional)
4. Click "Send Invitation"
5. User receives email with setup link

### Editing Team Member

1. Find the team member in the list
2. Click the Edit icon
3. Update information
4. Save changes

### Deactivating a Team Member

1. Find the team member
2. Click the More menu (•••)
3. Select "Deactivate"
4. Confirm action
5. User loses access immediately
6. Their clients remain in the system

## Backup and Export

- Export client data
- Export financial records
- Scheduled automatic backups
- Restore from backup
- Download data for compliance

## System Updates

- Automatic update notifications
- Scheduled maintenance windows
- Release notes
- Beta feature opt-in
- Update history
    `
  },
  {
    id: 'dark-mode',
    title: 'Dark Mode',
    category: 'Settings',
    icon: Moon,
    tags: ['dark mode', 'theme', 'appearance', 'display'],
    content: `
# Dark Mode

Enable dark mode for a comfortable viewing experience in low-light environments.

## Enabling Dark Mode

### Method 1: Settings Menu
1. Click the Settings icon in the header
2. Navigate to "Appearance" section
3. Toggle "Dark Mode" switch
4. Interface changes immediately

### Method 2: Quick Toggle
1. Click your profile picture
2. Look for the Dark Mode toggle
3. Click to switch between light and dark

### Method 3: System Preference (if enabled)
- Dark mode can follow your system settings
- Automatically switches based on time of day
- Configure in Settings → Appearance

## Dark Mode Features

### Optimized Colors
- Reduced eye strain in low light
- High contrast for readability
- Muted colors for comfort
- Proper color calibration

### Consistent Experience
- All pages support dark mode
- Client folders adapt to theme
- Dialogs and modals themed
- Charts and graphs adjusted

### Image Handling
- Images maintain proper contrast
- Icons adjust to theme
- Logos remain visible
- Avatars properly styled

## Customizing Dark Mode

While dark mode uses default settings, you can customize:

### Brightness
- Adjust overall brightness
- Some monitors benefit from tweaking
- Won't affect other users

### Accent Colors
- Your branding colors work in both modes
- Platform automatically adjusts contrast
- Ensures accessibility standards

## Benefits of Dark Mode

1. **Reduced Eye Strain**: Easier on eyes in dark environments
2. **Better Battery Life**: OLED screens use less power
3. **Focus**: Reduces distractions from bright whites
4. **Professional**: Modern, sleek appearance
5. **Accessibility**: Helps users with light sensitivity

## Troubleshooting

### Dark mode not applying everywhere?
- Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)
- Clear browser cache
- Check if certain components override theme

### Colors not visible?
- Some custom colors may need adjustment
- Report issues to admin
- Use browser zoom if text is hard to read

### Switching back to light mode?
- Simply toggle the dark mode switch off
- Previous light theme restored
- Can switch back and forth anytime

## Best Practices

- Use dark mode in dimly lit environments
- Switch to light mode for printing
- Consider time of day (dark at night, light during day)
- Match theme to your personal comfort
- Don't force team members to use one theme
    `
  },
  {
    id: 'search-filters',
    title: 'Search and Filters',
    category: 'Features',
    icon: Search,
    tags: ['search', 'filter', 'find', 'organize'],
    content: `
# Search and Filters

Quickly find clients, documents, and information using powerful search and filtering tools.

## Global Search

### Header Search Bar
Located in the top header, use it to search across the entire platform:

**What you can search:**
- Client names
- Email addresses
- Phone numbers
- Document names
- Invoice numbers
- Tags

**How to use:**
1. Click the search bar or press **Ctrl+K** (Windows) or **Cmd+K** (Mac)
2. Type your search query
3. Results appear instantly as you type
4. Click a result to navigate to it

### Search Tips
- Use quotes for exact phrases: "John Smith"
- Search by partial information (e.g., "john" finds "Johnson")
- Search is case-insensitive
- Recent searches are saved for quick access

## Client Search

### In Client Management View
The client list has its own search:

1. **Search Bar**: Located above the client list
2. **Type Filter**: Filter by Individual or Business
3. **Tag Filter**: Filter by tags (VIP, Premium, etc.)
4. **Assigned To**: Filter by team member

### Advanced Client Filters

Click "**Filters**" button to access:
- Created date range
- Last activity date
- Status (active, inactive, archived)
- Custom fields
- Multiple tags (AND/OR logic)

## Document Search

### In Incoming Documents View
Search and filter documents:

**Search Options:**
- Document name
- Client name
- Document type
- Upload date
- File type (PDF, DOC, etc.)

**Filters:**
- Date range picker
- Status (pending, processed)
- Document type dropdown
- Client dropdown

### Bulk Operations with Filters
1. Apply filters to narrow results
2. Select "Select All" (only filtered items selected)
3. Apply bulk actions to filtered selection

## Signature Search

### In Signatures View
Find signature requests:

**Search by:**
- Document title
- Client name
- Signer name
- Status

**Filter by:**
- Status (pending, completed, declined)
- Date range
- Signer
- Deadline proximity

## Invoice Search

### In Billing View
Locate invoices quickly:

**Search fields:**
- Invoice number
- Client name
- Amount
- Description

**Filter options:**
- Status (draft, sent, paid, overdue)
- Date range
- Amount range
- Payment method

## Saved Filters

Create and save frequently used filter combinations:

1. Apply your desired filters
2. Click "**Save Filter**" button
3. Name your saved filter
4. Access later from "Saved Filters" dropdown

**Common saved filters:**
- "Overdue Invoices"
- "Pending Signatures This Week"
- "VIP Clients"
- "New Documents Today"

## Sorting

All list views support sorting:

### Sort Options
- **Name**: A-Z or Z-A
- **Date**: Newest or Oldest first
- **Type**: Group by type
- **Status**: Group by status
- **Amount**: High to Low or Low to High

### How to Sort
1. Click column header to sort by that column
2. Click again to reverse sort order
3. Icon indicates current sort direction
4. Some columns support multi-level sorting

## View Preferences

Customize how results are displayed:

### Density
- **Comfortable**: More spacing, larger text
- **Compact**: More items visible, less spacing
- **Dense**: Maximum items per page

### Columns (Table View)
- Show/hide columns
- Reorder columns by dragging
- Resize columns by dragging edge
- Save column preferences

## Keyboard Shortcuts

Speed up searching and filtering:

- **Ctrl/Cmd + K**: Open global search
- **Ctrl/Cmd + F**: Focus local search
- **Arrow Keys**: Navigate search results
- **Enter**: Open selected result
- **Esc**: Close search/clear filters
- **/**: Quick search (focus search bar)

## Search Performance Tips

1. **Be Specific**: More specific queries return better results
2. **Use Filters**: Narrow down before searching
3. **Recent Items**: Check recent items first
4. **Tags**: Tag items well for easier future searching
5. **Consistent Naming**: Use consistent naming conventions

## Advanced Search (Coming Soon)

Features in development:
- Boolean search operators (AND, OR, NOT)
- Wildcard search (*)
- Regular expression support
- Search within documents (full-text search)
- Search history and analytics
- Search suggestions based on behavior
    `
  },
  {
    id: 'keyboard-shortcuts',
    title: 'Keyboard Shortcuts',
    category: 'Features',
    icon: Settings,
    tags: ['shortcuts', 'keyboard', 'productivity', 'navigation'],
    content: `
# Keyboard Shortcuts

Boost your productivity with keyboard shortcuts for common actions.

## Global Shortcuts

### Navigation
- **Ctrl/Cmd + K**: Open quick search
- **Ctrl/Cmd + /** : Focus search bar
- **Alt + 1**: Go to Dashboard
- **Alt + 2**: Go to Clients
- **Alt + 3**: Go to Signatures
- **Alt + 4**: Go to Incoming Documents
- **Alt + 5**: Go to Billing
- **Alt + 6**: Go to Chat
- **Alt + 7**: Go to Settings

### Actions
- **Ctrl/Cmd + N**: Create new (context-aware)
- **Ctrl/Cmd + S**: Save current form
- **Ctrl/Cmd + P**: Print current view
- **Ctrl/Cmd + F**: Find in page
- **Esc**: Close dialog/modal
- **Ctrl/Cmd + ,**: Open settings

### Selection
- **Ctrl/Cmd + A**: Select all
- **Shift + Click**: Select range
- **Ctrl/Cmd + Click**: Toggle individual selection
- **Space**: Toggle selection on focused item

## Client Management

### In Client List
- **Arrow Up/Down**: Navigate between clients
- **Enter**: Open selected client folder
- **Ctrl/Cmd + E**: Edit selected client
- **Delete**: Delete selected client (with confirmation)
- **T**: Toggle between Card and Table view
- **F**: Toggle filters

### In Client Folder
- **Tab**: Next tab
- **Shift + Tab**: Previous tab
- **Ctrl/Cmd + E**: Edit client details
- **Ctrl/Cmd + W**: Close folder
- **1-9**: Jump to specific tab (1=Snapshot, 2=Details, etc.)

## Document Management

- **Ctrl/Cmd + U**: Upload documents
- **Ctrl/Cmd + D**: Download selected
- **Ctrl/Cmd + A**: Select all documents
- **Space**: Preview selected document
- **Delete**: Delete selected documents

## Signatures

- **Ctrl/Cmd + N**: New signature request
- **R**: Send reminder to selected signature
- **S**: Filter by status
- **D**: Download signed document

## Billing

- **Ctrl/Cmd + N**: Create new invoice
- **Ctrl/Cmd + E**: Edit selected invoice
- **P**: Mark as paid
- **Ctrl/Cmd + M**: Send reminder

## Chat

- **Ctrl/Cmd + Enter**: Send message
- **Ctrl/Cmd + N**: New conversation
- **Ctrl/Cmd + U**: Upload attachment
- **Arrow Up/Down**: Navigate conversations
- **!**: Mark message as urgent
- **@**: Mention team member

## Forms and Inputs

- **Tab**: Next field
- **Shift + Tab**: Previous field
- **Enter**: Submit form (when button focused)
- **Esc**: Cancel/close
- **Ctrl/Cmd + Z**: Undo
- **Ctrl/Cmd + Y**: Redo

## Text Editing

- **Ctrl/Cmd + B**: Bold
- **Ctrl/Cmd + I**: Italic
- **Ctrl/Cmd + U**: Underline
- **Ctrl/Cmd + K**: Insert link
- **Ctrl/Cmd + X**: Cut
- **Ctrl/Cmd + C**: Copy
- **Ctrl/Cmd + V**: Paste

## Accessibility Shortcuts

- **Alt + Shift + K**: Show keyboard shortcuts help
- **Alt + Shift + H**: Go to help
- **Alt + Shift + /**: Go to accessibility settings
- **Tab**: Navigate interactive elements
- **Shift + Tab**: Navigate backwards

## Customizing Shortcuts

You can customize keyboard shortcuts in Settings:

1. Go to Settings → Keyboard Shortcuts
2. Find the action you want to customize
3. Click on the current shortcut
4. Press your desired key combination
5. Save changes

**Note:** Some shortcuts cannot be customized as they conflict with browser shortcuts.

## Tips for Learning Shortcuts

1. **Start Small**: Learn 3-5 shortcuts you'll use daily
2. **Cheat Sheet**: Print the shortcuts list and keep it nearby
3. **Practice**: Use shortcuts consciously for a week
4. **Hover Tooltips**: Most buttons show their shortcut on hover
5. **Help Modal**: Press **?** anywhere to see contextual shortcuts

## Platform-Specific Notes

### Windows/Linux
- Use **Ctrl** for command shortcuts
- Use **Alt** for navigation shortcuts

### Mac
- Use **Cmd (⌘)** for command shortcuts
- Use **Option (⌥)** for navigation shortcuts
- Some shortcuts may differ from Windows

### Browser Conflicts
Some shortcuts may conflict with browser shortcuts:
- **Ctrl/Cmd + T**: Browser new tab (can't override)
- **Ctrl/Cmd + W**: Browser close tab
- **Ctrl/Cmd + R**: Browser refresh
- Use Alt variants for these actions in the app
    `
  },
  {
    id: 'mobile-access',
    title: 'Mobile Access',
    category: 'Features',
    icon: Users,
    tags: ['mobile', 'responsive', 'app', 'phone', 'tablet'],
    content: `
# Mobile Access

Access Acounta on your mobile devices with our responsive design and mobile app.

## Mobile Web Interface

### Accessing via Browser
Open your mobile browser and navigate to your Acounta URL:
- Fully responsive design
- Optimized for touch
- All features available
- Works on all modern browsers

### Mobile Layout
The interface adapts for smaller screens:

**Mobile Navigation**
- Hamburger menu for main navigation
- Swipeable tabs
- Bottom navigation bar (optional)
- Gesture support

**Touch Optimizations**
- Larger tap targets
- Swipe gestures
- Pull to refresh
- Touch-friendly buttons

### Mobile Features

#### Optimized Views
- Single-column layout
- Collapsible sections
- Simplified client cards
- Touch-optimized buttons

#### Quick Actions
- Swipe to access common actions
- Long-press for context menu
- Quick reply in chat
- One-tap calling

## Mobile App (Coming Soon)

### iOS App
- Available on App Store
- Native iOS experience
- Offline access
- Push notifications
- Biometric login (Face ID / Touch ID)

### Android App
- Available on Google Play
- Native Android experience
- Offline access
- Push notifications
- Fingerprint login

### App Features
- Camera document scanning
- Voice messages
- Location services (for mileage tracking)
- Calendar integration
- Contact book integration

## Mobile Capabilities

### Document Scanning
Scan documents using your phone camera:
1. Tap "Upload" → "Scan Document"
2. Point camera at document
3. Auto-edge detection
4. Apply filters (enhance, grayscale)
5. Upload directly to client folder

### Photo Upload
- Take photo or choose from gallery
- Multiple photo upload
- Compress before upload
- Auto-rotate images

### Signature Capture
- Sign documents with finger
- Stylus support
- Multiple signature styles
- Save signature for reuse

### Voice Notes
- Record voice notes for clients
- Attach to client profiles
- Transcription (if enabled)
- Playback controls

## Offline Mode

### What Works Offline
- View recently accessed clients
- Read messages
- Draft new messages
- View cached documents

### What Requires Connection
- Syncing new data
- Sending messages
- Uploading documents
- Making payments

### Sync Behavior
- Auto-sync when connection restored
- Manual sync trigger
- Sync status indicator
- Conflict resolution for edits

## Mobile Best Practices

### For Optimal Experience

1. **Use WiFi for Large Uploads**
   - Documents over 5MB
   - Multiple file uploads
   - Video uploads

2. **Enable Push Notifications**
   - Stay updated on urgent messages
   - Payment confirmations
   - Document signatures

3. **Save Frequently Used Clients**
   - Mark as favorites for quick access
   - Available in offline mode
   - Quick swipe access

4. **Regular Syncing**
   - Open app daily to sync
   - Enable auto-sync in settings
   - Check sync status before important tasks

## Mobile Security

### Security Features
- Automatic logout after inactivity
- Biometric authentication
- Encrypted data storage
- Remote wipe capability

### Security Best Practices
- Use biometric login
- Set shorter auto-lock timeout
- Don't save passwords in browser
- Enable 2FA
- Keep app updated

## Troubleshooting Mobile Issues

### App Won't Load
1. Check internet connection
2. Force close and reopen
3. Clear app cache
4. Update to latest version
5. Reinstall app if needed

### Sync Issues
1. Check internet speed
2. Force manual sync
3. Check storage space
4. Log out and log back in

### Touch/Display Issues
1. Restart device
2. Check for OS updates
3. Clear browser cache (web)
4. Adjust display settings

## Mobile vs Desktop

### Features Only on Desktop
- Multi-column layout
- Drag-and-drop file organization
- Resizable columns
- Some advanced reports
- Keyboard shortcuts

### Features Better on Mobile
- Document scanning
- Photo uploads
- Voice messages
- Location-based features
- Push notifications

### When to Use Each

**Use Mobile For:**
- Quick client lookups
- Responding to urgent messages
- Document scanning on-site
- Approving pending items
- Time-sensitive notifications

**Use Desktop For:**
- Detailed data entry
- Bulk operations
- Complex reporting
- Extended work sessions
- Multi-tasking across clients
    `
  }
];

export function HelpView() {
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Get unique categories
  const categories = ['All', ...Array.from(new Set(helpArticles.map(a => a.category)))];

  // Filter articles
  const filteredArticles = helpArticles.filter(article => {
    const matchesSearch = searchQuery === '' || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Group articles by category
  const articlesByCategory = filteredArticles.reduce((acc, article) => {
    if (!acc[article.category]) {
      acc[article.category] = [];
    }
    acc[article.category].push(article);
    return acc;
  }, {} as Record<string, HelpArticle[]>);

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {selectedArticle ? (
              <button
                onClick={() => setSelectedArticle(null)}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Help Center</span>
              </button>
            ) : (
              <>
                <BookOpen className="w-8 h-8" style={{ color: 'var(--primaryColor)' }} />
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Help Center</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Find answers and learn how to use Acounta</p>
                </div>
              </>
            )}
          </div>
          <Badge variant="outline">{filteredArticles.length} {filteredArticles.length === 1 ? 'article' : 'articles'}</Badge>
        </div>

        {/* Search */}
        {!selectedArticle && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {selectedArticle ? (
          // Article View
          <div className="max-w-4xl mx-auto p-6 md:p-8">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-8">
              <div className="flex items-start gap-4 mb-6">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ 
                    background: 'var(--selectedBgColorSideMenu, linear-gradient(to bottom right, #7c3aed, #6d28d9))'
                  }}
                >
                  <selectedArticle.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <Badge variant="secondary" className="mb-2">{selectedArticle.category}</Badge>
                  <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {selectedArticle.title}
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {selectedArticle.tags.map((tag, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              <div 
                className="prose prose-gray dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: selectedArticle.content
                    .split('\n')
                    .map(line => {
                      // Headers
                      if (line.startsWith('# ')) return `<h1>${line.slice(2)}</h1>`;
                      if (line.startsWith('## ')) return `<h2>${line.slice(3)}</h2>`;
                      if (line.startsWith('### ')) return `<h3>${line.slice(4)}</h3>`;
                      if (line.startsWith('#### ')) return `<h4>${line.slice(5)}</h4>`;
                      
                      // Bold
                      line = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
                      
                      // Bullets
                      if (line.startsWith('- ')) return `<li>${line.slice(2)}</li>`;
                      
                      // Paragraphs
                      if (line.trim() === '') return '<br>';
                      if (!line.startsWith('<')) return `<p>${line}</p>`;
                      
                      return line;
                    })
                    .join('\n')
                }}
              />
            </div>

            {/* Related Articles */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Related Articles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {helpArticles
                  .filter(a => a.id !== selectedArticle.id && a.category === selectedArticle.category)
                  .slice(0, 4)
                  .map(article => (
                    <button
                      key={article.id}
                      onClick={() => setSelectedArticle(article)}
                      className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 text-left hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <article.icon className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--primaryColor)' }} />
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">{article.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                            {article.content.slice(0, 100)}...
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          </div>
        ) : (
          // Article List
          <div className="max-w-6xl mx-auto p-6">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 mb-6">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={cn(
                    "px-4 py-2 rounded-lg font-medium transition-all",
                    selectedCategory === category
                      ? "text-white shadow-lg"
                      : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
                  )}
                  style={
                    selectedCategory === category
                      ? { background: 'var(--selectedBgColorSideMenu, linear-gradient(to bottom right, #7c3aed, #6d28d9))' }
                      : undefined
                  }
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Articles Grid */}
            {filteredArticles.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No articles found</h3>
                <p className="text-gray-600 dark:text-gray-400">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(articlesByCategory).map(([category, articles]) => (
                  <div key={category}>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">{category}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {articles.map(article => (
                        <button
                          key={article.id}
                          onClick={() => setSelectedArticle(article)}
                          className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 text-left hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-lg transition-all group"
                        >
                          <div className="flex items-start gap-4 mb-3">
                            <div 
                              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ 
                                background: 'var(--selectedBgColorSideMenu, linear-gradient(to bottom right, #7c3aed, #6d28d9))'
                              }}
                            >
                              <article.icon className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                                {article.title}
                              </h3>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 group-hover:text-purple-600 dark:group-hover:text-purple-400" />
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-3">
                            {article.content.slice(0, 150)}...
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {article.tags.slice(0, 3).map((tag, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
