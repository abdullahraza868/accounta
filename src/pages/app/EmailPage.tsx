import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import {
  Mail,
  Send,
  Inbox,
  FileText,
  Clock,
  Shield,
  Star,
  Archive,
  Trash2,
  Search,
  Filter,
  Settings,
  Paperclip,
  Calendar as CalendarIcon,
  CheckSquare,
  Folder,
  MoreVertical,
  Reply,
  ReplyAll,
  Forward,
  Download,
  Flag,
  Sparkles,
  X,
  Check,
  AlertCircle,
  Users,
  Building2,
  Tag,
  BarChart3,
  User,
  FileDown,
  Eye,
  MousePointerClick,
  ExternalLink,
  ChevronLeft,
  Activity,
  ChevronRight,
  Video,
  MessageCircle,
  Upload,
  LogIn,
  LogOut,
  MailOpen,
  ListTodo,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Card } from "../../components/ui/card";
import { Separator } from "../../components/ui/separator";
import { cn } from "../../components/ui/utils";
import { format, formatDistanceToNow } from "date-fns";
import { EmailSettingsDialog } from "../../components/EmailSettingsDialog";
import { AssignToProjectDialog } from "../../components/AssignToProjectDialog";
import { CreateTaskFromEmailDialog } from "../../components/CreateTaskFromEmailDialog";
import { AIEmailSummaryDialog } from "../../components/AIEmailSummaryDialog";
import { AIGenerateEmailDialog } from "../../components/AIGenerateEmailDialog";
import { InlineComposeEmail } from "../../components/InlineComposeEmail";
import { SaveDraftConfirmationDialog } from "../../components/SaveDraftConfirmationDialog";
import { AddEmailToCalendarDialog } from "../../components/AddEmailToCalendarDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "../../components/ui/context-menu";
import { ScrollArea } from "../../components/ui/scroll-area";
import {
  Avatar,
  AvatarFallback,
} from "../../components/ui/avatar";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "../../components/ui/tooltip";
import { toast } from "sonner@2.0.3";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../components/ui/collapsible";

type EmailFolder =
  | "inbox"
  | "unread"
  | "sent"
  | "drafts"
  | "scheduled"
  | "secure"
  | "starred"
  | "flagged"
  | "trash"
  | "firm";

type Email = {
  id: string;
  from: {
    name: string;
    email: string;
    avatar?: string;
    clientType?: "Individual" | "Business"; // Add client type for icon display
  };
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  date: string;
  read: boolean;
  starred: boolean;
  flagged: boolean;
  hasAttachments: boolean;
  attachments?: Array<{
    id: string;
    name: string;
    size: number;
    type: string;
  }>;
  isSecure: boolean;
  isFirmEmail?: boolean;
  thread?: Email[];
  projectIds?: string[];
  clientId?: string;
  clientName?: string;
  scheduledFor?: string;
  status?:
    | "sent"
    | "delivered"
    | "opened"
    | "failed"
    | "scheduled"
    | "draft";
  openedAt?: string;
  deliveredAt?: string;
  sentAt?: string;
  clickedLinks?: Array<{
    url: string;
    clickedAt: string;
  }>;
};

export function EmailPage() {
  const navigate = useNavigate();
  const emailRefs = useRef<{
    [key: string]: HTMLButtonElement | null;
  }>({});
  const [selectedFolder, setSelectedFolder] =
    useState<EmailFolder>("inbox");
  const [selectedEmail, setSelectedEmail] =
    useState<Email | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [clientTypeFilter, setClientTypeFilter] = useState<
    "all" | "Individual" | "Business"
  >("all");
  const [showSettings, setShowSettings] = useState(false);
  const [showAssignProject, setShowAssignProject] =
    useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showAISummary, setShowAISummary] = useState(false);
  const [showAIGenerate, setShowAIGenerate] = useState(false);
  const [showAddToCalendar, setShowAddToCalendar] =
    useState(false);
  const [composeMode, setComposeMode] = useState<
    "new" | "reply" | "replyAll" | "forward"
  >("new");
  const [replyToEmail, setReplyToEmail] =
    useState<Email | null>(null);
  const [composeTo, setComposeTo] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [composeSecure, setComposeSecure] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [selectedActivityType, setSelectedActivityType] =
    useState<string | null>(null);
  const [
    showSaveDraftConfirmation,
    setShowSaveDraftConfirmation,
  ] = useState(false);
  const [pendingEmailSelection, setPendingEmailSelection] =
    useState<Email | null>(null);
  const [composeData, setComposeData] = useState<{
    to: any[];
    subject: string;
    body: string;
    attachments: any[];
  }>({ to: [], subject: "", body: "", attachments: [] });
  const [selectedActivityLog, setSelectedActivityLog] =
    useState<any | null>(null);
  const [expandedActivities, setExpandedActivities] = useState<
    string[]
  >([]);
  const [activitySearchQuery, setActivitySearchQuery] =
    useState("");
  const [
    selectedActivityClientType,
    setSelectedActivityClientType,
  ] = useState<"all" | "Individual" | "Business">("all");
  const [
    selectedActivityDateRange,
    setSelectedActivityDateRange,
  ] = useState<"all" | "today" | "7days" | "30days">("all");
  const [selectedActivityStatus, setSelectedActivityStatus] =
    useState<
      | "all"
      | "sent"
      | "delivered"
      | "opened"
      | "failed"
      | "success"
    >("all");
  const [
    selectedActivityEmailType,
    setSelectedActivityEmailType,
  ] = useState<"all" | "firm" | "personal">("all");

  // Mock email data
  const [emails, setEmails] = useState<Email[]>([
    {
      id: "1",
      from: {
        name: "Gokhan Troy",
        email: "gokhan@troy.com",
        avatar: "GT",
        clientType: "Business",
      },
      to: ["sarah@firm.com"],
      subject: "Q4 Tax Documents Ready for Review",
      body: `Hi Sarah,

I hope this email finds you well. I wanted to let you know that I've uploaded all the Q4 tax documents to the portal as requested.

The documents include:
- Income statements
- Expense reports
- Quarterly revenue breakdown

Please let me know if you need anything else or if you have any questions.

Best regards,
Gokhan`,
      date: new Date().toISOString(),
      read: false,
      starred: false,
      flagged: true,
      hasAttachments: true,
      attachments: [
        {
          id: "1",
          name: "Q4-Income-Statement.pdf",
          size: 245000,
          type: "application/pdf",
        },
        {
          id: "2",
          name: "Q4-Expenses.xlsx",
          size: 89000,
          type: "application/vnd.ms-excel",
        },
      ],
      isSecure: false,
      clientId: "1",
      clientName: "Troy Business Services LLC",
      status: "delivered",
      deliveredAt: new Date().toISOString(),
    },
    {
      id: "2",
      from: {
        name: "Sarah Johnson",
        email: "sarah@firm.com",
        avatar: "SJ",
        clientType: "Individual",
      },
      to: ["jamal@bestface.com"],
      subject: "Year-End Financial Review Meeting Confirmation",
      body: `Hi Jamal,

This is to confirm our year-end financial review meeting scheduled for next week.

Meeting Details:
- Date: December 20, 2025
- Time: 2:00 PM EST
- Duration: 1.5 hours
- Location: Virtual (Google Meet link will be sent)

Please review the attached agenda before our meeting.

Looking forward to our discussion!

Best,
Sarah`,
      date: new Date(
        Date.now() - 2 * 60 * 60 * 1000,
      ).toISOString(),
      read: true,
      starred: true,
      flagged: false,
      hasAttachments: true,
      attachments: [
        {
          id: "3",
          name: "Meeting-Agenda.pdf",
          size: 125000,
          type: "application/pdf",
        },
      ],
      isSecure: false,
      clientId: "3",
      clientName: "Best Face Forward",
      status: "opened",
      sentAt: new Date(
        Date.now() - 2 * 60 * 60 * 1000,
      ).toISOString(),
      deliveredAt: new Date(
        Date.now() - 2 * 60 * 60 * 1000 + 2 * 1000,
      ).toISOString(),
      openedAt: new Date(
        Date.now() - 1 * 60 * 60 * 1000,
      ).toISOString(),
      clickedLinks: [
        {
          url: "https://meet.google.com/abc-defg-hij",
          clickedAt: new Date(
            Date.now() - 45 * 60 * 1000,
          ).toISOString(),
        },
      ],
    },
    {
      id: "3",
      from: {
        name: "Mike Chen",
        email: "mike@firm.com",
        avatar: "MC",
        clientType: "Individual",
      },
      to: ["john@smithfamily.com"],
      subject: "2024 Tax Return - Sensitive Information",
      body: `Dear John and Mary,

I'm pleased to inform you that your 2024 tax return has been completed. Due to the sensitive nature of this information, I've sent this as a secure email.

The attached PDF includes:
- Complete 2024 Federal Tax Return
- State Tax Return
- Supporting documentation
- Summary of deductions and credits

You'll need to verify your identity to download the attachments. Please review everything and let me know if you have any questions.

Best regards,
Mike Chen, CPA`,
      date: new Date(
        Date.now() - 24 * 60 * 60 * 1000,
      ).toISOString(),
      read: true,
      starred: false,
      flagged: false,
      hasAttachments: true,
      attachments: [
        {
          id: "4",
          name: "2024-Tax-Return.pdf",
          size: 1200000,
          type: "application/pdf",
        },
      ],
      isSecure: true,
      clientId: "11",
      clientName: "John & Mary Smith",
      status: "delivered",
      deliveredAt: new Date(
        Date.now() - 24 * 60 * 60 * 1000,
      ).toISOString(),
    },
    {
      id: "4",
      from: {
        name: "Sarah Johnson",
        email: "sarah@firm.com",
        avatar: "SJ",
        clientType: "Individual",
      },
      to: ["clients@firm.com"],
      subject: "DRAFT: Tax Season 2025 Preparation Guide",
      body: `Dear Valued Clients,

As we approach the 2025 tax season, we wanted to share this comprehensive preparation guide to help you get organized.

[Draft content continues...]`,
      date: new Date(
        Date.now() - 3 * 60 * 60 * 1000,
      ).toISOString(),
      read: true,
      starred: false,
      flagged: false,
      hasAttachments: false,
      isSecure: false,
      status: "draft",
    },
    {
      id: "5",
      from: {
        name: "Sarah Johnson",
        email: "sarah@firm.com",
        avatar: "SJ",
        clientType: "Individual",
      },
      to: ["newsletter@clients.com"],
      subject: "Monthly Tax Newsletter - January 2025",
      body: `Scheduled to send on January 1, 2025 at 9:00 AM`,
      date: new Date(
        Date.now() - 1 * 60 * 60 * 1000,
      ).toISOString(),
      read: true,
      starred: false,
      flagged: false,
      hasAttachments: false,
      isSecure: false,
      status: "scheduled",
      scheduledFor: new Date(
        Date.now() + 14 * 24 * 60 * 60 * 1000,
      ).toISOString(),
    },
    {
      id: "6",
      from: {
        name: "Jennifer Wilson",
        email: "jen@wilsontech.com",
        avatar: "JW",
        clientType: "Business",
      },
      to: ["sarah@firm.com"],
      subject: "Quarterly Estimated Tax Payment Reminder",
      body: `Hi Sarah,

Just a quick reminder that my Q4 estimated tax payment is due next month. Could you please send me the updated payment voucher?

Also, I wanted to discuss some potential deductions for my home office expenses.

Thanks!
Jennifer`,
      date: new Date(
        Date.now() - 3 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      read: false,
      starred: false,
      flagged: false,
      hasAttachments: false,
      isSecure: false,
      clientId: "5",
      clientName: "Wilson Tech Solutions",
      status: "delivered",
      deliveredAt: new Date(
        Date.now() - 3 * 24 * 60 * 60 * 1000,
      ).toISOString(),
    },
    {
      id: "7",
      from: {
        name: "Robert Martinez",
        email: "robert@martinez.com",
        avatar: "RM",
        clientType: "Business",
      },
      to: ["sarah@firm.com"],
      subject: "Business Sale Documentation - Confidential",
      body: `Sarah,

As we discussed, I'm attaching the confidential documentation related to the potential sale of my business.

This includes:
- Financial statements (3 years)
- Valuation report
- Due diligence documents
- Tax planning scenarios

Please review and let's schedule a call to discuss the tax implications.

Confidential - Please do not forward.

Robert`,
      date: new Date(
        Date.now() - 5 * 60 * 60 * 1000,
      ).toISOString(),
      read: false,
      starred: true,
      flagged: true,
      hasAttachments: true,
      attachments: [
        {
          id: "5",
          name: "Financial-Statements-2022-2024.pdf",
          size: 3400000,
          type: "application/pdf",
        },
        {
          id: "6",
          name: "Business-Valuation.pdf",
          size: 890000,
          type: "application/pdf",
        },
        {
          id: "7",
          name: "Tax-Planning-Scenarios.xlsx",
          size: 156000,
          type: "application/vnd.ms-excel",
        },
      ],
      isSecure: true,
      clientId: "8",
      clientName: "Martinez Enterprises",
      status: "delivered",
      deliveredAt: new Date(
        Date.now() - 5 * 60 * 60 * 1000,
      ).toISOString(),
    },
    {
      id: "8",
      from: {
        name: "Lisa Chen",
        email: "lisa@greenvalley.org",
        avatar: "LC",
        clientType: "Business",
      },
      to: ["sarah@firm.com"],
      subject: "Non-Profit 990 Filing Questions",
      body: `Hi Sarah,

I have a few questions about our Form 990 filing for the Green Valley Community Center.

Specifically:
1. How do we report the donated services?
2. What's the threshold for Schedule B filing?
3. Do we need to file state charitable registrations?

Our board meeting is next week and I'd love to have answers.

Thanks so much!
Lisa`,
      date: new Date(
        Date.now() - 7 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      read: true,
      starred: false,
      flagged: false,
      hasAttachments: false,
      isSecure: false,
      clientId: "12",
      clientName: "Green Valley Community Center",
      status: "delivered",
      deliveredAt: new Date(
        Date.now() - 7 * 24 * 60 * 60 * 1000,
      ).toISOString(),
    },
    {
      id: "9",
      from: {
        name: "David Park",
        email: "david@parkproperties.com",
        avatar: "DP",
        clientType: "Business",
      },
      to: ["sarah@firm.com"],
      subject:
        "Real Estate Investment - 1031 Exchange Guidance",
      body: `Sarah,

I'm considering selling one of my rental properties and using a 1031 exchange to defer the capital gains.

Property details:
- Purchase price: $450,000 (2018)
- Current value: $725,000
- Accumulated depreciation: $42,000

Can we discuss the tax implications and timeline requirements?

Best,
David`,
      date: new Date(
        Date.now() - 10 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      read: false,
      starred: false,
      flagged: false,
      hasAttachments: false,
      isSecure: false,
      clientId: "14",
      clientName: "Park Properties LLC",
      status: "delivered",
      deliveredAt: new Date(
        Date.now() - 10 * 24 * 60 * 60 * 1000,
      ).toISOString(),
    },
    {
      id: "10",
      from: {
        name: "Amanda Foster",
        email: "amanda@foster.com",
        avatar: "AF",
        clientType: "Business",
      },
      to: ["sarah@firm.com"],
      subject: "Estate Planning Documents",
      body: `Dear Sarah,

Attached are the estate planning documents we discussed during our last meeting.

This secure email contains:
- Updated will
- Trust documents
- Asset inventory
- Beneficiary designations

Please review from a tax perspective and let me know if you see any issues.

Thank you,
Amanda`,
      date: new Date(
        Date.now() - 12 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      read: true,
      starred: true,
      flagged: false,
      hasAttachments: true,
      attachments: [
        {
          id: "8",
          name: "Estate-Planning-Package.pdf",
          size: 2100000,
          type: "application/pdf",
        },
        {
          id: "9",
          name: "Asset-Inventory.xlsx",
          size: 234000,
          type: "application/vnd.ms-excel",
        },
      ],
      isSecure: true,
      clientId: "16",
      clientName: "Foster Family Trust",
      status: "delivered",
      deliveredAt: new Date(
        Date.now() - 12 * 24 * 60 * 60 * 1000,
      ).toISOString(),
    },
    {
      id: "11",
      from: {
        name: "Thomas Baker",
        email: "tom@bakercafe.com",
        avatar: "TB",
        clientType: "Business",
      },
      to: ["sarah@firm.com"],
      subject: "Payroll Tax Question - New Hire",
      body: `Hi Sarah,

We just hired a new manager and I have some questions about the payroll setup:

1. What forms does she need to complete?
2. How do we handle the health insurance deduction?
3. Should we set up a 401k match from day one?

She starts Monday so I need to get this sorted quickly!

Tom`,
      date: new Date(
        Date.now() - 15 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      read: false,
      starred: false,
      flagged: false,
      hasAttachments: false,
      isSecure: false,
      clientId: "7",
      clientName: "Baker Street Cafe",
      status: "delivered",
      deliveredAt: new Date(
        Date.now() - 15 * 24 * 60 * 60 * 1000,
      ).toISOString(),
    },
    {
      id: "12",
      from: {
        name: "Maria Rodriguez",
        email: "maria@rodriguez.com",
        avatar: "MR",
        clientType: "Individual",
      },
      to: ["sarah@firm.com"],
      subject: "Cryptocurrency Tax Reporting",
      body: `Hi Sarah,

I did some cryptocurrency trading this year and I'm not sure how to report it.

I have:
- Bitcoin transactions (buy/sell)
- Ethereum staking rewards
- NFT sales

I've downloaded all the transaction history from Coinbase. Can you help me figure out the tax implications?

Thanks!
Maria`,
      date: new Date(
        Date.now() - 18 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      read: true,
      starred: false,
      flagged: false,
      hasAttachments: true,
      attachments: [
        {
          id: "10",
          name: "Coinbase-Transactions-2024.csv",
          size: 45000,
          type: "text/csv",
        },
      ],
      isSecure: false,
      clientId: "19",
      clientName: "Maria Rodriguez",
      status: "delivered",
      deliveredAt: new Date(
        Date.now() - 18 * 24 * 60 * 60 * 1000,
      ).toISOString(),
    },
    {
      id: "13",
      from: {
        name: "Kevin Thompson",
        email: "kevin@thompson.com",
        avatar: "KT",
        clientType: "Individual",
      },
      to: ["sarah@firm.com"],
      subject: "Divorce Settlement - Tax Implications",
      body: `Sarah,

As we discussed, I need your help understanding the tax implications of my divorce settlement.

The settlement includes:
- Property division
- Alimony payments
- Child support
- Retirement account transfers

This is very sensitive and time-critical as the final hearing is next month.

Can we schedule a confidential call?

Kevin`,
      date: new Date(
        Date.now() - 20 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      read: false,
      starred: true,
      flagged: true,
      hasAttachments: true,
      attachments: [
        {
          id: "11",
          name: "Divorce-Settlement-Draft.pdf",
          size: 678000,
          type: "application/pdf",
        },
      ],
      isSecure: true,
      clientId: "21",
      clientName: "Kevin Thompson",
      status: "delivered",
      deliveredAt: new Date(
        Date.now() - 20 * 24 * 60 * 60 * 1000,
      ).toISOString(),
    },
    {
      id: "14",
      from: {
        name: "Susan Miller",
        email: "susan@millerdesign.com",
        avatar: "SM",
        clientType: "Business",
      },
      to: ["sarah@firm.com"],
      subject: "Freelance Income - Estimated Tax Payments",
      body: `Hi Sarah,

My freelance design business has really taken off this year! I'm making much more than I expected.

I think I need to adjust my estimated tax payments. Can you help me calculate how much I should be paying quarterly?

My Q3 income was about $45,000 and Q4 is looking similar.

Thanks!
Susan`,
      date: new Date(
        Date.now() - 25 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      read: true,
      starred: false,
      flagged: false,
      hasAttachments: false,
      isSecure: false,
      clientId: "23",
      clientName: "Miller Design Studio",
      status: "delivered",
      deliveredAt: new Date(
        Date.now() - 25 * 24 * 60 * 60 * 1000,
      ).toISOString(),
    },
    {
      id: "15",
      from: {
        name: "James Anderson",
        email: "james@anderson.com",
        avatar: "JA",
        clientType: "Individual",
      },
      to: ["sarah@firm.com"],
      subject: "Stock Options Exercise - Tax Question",
      body: `Sarah,

My company is going public next year and I have a bunch of stock options that will vest.

I need to understand:
1. When should I exercise?
2. What are the tax implications of ISO vs NSO?
3. Should I consider an 83(b) election?
4. AMT concerns?

This could be a significant financial event for my family.

Let's discuss soon.

James`,
      date: new Date(
        Date.now() - 30 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      read: false,
      starred: false,
      flagged: false,
      hasAttachments: false,
      isSecure: false,
      clientId: "25",
      clientName: "James & Emily Anderson",
      status: "delivered",
      deliveredAt: new Date(
        Date.now() - 30 * 24 * 60 * 60 * 1000,
      ).toISOString(),
    },
    {
      id: "16",
      from: {
        name: "Patricia Lee",
        email: "patricia@leeconsulting.com",
        avatar: "PL",
        clientType: "Business",
      },
      to: ["sarah@firm.com"],
      subject: "S-Corp Election for New Business",
      body: `Hi Sarah,

I'm starting a new consulting business and wondering if I should elect S-Corp status.

Projected revenue: $180,000/year
Estimated expenses: $45,000/year

What are the pros and cons from a tax perspective?

Thanks,
Patricia`,
      date: new Date(
        Date.now() - 35 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      read: true,
      starred: false,
      flagged: false,
      hasAttachments: false,
      isSecure: false,
      clientId: "27",
      clientName: "Lee Consulting Group",
      status: "delivered",
      deliveredAt: new Date(
        Date.now() - 35 * 24 * 60 * 60 * 1000,
      ).toISOString(),
    },
    {
      id: "17",
      from: {
        name: "IRS",
        email: "notices@irs.gov",
        avatar: "IR",
        clientType: "Business",
      },
      to: ["sarah@firm.com"],
      subject: "Client Notice - CP2000 Response Required",
      body: `IMPORTANT: IRS Notice Received

Client: Martinez Enterprises
Notice Type: CP2000 - Proposed Changes to Tax Return
Tax Year: 2023
Amount: $12,450

Response deadline: January 15, 2026

This notice indicates a discrepancy between reported income and IRS records. Immediate attention required.

Full notice details and response options are attached.

Please review urgently.`,
      date: new Date(
        Date.now() - 2 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      read: false,
      starred: true,
      flagged: true,
      hasAttachments: true,
      attachments: [
        {
          id: "12",
          name: "IRS-CP2000-Notice.pdf",
          size: 456000,
          type: "application/pdf",
        },
      ],
      isSecure: true,
      clientId: "8",
      clientName: "Martinez Enterprises",
      status: "delivered",
      deliveredAt: new Date(
        Date.now() - 2 * 24 * 60 * 60 * 1000,
      ).toISOString(),
    },
    {
      id: "18",
      from: {
        name: "Rachel Green",
        email: "rachel@greenlaw.com",
        avatar: "RG",
        clientType: "Individual",
      },
      to: ["sarah@firm.com"],
      subject: "Client Referral - Corporate Tax Planning",
      body: `Hi Sarah,

I have a client who needs corporate tax planning services. They're a growing tech company with about $5M in revenue.

They need help with:
- R&D tax credits
- Multi-state tax compliance
- Transfer pricing
- International tax planning

Would you be interested in taking them on? I think they'd be a great fit.

Let me know!
Rachel`,
      date: new Date(
        Date.now() - 4 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      read: false,
      starred: false,
      flagged: false,
      hasAttachments: false,
      isSecure: false,
      status: "delivered",
      deliveredAt: new Date(
        Date.now() - 4 * 24 * 60 * 60 * 1000,
      ).toISOString(),
    },
    {
      id: "19",
      from: {
        name: "Michael Scott",
        email: "michael@scottbuilders.com",
        avatar: "MS",
        clientType: "Business",
      },
      to: ["sarah@firm.com"],
      subject: "Construction Business - Equipment Depreciation",
      body: `Sarah,

We just purchased some major equipment for the business:

- Excavator: $125,000
- Dump truck: $85,000
- Concrete mixer: $45,000

I've heard about Section 179 and bonus depreciation. Can you explain which is better for us?

Also, does it make sense to finance or buy outright from a tax perspective?

Mike`,
      date: new Date(
        Date.now() - 8 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      read: true,
      starred: false,
      flagged: false,
      hasAttachments: true,
      attachments: [
        {
          id: "13",
          name: "Equipment-Purchase-Invoices.pdf",
          size: 234000,
          type: "application/pdf",
        },
      ],
      isSecure: false,
      clientId: "29",
      clientName: "Scott Builders Inc",
      status: "delivered",
      deliveredAt: new Date(
        Date.now() - 8 * 24 * 60 * 60 * 1000,
      ).toISOString(),
    },
    {
      id: "20",
      from: {
        name: "Emily White",
        email: "emily@whitefoundation.org",
        avatar: "EW",
        clientType: "Business",
      },
      to: ["sarah@firm.com"],
      subject: "Private Foundation - Grant Making Guidelines",
      body: `Dear Sarah,

Our family foundation is ready to start making grants. We need guidance on:

- Expenditure responsibility grants
- Due diligence requirements
- Documentation and reporting
- Prohibited transactions

Attached is our current grantmaking policy draft for your review.

This is confidential as it contains our giving strategy and financial details.

Best regards,
Emily`,
      date: new Date(
        Date.now() - 40 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      read: true,
      starred: false,
      flagged: false,
      hasAttachments: true,
      attachments: [
        {
          id: "14",
          name: "Grantmaking-Policy-Draft.pdf",
          size: 567000,
          type: "application/pdf",
        },
      ],
      isSecure: true,
      clientId: "31",
      clientName: "White Family Foundation",
      status: "delivered",
      deliveredAt: new Date(
        Date.now() - 40 * 24 * 60 * 60 * 1000,
      ).toISOString(),
    },
    {
      id: "21",
      from: {
        name: "Gokhan Troy",
        email: "gokhan@troy.com",
        avatar: "GT",
        clientType: "Business",
      },
      to: ["notifications@firm.com"],
      subject: "Re: Invoice #1234 Payment Confirmation",
      body: `Hi,

Thank you for the invoice. I just completed the payment via ACH.

Please confirm receipt.

Best,
Gokhan`,
      date: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      read: false,
      starred: false,
      flagged: false,
      hasAttachments: false,
      isSecure: false,
      isFirmEmail: true,
      clientId: "1",
      clientName: "Troy Business Services LLC",
      status: "delivered",
      deliveredAt: new Date(
        Date.now() - 30 * 60 * 1000,
      ).toISOString(),
    },
    {
      id: "22",
      from: {
        name: "Jamal Wilson",
        email: "jamal@bestface.com",
        avatar: "JW",
        clientType: "Business",
      },
      to: ["notifications@firm.com"],
      subject: "Re: Document Request - Q4 Expenses",
      body: `Hello,

I have uploaded the requested Q4 expense documents to the portal.

Let me know if you need anything else.

Thanks,
Jamal`,
      date: new Date(
        Date.now() - 2 * 60 * 60 * 1000,
      ).toISOString(),
      read: true,
      starred: false,
      flagged: false,
      hasAttachments: false,
      isSecure: false,
      isFirmEmail: true,
      clientId: "3",
      clientName: "Best Face Forward",
      status: "delivered",
      deliveredAt: new Date(
        Date.now() - 2 * 60 * 60 * 1000,
      ).toISOString(),
    },
    {
      id: "23",
      from: {
        name: "Mary Smith",
        email: "mary@smithfamily.com",
        avatar: "MS",
        clientType: "Individual",
      },
      to: ["notifications@firm.com"],
      subject: "Question about 2024 Tax Return",
      body: `Hi there,

I have a question about the deduction on line 23 of our tax return. Can someone give me a call to discuss?

Thanks,
Mary Smith`,
      date: new Date(
        Date.now() - 5 * 60 * 60 * 1000,
      ).toISOString(),
      read: false,
      starred: false,
      flagged: true,
      hasAttachments: false,
      isSecure: false,
      isFirmEmail: true,
      clientId: "11",
      clientName: "John & Mary Smith",
      status: "delivered",
      deliveredAt: new Date(
        Date.now() - 5 * 60 * 60 * 1000,
      ).toISOString(),
    },
  ]);

  // Activity Log Data
  const activityLogs = [
    {
      id: "act0",
      type: "email_failed",
      user: "System",
      userInitials: "SY",
      action: "failed to send email",
      details: "Payment Reminder - Delivery Failed",
      timestamp: new Date(
        Date.now() - 30 * 60 * 1000,
      ).toISOString(),
      emailId: "999",
      status: "failed",
      isFirmEmail: false,
      extendedDetails: {
        subject: "Payment Reminder - Delivery Failed",
        from: "sarah@firm.com",
        to: ["invalid@bounced-email.com"],
        body: "This is a reminder that your payment is due...",
      },
    },
    {
      id: "act1",
      type: "email_sent",
      user: "Sarah Johnson",
      userInitials: "SJ",
      action: "sent an email",
      details: "Client Inquiry - 2024 Tax Filing",
      timestamp: new Date(
        Date.now() - 2 * 60 * 60 * 1000,
      ).toISOString(),
      emailId: "1",
      status: "delivered",
      isFirmEmail: false,
      extendedDetails: {
        subject: "Client Inquiry - 2024 Tax Filing",
        from: "sarah@firm.com",
        to: ["john@smithcorp.com"],
        body: "Thank you for reaching out. I can definitely help you with your 2024 tax filing...",
        attachments: [],
      },
    },
    {
      id: "act2",
      type: "email_received",
      user: "Michael Chen",
      userInitials: "MC",
      action: "received an email",
      details: "Quarterly Tax Estimate Question",
      timestamp: new Date(
        Date.now() - 5 * 60 * 60 * 1000,
      ).toISOString(),
      emailId: "2",
      status: "delivered",
      isFirmEmail: true,
      extendedDetails: {
        subject: "Quarterly Tax Estimate Question",
        from: "michael@chen.com",
        to: ["notifications@firm.com"],
        body: "Our business revenue has increased significantly this quarter...",
        attachments: ["Q3-Revenue-Report.xlsx"],
      },
    },
    {
      id: "act3",
      type: "email_opened",
      user: "John Smith",
      userInitials: "JS",
      action: "opened email",
      details: "Client Inquiry - 2024 Tax Filing",
      timestamp: new Date(
        Date.now() - 6 * 60 * 60 * 1000,
      ).toISOString(),
      emailId: "1",
      status: "opened",
      isFirmEmail: false,
      metadata: "Opened 3 times",
    },
    {
      id: "act4",
      type: "email_replied",
      user: "Sarah Johnson",
      userInitials: "SJ",
      action: "replied to email",
      details: "Trust Distribution - Tax Implications",
      timestamp: new Date(
        Date.now() - 12 * 60 * 60 * 1000,
      ).toISOString(),
      emailId: "3",
      status: "delivered",
      isFirmEmail: false,
      extendedDetails: {
        subject: "Re: Trust Distribution - Tax Implications",
        from: "sarah@firm.com",
        to: ["lisa@thompson.com"],
        body: "Thank you for sending the trust document. After reviewing it...",
      },
    },
    {
      id: "act5",
      type: "email_added_to_task",
      user: "Sarah Johnson",
      userInitials: "SJ",
      action: "added email to task",
      details: "International Tax Compliance Question",
      timestamp: new Date(
        Date.now() - 18 * 60 * 60 * 1000,
      ).toISOString(),
      emailId: "4",
      status: "sent",
      isFirmEmail: false,
      extendedDetails: {
        subject: "International Tax Compliance Question",
        from: "client@international.com",
        to: ["sarah@firm.com"],
        body: "Need guidance on international tax compliance requirements...",
        taskName: "Review International Tax Compliance",
      },
    },
    {
      id: "act6",
      type: "email_sent",
      user: "Sarah Johnson",
      userInitials: "SJ",
      action: "sent a secure email",
      details: "Partnership K-1 Forms Available",
      timestamp: new Date(
        Date.now() - 24 * 60 * 60 * 1000,
      ).toISOString(),
      emailId: "5",
      status: "sent",
      isFirmEmail: false,
      extendedDetails: {
        subject: "Partnership K-1 Forms Available",
        from: "sarah@firm.com",
        to: ["robert@davis.com"],
        body: "Your K-1 forms are ready for download through our secure portal...",
        attachments: ["K1-2024.pdf"],
      },
    },
    {
      id: "act7",
      type: "email_received",
      user: "Amanda Rodriguez",
      userInitials: "AR",
      action: "received an email",
      details: "LLC Formation Tax Structure",
      timestamp: new Date(
        Date.now() - 30 * 60 * 60 * 1000,
      ).toISOString(),
      emailId: "6",
      status: "delivered",
      isFirmEmail: true,
      extendedDetails: {
        subject: "LLC Formation Tax Structure",
        from: "amanda@rodriguez.com",
        to: ["notifications@firm.com"],
        body: "I am forming an LLC and need advice on tax structure...",
      },
    },
    {
      id: "act8",
      type: "email_added_to_calendar",
      user: "Sarah Johnson",
      userInitials: "SJ",
      action: "added email to calendar",
      details: "Estate Tax Return Meeting Request",
      timestamp: new Date(
        Date.now() - 36 * 60 * 60 * 1000,
      ).toISOString(),
      emailId: "7",
      status: "delivered",
      isFirmEmail: false,
      extendedDetails: {
        subject: "Estate Tax Return Meeting Request",
        from: "patricia@wilson.com",
        to: ["sarah@firm.com"],
        body: "Can we schedule a meeting to discuss the estate tax return?",
        eventDate: "2024-12-28",
      },
    },
    {
      id: "act9",
      type: "email_assigned_to_project",
      user: "Mike Brown",
      userInitials: "MB",
      action: "assigned email to project",
      details: "Corporate Tax Filing - Q4 2024",
      timestamp: new Date(
        Date.now() - 42 * 60 * 60 * 1000,
      ).toISOString(),
      emailId: "8",
      status: "delivered",
      isFirmEmail: true,
      extendedDetails: {
        subject: "Corporate Tax Filing - Q4 2024",
        from: "finance@bigcorp.com",
        to: ["notifications@firm.com"],
        body: "Attached are the documents for Q4 corporate tax filing...",
        projectName: "BigCorp Q4 Tax Filing",
      },
    },
    {
      id: "act10",
      type: "email_starred",
      user: "Sarah Johnson",
      userInitials: "SJ",
      action: "starred email",
      details: "Important: IRS Audit Notice",
      timestamp: new Date(
        Date.now() - 48 * 60 * 60 * 1000,
      ).toISOString(),
      emailId: "9",
      status: "delivered",
      isFirmEmail: false,
      extendedDetails: {
        subject: "Important: IRS Audit Notice",
        from: "irs-notices@taxagency.gov",
        to: ["sarah@firm.com"],
        body: "This is to notify you that your client has been selected for audit...",
      },
    },
    {
      id: "act11",
      type: "email_sent",
      user: "Emily Davis",
      userInitials: "ED",
      action: "sent an email",
      details: "Tax Extension Confirmation",
      timestamp: new Date(
        Date.now() - 3 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      emailId: "10",
      status: "sent",
      isFirmEmail: false,
      extendedDetails: {
        subject: "Tax Extension Confirmation",
        from: "emily@firm.com",
        to: ["client@business.com"],
        body: "Your tax extension has been filed successfully...",
      },
    },
    {
      id: "act12",
      type: "email_failed",
      user: "System",
      userInitials: "SY",
      action: "failed to deliver email",
      details: "Quarterly Report - Invalid Email Address",
      timestamp: new Date(
        Date.now() - 4 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      emailId: "11",
      status: "failed",
      isFirmEmail: true,
      extendedDetails: {
        subject: "Quarterly Report - Invalid Email Address",
        from: "notifications@firm.com",
        to: ["invalid@nonexistent-domain.xyz"],
        body: "Your quarterly tax report is ready for review...",
      },
    },
  ];

  // Group activities by date
  const groupActivitiesByDate = (
    activities: typeof activityLogs,
  ) => {
    const groups: { [key: string]: typeof activityLogs } = {};

    activities.forEach((activity) => {
      const date = new Date(activity.timestamp);
      const dateKey = format(date, "yyyy-MM-dd");

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(activity);
    });

    return Object.entries(groups)
      .sort(
        ([a], [b]) =>
          new Date(b).getTime() - new Date(a).getTime(),
      )
      .map(([date, activities]) => ({
        date,
        displayDate: formatActivityDate(date),
        activities: activities.sort(
          (a, b) =>
            new Date(b.timestamp).getTime() -
            new Date(a.timestamp).getTime(),
        ),
      }));
  };

  const formatActivityDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (
      format(date, "yyyy-MM-dd") === format(today, "yyyy-MM-dd")
    ) {
      return "Today";
    } else if (
      format(date, "yyyy-MM-dd") ===
      format(yesterday, "yyyy-MM-dd")
    ) {
      return "Yesterday";
    } else {
      return format(date, "MMMM d, yyyy");
    }
  };

  const formatRelativeTime = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), {
      addSuffix: true,
    });
  };

  // Email-Task mapping helpers
  const getEmailTaskMapping = (): Record<string, string> => {
    const mapping = localStorage.getItem("emailTaskMapping");
    return mapping ? JSON.parse(mapping) : {};
  };

  const getTaskIdForEmail = (
    emailId: string,
  ): string | null => {
    const mapping = getEmailTaskMapping();
    return mapping[emailId] || null;
  };

  const handleViewTask = (taskId: string) => {
    // Navigate to tasks page with the task ID to open its detail dialog
    navigate("/tasks", { state: { openTaskId: taskId } });
    toast.success("Opening task...");
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "email_sent":
        return {
          icon: <Send className="w-4 h-4" />,
          bgColor: "bg-blue-100 dark:bg-blue-900/30",
          textColor: "text-blue-600 dark:text-blue-400",
        };
      case "email_received":
        return {
          icon: <Mail className="w-4 h-4" />,
          bgColor: "bg-green-100 dark:bg-green-900/30",
          textColor: "text-green-600 dark:text-green-400",
        };
      case "email_replied":
        return {
          icon: <Reply className="w-4 h-4" />,
          bgColor: "bg-cyan-100 dark:bg-cyan-900/30",
          textColor: "text-cyan-600 dark:text-cyan-400",
        };
      case "email_added_to_task":
        return {
          icon: <ListTodo className="w-4 h-4" />,
          bgColor: "bg-amber-100 dark:bg-amber-900/30",
          textColor: "text-amber-600 dark:text-amber-400",
        };
      case "email_added_to_calendar":
        return {
          icon: <CalendarIcon className="w-4 h-4" />,
          bgColor: "bg-indigo-100 dark:bg-indigo-900/30",
          textColor: "text-indigo-600 dark:text-indigo-400",
        };
      case "email_assigned_to_project":
        return {
          icon: <Folder className="w-4 h-4" />,
          bgColor: "bg-teal-100 dark:bg-teal-900/30",
          textColor: "text-teal-600 dark:text-teal-400",
        };
      case "email_starred":
        return {
          icon: <Star className="w-4 h-4" />,
          bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
          textColor: "text-yellow-600 dark:text-yellow-400",
        };
      case "email_opened":
        return {
          icon: <Eye className="w-4 h-4" />,
          bgColor: "bg-purple-100 dark:bg-purple-900/30",
          textColor: "text-purple-600 dark:text-purple-400",
        };
      case "email_failed":
        return {
          icon: <AlertCircle className="w-4 h-4" />,
          bgColor: "bg-red-100 dark:bg-red-900/30",
          textColor: "text-red-600 dark:text-red-400",
        };
      default:
        return {
          icon: <Activity className="w-4 h-4" />,
          bgColor: "bg-gray-100 dark:bg-gray-900/30",
          textColor: "text-gray-600 dark:text-gray-400",
        };
    }
  };

  const hasExtendedDetails = (
    activity: (typeof activityLogs)[0],
  ) => {
    return !!activity.extendedDetails;
  };

  const toggleActivityExpansion = (activityId: string) => {
    setExpandedActivities((prev) =>
      prev.includes(activityId)
        ? prev.filter((id) => id !== activityId)
        : [...prev, activityId],
    );
  };

  // Get filtered activity logs
  const getFilteredActivityLogs = () => {
    let filtered = activityLogs;

    // Apply search filter
    if (activitySearchQuery.trim()) {
      const query = activitySearchQuery.toLowerCase();
      filtered = filtered.filter(
        (activity) =>
          activity.details.toLowerCase().includes(query) ||
          activity.user.toLowerCase().includes(query) ||
          activity.action.toLowerCase().includes(query) ||
          activity.extendedDetails?.subject
            ?.toLowerCase()
            .includes(query) ||
          false,
      );
    }

    // Apply client type filter
    if (selectedActivityClientType !== "all") {
      filtered = filtered.filter((activity) => {
        const relatedEmail = emails.find(
          (e) => e.id === activity.emailId,
        );
        return (
          relatedEmail?.from.clientType ===
          selectedActivityClientType
        );
      });
    }

    // Apply date range filter
    if (selectedActivityDateRange !== "all") {
      const now = new Date();
      const startOfToday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      );

      filtered = filtered.filter((activity) => {
        const activityDate = new Date(activity.timestamp);

        if (selectedActivityDateRange === "today") {
          return activityDate >= startOfToday;
        } else if (selectedActivityDateRange === "7days") {
          const sevenDaysAgo = new Date(
            now.getTime() - 7 * 24 * 60 * 60 * 1000,
          );
          return activityDate >= sevenDaysAgo;
        } else if (selectedActivityDateRange === "30days") {
          const thirtyDaysAgo = new Date(
            now.getTime() - 30 * 24 * 60 * 60 * 1000,
          );
          return activityDate >= thirtyDaysAgo;
        }

        return true;
      });
    }

    // Apply status filter
    if (selectedActivityStatus !== "all") {
      filtered = filtered.filter(
        (activity) =>
          activity.status === selectedActivityStatus,
      );
    }

    // Apply email type filter (firm vs personal)
    if (selectedActivityEmailType !== "all") {
      if (selectedActivityEmailType === "firm") {
        filtered = filtered.filter(
          (activity) => activity.isFirmEmail === true,
        );
      } else if (selectedActivityEmailType === "personal") {
        filtered = filtered.filter(
          (activity) => !activity.isFirmEmail,
        );
      }
    }

    return filtered;
  };

  const filteredActivityLogs = getFilteredActivityLogs();
  const groupedActivities = groupActivitiesByDate(
    filteredActivityLogs,
  );

  const folders = [
    {
      id: "inbox" as EmailFolder,
      label: "Inbox",
      icon: Inbox,
      count: emails.filter(
        (e) =>
          !e.read &&
          e.status !== "draft" &&
          e.status !== "scheduled" &&
          !e.isFirmEmail,
      ).length,
    },
    {
      id: "firm" as EmailFolder,
      label: "Firm Email",
      icon: Building2,
      count: emails.filter((e) => e.isFirmEmail && !e.read)
        .length,
    },
    {
      id: "secure" as EmailFolder,
      label: "Secure",
      icon: Shield,
      count: emails.filter((e) => e.isSecure).length,
    },
    {
      id: "starred" as EmailFolder,
      label: "Starred",
      icon: Star,
      count: emails.filter((e) => e.starred).length,
    },
    {
      id: "flagged" as EmailFolder,
      label: "Flagged",
      icon: Flag,
      count: emails.filter((e) => e.flagged).length,
    },
    {
      id: "sent" as EmailFolder,
      label: "Sent",
      icon: Send,
      count: emails.filter(
        (e) =>
          e.status === "sent" ||
          e.status === "delivered" ||
          e.status === "opened",
      ).length,
    },
    {
      id: "drafts" as EmailFolder,
      label: "Drafts",
      icon: FileText,
      count: emails.filter((e) => e.status === "draft").length,
    },
    {
      id: "scheduled" as EmailFolder,
      label: "Scheduled",
      icon: Clock,
      count: emails.filter((e) => e.status === "scheduled")
        .length,
    },
    {
      id: "trash" as EmailFolder,
      label: "Trash",
      icon: Trash2,
      count: 0,
    },
  ];

  const getFilteredEmails = () => {
    let filtered = emails;

    // Filter by folder
    switch (selectedFolder) {
      case "inbox":
        filtered = filtered.filter(
          (e) =>
            e.status !== "draft" &&
            e.status !== "scheduled" &&
            !e.isFirmEmail &&
            e.to.includes("sarah@firm.com"),
        );
        break;
      case "unread":
        filtered = filtered.filter(
          (e) =>
            !e.read &&
            e.status !== "draft" &&
            e.status !== "scheduled" &&
            !e.isFirmEmail &&
            e.to.includes("sarah@firm.com"),
        );
        break;
      case "firm":
        filtered = filtered.filter((e) => e.isFirmEmail);
        break;
      case "starred":
        filtered = filtered.filter((e) => e.starred);
        break;
      case "flagged":
        filtered = filtered.filter((e) => e.flagged);
        break;
      case "sent":
        filtered = filtered.filter(
          (e) =>
            (e.status === "sent" ||
              e.status === "delivered" ||
              e.status === "opened") &&
            e.from.email === "sarah@firm.com",
        );
        break;
      case "drafts":
        filtered = filtered.filter((e) => e.status === "draft");
        break;
      case "scheduled":
        filtered = filtered.filter(
          (e) => e.status === "scheduled",
        );
        break;
      case "secure":
        filtered = filtered.filter((e) => e.isSecure);
        break;
      case "trash":
        filtered = [];
        break;
    }

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(
        (e) =>
          e.subject
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          e.body
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          e.from.name
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          e.from.email
            .toLowerCase()
            .includes(searchQuery.toLowerCase()),
      );
    }

    // Filter by client type
    if (clientTypeFilter !== "all") {
      filtered = filtered.filter(
        (e) => e.from.clientType === clientTypeFilter,
      );
    }

    return filtered.sort(
      (a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  };

  const handleCompose = () => {
    setComposeMode("new");
    setReplyToEmail(null);
    setIsComposing(true);
    setShowActivityLog(false); // Exit activity log mode when composing
  };

  const handleReply = (
    email: Email,
    replyAll: boolean = false,
  ) => {
    setComposeMode(replyAll ? "replyAll" : "reply");
    setReplyToEmail(email);
    setIsComposing(true);
    setShowActivityLog(false); // Exit activity log mode when replying
  };

  const handleForward = (email: Email) => {
    setComposeMode("forward");
    setReplyToEmail(email);
    setIsComposing(true);
    setShowActivityLog(false); // Exit activity log mode when forwarding
  };

  const handleStarEmail = (emailId: string) => {
    const email = emails.find((e) => e.id === emailId);
    const wasStarred = email?.starred;
    setEmails(
      emails.map((e) =>
        e.id === emailId ? { ...e, starred: !e.starred } : e,
      ),
    );

    // Update selectedEmail if it's the one being starred
    if (selectedEmail?.id === emailId) {
      setSelectedEmail({
        ...selectedEmail,
        starred: !selectedEmail.starred,
      });
    }

    toast.success(
      wasStarred ? "Removed from starred" : "Added to starred",
    );
  };

  const handleFlagEmail = (emailId: string) => {
    const email = emails.find((e) => e.id === emailId);
    const wasFlagged = email?.flagged;
    setEmails(
      emails.map((e) =>
        e.id === emailId ? { ...e, flagged: !e.flagged } : e,
      ),
    );

    // Update selectedEmail if it's the one being flagged
    if (selectedEmail?.id === emailId) {
      setSelectedEmail({
        ...selectedEmail,
        flagged: !selectedEmail.flagged,
      });
    }

    toast.success(
      wasFlagged ? "Flag removed" : "Email flagged",
    );
  };

  const handleMarkAsRead = (emailId: string, read: boolean) => {
    setEmails(
      emails.map((e) =>
        e.id === emailId ? { ...e, read } : e,
      ),
    );

    // Update selectedEmail if it's the one being marked as read/unread
    if (selectedEmail?.id === emailId) {
      setSelectedEmail({ ...selectedEmail, read });
    }
  };

  // Check for navigation from Tasks module
  useEffect(() => {
    const emailIdToNavigate = localStorage.getItem(
      "navigateToEmailId",
    );
    if (emailIdToNavigate) {
      // Find and select the email
      const email = emails.find(
        (e) => e.id === emailIdToNavigate,
      );
      if (email) {
        setSelectedEmail(email);
        handleMarkAsRead(email.id, true);

        // Scroll the email into view
        setTimeout(() => {
          const emailElement =
            emailRefs.current[emailIdToNavigate];
          if (emailElement) {
            emailElement.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
            console.log(
              "[EmailPage] Scrolled to email:",
              emailIdToNavigate,
            );
          }
        }, 100); // Small delay to ensure DOM is updated

        // Clear the navigation flag
        localStorage.removeItem("navigateToEmailId");
        toast.success("Email opened from task");
      } else {
        toast.error("Email not found");
        localStorage.removeItem("navigateToEmailId");
      }
    }
  }, [emails]);

  const handleDeleteEmail = (emailId: string) => {
    setEmails(emails.filter((e) => e.id !== emailId));
    if (selectedEmail?.id === emailId) {
      setSelectedEmail(null);
    }
    toast.success("Email moved to trash");
  };

  // Check if compose form has content
  const hasComposeContent = () => {
    return (
      composeData.to.length > 0 ||
      composeData.subject.trim() !== "" ||
      composeData.body.trim() !== "" ||
      composeData.attachments.length > 0
    );
  };

  // Handle email selection with draft confirmation
  const handleEmailSelection = (email: Email) => {
    // If composing and there's content, show confirmation
    if (isComposing && hasComposeContent()) {
      setPendingEmailSelection(email);
      setShowSaveDraftConfirmation(true);
    } else {
      // No compose or no content, just select the email
      setSelectedEmail(email);
      setIsComposing(false);
    }
  };

  // Save draft and continue to selected email
  const handleSaveDraftAndContinue = () => {
    // Save the draft (in real app, would save to drafts folder)
    const draftEmail: Email = {
      id: Math.random().toString(36).substr(2, 9),
      from: { name: "Me", email: "me@firm.com" },
      to: composeData.to.map((r) => r.label),
      subject: composeData.subject || "(No Subject)",
      body: composeData.body,
      date: new Date().toISOString(),
      read: true,
      starred: false,
      flagged: false,
      hasAttachments: composeData.attachments.length > 0,
      attachments: composeData.attachments,
      isSecure: false,
      status: "draft",
    };

    setEmails([draftEmail, ...emails]);
    toast.success("Draft saved");

    // Continue to selected email
    if (pendingEmailSelection) {
      setSelectedEmail(pendingEmailSelection);
    }
    setIsComposing(false);
    setShowSaveDraftConfirmation(false);
    setPendingEmailSelection(null);

    // Reset compose data
    setComposeData({
      to: [],
      subject: "",
      body: "",
      attachments: [],
    });
  };

  // Discard and continue to selected email
  const handleDiscardAndContinue = () => {
    if (pendingEmailSelection) {
      setSelectedEmail(pendingEmailSelection);
    }
    setIsComposing(false);
    setShowSaveDraftConfirmation(false);
    setPendingEmailSelection(null);

    // Reset compose data
    setComposeData({
      to: [],
      subject: "",
      body: "",
      attachments: [],
    });
    toast.info("Draft discarded");
  };

  // Cancel and keep composing
  const handleKeepComposing = () => {
    setShowSaveDraftConfirmation(false);
    setPendingEmailSelection(null);
  };

  const formatEmailDate = (date: string) => {
    const emailDate = new Date(date);
    const now = new Date();
    const diffInHours =
      (now.getTime() - emailDate.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return format(emailDate, "h:mm a");
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else if (diffInHours < 168) {
      return format(emailDate, "EEE");
    } else {
      return format(emailDate, "MMM d");
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Math.round((bytes / Math.pow(k, i)) * 100) / 100 +
      " " +
      sizes[i]
    );
  };

  const cleanEmailPreview = (body: string): string => {
    // Replace all newlines with spaces and trim
    return body.replace(/\n/g, " ").replace(/\s+/g, " ").trim();
  };

  const exportEmailAsPDF = async (email: Email) => {
    try {
      const doc = new jsPDF();

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - margin * 2;
      let yPosition = 20;

      // Helper function to add text with word wrapping
      const addText = (
        text: string,
        fontSize: number = 11,
        isBold: boolean = false,
      ) => {
        doc.setFontSize(fontSize);
        doc.setFont("helvetica", isBold ? "bold" : "normal");
        const lines = doc.splitTextToSize(text, maxWidth);

        lines.forEach((line: string) => {
          if (yPosition > pageHeight - 20) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(line, margin, yPosition);
          yPosition += fontSize * 0.5;
        });
      };

      // Add purple header line
      doc.setDrawColor(124, 58, 237); // Purple color
      doc.setLineWidth(2);
      doc.line(margin, 15, pageWidth - margin, 15);
      yPosition = 25;

      // Add Subject
      addText(email.subject, 16, true);
      yPosition += 5;

      // Add metadata
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(107, 114, 128); // Gray color

      addText(
        `From: ${email.from.name} <${email.from.email}>`,
        10,
      );
      addText(
        `To: ${email.to ? email.to.join(", ") : "N/A"}`,
        10,
      );
      addText(
        `Date: ${format(new Date(email.date), "MMMM d, yyyy · h:mm a")}`,
        10,
      );

      if (email.isSecure) {
        yPosition += 3;
        doc.setFillColor(16, 185, 129); // Green
        doc.setTextColor(255, 255, 255); // White
        doc.roundedRect(margin, yPosition, 40, 6, 2, 2, "F");
        doc.setFontSize(9);
        doc.text("SECURE", margin + 5, yPosition + 4);
        yPosition += 8;
      }

      // Add separator
      yPosition += 5;
      doc.setDrawColor(229, 231, 235);
      doc.setLineWidth(0.5);
      doc.line(
        margin,
        yPosition,
        pageWidth - margin,
        yPosition,
      );
      yPosition += 10;

      // Add email body
      doc.setTextColor(31, 41, 55); // Dark gray
      addText(email.body, 11);

      // Add attachments if any
      if (
        email.hasAttachments &&
        email.attachments &&
        email.attachments.length > 0
      ) {
        yPosition += 10;
        doc.setDrawColor(229, 231, 235);
        doc.line(
          margin,
          yPosition,
          pageWidth - margin,
          yPosition,
        );
        yPosition += 8;

        addText(
          `Attachments (${email.attachments.length})`,
          12,
          true,
        );
        yPosition += 5;

        email.attachments.forEach((att) => {
          doc.setFontSize(10);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(31, 41, 55);

          if (yPosition > pageHeight - 25) {
            doc.addPage();
            yPosition = 20;
          }

          doc.text(`- ${att.name}`, margin + 5, yPosition);
          yPosition += 5;

          doc.setFont("helvetica", "normal");
          doc.setTextColor(107, 114, 128);
          doc.setFontSize(9);
          doc.text(
            `  ${formatFileSize(att.size)}`,
            margin + 5,
            yPosition,
          );
          yPosition += 8;
        });
      }

      // Add footer
      yPosition = pageHeight - 15;
      doc.setDrawColor(229, 231, 235);
      doc.setLineWidth(0.5);
      doc.line(
        margin,
        yPosition - 5,
        pageWidth - margin,
        yPosition - 5,
      );
      doc.setFontSize(8);
      doc.setTextColor(156, 163, 175);
      doc.setFont("helvetica", "normal");
      const footerText = `Exported on ${format(new Date(), "MMMM d, yyyy · h:mm a")}`;
      const footerWidth = doc.getTextWidth(footerText);
      doc.text(
        footerText,
        (pageWidth - footerWidth) / 2,
        yPosition,
      );

      // Save the PDF
      const fileName = `${email.subject.replace(/[^a-z0-9]/gi, "_")}_${format(new Date(), "yyyy-MM-dd")}.pdf`;
      doc.save(fileName);

      toast.success("Email exported as PDF successfully");
    } catch (error) {
      console.error("Error exporting email:", error);
      toast.error("Failed to export email as PDF");
    }
  };

  const exportEmailAsPDF_OLD = async (email: Email) => {
    // PDF export functionality is not available in this environment
    toast.info("PDF export feature coming soon", {
      description:
        "This feature requires additional PDF generation library support",
    });
    return;

    try {
      // const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();

      let yPosition = 20;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - margin * 2;

      // Add title
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Email Thread Export", margin, yPosition);
      yPosition += 10;

      // Add export date
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.text(
        `Exported on: ${format(new Date(), "PPP · p")}`,
        margin,
        yPosition,
      );
      yPosition += 15;

      // Draw separator line
      doc.setDrawColor(200, 200, 200);
      doc.line(
        margin,
        yPosition,
        pageWidth - margin,
        yPosition,
      );
      yPosition += 10;

      // Function to add new page if needed
      const checkAndAddPage = (requiredSpace: number) => {
        if (yPosition + requiredSpace > pageHeight - margin) {
          doc.addPage();
          yPosition = 20;
          return true;
        }
        return false;
      };

      // Function to split and add text with word wrapping
      const addWrappedText = (
        text: string,
        fontSize: number,
        fontStyle: "normal" | "bold" = "normal",
        color: [number, number, number] = [0, 0, 0],
      ) => {
        doc.setFontSize(fontSize);
        doc.setFont("helvetica", fontStyle);
        doc.setTextColor(color[0], color[1], color[2]);

        const lines = doc.splitTextToSize(text, maxWidth);
        for (const line of lines) {
          checkAndAddPage(fontSize * 0.5);
          doc.text(line, margin, yPosition);
          yPosition += fontSize * 0.5;
        }
      };

      // Build thread array (main email + thread if exists)
      const threadEmails: Email[] = [
        email,
        ...(email.thread || []),
      ];

      // Process each email in thread
      threadEmails.forEach((threadEmail, index) => {
        // Check if we need a new page for this email
        checkAndAddPage(40);

        // Email number in thread
        if (threadEmails.length > 1) {
          doc.setFontSize(10);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(100, 100, 100);
          doc.text(
            `Email ${index + 1} of ${threadEmails.length}`,
            margin,
            yPosition,
          );
          yPosition += 8;
        }

        // Subject
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0);
        const subjectLines = doc.splitTextToSize(
          `Subject: ${threadEmail.subject}`,
          maxWidth,
        );
        subjectLines.forEach((line: string) => {
          checkAndAddPage(14 * 0.5);
          doc.text(line, margin, yPosition);
          yPosition += 7;
        });
        yPosition += 5;

        // From
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0);
        doc.text("From:", margin, yPosition);
        doc.setFont("helvetica", "normal");
        doc.text(
          `${threadEmail.from.name} <${threadEmail.from.email}>`,
          margin + 20,
          yPosition,
        );
        yPosition += 6;

        // To
        if (threadEmail.to && threadEmail.to.length > 0) {
          checkAndAddPage(6);
          doc.setFont("helvetica", "bold");
          doc.text("To:", margin, yPosition);
          doc.setFont("helvetica", "normal");
          const toText = threadEmail.to.join(", ");
          const toLines = doc.splitTextToSize(
            toText,
            maxWidth - 20,
          );
          toLines.forEach((line: string, idx: number) => {
            doc.text(
              line,
              margin + (idx === 0 ? 20 : 0),
              yPosition,
            );
            yPosition += 6;
          });
        }

        // CC
        if (threadEmail.cc && threadEmail.cc.length > 0) {
          checkAndAddPage(6);
          doc.setFont("helvetica", "bold");
          doc.text("Cc:", margin, yPosition);
          doc.setFont("helvetica", "normal");
          doc.text(
            threadEmail.cc.join(", "),
            margin + 20,
            yPosition,
          );
          yPosition += 6;
        }

        // Date
        checkAndAddPage(6);
        doc.setFont("helvetica", "bold");
        doc.text("Date:", margin, yPosition);
        doc.setFont("helvetica", "normal");
        doc.text(
          format(new Date(threadEmail.date), "PPP · p"),
          margin + 20,
          yPosition,
        );
        yPosition += 6;

        // Client info if available
        if (threadEmail.clientName) {
          checkAndAddPage(6);
          doc.setFont("helvetica", "bold");
          doc.text("Client:", margin, yPosition);
          doc.setFont("helvetica", "normal");
          doc.text(
            threadEmail.clientName,
            margin + 20,
            yPosition,
          );
          yPosition += 6;
        }

        // Status badges
        if (
          threadEmail.isSecure ||
          threadEmail.flagged ||
          threadEmail.starred
        ) {
          checkAndAddPage(6);
          doc.setFont("helvetica", "bold");
          doc.text("Tags:", margin, yPosition);
          doc.setFont("helvetica", "normal");
          const tags = [];
          if (threadEmail.isSecure) tags.push("Secure");
          if (threadEmail.flagged) tags.push("Flagged");
          if (threadEmail.starred) tags.push("Starred");
          doc.text(tags.join(", "), margin + 20, yPosition);
          yPosition += 6;
        }

        yPosition += 5;

        // Separator before body
        checkAndAddPage(5);
        doc.setDrawColor(220, 220, 220);
        doc.line(
          margin,
          yPosition,
          pageWidth - margin,
          yPosition,
        );
        yPosition += 8;

        // Email body
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(40, 40, 40);

        const bodyLines = threadEmail.body.split("\n");
        bodyLines.forEach((line) => {
          if (line.trim() === "") {
            yPosition += 5;
            return;
          }
          const wrappedLines = doc.splitTextToSize(
            line,
            maxWidth,
          );
          wrappedLines.forEach((wrappedLine: string) => {
            checkAndAddPage(5);
            doc.text(wrappedLine, margin, yPosition);
            yPosition += 5;
          });
        });

        yPosition += 8;

        // Attachments
        if (
          threadEmail.hasAttachments &&
          threadEmail.attachments &&
          threadEmail.attachments.length > 0
        ) {
          checkAndAddPage(15);
          doc.setFontSize(11);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(0, 0, 0);
          doc.text(
            `Attachments (${threadEmail.attachments.length}):`,
            margin,
            yPosition,
          );
          yPosition += 7;

          doc.setFontSize(9);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(60, 60, 60);

          threadEmail.attachments.forEach((attachment) => {
            checkAndAddPage(6);
            doc.text(
              `• ${attachment.name} (${formatFileSize(attachment.size)})`,
              margin + 5,
              yPosition,
            );
            yPosition += 6;
          });

          yPosition += 5;
        }

        // Separator between emails in thread
        if (index < threadEmails.length - 1) {
          checkAndAddPage(10);
          doc.setDrawColor(150, 150, 150);
          doc.line(
            margin,
            yPosition,
            pageWidth - margin,
            yPosition,
          );
          yPosition += 15;
        }
      });

      // Add footer with page numbers
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Page ${i} of ${pageCount}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: "center" },
        );
      }

      // Generate filename
      const safeSubject = email.subject
        .replace(/[^a-z0-9]/gi, "_")
        .substring(0, 50);
      const filename = `Email_${safeSubject}_${format(new Date(), "yyyy-MM-dd")}.pdf`;

      // Save PDF
      doc.save(filename);

      toast.success("Email exported as PDF", {
        description: `Downloaded as ${filename}`,
      });
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast.error("Failed to export email as PDF");
    }
  };

  const filteredEmails = getFilteredEmails();

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="h-16 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 bg-white dark:bg-gray-900 shadow-sm flex-shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Email
          </h1>
          <Badge variant="secondary" className="text-xs">
            {filteredEmails.filter((e) => !e.read).length}{" "}
            unread
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleCompose}
            style={{ backgroundColor: "var(--primaryColor)" }}
            className="gap-2"
          >
            <Mail className="w-4 h-4" />
            Compose
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowSettings(true)}
            className="gap-2"
          >
            <Settings className="w-4 h-4" />
            Settings
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Folders */}
        <div className="w-64 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col">
          <div className="p-4 space-y-1">
            {folders.map((folder) => (
              <>
                <button
                  key={folder.id}
                  onClick={() => {
                    setSelectedFolder(folder.id);
                    setSelectedEmail(null);
                    setShowActivityLog(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
                    folder.id === "firm" &&
                      selectedFolder === folder.id &&
                      !showActivityLog
                      ? "bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 shadow-sm border border-purple-200 dark:border-purple-800"
                      : folder.id === "firm"
                        ? "text-purple-700 dark:text-purple-300 hover:bg-purple-50/50 dark:hover:bg-purple-950/20"
                        : selectedFolder === folder.id &&
                            !showActivityLog
                          ? "text-white shadow-sm"
                          : folder.id === "trash"
                            ? "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50",
                  )}
                  style={
                    selectedFolder === folder.id &&
                    !showActivityLog &&
                    folder.id !== "firm"
                      ? {
                          backgroundColor:
                            "var(--primaryColor)",
                        }
                      : {}
                  }
                >
                  <div className="flex items-center gap-3">
                    <folder.icon
                      className={cn(
                        "w-4 h-4",
                        folder.id === "firm" &&
                          "text-purple-600 dark:text-purple-400",
                        folder.id === "starred" &&
                          "text-yellow-500",
                        folder.id === "flagged" &&
                          "text-red-500",
                        folder.id === "secure" &&
                          "text-green-600",
                      )}
                    />
                    <span
                      className={cn(
                        folder.id === "firm" && "font-medium",
                      )}
                    >
                      {folder.label}
                    </span>
                  </div>
                  {folder.count > 0 && (
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-xs",
                        selectedFolder === folder.id &&
                          !showActivityLog &&
                          folder.id === "firm" &&
                          "bg-purple-700 text-white border-purple-600",
                        selectedFolder === folder.id &&
                          !showActivityLog &&
                          folder.id !== "firm" &&
                          "bg-white/20 text-white border-white/30",
                      )}
                    >
                      {folder.count}
                    </Badge>
                  )}
                </button>

                {/* Nested Unread item under Inbox */}
                {folder.id === "inbox" && (
                  <div className="pl-7">
                    <button
                      onClick={() => {
                        setSelectedFolder("unread");
                        setSelectedEmail(null);
                        setShowActivityLog(false);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
                        selectedFolder === "unread" &&
                          !showActivityLog
                          ? "text-white shadow-sm"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50",
                      )}
                      style={
                        selectedFolder === "unread" &&
                        !showActivityLog
                          ? {
                              backgroundColor:
                                "var(--primaryColor)",
                            }
                          : {}
                      }
                    >
                      <div className="flex items-center gap-3">
                        <MailOpen className="w-4 h-4" />
                        <span>Unread</span>
                      </div>
                      {emails.filter(
                        (e) =>
                          !e.read &&
                          e.status !== "draft" &&
                          e.status !== "scheduled" &&
                          !e.isFirmEmail &&
                          e.to.includes("sarah@firm.com"),
                      ).length > 0 && (
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-xs",
                            selectedFolder === "unread" &&
                              !showActivityLog &&
                              "bg-white/20 text-white border-white/30",
                          )}
                        >
                          {
                            emails.filter(
                              (e) =>
                                !e.read &&
                                e.status !== "draft" &&
                                e.status !== "scheduled" &&
                                !e.isFirmEmail &&
                                e.to.includes("sarah@firm.com"),
                            ).length
                          }
                        </Badge>
                      )}
                    </button>
                  </div>
                )}
              </>
            ))}
          </div>

          <Separator />

          <div className="p-4">
            <Button
              size="sm"
              variant={showActivityLog ? "default" : "outline"}
              className={cn(
                "w-full gap-2",
                showActivityLog && "text-white shadow-sm",
              )}
              style={
                showActivityLog
                  ? { backgroundColor: "var(--primaryColor)" }
                  : {}
              }
              onClick={() => {
                setShowActivityLog(true);
                setSelectedEmail(null);
              }}
            >
              <BarChart3 className="w-4 h-4" />
              Activity Log
            </Button>
          </div>
        </div>

        {/* Middle - Email List or Activity Log */}
        {!showActivityLog ? (
          <div className="w-96 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex flex-col">
            {/* Search & Filters */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search emails..."
                  value={searchQuery}
                  onChange={(e) =>
                    setSearchQuery(e.target.value)
                  }
                  className="pl-9"
                />
              </div>

              {/* Client Type Filter Pills */}
              <div className="flex gap-2">
                <button
                  onClick={() => setClientTypeFilter("all")}
                  className={cn(
                    "flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                    clientTypeFilter === "all"
                      ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                      : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700",
                  )}
                >
                  All
                </button>
                <button
                  onClick={() =>
                    setClientTypeFilter("Individual")
                  }
                  className={cn(
                    "flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-1",
                    clientTypeFilter === "Individual"
                      ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                      : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700",
                  )}
                >
                  <User className="w-3 h-3" />
                  Individual
                </button>
                <button
                  onClick={() =>
                    setClientTypeFilter("Business")
                  }
                  className={cn(
                    "flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-1",
                    clientTypeFilter === "Business"
                      ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                      : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700",
                  )}
                >
                  <Building2 className="w-3 h-3" />
                  Business
                </button>
              </div>
            </div>

            {/* Email List */}
            <div className="flex-1 overflow-y-auto">
              {filteredEmails.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                  <Mail className="w-12 h-12 mb-3 opacity-50" />
                  <p className="text-sm">No emails found</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredEmails.map((email) => (
                    <ContextMenu key={email.id}>
                      <ContextMenuTrigger asChild>
                        <button
                          ref={(el) =>
                            (emailRefs.current[email.id] = el)
                          }
                          onClick={() => {
                            // Create email with read status set to true
                            const emailToSelect = {
                              ...email,
                              read: true,
                            };

                            // Update emails array
                            setEmails(
                              emails.map((e) =>
                                e.id === email.id
                                  ? emailToSelect
                                  : e,
                              ),
                            );

                            // Select the email with updated read status
                            if (
                              isComposing &&
                              hasComposeContent()
                            ) {
                              setPendingEmailSelection(
                                emailToSelect,
                              );
                              setShowSaveDraftConfirmation(
                                true,
                              );
                            } else {
                              setSelectedEmail(emailToSelect);
                              setIsComposing(false);
                            }
                          }}
                          className={cn(
                            "w-full p-4 text-left transition-colors",
                            // Background based on read status and selection - selected emails always bg-white with full opacity
                            selectedEmail?.id === email.id
                              ? "bg-white dark:bg-gray-900"
                              : !email.read
                                ? "bg-white dark:bg-gray-900"
                                : "bg-gray-50 dark:bg-gray-800",
                            // Hover states
                            selectedEmail?.id !== email.id &&
                              "hover:bg-gray-100 dark:hover:bg-gray-800",
                            // Selected state - purple ring and white background with forced full opacity
                            selectedEmail?.id === email.id &&
                              "ring-2 ring-inset ring-purple-500 bg-white dark:bg-gray-900 opacity-100",
                          )}
                        >
                          <div className="flex items-start gap-3">
                            {/* Unread indicator dot */}
                            <div className="flex items-center pt-3">
                              {!email.read ? (
                                <div
                                  className="w-2.5 h-2.5 rounded-full"
                                  style={{
                                    backgroundColor:
                                      "var(--primaryColor)",
                                  }}
                                />
                              ) : (
                                <div className="w-2.5 h-2.5" />
                              )}
                            </div>

                            <Avatar className="w-10 h-10 flex-shrink-0">
                              <div
                                className="w-full h-full flex items-center justify-center text-white text-sm font-medium rounded-full"
                                style={{
                                  backgroundColor:
                                    "var(--primaryColor)",
                                }}
                              >
                                {email.from.avatar ||
                                  email.from.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                              </div>
                            </Avatar>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <div className="flex items-center gap-1.5">
                                  {email.from.clientType ===
                                    "Business" && (
                                    <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                                  )}
                                  {email.from.clientType ===
                                    "Individual" && (
                                    <User className="w-3.5 h-3.5 text-green-600 dark:text-green-400 flex-shrink-0" />
                                  )}
                                  <span
                                    className={cn(
                                      "text-sm truncate",
                                      !email.read ||
                                        selectedEmail?.id ===
                                          email.id
                                        ? "font-semibold text-gray-900 dark:text-gray-100"
                                        : "font-medium text-gray-700 dark:text-gray-300",
                                    )}
                                  >
                                    {email.from.name}
                                  </span>
                                </div>
                                <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                                  {formatEmailDate(email.date)}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 mb-1">
                                <p
                                  className={cn(
                                    "text-sm truncate flex-1",
                                    !email.read ||
                                      selectedEmail?.id ===
                                        email.id
                                      ? "font-medium text-gray-900 dark:text-gray-100"
                                      : "text-gray-600 dark:text-gray-400",
                                  )}
                                >
                                  {email.subject}
                                </p>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  {email.isFirmEmail && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs px-1.5 py-0 h-5 bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800"
                                    >
                                      <Building2 className="w-3 h-3 mr-1" />
                                      Firm
                                    </Badge>
                                  )}
                                  {email.starred && (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div>
                                          <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        Starred
                                      </TooltipContent>
                                    </Tooltip>
                                  )}
                                  {email.flagged && (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div>
                                          <Flag className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        Flagged
                                      </TooltipContent>
                                    </Tooltip>
                                  )}
                                  {email.hasAttachments && (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div>
                                          <Paperclip className="w-3.5 h-3.5 text-gray-400" />
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        Has Attachments
                                      </TooltipContent>
                                    </Tooltip>
                                  )}
                                  {getTaskIdForEmail(
                                    email.id,
                                  ) && (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div>
                                          <ListTodo className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        Task Created
                                      </TooltipContent>
                                    </Tooltip>
                                  )}
                                </div>
                              </div>

                              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 break-words leading-relaxed">
                                {cleanEmailPreview(email.body)}
                              </p>

                              {email.status === "scheduled" &&
                                email.scheduledFor && (
                                  <div className="flex items-center gap-1 mt-2">
                                    <Clock className="w-3 h-3 text-orange-500" />
                                    <span className="text-xs text-orange-600 dark:text-orange-400">
                                      Scheduled for{" "}
                                      {format(
                                        new Date(
                                          email.scheduledFor,
                                        ),
                                        "MMM d, h:mm a",
                                      )}
                                    </span>
                                  </div>
                                )}

                              {email.clientName && (
                                <div className="flex items-center justify-between gap-2 mt-1">
                                  <div className="flex items-center gap-1">
                                    <Building2 className="w-3 h-3 text-gray-400" />
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      {email.clientName}
                                    </span>
                                  </div>
                                  {email.isSecure && (
                                    <Badge className="gap-1 px-1.5 py-0.5 h-5 bg-green-600 hover:bg-green-700 border-green-600">
                                      <Shield className="w-3 h-3 text-white" />
                                      <span className="text-xs font-medium text-white">
                                        Secure
                                      </span>
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </button>
                      </ContextMenuTrigger>
                      <ContextMenuContent className="w-56">
                        <ContextMenuItem
                          onClick={() => handleReply(email)}
                        >
                          <Reply className="w-4 h-4 mr-2" />
                          Reply
                        </ContextMenuItem>
                        <ContextMenuItem
                          onClick={() =>
                            handleReply(email, true)
                          }
                        >
                          <ReplyAll className="w-4 h-4 mr-2" />
                          Reply All
                        </ContextMenuItem>
                        <ContextMenuItem
                          onClick={() => handleForward(email)}
                        >
                          <Forward className="w-4 h-4 mr-2" />
                          Forward
                        </ContextMenuItem>
                        <ContextMenuSeparator />
                        <ContextMenuItem
                          onClick={() =>
                            handleStarEmail(email.id)
                          }
                        >
                          <Star
                            className={cn(
                              "w-4 h-4 mr-2",
                              email.starred &&
                                "fill-yellow-500 text-yellow-500",
                            )}
                          />
                          {email.starred ? "Unstar" : "Star"}
                        </ContextMenuItem>
                        <ContextMenuItem
                          onClick={() =>
                            handleFlagEmail(email.id)
                          }
                        >
                          <Flag
                            className={cn(
                              "w-4 h-4 mr-2",
                              email.flagged &&
                                "fill-red-500 text-red-500",
                            )}
                          />
                          {email.flagged ? "Unflag" : "Flag"}
                        </ContextMenuItem>
                        <ContextMenuItem
                          onClick={() =>
                            handleMarkAsRead(
                              email.id,
                              !email.read,
                            )
                          }
                        >
                          <MailOpen className="w-4 h-4 mr-2" />
                          Mark as{" "}
                          {email.read ? "Unread" : "Read"}
                        </ContextMenuItem>
                        <ContextMenuSeparator />
                        <ContextMenuItem
                          onClick={() => {
                            setSelectedEmail(email);
                            setShowAssignProject(true);
                          }}
                        >
                          <Folder className="w-4 h-4 mr-2" />
                          Assign to Project
                        </ContextMenuItem>
                        <ContextMenuItem
                          onClick={() => {
                            const taskId = getTaskIdForEmail(
                              email.id,
                            );
                            if (taskId) {
                              handleViewTask(taskId);
                            } else {
                              setSelectedEmail(email);
                              setShowCreateTask(true);
                            }
                          }}
                        >
                          {getTaskIdForEmail(email.id) ? (
                            <>
                              <ListTodo className="w-4 h-4 mr-2" />
                              View Task
                            </>
                          ) : (
                            <>
                              <CheckSquare className="w-4 h-4 mr-2" />
                              Add to Task
                            </>
                          )}
                        </ContextMenuItem>
                        <ContextMenuItem
                          onClick={() => {
                            setSelectedEmail(email);
                            setShowAddToCalendar(true);
                          }}
                        >
                          <CalendarIcon className="w-4 h-4 mr-2" />
                          Add to Calendar
                        </ContextMenuItem>
                        <ContextMenuSeparator />
                        <ContextMenuItem
                          onClick={() => {
                            setSelectedEmail(email);
                            setShowAISummary(true);
                          }}
                        >
                          <Sparkles className="w-4 h-4 mr-2" />
                          AI Summary
                        </ContextMenuItem>
                        <ContextMenuSeparator />
                        <ContextMenuItem
                          onClick={() =>
                            exportEmailAsPDF(email)
                          }
                        >
                          <FileDown className="w-4 h-4 mr-2" />
                          Export as PDF
                        </ContextMenuItem>
                        <ContextMenuSeparator />
                        <ContextMenuItem
                          onClick={() =>
                            handleDeleteEmail(email.id)
                          }
                          className="text-red-600 dark:text-red-400"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </ContextMenuItem>
                      </ContextMenuContent>
                    </ContextMenu>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Activity Log - Left Panel (40%) */}
            <div className="w-[40%] border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex flex-col overflow-hidden">
              {/* Activity Log Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between flex-shrink-0">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Activity Log
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Email activity timeline
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setShowActivityLog(false);
                    setSelectedActivityLog(null);
                    setSelectedEmail(null);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Search & Filter */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-3 flex-shrink-0">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search activities..."
                    value={activitySearchQuery}
                    onChange={(e) =>
                      setActivitySearchQuery(e.target.value)
                    }
                    className="pl-10"
                  />
                </div>

                {/* Compact Filter Row with Dropdowns */}
                <div className="flex items-center gap-2">
                  {/* Client Type */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                          "h-8 text-xs gap-1.5",
                          selectedActivityClientType !==
                            "all" &&
                            "bg-purple-50 dark:bg-purple-950/30 border-purple-300 dark:border-purple-700",
                        )}
                      >
                        <Filter className="w-3 h-3" />
                        {selectedActivityClientType === "all"
                          ? "All Clients"
                          : selectedActivityClientType}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem
                        onClick={() =>
                          setSelectedActivityClientType("all")
                        }
                      >
                        All Clients
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          setSelectedActivityClientType(
                            "Individual",
                          )
                        }
                      >
                        <User className="w-3 h-3 mr-2" />
                        Individual
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          setSelectedActivityClientType(
                            "Business",
                          )
                        }
                      >
                        <Building2 className="w-3 h-3 mr-2" />
                        Business
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Date Range */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                          "h-8 text-xs gap-1.5",
                          selectedActivityDateRange !== "all" &&
                            "bg-purple-50 dark:bg-purple-950/30 border-purple-300 dark:border-purple-700",
                        )}
                      >
                        <CalendarIcon className="w-3 h-3" />
                        {selectedActivityDateRange === "all"
                          ? "All Time"
                          : selectedActivityDateRange ===
                              "today"
                            ? "Today"
                            : selectedActivityDateRange ===
                                "7days"
                              ? "Last 7 Days"
                              : "Last 30 Days"}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem
                        onClick={() =>
                          setSelectedActivityDateRange("all")
                        }
                      >
                        All Time
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          setSelectedActivityDateRange("today")
                        }
                      >
                        Today
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          setSelectedActivityDateRange("7days")
                        }
                      >
                        Last 7 Days
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          setSelectedActivityDateRange("30days")
                        }
                      >
                        Last 30 Days
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Status */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                          "h-8 text-xs gap-1.5",
                          selectedActivityStatus !== "all" &&
                            "bg-purple-50 dark:bg-purple-950/30 border-purple-300 dark:border-purple-700",
                        )}
                      >
                        <BarChart3 className="w-3 h-3" />
                        {selectedActivityStatus === "all"
                          ? "All Status"
                          : selectedActivityStatus
                              .charAt(0)
                              .toUpperCase() +
                            selectedActivityStatus.slice(1)}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem
                        onClick={() =>
                          setSelectedActivityStatus("all")
                        }
                      >
                        All Status
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() =>
                          setSelectedActivityStatus("sent")
                        }
                      >
                        <Send className="w-3 h-3 mr-2 text-blue-600" />
                        Sent
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          setSelectedActivityStatus("delivered")
                        }
                      >
                        <Check className="w-3 h-3 mr-2 text-green-600" />
                        Delivered
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          setSelectedActivityStatus("opened")
                        }
                      >
                        <Eye className="w-3 h-3 mr-2 text-purple-600" />
                        Opened
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          setSelectedActivityStatus("success")
                        }
                      >
                        <Check className="w-3 h-3 mr-2 text-green-600" />
                        Success
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          setSelectedActivityStatus("failed")
                        }
                      >
                        <X className="w-3 h-3 mr-2 text-red-600" />
                        Failed
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Divider */}
                  <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />

                  {/* Email Type Pills - Keep These Prominent */}
                  <div className="flex gap-1.5 flex-1">
                    <button
                      onClick={() =>
                        setSelectedActivityEmailType("all")
                      }
                      className={cn(
                        "flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                        selectedActivityEmailType === "all"
                          ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700",
                      )}
                    >
                      All
                    </button>
                    <button
                      onClick={() =>
                        setSelectedActivityEmailType("firm")
                      }
                      className={cn(
                        "flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-1",
                        selectedActivityEmailType === "firm"
                          ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700",
                      )}
                    >
                      <Building2 className="w-3 h-3" />
                      Firm
                    </button>
                    <button
                      onClick={() =>
                        setSelectedActivityEmailType("personal")
                      }
                      className={cn(
                        "flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-1",
                        selectedActivityEmailType === "personal"
                          ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700",
                      )}
                    >
                      <User className="w-3 h-3" />
                      Personal
                    </button>
                  </div>
                </div>
              </div>

              {/* Activity Timeline */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-6">
                  {groupedActivities.length === 0 ? (
                    <Card className="p-12">
                      <div className="text-center">
                        <Activity className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-gray-400">
                          {activitySearchQuery ||
                          selectedActivityClientType !==
                            "all" ||
                          selectedActivityDateRange !== "all" ||
                          selectedActivityStatus !== "all" ||
                          selectedActivityEmailType !== "all"
                            ? "No activities match your filters"
                            : "No activity to display"}
                        </p>
                        {(activitySearchQuery ||
                          selectedActivityClientType !==
                            "all" ||
                          selectedActivityDateRange !== "all" ||
                          selectedActivityStatus !== "all" ||
                          selectedActivityEmailType !==
                            "all") && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setActivitySearchQuery("");
                              setSelectedActivityClientType(
                                "all",
                              );
                              setSelectedActivityDateRange(
                                "all",
                              );
                              setSelectedActivityStatus("all");
                              setSelectedActivityEmailType(
                                "all",
                              );
                            }}
                            className="mt-4"
                          >
                            Clear Filters
                          </Button>
                        )}
                      </div>
                    </Card>
                  ) : (
                    <div className="space-y-8">
                      {groupedActivities.map(
                        (group, groupIndex) => (
                          <div
                            key={group.date}
                            className="relative"
                          >
                            {/* Date Header */}
                            <div className="flex items-center gap-4 mb-4">
                              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-purple-700 dark:from-purple-500 dark:to-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30 dark:shadow-purple-500/20">
                                <CalendarIcon className="w-6 h-6" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                  {group.displayDate}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {group.activities.length}{" "}
                                  activities
                                </p>
                              </div>
                              <div className="flex-1 h-px bg-gradient-to-r from-gray-200 dark:from-gray-700 to-transparent" />
                            </div>

                            {/* Vertical Timeline Line */}
                            {groupIndex !==
                              groupedActivities.length - 1 && (
                              <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-gradient-to-b from-purple-200 dark:from-purple-800 to-transparent" />
                            )}

                            {/* Activities */}
                            <div className="ml-16 space-y-3">
                              {group.activities.map(
                                (activity, activityIndex) => {
                                  const {
                                    icon,
                                    bgColor,
                                    textColor,
                                  } = getActivityIcon(
                                    activity.type,
                                  );
                                  const isExpanded =
                                    expandedActivities.includes(
                                      activity.id,
                                    );
                                  const canExpand =
                                    hasExtendedDetails(
                                      activity,
                                    );
                                  const isSelected =
                                    selectedActivityLog?.id ===
                                    activity.id;

                                  return (
                                    <div
                                      key={activity.id}
                                      className="relative"
                                    >
                                      {/* Connection Line to Timeline */}
                                      <div className="absolute -left-10 top-6 w-10 h-px bg-gray-200 dark:bg-gray-700" />

                                      {/* Activity Card */}
                                      <Card
                                        className={cn(
                                          "p-4 border-l-4 transition-all cursor-pointer",
                                          activity.isFirmEmail &&
                                            !isSelected &&
                                            "bg-purple-50/40 dark:bg-purple-950/10",
                                          isSelected
                                            ? "border-l-purple-600 dark:border-l-purple-500 bg-purple-50/50 dark:bg-purple-900/20 shadow-md"
                                            : "border-l-purple-600 dark:border-l-purple-500 hover:shadow-md",
                                        )}
                                        onClick={() => {
                                          setSelectedActivityLog(
                                            activity,
                                          );
                                          // Find the related email
                                          const relatedEmail =
                                            emails.find(
                                              (e) =>
                                                e.id ===
                                                activity.emailId,
                                            );
                                          if (relatedEmail) {
                                            setSelectedEmail(
                                              relatedEmail,
                                            );
                                          }
                                        }}
                                      >
                                        <div className="flex items-start gap-4">
                                          {/* Icon */}
                                          <div
                                            className={cn(
                                              "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                                              bgColor,
                                              textColor,
                                            )}
                                          >
                                            {icon}
                                          </div>

                                          {/* Content */}
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-4 mb-2">
                                              <div className="flex-1">
                                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                                  <p className="text-sm">
                                                    <span className="font-medium text-gray-900 dark:text-gray-100">
                                                      {
                                                        activity.user
                                                      }
                                                    </span>
                                                    <span className="text-gray-600 dark:text-gray-400">
                                                      {" "}
                                                      {
                                                        activity.action
                                                      }
                                                    </span>
                                                  </p>
                                                  {activity.isFirmEmail && (
                                                    <Badge
                                                      variant="outline"
                                                      className="text-[10px] px-1.5 py-0 h-4 bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800"
                                                    >
                                                      <Building2 className="w-2.5 h-2.5 mr-0.5" />
                                                      Firm
                                                    </Badge>
                                                  )}
                                                </div>
                                                {activity.details && (
                                                  <p className="text-sm text-gray-700 dark:text-gray-300 font-medium mt-0.5">
                                                    {
                                                      activity.details
                                                    }
                                                  </p>
                                                )}
                                                {/* From/To Information */}
                                                {activity.extendedDetails &&
                                                  (activity
                                                    .extendedDetails
                                                    .from ||
                                                    activity
                                                      .extendedDetails
                                                      .to) && (
                                                    <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                                                      {activity
                                                        .extendedDetails
                                                        .from && (
                                                        <div className="flex items-center gap-1">
                                                          <span className="text-gray-400">
                                                            From:
                                                          </span>
                                                          <span className="font-medium">
                                                            {
                                                              activity
                                                                .extendedDetails
                                                                .from
                                                            }
                                                          </span>
                                                        </div>
                                                      )}
                                                      {activity
                                                        .extendedDetails
                                                        .to &&
                                                        activity
                                                          .extendedDetails
                                                          .to
                                                          .length >
                                                          0 && (
                                                          <>
                                                            {activity
                                                              .extendedDetails
                                                              .from && (
                                                              <span>
                                                                •
                                                              </span>
                                                            )}
                                                            <div className="flex items-center gap-1">
                                                              <span className="text-gray-400">
                                                                To:
                                                              </span>
                                                              <span className="font-medium">
                                                                {
                                                                  activity
                                                                    .extendedDetails
                                                                    .to[0]
                                                                }
                                                              </span>
                                                              {activity
                                                                .extendedDetails
                                                                .to
                                                                .length >
                                                                1 && (
                                                                <span className="text-gray-400">
                                                                  +
                                                                  {activity
                                                                    .extendedDetails
                                                                    .to
                                                                    .length -
                                                                    1}
                                                                </span>
                                                              )}
                                                            </div>
                                                          </>
                                                        )}
                                                    </div>
                                                  )}
                                                {activity.metadata &&
                                                  !activity.extendedDetails && (
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                      {
                                                        activity.metadata
                                                      }
                                                    </p>
                                                  )}
                                              </div>
                                              {/* Status Badge */}
                                              {activity.status && (
                                                <Badge
                                                  variant="outline"
                                                  className={cn(
                                                    "text-[10px] px-2 py-0.5 h-5 flex-shrink-0",
                                                    activity.status ===
                                                      "sent" &&
                                                      "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800",
                                                    activity.status ===
                                                      "delivered" &&
                                                      "bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-800",
                                                    activity.status ===
                                                      "failed" &&
                                                      "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-800",
                                                    activity.status ===
                                                      "opened" &&
                                                      "bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-800",
                                                  )}
                                                >
                                                  {activity.status
                                                    .charAt(0)
                                                    .toUpperCase() +
                                                    activity.status.slice(
                                                      1,
                                                    )}
                                                </Badge>
                                              )}
                                            </div>
                                          </div>

                                          {/* User Avatar */}
                                          <Avatar className="w-8 h-8 flex-shrink-0">
                                            <AvatarFallback className="bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-xs">
                                              {
                                                activity.userInitials
                                              }
                                            </AvatarFallback>
                                          </Avatar>
                                        </div>

                                        {/* Full Timestamp at bottom */}
                                        <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500 mt-2">
                                          <div className="flex items-center gap-1.5">
                                            <Clock className="w-3 h-3" />
                                            <span>
                                              {format(
                                                new Date(
                                                  activity.timestamp,
                                                ),
                                                "MMM d, yyyy • h:mm a",
                                              )}
                                            </span>
                                          </div>
                                          {activity.status ===
                                            "opened" &&
                                            activity.metadata && (
                                              <span className="text-gray-600 dark:text-gray-300 font-medium">
                                                {
                                                  activity.metadata
                                                }
                                              </span>
                                            )}
                                        </div>
                                      </Card>
                                    </div>
                                  );
                                },
                              )}
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Activity Details - Right Panel (60%) */}
            <div className="flex-1 bg-gray-50 dark:bg-gray-900 flex flex-col">
              {selectedActivityLog && selectedEmail ? (
                <>
                  {/* Email Header */}
                  <div className="border-b border-gray-200 dark:border-gray-700 p-6 bg-white dark:bg-gray-800 flex-shrink-0">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                            {selectedEmail.subject}
                          </h2>
                          {selectedEmail.isSecure && (
                            <Badge className="gap-1.5 px-2.5 py-1 bg-green-600 hover:bg-green-700 border-green-600">
                              <Shield className="w-3.5 h-3.5 text-white" />
                              <span className="text-xs font-medium text-white">
                                Secure
                              </span>
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-8 h-8">
                              <div
                                className="w-full h-full flex items-center justify-center text-white text-xs font-medium rounded-full"
                                style={{
                                  backgroundColor:
                                    "var(--primaryColor)",
                                }}
                              >
                                {selectedEmail.from.avatar ||
                                  selectedEmail.from.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                              </div>
                            </Avatar>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-gray-100">
                                {selectedEmail.from.name}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {selectedEmail.from.email}
                              </p>
                            </div>
                          </div>
                          <span>•</span>
                          <span>
                            {format(
                              new Date(selectedEmail.date),
                              "MMM d, yyyy · h:mm a",
                            )}
                          </span>
                        </div>

                        {selectedEmail.to &&
                          selectedEmail.to.length > 0 && (
                            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                              <span className="font-medium">
                                To:
                              </span>{" "}
                              {selectedEmail.to.join(", ")}
                            </div>
                          )}
                      </div>
                    </div>

                    {/* Activity Badge */}
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center",
                          getActivityIcon(
                            selectedActivityLog.type,
                          ).bgColor,
                          getActivityIcon(
                            selectedActivityLog.type,
                          ).textColor,
                        )}
                      >
                        {
                          getActivityIcon(
                            selectedActivityLog.type,
                          ).icon
                        }
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {selectedActivityLog.action}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatRelativeTime(
                            selectedActivityLog.timestamp,
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Email Body */}
                  <ScrollArea className="flex-1 p-6 bg-white dark:bg-gray-900">
                    <div className="prose dark:prose-invert max-w-none">
                      <div className="whitespace-pre-wrap text-gray-900 dark:text-gray-100">
                        {selectedEmail.body}
                      </div>

                      {/* Attachments */}
                      {selectedEmail.hasAttachments &&
                        selectedEmail.attachments &&
                        selectedEmail.attachments.length >
                          0 && (
                          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                              Attachments (
                              {selectedEmail.attachments.length}
                              )
                            </h3>
                            <div className="space-y-2">
                              {selectedEmail.attachments.map(
                                (attachment) => (
                                  <div
                                    key={attachment.id}
                                    className="relative p-3 flex items-center gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-sm transition-all group cursor-pointer hover:border-purple-300 dark:hover:border-purple-700"
                                    onClick={() => {
                                      toast.success(
                                        `Downloading ${attachment.name}`,
                                      );
                                    }}
                                  >
                                    {/* Thumbnail on left - shows on hover */}
                                    <div className="relative flex-shrink-0">
                                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded flex items-center justify-center">
                                        <Paperclip className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                      </div>
                                      {/* Thumbnail preview on hover */}
                                      <div className="absolute left-0 top-full mt-2 w-48 h-48 bg-white dark:bg-gray-800 border-2 border-purple-500 dark:border-purple-400 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 p-2">
                                        <div className="w-full h-full bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                                          <div className="text-center p-4">
                                            <FileText className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium break-all">
                                              {attachment.name}
                                            </p>
                                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                              {formatFileSize(
                                                attachment.size,
                                              )}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                        {attachment.name}
                                      </p>
                                      <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {formatFileSize(
                                          attachment.size,
                                        )}
                                      </p>
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="flex items-center gap-2 pointer-events-none"
                                    >
                                      <Download className="w-4 h-4" />
                                      <span className="text-sm">
                                        Download
                                      </span>
                                    </Button>
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  </ScrollArea>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center p-8">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-4">
                      <Activity className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Select an Activity Log
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                      Click on any activity from the timeline to
                      view the related email details
                    </p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Right - Email Content (only show when NOT in Activity Log mode) */}
        {!showActivityLog && (
          <div className="flex-1 bg-white dark:bg-gray-900 flex flex-col overflow-hidden">
            {isComposing ? (
              <InlineComposeEmail
                mode={composeMode}
                replyToEmail={replyToEmail}
                onClose={() => setIsComposing(false)}
                onComposeDataChange={(data) =>
                  setComposeData(data)
                }
              />
            ) : selectedEmail ? (
              <>
                {/* Email Header */}
                <div className="border-b border-gray-200 dark:border-gray-700 p-6 overflow-y-auto flex-shrink-0">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                          {selectedEmail.subject}
                        </h2>
                        {selectedEmail.isSecure && (
                          <Badge className="gap-1.5 px-2.5 py-1 bg-green-600 hover:bg-green-700 border-green-600">
                            <Shield className="w-3.5 h-3.5 text-white" />
                            <span className="text-xs font-medium text-white">
                              Secure
                            </span>
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-8 h-8">
                            <div
                              className="w-full h-full flex items-center justify-center text-white text-xs font-medium rounded-full"
                              style={{
                                backgroundColor:
                                  "var(--primaryColor)",
                              }}
                            >
                              {selectedEmail.from.avatar ||
                                selectedEmail.from.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                            </div>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              {selectedEmail.from.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {selectedEmail.from.email}
                            </p>
                          </div>
                        </div>
                        <span>•</span>
                        <span>
                          {format(
                            new Date(selectedEmail.date),
                            "MMM d, yyyy · h:mm a",
                          )}
                        </span>
                      </div>

                      {selectedEmail.to &&
                        selectedEmail.to.length > 0 && (
                          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-medium">
                              To:
                            </span>{" "}
                            {selectedEmail.to.join(", ")}
                          </div>
                        )}

                      {selectedEmail.status &&
                        selectedEmail.status !== "draft" && (
                          <div className="mt-2 flex items-center gap-2">
                            {selectedEmail.status ===
                              "delivered" && (
                              <Badge
                                variant="secondary"
                                className="gap-1 text-xs"
                              >
                                <Check className="w-3 h-3" />
                                Delivered
                              </Badge>
                            )}
                            {selectedEmail.status ===
                              "opened" && (
                              <Badge
                                variant="secondary"
                                className="gap-1 text-xs"
                              >
                                <Check className="w-3 h-3 text-green-600" />
                                Opened{" "}
                                {selectedEmail.openedAt &&
                                  `• ${formatDistanceToNow(new Date(selectedEmail.openedAt), { addSuffix: true })}`}
                              </Badge>
                            )}
                          </div>
                        )}

                      {/* Task Badge */}
                      {getTaskIdForEmail(selectedEmail.id) && (
                        <div className="mt-2 flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className="gap-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700"
                          >
                            <Check className="w-3 h-3" />
                            Task Created
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleViewTask(
                                getTaskIdForEmail(
                                  selectedEmail.id,
                                )!,
                              )
                            }
                            className="h-6 text-xs"
                          >
                            <ListTodo className="w-3 h-3 mr-1" />
                            View Task
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleStarEmail(selectedEmail.id)
                            }
                            className={cn(
                              selectedEmail.starred &&
                                "text-yellow-500",
                            )}
                          >
                            <Star
                              className={cn(
                                "w-4 h-4",
                                selectedEmail.starred &&
                                  "fill-yellow-500",
                              )}
                            />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {selectedEmail.starred
                            ? "Remove Star"
                            : "Star Email"}
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleFlagEmail(selectedEmail.id)
                            }
                            className={cn(
                              selectedEmail.flagged &&
                                "text-red-500",
                            )}
                          >
                            <Flag
                              className={cn(
                                "w-4 h-4",
                                selectedEmail.flagged &&
                                  "fill-red-500",
                              )}
                            />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {selectedEmail.flagged
                            ? "Remove Flag"
                            : "Flag Email"}
                        </TooltipContent>
                      </Tooltip>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="outline">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-56"
                        >
                          <DropdownMenuItem
                            onClick={() => {
                              setShowAssignProject(true);
                            }}
                          >
                            <Folder className="w-4 h-4 mr-2" />
                            Assign to Project
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              const taskId = getTaskIdForEmail(
                                selectedEmail.id,
                              );
                              if (taskId) {
                                handleViewTask(taskId);
                              } else {
                                setShowCreateTask(true);
                              }
                            }}
                          >
                            {getTaskIdForEmail(
                              selectedEmail.id,
                            ) ? (
                              <>
                                <ListTodo className="w-4 h-4 mr-2" />
                                View Task
                              </>
                            ) : (
                              <>
                                <CheckSquare className="w-4 h-4 mr-2" />
                                Add to Task
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setShowAddToCalendar(true);
                            }}
                          >
                            <CalendarIcon className="w-4 h-4 mr-2" />
                            Add to Calendar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setShowAISummary(true);
                            }}
                          >
                            <Sparkles className="w-4 h-4 mr-2" />
                            AI Summary
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              exportEmailAsPDF(selectedEmail);
                            }}
                          >
                            <FileDown className="w-4 h-4 mr-2" />
                            Export as PDF
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              handleMarkAsRead(
                                selectedEmail.id,
                                !selectedEmail.read,
                              )
                            }
                          >
                            <MailOpen className="w-4 h-4 mr-2" />
                            Mark as{" "}
                            {selectedEmail.read
                              ? "Unread"
                              : "Read"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleDeleteEmail(
                                selectedEmail.id,
                              )
                            }
                            className="text-red-600 dark:text-red-400"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReply(selectedEmail)}
                      className="gap-2"
                    >
                      <Reply className="w-4 h-4" />
                      Reply
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleReply(selectedEmail, true)
                      }
                      className="gap-2"
                    >
                      <ReplyAll className="w-4 h-4" />
                      Reply All
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleForward(selectedEmail)
                      }
                      className="gap-2"
                    >
                      <Forward className="w-4 h-4" />
                      Forward
                    </Button>

                    {/* Icon-based action menu */}
                    <div className="ml-2 pl-2 border-l border-gray-300 dark:border-gray-600 flex items-center gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              exportEmailAsPDF(selectedEmail)
                            }
                          >
                            <FileDown className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          Export as PDF
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setShowAssignProject(true)
                            }
                          >
                            <Folder className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          Assign to Project
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const taskId = getTaskIdForEmail(
                                selectedEmail.id,
                              );
                              if (taskId) {
                                handleViewTask(taskId);
                              } else {
                                setShowCreateTask(true);
                              }
                            }}
                          >
                            {getTaskIdForEmail(
                              selectedEmail.id,
                            ) ? (
                              <ListTodo className="w-4 h-4" />
                            ) : (
                              <CheckSquare className="w-4 h-4" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {getTaskIdForEmail(selectedEmail.id)
                            ? "View Task"
                            : "Add to Task"}
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setShowAddToCalendar(true)
                            }
                          >
                            <CalendarIcon className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          Add to Calendar
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setShowAISummary(true)
                            }
                          >
                            <Sparkles className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          AI Summary
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleMarkAsRead(
                                selectedEmail.id,
                                !selectedEmail.read,
                              )
                            }
                          >
                            <MailOpen className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          Mark as{" "}
                          {selectedEmail.read
                            ? "Unread"
                            : "Read"}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </div>

                {/* Email Body */}
                <ContextMenu>
                  <ContextMenuTrigger asChild>
                    <ScrollArea className="flex-1 p-6">
                      <div className="prose dark:prose-invert max-w-none">
                        <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 dark:text-gray-300">
                          {selectedEmail.body}
                        </pre>
                      </div>

                      {/* Attachments */}
                      {selectedEmail.hasAttachments &&
                        selectedEmail.attachments &&
                        selectedEmail.attachments.length >
                          0 && (
                          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                              Attachments (
                              {selectedEmail.attachments.length}
                              )
                            </h3>
                            <div className="space-y-2">
                              {selectedEmail.attachments.map(
                                (attachment) => (
                                  <div
                                    key={attachment.id}
                                    className="relative p-3 flex items-center gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-sm transition-all group cursor-pointer hover:border-purple-300 dark:hover:border-purple-700"
                                    onClick={() => {
                                      // Create a mock file blob for demonstration
                                      const blob = new Blob(
                                        [
                                          "Mock file content for " +
                                            attachment.name,
                                        ],
                                        {
                                          type:
                                            attachment.type ||
                                            "application/octet-stream",
                                        },
                                      );
                                      const url =
                                        URL.createObjectURL(
                                          blob,
                                        );
                                      const a =
                                        document.createElement(
                                          "a",
                                        );
                                      a.href = url;
                                      a.download =
                                        attachment.name;
                                      document.body.appendChild(
                                        a,
                                      );
                                      a.click();
                                      document.body.removeChild(
                                        a,
                                      );
                                      URL.revokeObjectURL(url);
                                      toast.success(
                                        `Downloaded ${attachment.name}`,
                                      );
                                    }}
                                  >
                                    {/* Thumbnail on left - shows on hover */}
                                    <div className="relative flex-shrink-0">
                                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded flex items-center justify-center">
                                        <Paperclip className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                      </div>
                                      {/* Thumbnail preview on hover */}
                                      <div className="absolute left-0 top-full mt-2 w-48 h-48 bg-white dark:bg-gray-800 border-2 border-purple-500 dark:border-purple-400 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 p-2">
                                        <div className="w-full h-full bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                                          <div className="text-center p-4">
                                            <FileText className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium break-all">
                                              {attachment.name}
                                            </p>
                                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                              {formatFileSize(
                                                attachment.size,
                                              )}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                        {attachment.name}
                                      </p>
                                      <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {formatFileSize(
                                          attachment.size,
                                        )}
                                      </p>
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="flex items-center gap-2 pointer-events-none"
                                    >
                                      <Download className="w-4 h-4" />
                                      <span className="text-sm">
                                        Download
                                      </span>
                                    </Button>
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        )}

                      {/* Activity Tracking - Show when in activity log mode */}
                      {showActivityLog && (
                        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                            <BarChart3 className="w-4 h-4" />
                            Email Activity Tracking
                          </h3>

                          <div className="space-y-3">
                            {/* Sent */}
                            {selectedEmail.sentAt && (
                              <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800">
                                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                  <Send className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                                    Email Sent
                                  </div>
                                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                                    {format(
                                      new Date(
                                        selectedEmail.sentAt,
                                      ),
                                      "MMM d, yyyy",
                                    )}{" "}
                                    |{" "}
                                    {format(
                                      new Date(
                                        selectedEmail.sentAt,
                                      ),
                                      "h:mm a",
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Delivered */}
                            {selectedEmail.deliveredAt && (
                              <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800">
                                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                                  <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                                </div>
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                                    Delivered
                                  </div>
                                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                                    {format(
                                      new Date(
                                        selectedEmail.deliveredAt,
                                      ),
                                      "MMM d, yyyy",
                                    )}{" "}
                                    |{" "}
                                    {format(
                                      new Date(
                                        selectedEmail.deliveredAt,
                                      ),
                                      "h:mm a",
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Opened */}
                            {selectedEmail.openedAt && (
                              <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800">
                                <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                                  <Eye className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                                    Email Opened
                                  </div>
                                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                                    {format(
                                      new Date(
                                        selectedEmail.openedAt,
                                      ),
                                      "MMM d, yyyy",
                                    )}{" "}
                                    |{" "}
                                    {format(
                                      new Date(
                                        selectedEmail.openedAt,
                                      ),
                                      "h:mm a",
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Clicked Links */}
                            {selectedEmail.clickedLinks &&
                              selectedEmail.clickedLinks
                                .length > 0 && (
                                <div className="flex items-start gap-3 p-3 rounded-lg bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800">
                                  <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                                    <MousePointerClick className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="font-medium text-gray-900 dark:text-gray-100 text-sm mb-2">
                                      Links Clicked (
                                      {
                                        selectedEmail
                                          .clickedLinks.length
                                      }
                                      )
                                    </div>
                                    <div className="space-y-2">
                                      {selectedEmail.clickedLinks.map(
                                        (link, idx) => (
                                          <div
                                            key={idx}
                                            className="flex items-start gap-2 text-xs"
                                          >
                                            <ExternalLink className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                              <div className="text-gray-700 dark:text-gray-300 truncate font-mono">
                                                {link.url}
                                              </div>
                                              <div className="text-gray-500 dark:text-gray-400 mt-0.5">
                                                {format(
                                                  new Date(
                                                    link.clickedAt,
                                                  ),
                                                  "MMM d, yyyy",
                                                )}{" "}
                                                |{" "}
                                                {format(
                                                  new Date(
                                                    link.clickedAt,
                                                  ),
                                                  "h:mm a",
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        ),
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                          </div>
                        </div>
                      )}
                    </ScrollArea>
                  </ContextMenuTrigger>
                  <ContextMenuContent className="w-56">
                    <ContextMenuItem
                      onClick={() => handleReply(selectedEmail)}
                    >
                      <Reply className="w-4 h-4 mr-2" />
                      Reply
                    </ContextMenuItem>
                    <ContextMenuItem
                      onClick={() =>
                        handleReply(selectedEmail, true)
                      }
                    >
                      <ReplyAll className="w-4 h-4 mr-2" />
                      Reply All
                    </ContextMenuItem>
                    <ContextMenuItem
                      onClick={() =>
                        handleForward(selectedEmail)
                      }
                    >
                      <Forward className="w-4 h-4 mr-2" />
                      Forward
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem
                      onClick={() =>
                        handleStarEmail(selectedEmail.id)
                      }
                    >
                      <Star
                        className={cn(
                          "w-4 h-4 mr-2",
                          selectedEmail.starred &&
                            "fill-yellow-500 text-yellow-500",
                        )}
                      />
                      {selectedEmail.starred
                        ? "Unstar"
                        : "Star"}
                    </ContextMenuItem>
                    <ContextMenuItem
                      onClick={() =>
                        handleFlagEmail(selectedEmail.id)
                      }
                    >
                      <Flag
                        className={cn(
                          "w-4 h-4 mr-2",
                          selectedEmail.flagged &&
                            "fill-red-500 text-red-500",
                        )}
                      />
                      {selectedEmail.flagged
                        ? "Unflag"
                        : "Flag"}
                    </ContextMenuItem>
                    <ContextMenuItem
                      onClick={() =>
                        handleMarkAsRead(
                          selectedEmail.id,
                          !selectedEmail.read,
                        )
                      }
                    >
                      <MailOpen className="w-4 h-4 mr-2" />
                      Mark as{" "}
                      {selectedEmail.read ? "Unread" : "Read"}
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem
                      onClick={() => setShowAssignProject(true)}
                    >
                      <Folder className="w-4 h-4 mr-2" />
                      Assign to Project
                    </ContextMenuItem>
                    <ContextMenuItem
                      onClick={() => {
                        const taskId = getTaskIdForEmail(
                          selectedEmail.id,
                        );
                        if (taskId) {
                          handleViewTask(taskId);
                        } else {
                          setShowCreateTask(true);
                        }
                      }}
                    >
                      {getTaskIdForEmail(selectedEmail.id) ? (
                        <>
                          <ListTodo className="w-4 h-4 mr-2" />
                          View Task
                        </>
                      ) : (
                        <>
                          <CheckSquare className="w-4 h-4 mr-2" />
                          Add to Task
                        </>
                      )}
                    </ContextMenuItem>
                    <ContextMenuItem
                      onClick={() => setShowAddToCalendar(true)}
                    >
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      Add to Calendar
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem
                      onClick={() => setShowAISummary(true)}
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      AI Summary
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem
                      onClick={() =>
                        exportEmailAsPDF(selectedEmail)
                      }
                    >
                      <FileDown className="w-4 h-4 mr-2" />
                      Export as PDF
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem
                      onClick={() =>
                        handleDeleteEmail(selectedEmail.id)
                      }
                      className="text-red-600 dark:text-red-400"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <Mail className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">
                    Select an email to read
                  </p>
                  <p className="text-sm mt-1">
                    Choose an email from the list to view its
                    contents
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <EmailSettingsDialog
        open={showSettings}
        onOpenChange={setShowSettings}
      />

      <AssignToProjectDialog
        open={showAssignProject}
        onOpenChange={setShowAssignProject}
        emailId={selectedEmail?.id || ""}
        clientId={selectedEmail?.clientId}
        clientName={selectedEmail?.clientName}
      />

      <CreateTaskFromEmailDialog
        open={showCreateTask}
        onOpenChange={setShowCreateTask}
        email={selectedEmail}
      />

      <AIEmailSummaryDialog
        open={showAISummary}
        onOpenChange={setShowAISummary}
        email={selectedEmail}
        onGenerateReply={() => {
          if (selectedEmail) {
            handleReply(selectedEmail);
          }
        }}
      />

      <AIGenerateEmailDialog
        open={showAIGenerate}
        onOpenChange={setShowAIGenerate}
      />

      <AddEmailToCalendarDialog
        open={showAddToCalendar}
        onClose={() => setShowAddToCalendar(false)}
        email={selectedEmail}
      />

      <SaveDraftConfirmationDialog
        open={showSaveDraftConfirmation}
        onOpenChange={setShowSaveDraftConfirmation}
        onSaveAndContinue={handleSaveDraftAndContinue}
        onDiscardAndContinue={handleDiscardAndContinue}
        onCancel={handleKeepComposing}
      />
    </div>
  );
}