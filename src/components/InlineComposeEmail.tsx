import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { Separator } from "./ui/separator";
import { ScrollArea } from "./ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { Calendar } from "./ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  X,
  Send,
  Shield,
  Users,
  Upload,
  Paperclip,
  FileText,
  ChevronDown,
  CalendarIcon,
  Clock,
  Sparkles,
  Building2,
  Tag,
  File,
  ImageIcon,
  Search,
  Link2,
} from "lucide-react";
import { cn } from "./ui/utils";
import { toast } from "sonner@2.0.3";
import { format } from "date-fns";
import { EmailRecipientSelector } from "./EmailRecipientSelector";
import { EmailFileManager } from "./EmailFileManager";
import { InlineEmailFileManager } from "./InlineEmailFileManager";
import { AIGenerateEmailDialog } from "./AIGenerateEmailDialog";

type InlineComposeEmailProps = {
  mode?: "new" | "reply" | "replyAll" | "forward";
  replyToEmail?: any;
  onClose: () => void;
  initialClientId?: string;
  initialClientName?: string;
  onGetComposeData?: () => {
    hasContent: boolean;
    data: {
      to: Recipient[];
      subject: string;
      body: string;
      attachments: Attachment[];
    };
  };
  onComposeDataChange?: (data: {
    to: Recipient[];
    subject: string;
    body: string;
    attachments: Attachment[];
  }) => void;
};

type Recipient = {
  type: "client" | "group" | "email";
  value: string;
  label: string;
};

type Attachment = {
  id: string;
  name: string;
  size: number;
  type: string;
  source: "upload" | "fileManager";
  isLink?: boolean;
};

export function InlineComposeEmail({
  mode = "new",
  replyToEmail,
  onClose,
  initialClientId,
  initialClientName,
  onGetComposeData,
  onComposeDataChange,
}: InlineComposeEmailProps) {
  const [to, setTo] = useState<Recipient[]>([]);
  const [cc, setCc] = useState<Recipient[]>([]);
  const [bcc, setBcc] = useState<Recipient[]>([]);
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isSecure, setIsSecure] = useState(false);
  const [useTemplate, setUseTemplate] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [schedule, setSchedule] = useState(false);
  const [scheduleDate, setScheduleDate] = useState<Date>();
  const [scheduleTime, setScheduleTime] = useState("09:00");
  const [attachments, setAttachments] = useState<Attachment[]>(
    [],
  );
  const [showRecipientSelector, setShowRecipientSelector] =
    useState(false);
  const [recipientType, setRecipientType] = useState<
    "to" | "cc" | "bcc"
  >("to");
  const [isMergeFieldsOpen, setIsMergeFieldsOpen] =
    useState(false);
  const [recipientSearchQuery, setRecipientSearchQuery] =
    useState("");
  const [
    recipientSelectionMethod,
    setRecipientSelectionMethod,
  ] = useState<"groups" | "individual">("groups");
  const [selectedRecipientGroups, setSelectedRecipientGroups] =
    useState<Set<string>>(new Set());
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const subjectRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const ccEmailInputRef = useRef<HTMLInputElement>(null);
  const bccEmailInputRef = useRef<HTMLInputElement>(null);
  const [ccEmailInput, setCcEmailInput] = useState("");
  const [bccEmailInput, setBccEmailInput] = useState("");
  const [showFileManager, setShowFileManager] = useState(false);
  const [isAIGenerateDialogOpen, setIsAIGenerateDialogOpen] =
    useState(false);
  const [templateSearchQuery, setTemplateSearchQuery] =
    useState("");

  // Merge field definitions with categories and colors
  const mergeFields = [
    {
      field: "{{client_name}}",
      label: "Client Name",
      category: "Client",
      color: "emerald",
    },
    {
      field: "{{client_email}}",
      label: "Client Email",
      category: "Client",
      color: "emerald",
    },
    {
      field: "{{client_phone}}",
      label: "Client Phone",
      category: "Client",
      color: "emerald",
    },
    {
      field: "{{firm_name}}",
      label: "Firm Name",
      category: "Company",
      color: "indigo",
    },
    {
      field: "{{firm_email}}",
      label: "Firm Email",
      category: "Company",
      color: "indigo",
    },
    {
      field: "{{firm_phone}}",
      label: "Firm Phone",
      category: "Company",
      color: "indigo",
    },
    {
      field: "{{sender_name}}",
      label: "Sender Name",
      category: "Company",
      color: "indigo",
    },
    {
      field: "{{sender_email}}",
      label: "Sender Email",
      category: "Company",
      color: "indigo",
    },
    {
      field: "{{current_date}}",
      label: "Current Date",
      category: "Date",
      color: "blue",
    },
    {
      field: "{{current_year}}",
      label: "Current Year",
      category: "Date",
      color: "blue",
    },
  ];

  // Mock templates
  const templates = [
    {
      id: "1",
      name: "Welcome New Client",
      category: "Client Onboarding",
    },
    {
      id: "2",
      name: "Client Portal Access",
      category: "Client Onboarding",
    },
    {
      id: "3",
      name: "Tax Deadline Reminder",
      category: "Tax Season",
    },
    {
      id: "4",
      name: "Tax Season Kickoff",
      category: "Tax Season",
    },
    {
      id: "5",
      name: "Document Request",
      category: "Document Management",
    },
    {
      id: "6",
      name: "Document Upload Confirmation",
      category: "Document Management",
    },
    {
      id: "7",
      name: "Appointment Confirmation",
      category: "Appointments",
    },
    {
      id: "8",
      name: "Appointment Reminder",
      category: "Appointments",
    },
    {
      id: "9",
      name: "Appointment Follow-up",
      category: "Appointments",
    },
    {
      id: "10",
      name: "Invoice Sent",
      category: "Billing & Payments",
    },
    {
      id: "11",
      name: "Payment Receipt",
      category: "Billing & Payments",
    },
    {
      id: "12",
      name: "Birthday Wishes",
      category: "Seasonal & Special",
    },
    {
      id: "13",
      name: "Holiday Greetings",
      category: "Seasonal & Special",
    },
    {
      id: "14",
      name: "General Check-in",
      category: "General Communication",
    },
    {
      id: "15",
      name: "Newsletter Update",
      category: "General Communication",
    },
    {
      id: "16",
      name: "Team Task Assignment",
      category: "Internal Team",
    },
  ];

  // Group templates by category
  const templatesByCategory = templates.reduce(
    (acc, template) => {
      if (!acc[template.category]) {
        acc[template.category] = [];
      }
      acc[template.category].push(template);
      return acc;
    },
    {} as Record<string, typeof templates>,
  );

  const templateCategories = [
    "Client Onboarding",
    "Tax Season",
    "Document Management",
    "Appointments",
    "Billing & Payments",
    "Seasonal & Special",
    "General Communication",
    "Internal Team",
  ];

  // Mock clients
  const clients = [
    {
      id: "1",
      name: "Troy Business Services LLC",
      email: "gokhan@troy.com",
      type: "Business",
      groups: ["g1", "g3"],
    },
    {
      id: "3",
      name: "Best Face Forward",
      email: "jamal@bestface.com",
      type: "Business",
      groups: ["g1"],
    },
    {
      id: "11",
      name: "John & Mary Smith",
      email: "john@smithfamily.com",
      type: "Individual",
      groups: ["g2"],
    },
    {
      id: "12",
      name: "Sarah Johnson",
      email: "sarah@example.com",
      type: "Individual",
      groups: ["g2"],
    },
    {
      id: "13",
      name: "Tech Innovators Inc",
      email: "contact@techinnovators.com",
      type: "Business",
      groups: ["g1", "g3"],
    },
  ];

  // Mock client groups with colors
  const clientGroups = [
    {
      id: "g1",
      name: "All Business Clients",
      count: 24,
      color: "blue" as const,
    },
    {
      id: "g2",
      name: "1040 Clients",
      count: 156,
      color: "green" as const,
    },
    {
      id: "g3",
      name: "Quarterly Filers",
      count: 45,
      color: "purple" as const,
    },
  ];

  useEffect(() => {
    // Initialize form based on mode
    if (mode === "new") {
      setTo([]);
      setSubject("");
      setBody("");
    } else if (mode === "reply" && replyToEmail) {
      setTo([
        {
          type: "email",
          value: replyToEmail.from.email,
          label: replyToEmail.from.name,
        },
      ]);
      setSubject(
        `Re: ${replyToEmail.subject.replace(/^Re: /, "")}`,
      );
      setBody(
        `\n\n---\nOn ${format(new Date(replyToEmail.date), "PPP")}, ${replyToEmail.from.name} wrote:\n\n${replyToEmail.body}`,
      );
    } else if (mode === "replyAll" && replyToEmail) {
      setTo([
        {
          type: "email",
          value: replyToEmail.from.email,
          label: replyToEmail.from.name,
        },
      ]);
      // Add CC recipients
      if (replyToEmail.cc && replyToEmail.cc.length > 0) {
        setCc(
          replyToEmail.cc.map((email: string) => ({
            type: "email" as const,
            value: email,
            label: email,
          })),
        );
        setShowCc(true);
      }
      setSubject(
        `Re: ${replyToEmail.subject.replace(/^Re: /, "")}`,
      );
      setBody(
        `\n\n---\nOn ${format(new Date(replyToEmail.date), "PPP")}, ${replyToEmail.from.name} wrote:\n\n${replyToEmail.body}`,
      );
    } else if (mode === "forward" && replyToEmail) {
      setSubject(
        `Fwd: ${replyToEmail.subject.replace(/^Fwd: /, "")}`,
      );
      setBody(
        `\n\n---\nForwarded message from ${replyToEmail.from.name}:\n\n${replyToEmail.body}`,
      );
      // Copy attachments
      if (replyToEmail.attachments) {
        setAttachments(
          replyToEmail.attachments.map((att: any) => ({
            ...att,
            source: "fileManager",
          })),
        );
      }
    }

    // Set initial client
    if (initialClientId && initialClientName) {
      const client = clients.find(
        (c) => c.id === initialClientId,
      );
      if (client) {
        setTo([
          {
            type: "client",
            value: client.id,
            label: client.name,
          },
        ]);
      }
    }

    // Auto-focus based on mode: body for reply/replyAll/forward, subject for new
    setTimeout(() => {
      if (mode === "new" && subjectRef.current) {
        subjectRef.current.focus();
      } else if (
        (mode === "reply" ||
          mode === "replyAll" ||
          mode === "forward") &&
        bodyRef.current
      ) {
        bodyRef.current.focus();
        // Move cursor to the beginning of the text area
        bodyRef.current.setSelectionRange(0, 0);
      }
    }, 100);
  }, [mode, replyToEmail, initialClientId, initialClientName]);

  // Auto-focus CC/BCC email input when shown
  useEffect(() => {
    if (showCc && ccEmailInputRef.current) {
      setTimeout(() => ccEmailInputRef.current?.focus(), 100);
    }
  }, [showCc]);

  useEffect(() => {
    if (showBcc && bccEmailInputRef.current) {
      setTimeout(() => bccEmailInputRef.current?.focus(), 100);
    }
  }, [showBcc]);

  // Expose compose data to parent
  useEffect(() => {
    if (onGetComposeData) {
      // Update parent with current compose state
      onGetComposeData();
    }
    if (onComposeDataChange) {
      onComposeDataChange({ to, subject, body, attachments });
    }
  }, [to, subject, body, attachments]);

  // Helper function to check if there's content in the compose form
  const hasComposeContent = () => {
    return (
      to.length > 0 ||
      subject.trim() !== "" ||
      body.trim() !== "" ||
      attachments.length > 0
    );
  };

  const handleSend = () => {
    if (to.length === 0) {
      toast.error("Please add at least one recipient");
      return;
    }
    if (!subject.trim()) {
      toast.error("Please enter a subject");
      return;
    }
    if (!body.trim()) {
      toast.error("Please enter a message");
      return;
    }

    if (schedule && !scheduleDate) {
      toast.error("Please select a date for scheduled email");
      return;
    }

    const prefix = "Email";

    toast.success(
      schedule
        ? `${prefix} scheduled for ${format(scheduleDate!, "PPP")} at ${scheduleTime}`
        : `${prefix} sent successfully`,
      {
        description: `To: ${to.map((r) => r.label).join(", ")}`,
      },
    );

    onClose();
  };

  const handleSendSecure = () => {
    if (to.length === 0) {
      toast.error("Please add at least one recipient");
      return;
    }
    if (!subject.trim()) {
      toast.error("Please enter a subject");
      return;
    }
    if (!body.trim()) {
      toast.error("Please enter a message");
      return;
    }

    if (schedule && !scheduleDate) {
      toast.error("Please select a date for scheduled email");
      return;
    }

    // Check if all recipients have phone numbers
    const missingPhone = to.some((recipient) => {
      if (recipient.type === "client") {
        const client = clients.find(
          (c) => c.id === recipient.value,
        );
        // In real app, check if client has phone
        return false; // Mock: all have phone
      }
      return false;
    });

    if (missingPhone) {
      toast.error(
        "Some recipients don't have phone numbers on file. Secure email requires SMS verification.",
      );
      return;
    }

    const prefix = "Secure email";

    toast.success(
      schedule
        ? `${prefix} scheduled for ${format(scheduleDate!, "PPP")} at ${scheduleTime}`
        : `${prefix} sent successfully`,
      {
        description: `To: ${to.map((r) => r.label).join(", ")}`,
      },
    );

    onClose();
  };

  const handleSaveDraft = () => {
    toast.success("Draft saved");
    onClose();
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = e.target.files;
    if (!files) return;

    const newAttachments: Attachment[] = [];
    const maxSize = 20 * 1024 * 1024; // 20MB

    Array.from(files).forEach((file) => {
      if (file.size > maxSize) {
        toast.error(`${file.name} exceeds 20MB limit`);
        return;
      }

      newAttachments.push({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        source: "upload",
      });
    });

    setAttachments([...attachments, ...newAttachments]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments(attachments.filter((a) => a.id !== id));
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

  const addRecipient = (
    type: "to" | "cc" | "bcc",
    recipient: Recipient,
  ) => {
    if (type === "to") {
      setTo([...to, recipient]);
    } else if (type === "cc") {
      setCc([...cc, recipient]);
    } else {
      setBcc([...bcc, recipient]);
    }
  };

  const removeRecipient = (
    type: "to" | "cc" | "bcc",
    index: number,
  ) => {
    if (type === "to") {
      setTo(to.filter((_, i) => i !== index));
    } else if (type === "cc") {
      setCc(cc.filter((_, i) => i !== index));
    } else {
      setBcc(bcc.filter((_, i) => i !== index));
    }
  };

  const getRecipientIcon = (type: string) => {
    switch (type) {
      case "client":
        return <Building2 className="w-3 h-3" />;
      case "group":
        return <Users className="w-3 h-3" />;
      default:
        return null;
    }
  };

  // Handle adding email from textbox
  const handleAddEmailRecipient = (
    type: "cc" | "bcc",
    email: string,
  ) => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) return;

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    const recipient: Recipient = {
      type: "email",
      value: trimmedEmail,
      label: trimmedEmail,
    };

    if (type === "cc") {
      setCc([...cc, recipient]);
      setCcEmailInput("");
    } else {
      setBcc([...bcc, recipient]);
      setBccEmailInput("");
    }
  };

  // Insert merge field at cursor position
  const insertMergeField = (
    field: string,
    target: "subject" | "body",
  ) => {
    const ref = target === "subject" ? subjectRef : bodyRef;
    if (!ref.current) return;

    const start = ref.current.selectionStart || 0;
    const end = ref.current.selectionEnd || 0;
    const currentValue = target === "subject" ? subject : body;

    const newValue =
      currentValue.substring(0, start) +
      field +
      currentValue.substring(end);

    if (target === "subject") {
      setSubject(newValue);
    } else {
      setBody(newValue);
    }

    // Set cursor position after the inserted field
    setTimeout(() => {
      if (ref.current) {
        ref.current.focus();
        ref.current.setSelectionRange(
          start + field.length,
          start + field.length,
        );
      }
    }, 0);
  };

  const getColorClasses = (color: string) => {
    const colors: Record<
      string,
      {
        bg: string;
        border: string;
        text: string;
        hover: string;
      }
    > = {
      emerald: {
        bg: "bg-emerald-50 dark:bg-emerald-900/20",
        border: "border-emerald-300 dark:border-emerald-700",
        text: "text-emerald-800 dark:text-emerald-200",
        hover:
          "hover:bg-emerald-100 dark:hover:bg-emerald-900/30",
      },
      purple: {
        bg: "bg-purple-50 dark:bg-purple-900/20",
        border: "border-purple-300 dark:border-purple-700",
        text: "text-purple-800 dark:text-purple-200",
        hover:
          "hover:bg-purple-100 dark:hover:bg-purple-900/30",
      },
      blue: {
        bg: "bg-blue-50 dark:bg-blue-900/20",
        border: "border-blue-300 dark:border-blue-700",
        text: "text-blue-800 dark:text-blue-200",
        hover: "hover:bg-blue-100 dark:hover:bg-blue-900/30",
      },
      amber: {
        bg: "bg-amber-50 dark:bg-amber-900/20",
        border: "border-amber-300 dark:border-amber-700",
        text: "text-amber-800 dark:text-amber-200",
        hover: "hover:bg-amber-100 dark:hover:bg-amber-900/30",
      },
      indigo: {
        bg: "bg-indigo-50 dark:bg-indigo-900/20",
        border: "border-indigo-300 dark:border-indigo-700",
        text: "text-indigo-800 dark:text-indigo-200",
        hover:
          "hover:bg-indigo-100 dark:hover:bg-indigo-900/30",
      },
    };
    return colors[color] || colors.blue;
  };

  return (
    <>
      {showFileManager ? (
        <InlineEmailFileManager
          onBack={() => setShowFileManager(false)}
          onSelectDocuments={(docs) => {
            const newAttachments: Attachment[] = docs.map(
              ({ doc, asLink }) => ({
                id: doc.id,
                name: doc.name,
                size: doc.size,
                type: doc.type,
                source: "fileManager",
                isLink: asLink,
              }),
            );
            setAttachments([...attachments, ...newAttachments]);
            setShowFileManager(false);
          }}
          recipientClientIds={to
            .filter((r) => r.type === "client")
            .map((r) => r.value)}
          onAddRecipient={(
            clientId,
            clientName,
            clientEmail,
          ) => {
            // Add client to "To" field
            setTo([
              ...to,
              {
                type: "client",
                value: clientId,
                label: clientName,
              },
            ]);
            toast.success(`${clientName} added to recipients`);
          }}
        />
      ) : (
        <div className="h-full flex flex-col bg-white dark:bg-gray-900">
          {/* Header */}
          <div className="border-b border-gray-200 dark:border-gray-700 p-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Send
                  className="w-5 h-5"
                  style={{ color: "var(--primaryColor)" }}
                />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {mode === "new" && "Compose Email"}
                  {mode === "reply" && "Reply"}
                  {mode === "replyAll" && "Reply All"}
                  {mode === "forward" && "Forward"}
                </h2>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={onClose}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Form Content */}
          <ScrollArea className="flex-1 overflow-y-auto">
            <div className="space-y-4 p-4">
              {/* Recipients */}
              <div className="space-y-3">
                {/* TO Recipients - Inline Layout */}
                <div className="flex items-start gap-3">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100 pt-1.5 min-w-[30px]">
                    To
                  </span>
                  <div className="flex-1 flex flex-wrap items-center gap-2">
                    {to.map((recipient, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="gap-1 pl-2 pr-1"
                      >
                        {getRecipientIcon(recipient.type)}
                        <span>{recipient.label}</span>
                        <button
                          onClick={() =>
                            removeRecipient("to", index)
                          }
                          className="ml-1 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setRecipientType("to");
                        setShowRecipientSelector(true);
                      }}
                      className="gap-2"
                    >
                      <Users className="w-4 h-4" />
                      Add Recipients
                    </Button>
                    {!showCc && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowCc(true)}
                      >
                        Cc
                      </Button>
                    )}
                    {!showBcc && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowBcc(true)}
                      >
                        Bcc
                      </Button>
                    )}
                  </div>
                </div>

                {/* CC Recipients - Inline Layout */}
                {showCc && (
                  <div className="flex items-start gap-3">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100 pt-1.5 min-w-[30px]">
                      Cc
                    </span>
                    <div className="flex-1 flex flex-wrap items-center gap-2">
                      {cc.map((recipient, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="gap-1 pl-2 pr-1"
                        >
                          {getRecipientIcon(recipient.type)}
                          <span>{recipient.label}</span>
                          <button
                            onClick={() =>
                              removeRecipient("cc", index)
                            }
                            className="ml-1 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setRecipientType("cc");
                          setShowRecipientSelector(true);
                        }}
                        className="gap-2"
                      >
                        <Users className="w-4 h-4" />
                        Add from Clients
                      </Button>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        or
                      </span>
                      <Input
                        ref={ccEmailInputRef}
                        type="email"
                        placeholder="Enter email address..."
                        value={ccEmailInput}
                        onChange={(e) =>
                          setCcEmailInput(e.target.value)
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddEmailRecipient(
                              "cc",
                              ccEmailInput,
                            );
                          }
                        }}
                        className="flex-1 h-9"
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={() =>
                          handleAddEmailRecipient(
                            "cc",
                            ccEmailInput,
                          )
                        }
                        disabled={!ccEmailInput.trim()}
                      >
                        Add
                      </Button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowCc(false);
                          setCc([]);
                          setCcEmailInput("");
                        }}
                        className="text-xs text-gray-500 hover:text-red-600 flex items-center gap-1 px-2"
                      >
                        <X className="w-3 h-3" />
                        Remove
                      </button>
                    </div>
                  </div>
                )}

                {/* BCC Recipients - Inline Layout */}
                {showBcc && (
                  <div className="flex items-start gap-3">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100 pt-1.5 min-w-[30px]">
                      Bcc
                    </span>
                    <div className="flex-1 flex flex-wrap items-center gap-2">
                      {bcc.map((recipient, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="gap-1 pl-2 pr-1"
                        >
                          {getRecipientIcon(recipient.type)}
                          <span>{recipient.label}</span>
                          <button
                            onClick={() =>
                              removeRecipient("bcc", index)
                            }
                            className="ml-1 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setRecipientType("bcc");
                          setShowRecipientSelector(true);
                        }}
                        className="gap-2"
                      >
                        <Users className="w-4 h-4" />
                        Add from Clients
                      </Button>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        or
                      </span>
                      <Input
                        ref={bccEmailInputRef}
                        type="email"
                        placeholder="Enter email address..."
                        value={bccEmailInput}
                        onChange={(e) =>
                          setBccEmailInput(e.target.value)
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddEmailRecipient(
                              "bcc",
                              bccEmailInput,
                            );
                          }
                        }}
                        className="flex-1 h-9"
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={() =>
                          handleAddEmailRecipient(
                            "bcc",
                            bccEmailInput,
                          )
                        }
                        disabled={!bccEmailInput.trim()}
                      >
                        Add
                      </Button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowBcc(false);
                          setBcc([]);
                          setBccEmailInput("");
                        }}
                        className="text-xs text-gray-500 hover:text-red-600 flex items-center gap-1 px-2"
                      >
                        <X className="w-3 h-3" />
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Subject */}
              <div>
                <Label
                  htmlFor="subject"
                  className="text-sm font-medium mb-2 block"
                >
                  Subject
                </Label>
                <Input
                  id="subject"
                  placeholder="Email subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  ref={subjectRef}
                />
              </div>

              {/* Attachments */}
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Attachments
                </Label>

                {attachments.length > 0 && (
                  <div className="space-y-2 mb-2">
                    {attachments.map((attachment) => (
                      <Card
                        key={attachment.id}
                        className={cn(
                          "p-3",
                          attachment.isLink
                            ? "border-blue-200 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-900/20"
                            : "border-purple-200 dark:border-purple-700 bg-purple-50/50 dark:bg-purple-900/20",
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                              attachment.isLink
                                ? "bg-blue-100 dark:bg-blue-900/40"
                                : "bg-purple-100 dark:bg-purple-900/40",
                            )}
                          >
                            {attachment.isLink ? (
                              <Link2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            ) : attachment.type.startsWith(
                                "image/",
                              ) ? (
                              <ImageIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            ) : (
                              <Paperclip className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                {attachment.name}
                              </p>
                              <Badge
                                variant="secondary"
                                className={cn(
                                  "text-xs flex-shrink-0",
                                  attachment.isLink
                                    ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-600"
                                    : "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-600",
                                )}
                              >
                                {attachment.isLink
                                  ? "Secure Link"
                                  : "Attached"}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {formatFileSize(attachment.size)}
                              {attachment.source ===
                                "fileManager" &&
                                " • From File Manager"}
                              {attachment.isLink &&
                                " • Recipients can download via secure link"}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              handleRemoveAttachment(
                                attachment.id,
                              )
                            }
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    className="gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Files
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setShowFileManager(true)}
                    className="gap-2"
                  >
                    <Paperclip className="w-4 h-4" />
                    From File Manager
                  </Button>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Maximum file size: 20 MB per attachment
                </p>
              </div>

              {/* Message Body - Much Larger */}
              <div className="flex-1 flex flex-col min-h-[400px]">
                <div className="flex items-center justify-between mb-2">
                  <Label
                    htmlFor="body"
                    className="text-sm font-medium"
                  >
                    Message
                  </Label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-shrink-0">
                      <Select
                        value={selectedTemplate}
                        onValueChange={setSelectedTemplate}
                      >
                        <SelectTrigger className="w-[280px] h-9">
                          <SelectValue placeholder="Select Email Template" />
                        </SelectTrigger>
                        <SelectContent>
                          <div className="px-2 pb-2 sticky top-0 bg-white dark:bg-gray-950 z-10">
                            <div className="relative">
                              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                              <Input
                                placeholder="Search templates..."
                                value={templateSearchQuery}
                                onChange={(e) =>
                                  setTemplateSearchQuery(
                                    e.target.value,
                                  )
                                }
                                className="pl-8 h-8 text-sm"
                                onClick={(e) =>
                                  e.stopPropagation()
                                }
                              />
                            </div>
                          </div>
                          {templateCategories.map(
                            (category) => {
                              const filteredTemplates =
                                templatesByCategory[
                                  category
                                ].filter(
                                  (template) =>
                                    template.name
                                      .toLowerCase()
                                      .includes(
                                        templateSearchQuery.toLowerCase(),
                                      ) ||
                                    category
                                      .toLowerCase()
                                      .includes(
                                        templateSearchQuery.toLowerCase(),
                                      ),
                                );

                              if (
                                filteredTemplates.length === 0
                              )
                                return null;

                              return (
                                <div key={category}>
                                  <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 px-3 py-1 bg-gray-100 dark:bg-gray-800">
                                    {category}
                                  </div>
                                  {filteredTemplates.map(
                                    (template) => (
                                      <SelectItem
                                        key={template.id}
                                        value={template.id}
                                      >
                                        <div className="flex items-center gap-2">
                                          <FileText className="w-4 h-4" />
                                          <span>
                                            {template.name}
                                          </span>
                                        </div>
                                      </SelectItem>
                                    ),
                                  )}
                                </div>
                              );
                            },
                          )}
                        </SelectContent>
                      </Select>
                      {selectedTemplate && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTemplate("");
                            toast.success("Template cleared");
                          }}
                          className="absolute right-8 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors z-10"
                        >
                          <X className="w-3.5 h-3.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300" />
                        </button>
                      )}
                    </div>
                    <div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="gap-2 bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700 dark:bg-purple-900/20 dark:hover:bg-purple-900/30 dark:border-purple-800 dark:text-purple-300"
                        onClick={() => {
                          setIsAIGenerateDialogOpen(true);
                        }}
                      >
                        <Sparkles className="w-4 h-4" />
                        AI Generate
                      </Button>
                    </div>
                  </div>
                </div>
                <Textarea
                  id="body"
                  placeholder="Type your message..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={24}
                  className="font-sans resize-none flex-1"
                  ref={bodyRef}
                />
              </div>

              {/* Merge Fields & Schedule Email - Two Column Layout */}
              <div className="grid grid-cols-2 gap-4">
                {/* Merge Fields - Left Column (expands to full width when open, hidden when schedule open) */}
                {!isScheduleOpen && (
                  <div
                    className={`border-2 rounded-xl shadow-sm overflow-hidden ${isMergeFieldsOpen ? "col-span-2" : ""}`}
                    style={{
                      borderColor: "var(--primaryColorLight)",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setIsMergeFieldsOpen(
                          !isMergeFieldsOpen,
                        );
                      }}
                      className="w-full p-4 transition-all"
                      style={{
                        background: `linear-gradient(to bottom right, ${isMergeFieldsOpen ? "var(--primaryColorLight)" : "var(--primaryColorLight)"}20, ${isMergeFieldsOpen ? "var(--primaryColorLight)" : "var(--primaryColorLight)"}10)`,
                      }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex gap-2 items-center">
                          <Sparkles
                            className="w-5 h-5 flex-shrink-0"
                            style={{
                              color: "var(--primaryColor)",
                            }}
                          />
                          <div className="text-left">
                            <div className="font-semibold text-gray-900 dark:text-gray-100">
                              Merge Fields
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                              {isMergeFieldsOpen
                                ? "Click to insert"
                                : "Personalization fields"}
                            </p>
                          </div>
                        </div>
                        <ChevronDown
                          className={`w-5 h-5 flex-shrink-0 transition-transform ${
                            isMergeFieldsOpen
                              ? "rotate-180"
                              : ""
                          }`}
                          style={{
                            color: "var(--primaryColor)",
                          }}
                        />
                      </div>
                    </button>

                    {isMergeFieldsOpen && (
                      <div
                        className="p-4 pt-0 border-t"
                        style={{
                          borderColor:
                            "var(--primaryColorLight)",
                        }}
                      >
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              {
                                field: "{{client_name}}",
                                label: "Client Name",
                                category: "Client",
                              },
                              {
                                field: "{{client_email}}",
                                label: "Client Email",
                                category: "Client",
                              },
                              {
                                field: "{{client_phone}}",
                                label: "Client Phone",
                                category: "Client",
                              },
                              {
                                field: "{{client_company}}",
                                label: "Company Name",
                                category: "Client",
                              },
                              {
                                field: "{{firm_name}}",
                                label: "Firm Name",
                                category: "Firm",
                              },
                              {
                                field: "{{sender_name}}",
                                label: "Your Name",
                                category: "Firm",
                              },
                              {
                                field: "{{sender_title}}",
                                label: "Your Title",
                                category: "Firm",
                              },
                              {
                                field: "{{sender_email}}",
                                label: "Your Email",
                                category: "Firm",
                              },
                              {
                                field: "{{current_year}}",
                                label: "Current Year",
                                category: "General",
                              },
                              {
                                field: "{{current_date}}",
                                label: "Current Date",
                                category: "General",
                              },
                              {
                                field: "{{tax_year}}",
                                label: "Tax Year",
                                category: "Tax",
                              },
                              {
                                field: "{{deadline}}",
                                label: "Filing Deadline",
                                category: "Tax",
                              },
                            ].map(
                              ({ field, label, category }) => {
                                // Category-based styling
                                const categoryStyles = {
                                  Client: {
                                    border:
                                      "border-blue-200 dark:border-blue-800",
                                    hoverBorder:
                                      "hover:border-blue-400 dark:hover:border-blue-600",
                                    hoverBg:
                                      "hover:bg-blue-50 dark:hover:bg-blue-900/30",
                                    icon: "text-blue-400 group-hover:text-blue-600 dark:group-hover:text-blue-400",
                                    badge:
                                      "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300",
                                  },
                                  Firm: {
                                    border:
                                      "border-purple-200 dark:border-purple-800",
                                    hoverBorder:
                                      "hover:border-purple-400 dark:hover:border-purple-600",
                                    hoverBg:
                                      "hover:bg-purple-50 dark:hover:bg-purple-900/30",
                                    icon: "text-purple-400 group-hover:text-purple-600 dark:group-hover:text-purple-400",
                                    badge:
                                      "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300",
                                  },
                                  General: {
                                    border:
                                      "border-green-200 dark:border-green-800",
                                    hoverBorder:
                                      "hover:border-green-400 dark:hover:border-green-600",
                                    hoverBg:
                                      "hover:bg-green-50 dark:hover:bg-green-900/30",
                                    icon: "text-green-400 group-hover:text-green-600 dark:group-hover:text-green-400",
                                    badge:
                                      "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300",
                                  },
                                  Tax: {
                                    border:
                                      "border-orange-200 dark:border-orange-800",
                                    hoverBorder:
                                      "hover:border-orange-400 dark:hover:border-orange-600",
                                    hoverBg:
                                      "hover:bg-orange-50 dark:hover:bg-orange-900/30",
                                    icon: "text-orange-400 group-hover:text-orange-600 dark:group-hover:text-orange-400",
                                    badge:
                                      "bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300",
                                  },
                                };

                                const styles =
                                  categoryStyles[
                                    category as keyof typeof categoryStyles
                                  ];

                                return (
                                  <button
                                    key={field}
                                    type="button"
                                    onClick={() =>
                                      insertMergeField(
                                        field,
                                        "body",
                                      )
                                    }
                                    className={`text-left p-2 rounded-lg border ${styles.border} ${styles.hoverBorder} ${styles.hoverBg} transition-all group`}
                                  >
                                    <div className="flex items-start gap-2">
                                      <Tag
                                        className={`w-3.5 h-3.5 mt-0.5 ${styles.icon}`}
                                      />
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5 mb-0.5">
                                          <div className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                                            {label}
                                          </div>
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 font-mono truncate">
                                          {field}
                                        </div>
                                        <div
                                          className={`text-xs px-1.5 py-0.5 rounded mt-1 inline-block ${styles.badge}`}
                                        >
                                          {category}
                                        </div>
                                      </div>
                                    </div>
                                  </button>
                                );
                              },
                            )}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 pt-4 border-t border-gray-300 dark:border-gray-600">
                            <strong>Tip:</strong> Click in the
                            Subject or Message field where you
                            want to insert a merge field, then
                            click the field button above.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Schedule Email - Right Column (expands to full width when open, hidden when merge fields open) */}
                {!isMergeFieldsOpen && (
                  <div
                    className={`border-2 rounded-xl shadow-sm overflow-hidden border-blue-200 dark:border-blue-800 ${isScheduleOpen ? "col-span-2" : ""}`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setIsScheduleOpen(!isScheduleOpen);
                        if (!isScheduleOpen) {
                          setSchedule(true);
                        }
                      }}
                      className="w-full p-4 transition-all bg-gradient-to-br from-blue-50/50 to-blue-50/20 dark:from-blue-900/10 dark:to-blue-900/5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex gap-2 items-center">
                          <CalendarIcon className="w-5 h-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                          <div className="text-left">
                            <div className="font-semibold text-gray-900 dark:text-gray-100">
                              Schedule Email
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                              {isScheduleOpen
                                ? "Set date and time"
                                : "Send later"}
                            </p>
                          </div>
                        </div>
                        <ChevronDown
                          className={`w-5 h-5 flex-shrink-0 transition-transform text-blue-600 dark:text-blue-400 ${
                            isScheduleOpen ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                    </button>

                    {isScheduleOpen && (
                      <div className="border-t-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50/50 to-blue-50/20 dark:from-blue-900/10 dark:to-blue-900/5">
                        <div className="p-5">
                          <div className="space-y-4">
                            <div>
                              <Label className="text-sm font-medium mb-2 block">
                                Date
                              </Label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className="w-full justify-start gap-2"
                                  >
                                    <CalendarIcon className="w-4 h-4" />
                                    {scheduleDate
                                      ? format(
                                          scheduleDate,
                                          "PPP",
                                        )
                                      : "Pick a date"}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-auto p-0"
                                  align="start"
                                >
                                  <Calendar
                                    mode="single"
                                    selected={scheduleDate}
                                    onSelect={setScheduleDate}
                                    disabled={(date) =>
                                      date < new Date()
                                    }
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>
                            <div>
                              <Label className="text-sm font-medium mb-2 block">
                                Time
                              </Label>
                              <div className="relative">
                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                  type="time"
                                  value={scheduleTime}
                                  onChange={(e) =>
                                    setScheduleTime(
                                      e.target.value,
                                    )
                                  }
                                  className="pl-9"
                                />
                              </div>
                            </div>
                            <div className="flex items-center justify-between pt-2">
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                Email will be sent at the
                                scheduled time
                              </p>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setIsScheduleOpen(false);
                                  setSchedule(false);
                                  setScheduleDate(undefined);
                                  setScheduleTime("09:00");
                                }}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                              >
                                Clear
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>

          {/* Actions */}
          <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={handleSaveDraft}
                className="gap-2"
              >
                <FileText className="w-4 h-4" />
                Save Draft
              </Button>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSendSecure}
                  className="gap-2 bg-green-600 hover:bg-green-700 text-white border-green-600"
                >
                  <Shield className="w-4 h-4" />
                  {schedule
                    ? "Schedule Secure Email"
                    : "Send Secure Email"}
                </Button>
                <Button
                  onClick={handleSend}
                  style={{
                    backgroundColor: "var(--primaryColor)",
                  }}
                  className="gap-2"
                >
                  <Send className="w-4 h-4" />
                  {schedule ? "Schedule Email" : "Send Email"}
                </Button>
              </div>
            </div>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* Recipient Selector */}
          {showRecipientSelector && (
            <EmailRecipientSelector
              onClose={() => setShowRecipientSelector(false)}
              onSelectRecipients={(recipients) => {
                recipients.forEach((recipient) => {
                  addRecipient(recipientType, recipient);
                });
              }}
            />
          )}
        </div>
      )}
      {isAIGenerateDialogOpen && (
        <AIGenerateEmailDialog
          open={isAIGenerateDialogOpen}
          onOpenChange={setIsAIGenerateDialogOpen}
          onUseGenerated={(generatedSubject, generatedBody) => {
            setSubject(generatedSubject);
            setBody(generatedBody);
            setIsAIGenerateDialogOpen(false);
          }}
        />
      )}
    </>
  );
}