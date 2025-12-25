import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  User,
  Users,
  MoreVertical,
  Plus,
  StickyNote,
  Search,
  List,
  Grid3x3,
  Edit,
  Mail,
  MessageSquare,
  UserPlus,
  Calendar,
  CreditCard,
  Key,
  Trash2,
  Phone,
  FileEdit,
  MoreHorizontal,
  Download,
  Upload,
  Filter,
  Zap,
  Tag,
  Table2,
  CheckCheck,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MessagesSquare,
  FileSignature,
  FolderOpen,
  Check,
  Briefcase,
  Video,
  ReceiptText,
  LogIn,
  ChevronDown,
} from "lucide-react";
import { Client, FolderTab, ViewType } from "../App";
import { cn } from "./ui/utils";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { CheckSquare } from "lucide-react";
import {
  ClientGroupsDialog,
  defaultClientGroups,
  ClientGroup,
} from "./ClientGroupsDialog";
import { AddQuickClientDialog } from "./AddQuickClientDialog";
import { AssignToDialog } from "./dialogs/AssignToDialog";
import { CreateFoldersDialog } from "./dialogs/CreateFoldersDialog";
import { CreateProjectDialog } from "./dialogs/CreateProjectDialog";
import { InviteToMeetingDialog } from "./dialogs/InviteToMeetingDialog";
import { SendLoginDialog } from "./dialogs/SendLoginDialog";
import { BulkDeleteDialog } from "./dialogs/BulkDeleteDialog";

type SortField = "name" | "type" | "assignedTo" | "createdDate";
type SortDirection = "asc" | "desc";

type ClientListProps = {
  clients: Client[];
  selectedClient: Client | null;
  onSelectClient: (client: Client) => void;
  activeTab: FolderTab;
  communicationSubTab?:
    | "internal"
    | "external"
    | "texting"
    | "email"
    | "callback-history";
  showFilters: boolean;
  onToggleFilters: () => void;
  viewType: ViewType;
  onViewTypeChange: (viewType: ViewType) => void;
  onUpdateClient: (
    clientId: string,
    updates: Partial<Client>,
  ) => void;
};

export function ClientList({
  clients,
  selectedClient,
  onSelectClient,
  activeTab,
  communicationSubTab,
  showFilters,
  onToggleFilters,
  viewType,
  onViewTypeChange,
  onUpdateClient,
}: ClientListProps) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<
    "All" | "Individual" | "Business" | "Missing Info"
  >("All");
  const [expandedClientId, setExpandedClientId] = useState<
    string | null
  >(null);
  const [selectedClientIds, setSelectedClientIds] = useState<
    Set<string>
  >(new Set());
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] =
    useState<SortDirection>("asc");
  const [showGroupsDialog, setShowGroupsDialog] =
    useState(false);
  const [clientGroups, setClientGroups] = useState<
    ClientGroup[]
  >(defaultClientGroups);
  const [addingGroupToClient, setAddingGroupToClient] =
    useState<string | null>(null);
  const [showQuickAddDialog, setShowQuickAddDialog] =
    useState(false);

  // Bulk action dialogs
  const [showAssignToDialog, setShowAssignToDialog] =
    useState(false);
  const [showCreateFoldersDialog, setShowCreateFoldersDialog] =
    useState(false);
  const [showCreateProjectDialog, setShowCreateProjectDialog] =
    useState(false);
  const [
    showInviteToMeetingDialog,
    setShowInviteToMeetingDialog,
  ] = useState(false);
  const [showSendLoginDialog, setShowSendLoginDialog] =
    useState(false);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] =
    useState(false);

  // Resizable columns
  const [columnWidths, setColumnWidths] = useState({
    client: 220,
    contact: 160,
    assignedTo: 140,
    created: 110,
    tags: 140,
  });
  const [resizing, setResizing] = useState<string | null>(null);

  // Helper function to format time (hours ago if < 24 hours, otherwise date and time)
  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 24) {
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        return diffMinutes <= 1
          ? "Just now"
          : `${diffMinutes}m ago`;
      }
      return `${diffHours}h ago`;
    }

    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Helper function to get contextual info based on active tab and communication sub-tab
  const getContextualInfo = (
    client: Client,
    tab: FolderTab,
    commSubTab?: string,
  ) => {
    // Mock data - in real app, this would come from API/state
    const mockData: Record<string, any> = {
      Snapshot: {
        email: client.email,
        phone: client.phone,
      },
      Demographics: {
        email: client.email,
        phone: client.phone,
      },
      Teams: {
        teamMembers: Math.floor(Math.random() * 5) + 1,
        assignedTo: client.assignedTo,
      },
      Communication: (() => {
        // Generate different data based on communication sub-tab
        const baseTime = new Date(
          Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000,
        );

        switch (commSubTab) {
          case "internal":
            return {
              unreadCount: Math.floor(Math.random() * 5),
              lastPoster: [
                "Sarah J.",
                "Mike B.",
                "Emily D.",
                "Alex K.",
              ][Math.floor(Math.random() * 4)],
              lastTime: formatTime(baseTime),
            };

          case "external":
            return {
              unreadCount: Math.floor(Math.random() * 3) + 1,
              lastMessage: [
                "Can we reschedule?",
                "Thanks for the help!",
                "Got the documents",
                "Quick question...",
                "All set, thank you",
              ][Math.floor(Math.random() * 5)],
              lastTime: formatTime(baseTime),
            };

          case "email":
            return {
              unreadCount: Math.floor(Math.random() * 4),
              lastSubject: [
                "Q4 Tax Documents",
                "Meeting Follow-up",
                "Invoice #2847",
                "Year-End Planning",
                "Quick Update",
              ][Math.floor(Math.random() * 5)],
              lastTime: formatTime(baseTime),
            };

          case "texting":
            return {
              unreadCount: Math.floor(Math.random() * 3),
              lastText: [
                "Got it, thanks!",
                "On my way",
                "Can you call me?",
                "Perfect",
                "See you then",
              ][Math.floor(Math.random() * 5)],
              lastTime: formatTime(baseTime),
            };

          case "callback-history":
            return {
              openCount: Math.floor(Math.random() * 3),
              notReachedCount:
                Math.floor(Math.random() * 4) + 1,
              completedCount:
                Math.floor(Math.random() * 10) + 5,
            };

          default:
            // Default/fallback for when no sub-tab is active
            return {
              lastContact: baseTime.toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              }),
              unreadCount: Math.floor(Math.random() * 8),
              lastMessage: [
                "Following up on documents",
                "Thanks for the update",
                "Meeting confirmed for next week",
                "Please review the attached files",
                "All set, see you soon!",
              ][Math.floor(Math.random() * 5)],
            };
        }
      })(),
      Invoices: {
        paidCount: Math.floor(Math.random() * 10) + 5,
        pendingCount: Math.floor(Math.random() * 5),
        overdueCount: Math.floor(Math.random() * 3),
      },
      Signatures: {
        pending: Math.floor(Math.random() * 4),
        completed: Math.floor(Math.random() * 10) + 1,
      },
      Documents: {
        receivedCount: Math.floor(Math.random() * 30) + 10,
        pendingCount: Math.floor(Math.random() * 8),
        needReviewCount: Math.floor(Math.random() * 5),
      },
      Activity: {
        lastActivity: new Date(
          Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000,
        ).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
      },
      Notes: {
        count: Math.floor(Math.random() * 20) + 1,
        lastNote: new Date(
          Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000,
        ).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
      },
      Organizer: {
        pending: Math.floor(Math.random() * 8),
        completed: Math.floor(Math.random() * 15) + 5,
      },
    };

    return mockData[tab] || {};
  };

  // Auto-expand selected client in card view
  useEffect(() => {
    if (selectedClient && viewType === "card") {
      setExpandedClientId(selectedClient.id);
      console.log(
        "🔄 Auto-expanding client:",
        selectedClient.name,
      );

      // Scroll the selected client to top
      setTimeout(() => {
        const clientElement = document.getElementById(
          `client-${selectedClient.id}`,
        );
        if (clientElement) {
          clientElement.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
          console.log("📍 Scrolled to client element");
        }
      }, 100);
    }
  }, [selectedClient, viewType]);

  // Team members for assignment
  const teamMembers = [
    "Sarah Johnson",
    "Mike Brown",
    "Emily Davis",
    "John Smith",
    "Lisa Chen",
  ];

  // Available groups/tags - now uses the managed client groups
  const availableGroups = clientGroups.map((g) => g.name);

  // Check if client has missing info (no tags or missing essential fields)
  const hasMissingInfo = (client: Client) => {
    return (
      !client.tags ||
      client.tags.length === 0 ||
      !client.email ||
      !client.phone
    );
  };

  // Filter clients based on search and type
  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      client.firstName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      client.lastName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    let matchesType = true;
    if (filterType === "Missing Info") {
      matchesType = hasMissingInfo(client);
    } else if (filterType !== "All") {
      matchesType = client.type === filterType;
    }

    return matchesSearch && matchesType;
  });

  // Calculate counts
  const allCount = clients.length;
  const individualCount = clients.filter(
    (c) => c.type === "Individual",
  ).length;
  const businessCount = clients.filter(
    (c) => c.type === "Business",
  ).length;

  // Sort clients based on current sort field and direction
  const sortedClients = [...filteredClients].sort((a, b) => {
    let comparison = 0;

    switch (sortField) {
      case "name":
        comparison = a.name.localeCompare(b.name);
        break;
      case "type":
        comparison = a.type.localeCompare(b.type);
        break;
      case "assignedTo":
        comparison = a.assignedTo.localeCompare(b.assignedTo);
        break;
      case "createdDate":
        // Compare dates - newer dates should be "greater"
        comparison =
          new Date(a.createdDate).getTime() -
          new Date(b.createdDate).getTime();
        break;
      default:
        comparison = a.name.localeCompare(b.name);
    }

    return sortDirection === "asc" ? comparison : -comparison;
  });

  // Move selected/expanded client to top while maintaining sort order of the rest
  const reorderedClients = expandedClientId
    ? [
        ...sortedClients.filter(
          (c) => c.id === expandedClientId,
        ),
        ...sortedClients.filter(
          (c) => c.id !== expandedClientId,
        ),
      ]
    : sortedClients;

  const handleClientClick = (client: Client) => {
    const wasTableView = viewType === "table";

    // If in table view, switch to card view when selecting a client
    if (wasTableView) {
      onViewTypeChange("card");
    }
    onSelectClient(client);

    // In card view or switching from table view, expand the selected client
    if (viewType === "card" || wasTableView) {
      setExpandedClientId(client.id);
      // Scroll to top when coming from table view
      if (wasTableView) {
        setTimeout(() => {
          const clientListElement = document.querySelector(
            "[data-client-list-scroll]",
          );
          clientListElement?.scrollTo({
            top: 0,
            behavior: "smooth",
          });
        }, 100);
      }
    }
  };

  const handleSelectAll = () => {
    if (selectedClientIds.size === filteredClients.length) {
      setSelectedClientIds(new Set());
    } else {
      setSelectedClientIds(
        new Set(filteredClients.map((c) => c.id)),
      );
    }
  };

  const handleSelectClient = (clientId: string) => {
    const newSelected = new Set(selectedClientIds);
    if (newSelected.has(clientId)) {
      newSelected.delete(clientId);
    } else {
      newSelected.add(clientId);
    }
    setSelectedClientIds(newSelected);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if clicking the same field
      setSortDirection(
        sortDirection === "asc" ? "desc" : "asc",
      );
    } else {
      // Set new field with ascending direction
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="w-3.5 h-3.5 icon-brand" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 icon-brand" />
    );
  };

  const handleMouseDown =
    (columnName: string) => (e: React.MouseEvent) => {
      e.preventDefault();
      setResizing(columnName);

      const startX = e.pageX;
      const startWidth =
        columnWidths[columnName as keyof typeof columnWidths];

      const handleMouseMove = (e: MouseEvent) => {
        const diff = e.pageX - startX;
        const newWidth = Math.max(100, startWidth + diff); // Min width 100px
        setColumnWidths((prev) => ({
          ...prev,
          [columnName]: newWidth,
        }));
      };

      const handleMouseUp = () => {
        setResizing(null);
        document.removeEventListener(
          "mousemove",
          handleMouseMove,
        );
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    };

  return (
    <div
      className={cn(
        "bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-xl md:rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl shadow-gray-900/5 dark:shadow-black/20 flex flex-col transition-all h-full",
        viewType === "table"
          ? "w-full"
          : "w-full md:w-[340px] lg:w-[360px] xl:w-[380px] flex-shrink-0",
      )}
    >
      {/* Header */}
      <div className="p-3 md:p-5 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <div>
            <h2 className="text-lg md:text-xl font-semibold tracking-tight text-brand-gradient">
              Clients
            </h2>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 md:mt-1 font-normal">
              {filteredClients.length} clients
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 md:gap-2">
            {viewType === "table" ? (
              // Table View - Expanded Menu (hidden on mobile)
              <>
                {/* Add Client Button */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="btn-primary h-8 md:h-9 rounded-xl gap-1.5 md:gap-2 px-2.5 md:px-3">
                      <Plus className="w-3.5 md:w-4 h-3.5 md:h-4" />
                      <span className="font-medium text-sm md:text-base">
                        Add
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-52"
                  >
                    <DropdownMenuItem
                      onClick={() => navigate("/clients/add")}
                    >
                      <User className="w-4 h-4 mr-2" />
                      Add Client
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        setShowQuickAddDialog(true)
                      }
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Quick Add Client
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setShowGroupsDialog(true)}
                    >
                      <Tag className="w-4 h-4 mr-2" />
                      Add Client Group
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  variant="outline"
                  className="hidden lg:flex h-9 rounded-xl border-gray-200/60 gap-2 px-3 hover:bg-gray-50 hover:border-gray-300 shadow-sm"
                  onClick={() => setShowGroupsDialog(true)}
                >
                  <Tag className="w-4 h-4" />
                  <span className="font-medium">
                    Manage Groups
                  </span>
                </Button>
                <Button
                  variant="outline"
                  className="hidden xl:flex h-9 rounded-xl border-gray-200/60 gap-2 px-3 hover:bg-gray-50 hover:border-gray-300 shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  <span className="font-medium">Export</span>
                </Button>
                {/* Mobile: Show More Menu for table view too */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="lg:hidden h-8 md:h-9 w-8 md:w-9 p-0 rounded-xl border-gray-200/60 hover:bg-gray-50 hover:border-gray-300 shadow-sm"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-52"
                  >
                    <DropdownMenuItem
                      onClick={() => setShowGroupsDialog(true)}
                    >
                      <Tag className="w-4 h-4 mr-2" />
                      Manage Groups
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              // Card/List View - Compact Menu
              <>
                {/* Add Client */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="btn-primary h-8 md:h-9 rounded-xl gap-1.5 md:gap-2 px-2.5 md:px-3">
                      <Plus className="w-3.5 md:w-4 h-3.5 md:h-4" />
                      <span className="font-medium text-sm md:text-base">
                        Add
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-52"
                  >
                    <DropdownMenuItem
                      onClick={() => navigate("/clients/add")}
                    >
                      <User className="w-4 h-4 mr-2" />
                      Add Client
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        setShowQuickAddDialog(true)
                      }
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Quick Add Client
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setShowGroupsDialog(true)}
                    >
                      <Tag className="w-4 h-4 mr-2" />
                      Add Client Group
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* More Actions Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 md:h-9 w-8 md:w-9 p-0 rounded-xl border-gray-200/60 hover:bg-gray-50 hover:border-gray-300 shadow-sm"
                    >
                      <MoreHorizontal className="w-3.5 md:w-4 h-3.5 md:h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-52"
                  >
                    <DropdownMenuItem>
                      <Download className="w-4 h-4 mr-2" />
                      Export Clients
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setShowGroupsDialog(true)}
                    >
                      <Tag className="w-4 h-4 mr-2" />
                      Manage Groups
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </div>

        {/* Search with Filter */}
        <div className="relative mb-3 md:mb-4 flex gap-1.5 md:gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-3.5 md:w-4 h-3.5 md:h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-9 md:h-11 pl-9 md:pl-11 pr-3 md:pr-4 rounded-xl border border-gray-200/60 bg-gradient-to-br from-gray-50 to-white text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300 transition-all"
            />
          </div>

          {/* Filter Button */}
          <Button
            variant={showFilters ? "default" : "outline"}
            className={cn(
              "h-9 md:h-11 rounded-xl gap-1.5 md:gap-2 px-2.5 md:px-3 shadow-sm flex-shrink-0",
              showFilters
                ? "btn-primary"
                : "border-gray-200/60 hover:bg-gray-50 hover:border-gray-300",
            )}
            onClick={onToggleFilters}
          >
            <Filter className="w-3.5 md:w-4 h-3.5 md:h-4" />
            <span className="font-medium text-sm md:text-base hidden sm:inline">
              Filters
            </span>
          </Button>
        </div>

        {/* Type Filters and View/Sort Toggles */}
        <div className="flex items-center justify-between gap-1 md:gap-2">
          {/* Type Filters */}
          <div className="flex items-center gap-0.5 md:gap-1.5 bg-gradient-to-br from-gray-100 to-gray-50 p-0.5 rounded-lg md:rounded-xl min-w-0 flex-shrink">
            <button
              onClick={() => setFilterType("All")}
              className={cn(
                "flex items-center gap-0.5 md:gap-1 px-1.5 md:px-2.5 py-1 md:py-1.5 text-xs md:text-sm font-medium rounded-md md:rounded-lg transition-all duration-200",
                filterType === "All"
                  ? "btn-primary"
                  : "text-gray-600 hover:text-gray-900",
              )}
            >
              <Users className="w-3 md:w-4 h-3 md:h-4" />
              {viewType === "table" && (
                <span className="font-medium hidden lg:inline">
                  All
                </span>
              )}
              <span className="font-semibold">{allCount}</span>
            </button>

            <div className="w-px h-4 bg-gray-300"></div>

            <button
              onClick={() => setFilterType("Individual")}
              className={cn(
                "flex items-center gap-0.5 md:gap-1 px-1.5 md:px-2.5 py-1 md:py-1.5 text-xs md:text-sm font-medium rounded-md md:rounded-lg transition-all duration-200",
                filterType === "Individual"
                  ? "bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30"
                  : "text-gray-600 hover:text-gray-900",
              )}
            >
              <User className="w-3 md:w-4 h-3 md:h-4" />
              {viewType === "table" && (
                <span className="font-medium hidden lg:inline">
                  Individual
                </span>
              )}
              <span className="font-semibold">
                {individualCount}
              </span>
            </button>

            <div className="w-px h-4 bg-gray-300"></div>

            <button
              onClick={() => setFilterType("Business")}
              className={cn(
                "flex items-center gap-0.5 md:gap-1 px-1.5 md:px-2.5 py-1 md:py-1.5 text-xs md:text-sm font-medium rounded-md md:rounded-lg transition-all duration-200",
                filterType === "Business"
                  ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30"
                  : "text-gray-600 hover:text-gray-900",
              )}
            >
              <Building2 className="w-3 md:w-4 h-3 md:h-4" />
              {viewType === "table" && (
                <span className="font-medium hidden lg:inline">
                  Business
                </span>
              )}
              <span className="font-semibold">
                {businessCount}
              </span>
            </button>

            <div className="w-px h-4 bg-gray-300"></div>

            <button
              onClick={() => setFilterType("Missing Info")}
              className={cn(
                "flex items-center gap-0.5 md:gap-1 px-1.5 md:px-2.5 py-1 md:py-1.5 text-xs md:text-sm font-medium rounded-md md:rounded-lg transition-all duration-200",
                filterType === "Missing Info"
                  ? "bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30"
                  : "text-gray-600 hover:text-gray-900",
              )}
              title="Clients with missing information"
            >
              <Zap className="w-3 md:w-4 h-3 md:h-4" />
              {viewType === "table" && (
                <span className="font-medium hidden lg:inline">
                  Missing
                </span>
              )}
              <span className="font-semibold">
                {clients.filter(hasMissingInfo).length}
              </span>
            </button>
          </div>

          {/* View Toggle and Sort */}
          <div className="flex gap-0.5 md:gap-1.5 flex-shrink-0">
            {/* Sort Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-0.5 md:gap-1 px-1.5 md:px-2 py-1 md:py-1.5 bg-gray-100 hover:bg-gray-200 rounded-md md:rounded-lg transition-all text-gray-700"
                  title="Sort clients"
                >
                  <ArrowUpDown className="w-3.5 md:w-4 h-3.5 md:h-4" />
                  {viewType === "table" && (
                    <span className="text-xs md:text-sm font-medium hidden xl:inline">
                      Sort
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem
                  onClick={() => handleSort("name")}
                >
                  {getSortIcon("name")}
                  <span className="ml-2">Name (A-Z)</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleSort("type")}
                >
                  {getSortIcon("type")}
                  <span className="ml-2">Client Type</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleSort("assignedTo")}
                >
                  {getSortIcon("assignedTo")}
                  <span className="ml-2">Assigned To</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleSort("createdDate")}
                >
                  {getSortIcon("createdDate")}
                  <span className="ml-2">Created Date</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* View Toggle */}
            <div className="flex gap-0.5 bg-gray-100 rounded-md md:rounded-lg p-0.5">
              <button
                onClick={() => {
                  onViewTypeChange("card");
                  setSelectedClientIds(new Set());
                }}
                className={cn(
                  "flex items-center gap-0.5 md:gap-1 rounded transition-all px-1.5 md:px-2 py-1 md:py-1.5",
                  viewType === "card"
                    ? "bg-white shadow-sm"
                    : "text-gray-500",
                )}
                title="Card View"
              >
                <Grid3x3 className="w-3.5 md:w-4 h-3.5 md:h-4" />
                {viewType === "table" && (
                  <span className="text-xs md:text-sm font-medium hidden xl:inline">
                    Card
                  </span>
                )}
              </button>
              <button
                onClick={() => {
                  onViewTypeChange("list");
                  setSelectedClientIds(new Set());
                }}
                className={cn(
                  "flex items-center gap-0.5 md:gap-1 rounded transition-all px-1.5 md:px-2 py-1 md:py-1.5",
                  viewType === "list"
                    ? "bg-white shadow-sm"
                    : "text-gray-500",
                )}
                title="List View"
              >
                <List className="w-3.5 md:w-4 h-3.5 md:h-4" />
                {viewType === "table" && (
                  <span className="text-xs md:text-sm font-medium hidden xl:inline">
                    List
                  </span>
                )}
              </button>
              <button
                onClick={() => {
                  onViewTypeChange("table");
                  setSelectedClientIds(new Set());
                }}
                className={cn(
                  "flex items-center gap-0.5 md:gap-1 rounded transition-all px-1.5 md:px-2 py-1 md:py-1.5",
                  viewType === "table"
                    ? "bg-white shadow-sm"
                    : "text-gray-500",
                )}
                title="Table View"
              >
                <Table2 className="w-3.5 md:w-4 h-3.5 md:h-4" />
                {viewType === "table" && (
                  <span className="text-xs md:text-sm font-medium hidden xl:inline">
                    Table
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Select All Row - Card/List View Only */}
      {viewType !== "table" && filteredClients.length > 0 && (
        <div className="px-3 md:px-5 py-2 border-b border-gray-200/50">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
            className={cn(
              "h-8 rounded-lg gap-1.5 px-3 transition-all w-full justify-center",
              selectedClientIds.size ===
                filteredClients.length &&
                filteredClients.length > 0
                ? "bg-gradient-to-br from-purple-500 to-purple-600 text-white border-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-md"
                : "border-gray-300 hover:bg-gray-50",
            )}
          >
            <CheckSquare className="w-4 h-4" />
            <span className="text-xs font-medium">
              {selectedClientIds.size === filteredClients.length
                ? "Deselect All"
                : "Select All"}{" "}
              ({filteredClients.length})
            </span>
          </Button>
        </div>
      )}

      {/* Bulk Actions Bar */}
      {selectedClientIds.size > 0 && (
        <div
          className="px-3 md:px-5 py-2 md:py-3 border-b"
          style={{
            background:
              "linear-gradient(to right, rgba(var(--primaryColorBtnRgb), 0.08), rgba(var(--primaryColorBtnRgb), 0.12))",
            borderColor: "rgba(var(--primaryColorBtnRgb), 0.2)",
          }}
        >
          {viewType === "card" ? (
            // Card View - Dropdown only
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 md:gap-3">
                <CheckCheck className="w-4 md:w-5 h-4 md:h-5 icon-brand" />
                <span className="text-xs md:text-sm font-medium text-brand-primary">
                  {selectedClientIds.size} client
                  {selectedClientIds.size > 1 ? "s" : ""}{" "}
                  selected
                </span>

                {/* Bulk Actions Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-7 md:h-8 rounded-lg bg-white border-brand-light hover-brand text-xs md:text-sm"
                    >
                      <CheckSquare className="w-3 md:w-3.5 h-3 md:h-3.5 mr-1.5" />
                      Bulk Actions
                      <ChevronDown className="w-3 md:w-3.5 h-3 md:h-3.5 ml-1.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="w-56"
                  >
                    <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">
                      Bulk Actions ({selectedClientIds.size}{" "}
                      selected)
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() =>
                        console.log("Email All - Coming Soon")
                      }
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Email All
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        console.log("Send Text - Coming Soon")
                      }
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Send Text
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setShowGroupsDialog(true)}
                    >
                      <Tag className="w-4 h-4 mr-2" />
                      Add Group
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        setShowAssignToDialog(true)
                      }
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Assign To
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() =>
                        setShowCreateFoldersDialog(true)
                      }
                    >
                      <FolderOpen className="w-4 h-4 mr-2" />
                      Create Folders
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        setShowCreateProjectDialog(true)
                      }
                    >
                      <Briefcase className="w-4 h-4 mr-2" />
                      Create Project
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        setShowInviteToMeetingDialog(true)
                      }
                    >
                      <Video className="w-4 h-4 mr-2" />
                      Invite to Meeting
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        console.log(
                          "Create Subscription - Coming Soon",
                        )
                      }
                    >
                      <ReceiptText className="w-4 h-4 mr-2" />
                      Create Subscription
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        setShowSendLoginDialog(true)
                      }
                    >
                      <LogIn className="w-4 h-4 mr-2" />
                      Send Login
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() =>
                        console.log("Export - Coming Soon")
                      }
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600 focus:text-red-600 focus:bg-red-50"
                      onClick={() =>
                        setShowBulkDeleteDialog(true)
                      }
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Selected
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="flex items-center gap-1 md:gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 md:h-8 rounded-lg text-xs"
                  onClick={() =>
                    setSelectedClientIds(new Set())
                  }
                >
                  Clear
                </Button>
              </div>
            </div>
          ) : (
            // Table View - All buttons outside with title above
            <div className="space-y-2">
              <div className="flex items-center gap-2 md:gap-3">
                <CheckCheck className="w-4 md:w-5 h-4 md:h-5 icon-brand" />
                <span className="text-xs md:text-sm font-medium text-brand-primary">
                  {selectedClientIds.size} client
                  {selectedClientIds.size > 1 ? "s" : ""}{" "}
                  selected - Bulk Actions:
                </span>
              </div>
              <div className="flex items-center gap-1 md:gap-2 flex-wrap justify-end">
                <Button
                  variant="outline"
                  className="h-7 md:h-8 rounded-lg bg-white border-brand-light hover-brand text-xs md:text-sm"
                  onClick={() =>
                    console.log("Email All - Coming Soon")
                  }
                >
                  <Mail className="w-3 md:w-3.5 h-3 md:h-3.5 mr-1.5" />
                  <span className="hidden sm:inline">
                    Email All
                  </span>
                </Button>
                <Button
                  variant="outline"
                  className="h-7 md:h-8 rounded-lg bg-white border-brand-light hover-brand text-xs md:text-sm"
                  onClick={() =>
                    console.log("Send Text - Coming Soon")
                  }
                >
                  <MessageSquare className="w-3 md:w-3.5 h-3 md:h-3.5 mr-1.5" />
                  <span className="hidden sm:inline">
                    Send Text
                  </span>
                </Button>
                <Button
                  variant="outline"
                  className="h-7 md:h-8 rounded-lg bg-white border-brand-light hover-brand text-xs md:text-sm"
                  onClick={() => setShowGroupsDialog(true)}
                >
                  <Tag className="w-3 md:w-3.5 h-3 md:h-3.5 mr-1.5" />
                  <span className="hidden sm:inline">
                    Add Group
                  </span>
                </Button>
                <Button
                  variant="outline"
                  className="h-7 md:h-8 rounded-lg bg-white border-brand-light hover-brand text-xs md:text-sm"
                  onClick={() => setShowAssignToDialog(true)}
                >
                  <UserPlus className="w-3 md:w-3.5 h-3 md:h-3.5 mr-1.5" />
                  <span className="hidden sm:inline">
                    Assign To
                  </span>
                </Button>
                <Button
                  variant="outline"
                  className="h-7 md:h-8 rounded-lg bg-white border-brand-light hover-brand text-xs md:text-sm"
                  onClick={() =>
                    setShowCreateFoldersDialog(true)
                  }
                >
                  <FolderOpen className="w-3 md:w-3.5 h-3 md:h-3.5 mr-1.5" />
                  <span className="hidden lg:inline">
                    Create Folders
                  </span>
                </Button>
                <Button
                  variant="outline"
                  className="h-7 md:h-8 rounded-lg bg-white border-brand-light hover-brand text-xs md:text-sm"
                  onClick={() =>
                    setShowCreateProjectDialog(true)
                  }
                >
                  <Briefcase className="w-3 md:w-3.5 h-3 md:h-3.5 mr-1.5" />
                  <span className="hidden lg:inline">
                    Create Project
                  </span>
                </Button>
                <Button
                  variant="outline"
                  className="h-7 md:h-8 rounded-lg bg-white border-brand-light hover-brand text-xs md:text-sm"
                  onClick={() =>
                    setShowInviteToMeetingDialog(true)
                  }
                >
                  <Video className="w-3 md:w-3.5 h-3 md:h-3.5 mr-1.5" />
                  <span className="hidden lg:inline">
                    Invite to Meeting
                  </span>
                </Button>
                <Button
                  variant="outline"
                  className="h-7 md:h-8 rounded-lg bg-white border-brand-light hover-brand text-xs md:text-sm"
                  onClick={() =>
                    console.log(
                      "Create Subscription - Coming Soon",
                    )
                  }
                >
                  <ReceiptText className="w-3 md:w-3.5 h-3 md:h-3.5 mr-1.5" />
                  <span className="hidden lg:inline">
                    Create Subscription
                  </span>
                </Button>
                <Button
                  variant="outline"
                  className="h-7 md:h-8 rounded-lg bg-white border-brand-light hover-brand text-xs md:text-sm"
                  onClick={() => setShowSendLoginDialog(true)}
                >
                  <LogIn className="w-3 md:w-3.5 h-3 md:h-3.5 mr-1.5" />
                  <span className="hidden lg:inline">
                    Send Login
                  </span>
                </Button>
                <Button
                  variant="outline"
                  className="h-7 md:h-8 rounded-lg bg-white border-brand-light hover-brand text-xs md:text-sm"
                  onClick={() =>
                    console.log("Export - Coming Soon")
                  }
                >
                  <Download className="w-3 md:w-3.5 h-3 md:h-3.5 mr-1.5" />
                  <span className="hidden sm:inline">
                    Export
                  </span>
                </Button>
                <Button
                  variant="outline"
                  className="h-7 md:h-8 rounded-lg bg-white border-red-200 hover:bg-red-50 text-xs md:text-sm text-red-600"
                  onClick={() => setShowBulkDeleteDialog(true)}
                >
                  <Trash2 className="w-3 md:w-3.5 h-3 md:h-3.5 mr-1.5" />
                  <span className="hidden sm:inline">
                    Delete
                  </span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 md:h-8 rounded-lg text-xs"
                  onClick={() =>
                    setSelectedClientIds(new Set())
                  }
                >
                  Clear
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Client List */}
      <div
        className="flex-1 overflow-y-auto px-2 md:px-3 py-2 md:py-3"
        data-client-list-scroll
      >
        {viewType === "table" ? (
          // Table View
          <div className="bg-white rounded-xl border border-gray-200/50 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr
                  style={{
                    background:
                      "linear-gradient(to right, var(--primaryColor), var(--secondaryColor, var(--primaryColor)))",
                  }}
                >
                  <th className="text-center py-4 px-4 w-12">
                    <input
                      type="checkbox"
                      checked={
                        selectedClientIds.size ===
                          filteredClients.length &&
                        filteredClients.length > 0
                      }
                      onChange={handleSelectAll}
                      className="checkbox-brand rounded"
                    />
                  </th>
                  <th
                    style={{ width: columnWidths.client }}
                    className="text-left py-4 px-4 text-xs uppercase tracking-wide text-white/90 cursor-pointer hover:text-white transition-colors select-none relative group"
                  >
                    <div
                      className="flex items-center gap-2"
                      onClick={() => handleSort("name")}
                    >
                      <span>Client</span>
                      {getSortIcon("name")}
                    </div>
                    <div
                      className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize resize-handle transition-colors hover:bg-white/30"
                      onMouseDown={handleMouseDown("client")}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </th>
                  <th
                    style={{ width: columnWidths.contact }}
                    className="text-left py-4 px-4 text-xs uppercase tracking-wide text-white/90 relative group"
                  >
                    <span>Contact</span>
                    <div
                      className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize resize-handle transition-colors hover:bg-white/30"
                      onMouseDown={handleMouseDown("contact")}
                    />
                  </th>
                  <th
                    style={{ width: columnWidths.assignedTo }}
                    className="text-left py-4 px-4 text-xs uppercase tracking-wide text-white/90 cursor-pointer hover:text-white transition-colors select-none relative group"
                  >
                    <div
                      className="flex items-center gap-2"
                      onClick={() => handleSort("assignedTo")}
                    >
                      <span>Assigned To</span>
                      {getSortIcon("assignedTo")}
                    </div>
                    <div
                      className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize resize-handle transition-colors hover:bg-white/30"
                      onMouseDown={handleMouseDown(
                        "assignedTo",
                      )}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </th>
                  <th
                    style={{ width: columnWidths.created }}
                    className="text-left py-4 px-4 text-xs uppercase tracking-wide text-white/90 cursor-pointer hover:text-white transition-colors select-none relative group"
                  >
                    <div
                      className="flex items-center gap-2"
                      onClick={() => handleSort("createdDate")}
                    >
                      <span>Created</span>
                      {getSortIcon("createdDate")}
                    </div>
                    <div
                      className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize resize-handle transition-colors hover:bg-white/30"
                      onMouseDown={handleMouseDown("created")}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </th>
                  <th
                    style={{ width: columnWidths.tags }}
                    className="text-left py-4 px-4 text-xs uppercase tracking-wide text-white/90 relative group"
                  >
                    <span>Client Groups</span>
                    <div
                      className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize resize-handle transition-colors hover:bg-white/30"
                      onMouseDown={handleMouseDown("tags")}
                    />
                  </th>
                  <th className="text-center py-4 px-4 text-xs uppercase tracking-wide text-white/90 w-20">
                    Menu
                  </th>
                </tr>
              </thead>
              <tbody>
                {reorderedClients.map((client) => {
                  const isSelected =
                    selectedClient?.id === client.id;
                  const isChecked = selectedClientIds.has(
                    client.id,
                  );
                  return (
                    <tr
                      key={client.id}
                      id={`client-${client.id}`}
                      className={cn(
                        "border-b border-gray-100 transition-colors group",
                        isChecked && "bg-selected-lighter",
                      )}
                      style={
                        isSelected
                          ? {
                              background:
                                "linear-gradient(to right, rgba(var(--primaryColorBtnRgb), 0.08), rgba(var(--primaryColorBtnRgb), 0.12))",
                            }
                          : {}
                      }
                    >
                      <td className="py-3 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() =>
                            handleSelectClient(client.id)
                          }
                          onClick={(e) => e.stopPropagation()}
                          className="checkbox-brand rounded"
                        />
                      </td>
                      <td
                        className="py-3 px-4 cursor-pointer"
                        onClick={() =>
                          handleClientClick(client)
                        }
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                              client.type === "Business"
                                ? "bg-gradient-to-br from-blue-500 to-blue-600"
                                : "bg-gradient-to-br from-green-500 to-green-600",
                            )}
                          >
                            {client.type === "Business" ? (
                              <Building2 className="w-4 h-4 text-white" />
                            ) : (
                              <User className="w-4 h-4 text-white" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {client.name}
                            </div>
                            {client.type === "Business" && (
                              <div className="text-xs text-gray-500 truncate">
                                {client.firstName}{" "}
                                {client.lastName}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td
                        className="py-3 px-4 cursor-pointer"
                        onClick={() =>
                          handleClientClick(client)
                        }
                      >
                        <div className="text-xs text-gray-900 font-medium">
                          {(() => {
                            const phone = client.phone
                              .replace(/^\+1\s*/, "")
                              .replace(/\D/g, "");
                            if (phone.length === 10) {
                              return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6)}`;
                            }
                            return client.phone;
                          })()}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {client.email}
                        </div>
                      </td>
                      <td
                        className="py-3 px-4 cursor-pointer"
                        onClick={() =>
                          handleClientClick(client)
                        }
                      >
                        <div className="text-xs text-gray-700">
                          {client.assignedTo}
                        </div>
                      </td>
                      <td
                        className="py-3 px-4 cursor-pointer"
                        onClick={() =>
                          handleClientClick(client)
                        }
                      >
                        <div className="text-xs text-gray-700">
                          {new Date(
                            client.createdDate,
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 items-center">
                          {client.tags
                            .slice(0, 2)
                            .map((tag, idx) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className="text-xs cursor-pointer"
                                onClick={() =>
                                  handleClientClick(client)
                                }
                              >
                                {tag}
                              </Badge>
                            ))}
                          {client.tags.length > 2 && (
                            <Badge
                              variant="outline"
                              className="text-xs cursor-pointer"
                              onClick={() =>
                                handleClientClick(client)
                              }
                            >
                              +{client.tags.length - 2}
                            </Badge>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setAddingGroupToClient(
                                    client.id,
                                  );
                                }}
                                className="h-5 w-5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"
                                title="Add to group"
                              >
                                <Plus className="w-3.5 h-3.5 text-gray-500" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="start"
                              className="w-56"
                            >
                              <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">
                                Add to Group
                              </div>
                              <DropdownMenuSeparator />
                              {availableGroups.map((group) => (
                                <DropdownMenuItem
                                  key={group}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const currentTags =
                                      client.tags || [];
                                    if (
                                      !currentTags.includes(
                                        group,
                                      )
                                    ) {
                                      onUpdateClient(
                                        client.id,
                                        {
                                          tags: [
                                            ...currentTags,
                                            group,
                                          ],
                                        },
                                      );
                                    }
                                  }}
                                  className="text-sm"
                                >
                                  <Tag className="w-4 h-4 mr-2" />
                                  {group}
                                  {client.tags?.includes(
                                    group,
                                  ) && (
                                    <Check
                                      className="w-4 h-4 ml-auto"
                                      style={{
                                        color:
                                          "var(--primaryColor)",
                                      }}
                                    />
                                  )}
                                </DropdownMenuItem>
                              ))}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowGroupsDialog(true);
                                }}
                                className="text-sm"
                                style={{
                                  color: "var(--primaryColor)",
                                }}
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                Manage Groups
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              onClick={(e) =>
                                e.stopPropagation()
                              }
                              className={cn(
                                "h-8 px-3 rounded-lg inline-flex items-center justify-center gap-1.5 transition-all font-medium text-xs",
                                isSelected
                                  ? "bg-selected-light"
                                  : "bg-gray-100 text-gray-700 hover:bg-gray-200",
                              )}
                            >
                              <MoreVertical className="w-3.5 h-3.5" />
                              <span>Menu</span>
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-56"
                          >
                            <DropdownMenuItem>
                              <Edit className="w-4 h-4 mr-2" />
                              <span className="font-medium">
                                Edit Client
                              </span>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Key className="w-4 h-4 mr-2" />
                              Send Credentials
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="w-4 h-4 mr-2" />
                              Send Email
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Send Text
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Users className="w-4 h-4 mr-2" />
                              Assign Client Group
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <UserPlus className="w-4 h-4 mr-2" />
                              Change Assigned Person
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Calendar className="w-4 h-4 mr-2" />
                              Create Meeting
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <CreditCard className="w-4 h-4 mr-2" />
                              Create Subscription
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <StickyNote className="w-4 h-4 mr-2" />
                              Add Note
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Plus className="w-4 h-4 mr-2" />
                              Create Task
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Key className="w-4 h-4 mr-2" />
                              Reset Password
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600 font-medium">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Client
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : viewType === "list" ? (
          // List View
          reorderedClients.map((client) => {
            const isSelected = selectedClient?.id === client.id;
            const isChecked = selectedClientIds.has(client.id);
            return (
              <div
                key={client.id}
                id={`client-${client.id}`}
                className={cn(
                  "w-full px-4 py-2.5 mb-1 rounded-xl transition-all duration-200 flex items-center gap-3",
                  isSelected
                    ? "bg-selected"
                    : isChecked
                      ? "bg-selected-lighter"
                      : "hover:bg-gradient-to-br hover:from-gray-50 hover:to-white hover:shadow-md",
                )}
              >
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleSelectClient(client.id)}
                  onClick={(e) => e.stopPropagation()}
                  className={cn(
                    "rounded border-gray-300 focus:ring-purple-500 flex-shrink-0",
                    isSelected && "border-white/50 text-white",
                  )}
                />

                {/* Type Icon */}
                <button
                  onClick={() => handleClientClick(client)}
                  className="flex items-center gap-3 flex-1 min-w-0"
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                      client.type === "Business"
                        ? isSelected
                          ? "bg-white/20"
                          : "bg-gradient-to-br from-blue-500 to-blue-600"
                        : isSelected
                          ? "bg-white/20"
                          : "bg-gradient-to-br from-green-500 to-green-600",
                    )}
                  >
                    {client.type === "Business" ? (
                      <Building2 className="w-4 h-4 text-white" />
                    ) : (
                      <User className="w-4 h-4 text-white" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Client Name */}
                    <div
                      className={cn(
                        "text-[15px] font-semibold leading-tight mb-1 text-left truncate",
                        isSelected
                          ? "text-white"
                          : "text-gray-900",
                      )}
                    >
                      {client.name}
                    </div>

                    {/* Contextual Information Based on Active Tab */}
                    {(() => {
                      const contextInfo = getContextualInfo(
                        client,
                        activeTab,
                        communicationSubTab,
                      );

                      switch (activeTab) {
                        case "Snapshot":
                        case "Demographics":
                          return (
                            <div className="space-y-0.5">
                              <div
                                className={cn(
                                  "text-xs truncate flex items-center gap-1.5",
                                  isSelected
                                    ? "text-white/80"
                                    : "text-gray-600",
                                )}
                              >
                                <Mail className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">
                                  {contextInfo.email}
                                </span>
                              </div>
                              <div
                                className={cn(
                                  "text-xs flex items-center gap-1.5",
                                  isSelected
                                    ? "text-white/80"
                                    : "text-gray-600",
                                )}
                              >
                                <Phone className="w-3 h-3 flex-shrink-0" />
                                <span>
                                  {(() => {
                                    const phone =
                                      contextInfo.phone
                                        .replace(/^\+1\s*/, "")
                                        .replace(/\D/g, "");
                                    if (phone.length === 10) {
                                      return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6)}`;
                                    }
                                    return contextInfo.phone;
                                  })()}
                                </span>
                              </div>
                            </div>
                          );

                        case "Teams":
                          return (
                            <div
                              className={cn(
                                "text-xs flex items-center gap-2",
                                isSelected
                                  ? "text-white/80"
                                  : "text-gray-600",
                              )}
                            >
                              <Users className="w-3 h-3 flex-shrink-0" />
                              <span className="font-medium">
                                {contextInfo.teamMembers}
                              </span>
                              <span>
                                member
                                {contextInfo.teamMembers > 1
                                  ? "s"
                                  : ""}
                              </span>
                            </div>
                          );

                        case "Communication":
                          // Render based on communication sub-tab
                          if (
                            communicationSubTab ===
                            "callback-history"
                          ) {
                            return (
                              <div className="space-y-0.5">
                                <div
                                  className={cn(
                                    "text-xs flex items-center gap-2",
                                    isSelected
                                      ? "text-white/80"
                                      : "text-gray-600",
                                  )}
                                >
                                  <span className="font-medium text-green-600 dark:text-green-400">
                                    {contextInfo.completedCount}
                                  </span>
                                  <span
                                    className={cn(
                                      isSelected
                                        ? "text-white/60"
                                        : "text-gray-500",
                                    )}
                                  >
                                    completed
                                  </span>
                                  <span className="text-gray-400">
                                    ·
                                  </span>
                                  <span className="font-medium text-amber-600 dark:text-amber-400">
                                    {
                                      contextInfo.notReachedCount
                                    }
                                  </span>
                                  <span
                                    className={cn(
                                      isSelected
                                        ? "text-white/60"
                                        : "text-gray-500",
                                    )}
                                  >
                                    not reached
                                  </span>
                                </div>
                                <div
                                  className={cn(
                                    "text-xs flex items-center gap-2",
                                    isSelected
                                      ? "text-white/80"
                                      : "text-gray-600",
                                  )}
                                >
                                  <span className="font-medium text-red-600 dark:text-red-400">
                                    {contextInfo.openCount}
                                  </span>
                                  <span
                                    className={cn(
                                      isSelected
                                        ? "text-white/60"
                                        : "text-gray-500",
                                    )}
                                  >
                                    open
                                  </span>
                                </div>
                              </div>
                            );
                          } else if (
                            communicationSubTab === "internal"
                          ) {
                            return (
                              <div className="space-y-1">
                                <div
                                  className={cn(
                                    "text-xs text-left",
                                    isSelected
                                      ? "text-white/80"
                                      : "text-gray-600",
                                  )}
                                >
                                  <span>
                                    {contextInfo.lastTime}
                                  </span>
                                </div>
                                <div
                                  className={cn(
                                    "text-xs flex items-center gap-2",
                                    isSelected
                                      ? "text-white/80"
                                      : "text-gray-600",
                                  )}
                                >
                                  <MessagesSquare className="w-3 h-3 flex-shrink-0" />
                                  <span
                                    className={cn(
                                      isSelected
                                        ? "text-white/60"
                                        : "text-gray-500",
                                    )}
                                  >
                                    By:
                                  </span>
                                  <span className="font-medium">
                                    {contextInfo.lastPoster}
                                  </span>
                                </div>
                              </div>
                            );
                          } else if (
                            communicationSubTab === "external"
                          ) {
                            return (
                              <div className="space-y-1">
                                <div
                                  className={cn(
                                    "text-xs text-left",
                                    isSelected
                                      ? "text-white/80"
                                      : "text-gray-600",
                                  )}
                                >
                                  <span>
                                    {contextInfo.lastTime}
                                  </span>
                                </div>
                                <div
                                  className={cn(
                                    "text-xs flex items-center gap-2",
                                    isSelected
                                      ? "text-white/60"
                                      : "text-gray-500",
                                  )}
                                >
                                  <MessagesSquare className="w-3 h-3 flex-shrink-0" />
                                  <span>
                                    "{contextInfo.lastMessage}"
                                  </span>
                                </div>
                              </div>
                            );
                          } else if (
                            communicationSubTab === "email"
                          ) {
                            return (
                              <div className="space-y-1">
                                <div
                                  className={cn(
                                    "text-xs text-left",
                                    isSelected
                                      ? "text-white/80"
                                      : "text-gray-600",
                                  )}
                                >
                                  <span>
                                    {contextInfo.lastTime}
                                  </span>
                                </div>
                                <div
                                  className={cn(
                                    "text-xs flex items-center gap-2",
                                    isSelected
                                      ? "text-white/70"
                                      : "text-gray-600",
                                  )}
                                >
                                  <Mail className="w-3 h-3 flex-shrink-0" />
                                  <span>
                                    {contextInfo.lastSubject}
                                  </span>
                                </div>
                              </div>
                            );
                          } else if (
                            communicationSubTab === "texting"
                          ) {
                            return (
                              <div className="space-y-1">
                                <div
                                  className={cn(
                                    "text-xs text-left",
                                    isSelected
                                      ? "text-white/80"
                                      : "text-gray-600",
                                  )}
                                >
                                  <span>
                                    {contextInfo.lastTime}
                                  </span>
                                </div>
                                <div
                                  className={cn(
                                    "text-xs flex items-center gap-2",
                                    isSelected
                                      ? "text-white/60"
                                      : "text-gray-500",
                                  )}
                                >
                                  <MessageSquare className="w-3 h-3 flex-shrink-0" />
                                  <span>
                                    "{contextInfo.lastText}"
                                  </span>
                                </div>
                              </div>
                            );
                          } else {
                            // Fallback/default view
                            return (
                              <div className="space-y-1">
                                <div
                                  className={cn(
                                    "text-xs flex items-center gap-2",
                                    isSelected
                                      ? "text-white/80"
                                      : "text-gray-600",
                                  )}
                                >
                                  <span
                                    className={cn(
                                      isSelected
                                        ? "text-white/60"
                                        : "text-gray-500",
                                    )}
                                  >
                                    Last:
                                  </span>
                                  <span>
                                    {contextInfo.lastContact}
                                  </span>
                                </div>
                                <div
                                  className={cn(
                                    "text-xs flex items-center gap-2",
                                    isSelected
                                      ? "text-white/60"
                                      : "text-gray-500",
                                  )}
                                >
                                  <MessagesSquare className="w-3 h-3 flex-shrink-0" />
                                  <span>
                                    "{contextInfo.lastMessage}"
                                  </span>
                                </div>
                              </div>
                            );
                          }

                        case "Invoices":
                          return (
                            <div
                              className={cn(
                                "text-xs flex items-center gap-2",
                                isSelected
                                  ? "text-white/80"
                                  : "text-gray-600",
                              )}
                            >
                              <Badge
                                className={cn(
                                  "text-[10px] px-1.5 py-0 h-4 font-medium",
                                  isSelected
                                    ? "bg-white/20 text-white border-white/30"
                                    : "bg-green-100 text-green-700 border-green-200",
                                )}
                              >
                                {contextInfo.paidCount} Paid
                              </Badge>
                              <Badge
                                className={cn(
                                  "text-[10px] px-1.5 py-0 h-4 font-medium",
                                  isSelected
                                    ? "bg-white/20 text-white border-white/30"
                                    : "bg-blue-100 text-blue-700 border-blue-200",
                                )}
                              >
                                {contextInfo.pendingCount}{" "}
                                Pending
                              </Badge>
                              <Badge
                                className={cn(
                                  "text-[10px] px-1.5 py-0 h-4 font-medium",
                                  isSelected
                                    ? "bg-white/20 text-white border-white/30"
                                    : "bg-red-100 text-red-700 border-red-200",
                                )}
                              >
                                {contextInfo.overdueCount}{" "}
                                Overdue
                              </Badge>
                            </div>
                          );

                        case "Signatures":
                          return (
                            <div
                              className={cn(
                                "text-xs flex items-center gap-2",
                                isSelected
                                  ? "text-white/80"
                                  : "text-gray-600",
                              )}
                            >
                              <Badge
                                className={cn(
                                  "text-[10px] px-1.5 py-0 h-4 font-medium",
                                  contextInfo.pending > 0
                                    ? isSelected
                                      ? "bg-white/20 text-white border-white/30"
                                      : "bg-orange-100 text-orange-700 border-orange-200"
                                    : isSelected
                                      ? "bg-white/20 text-white border-white/30"
                                      : "bg-green-100 text-green-700 border-green-200",
                                )}
                              >
                                {contextInfo.pending > 0
                                  ? `${contextInfo.pending} pending`
                                  : "✓ All complete"}
                              </Badge>
                              <span
                                className={cn(
                                  isSelected
                                    ? "text-white/40"
                                    : "text-gray-300",
                                )}
                              >
                                •
                              </span>
                              <span className="font-medium">
                                {contextInfo.completed}
                              </span>
                              <span>
                                {contextInfo.pending > 0
                                  ? "signed"
                                  : "total"}
                              </span>
                            </div>
                          );

                        case "Documents":
                          return (
                            <div
                              className={cn(
                                "text-xs flex items-center gap-2",
                                isSelected
                                  ? "text-white/80"
                                  : "text-gray-600",
                              )}
                            >
                              <Badge
                                className={cn(
                                  "text-[10px] px-1.5 py-0 h-4 font-medium",
                                  isSelected
                                    ? "bg-white/20 text-white border-white/30"
                                    : "bg-green-100 text-green-700 border-green-200",
                                )}
                              >
                                {contextInfo.receivedCount}{" "}
                                Received
                              </Badge>
                              <Badge
                                className={cn(
                                  "text-[10px] px-1.5 py-0 h-4 font-medium",
                                  isSelected
                                    ? "bg-white/20 text-white border-white/30"
                                    : "bg-blue-100 text-blue-700 border-blue-200",
                                )}
                              >
                                {contextInfo.pendingCount}{" "}
                                Pending
                              </Badge>
                              <Badge
                                className={cn(
                                  "text-[10px] px-1.5 py-0 h-4 font-medium",
                                  isSelected
                                    ? "bg-white/20 text-white border-white/30"
                                    : "bg-amber-100 text-amber-700 border-amber-200",
                                )}
                              >
                                {contextInfo.needReviewCount}{" "}
                                Need Review
                              </Badge>
                            </div>
                          );

                        case "Activity":
                          return (
                            <div
                              className={cn(
                                "text-xs flex items-center gap-2",
                                isSelected
                                  ? "text-white/80"
                                  : "text-gray-600",
                              )}
                            >
                              <Zap className="w-3 h-3 flex-shrink-0" />
                              <span
                                className={cn(
                                  isSelected
                                    ? "text-white/60"
                                    : "text-gray-500",
                                )}
                              >
                                Last activity:
                              </span>
                              <span>
                                {contextInfo.lastActivity}
                              </span>
                            </div>
                          );

                        case "Notes":
                          return (
                            <div
                              className={cn(
                                "text-xs flex items-center gap-2",
                                isSelected
                                  ? "text-white/80"
                                  : "text-gray-600",
                              )}
                            >
                              <StickyNote className="w-3 h-3 flex-shrink-0" />
                              <span className="font-medium">
                                {contextInfo.count}
                              </span>
                              <span>
                                note
                                {contextInfo.count > 1
                                  ? "s"
                                  : ""}
                              </span>
                              <span
                                className={cn(
                                  isSelected
                                    ? "text-white/40"
                                    : "text-gray-300",
                                )}
                              >
                                •
                              </span>
                              <span
                                className={cn(
                                  isSelected
                                    ? "text-white/60"
                                    : "text-gray-500",
                                )}
                              >
                                Last:
                              </span>
                              <span>
                                {contextInfo.lastNote}
                              </span>
                            </div>
                          );

                        case "Organizer":
                          return (
                            <div
                              className={cn(
                                "text-xs flex items-center gap-2",
                                isSelected
                                  ? "text-white/80"
                                  : "text-gray-600",
                              )}
                            >
                              <Badge
                                className={cn(
                                  "text-[10px] px-1.5 py-0 h-4 font-medium",
                                  contextInfo.pending > 0
                                    ? isSelected
                                      ? "bg-white/20 text-white border-white/30"
                                      : "bg-purple-100 text-purple-700 border-purple-200"
                                    : isSelected
                                      ? "bg-white/20 text-white border-white/30"
                                      : "bg-green-100 text-green-700 border-green-200",
                                )}
                              >
                                {contextInfo.pending > 0
                                  ? `${contextInfo.pending} pending`
                                  : "✓ All complete"}
                              </Badge>
                              <span
                                className={cn(
                                  isSelected
                                    ? "text-white/40"
                                    : "text-gray-300",
                                )}
                              >
                                •
                              </span>
                              <span className="font-medium">
                                {contextInfo.completed}
                              </span>
                              <span>
                                {contextInfo.pending > 0
                                  ? "completed"
                                  : "total"}
                              </span>
                            </div>
                          );

                        default:
                          return null;
                      }
                    })()}
                  </div>
                </button>

                {/* Right Side: Unread Badge + Menu */}
                <div
                  className="flex items-center self-stretch flex-shrink-0 gap-2 justify-end"
                >
                  {/* Unread Badge */}
                  {(() => {
                    const contextInfo = getContextualInfo(
                      client,
                      activeTab,
                      communicationSubTab,
                    );
                    return (
                      viewType === "list" &&
                      activeTab === "Communication" &&
                      contextInfo.unreadCount > 0 && (
                        <Badge className="text-[10px] px-1.5 py-0 h-4 font-medium bg-red-500 text-white border-red-600">
                          {contextInfo.unreadCount} new
                        </Badge>
                      )
                    );
                  })()}

                  {/* Action Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className={cn(
                          "h-7 w-7 p-0 rounded-lg flex items-center justify-center transition-all flex-shrink-0",
                          isSelected
                            ? "hover:bg-white/20 text-white"
                            : "hover:bg-gray-100",
                        )}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-56"
                    >
                      <DropdownMenuItem>
                        <Edit className="w-4 h-4 mr-2" />
                        <span className="font-medium">
                          Edit Client
                        </span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Key className="w-4 h-4 mr-2" />
                        Send Credentials
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Mail className="w-4 h-4 mr-2" />
                        Send Email
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Send Text
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Users className="w-4 h-4 mr-2" />
                        Assign Client Group
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Change Assigned Person
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Calendar className="w-4 h-4 mr-2" />
                        Create Meeting
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Create Subscription
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <StickyNote className="w-4 h-4 mr-2" />
                        Add Note
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Task
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Key className="w-4 h-4 mr-2" />
                        Reset Password
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600 font-medium">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Client
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })
        ) : (
          // Card View
          reorderedClients.map((client) => {
            const isExpanded = expandedClientId === client.id;
            const isSelected = selectedClient?.id === client.id;
            const isChecked = selectedClientIds.has(client.id);
            return (
              <div
                key={client.id}
                id={`client-${client.id}`}
                className={cn(
                  "w-full p-4 mb-2 rounded-xl transition-all duration-200 group border",
                  isSelected
                    ? "bg-selected shadow-xl scale-[0.98] border-transparent"
                    : isChecked
                      ? "bg-selected-lighter border-brand-light"
                      : "bg-white hover:bg-gradient-to-br hover:from-gray-50 hover:to-white hover:shadow-lg hover:shadow-gray-900/5 border-gray-200/50",
                )}
              >
                {/* TOP SECTION: Demographics */}
                <div className="flex items-start gap-3">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() =>
                      handleSelectClient(client.id)
                    }
                    onClick={(e) => e.stopPropagation()}
                    className={cn(
                      "mt-1 rounded border-gray-300 focus:ring-purple-500 flex-shrink-0",
                      isSelected &&
                        "border-white/50 text-white",
                    )}
                  />

                  {/* Client Demographic Info */}
                  <div
                    onClick={() => handleClientClick(client)}
                    className="flex items-start gap-3 flex-1 min-w-0 cursor-pointer"
                  >
                    {/* Type Icon */}
                    <div
                      className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md",
                        client.type === "Business"
                          ? isSelected
                            ? "bg-white/20 shadow-white/20"
                            : "bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/30"
                          : isSelected
                            ? "bg-white/20 shadow-white/20"
                            : "bg-gradient-to-br from-green-500 to-green-600 shadow-green-500/30",
                      )}
                    >
                      {client.type === "Business" ? (
                        <Building2 className="w-6 h-6 text-white" />
                      ) : (
                        <User className="w-6 h-6 text-white" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div
                          className={cn(
                            "text-[15px] font-medium tracking-tight truncate",
                            isSelected
                              ? "text-white"
                              : "text-gray-900",
                          )}
                        >
                          {client.name}
                        </div>
                      </div>

                      <div
                        className={cn(
                          "text-[13px] truncate mt-1 font-normal",
                          isSelected
                            ? "text-white/75"
                            : "text-gray-600",
                        )}
                      >
                        {(() => {
                          const formatPhone = (
                            phone: string,
                          ) => {
                            const cleaned = phone
                              .replace(/^\+1\s*/, "")
                              .replace(/\D/g, "");
                            if (cleaned.length === 10) {
                              return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
                            }
                            return phone;
                          };
                          const formattedPhone = formatPhone(
                            client.phone,
                          );
                          return client.type === "Individual"
                            ? formattedPhone
                            : `${client.firstName} ${client.lastName} • ${formattedPhone}`;
                        })()}
                      </div>

                      <div
                        className={cn(
                          "text-[12px] truncate mt-0.5 font-normal",
                          isSelected
                            ? "text-white/60"
                            : "text-gray-500",
                        )}
                      >
                        {client.email}
                      </div>

                      <div
                        className={cn(
                          "text-[11px] mt-1 font-normal",
                          isSelected
                            ? "text-white/50"
                            : "text-gray-400",
                        )}
                      >
                        Created:{" "}
                        {new Date(
                          client.createdDate,
                        ).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Unread Badge + Menu */}
                  <div
                    className="flex items-center self-stretch flex-shrink-0 gap-2 justify-end"
                  >
                    {/* Unread Badge */}
                    {(() => {
                      const contextInfo = getContextualInfo(
                        client,
                        activeTab,
                        communicationSubTab,
                      );
                      return (
                        viewType === "list" &&
                        activeTab === "Communication" &&
                        contextInfo.unreadCount > 0 && (
                          <Badge className="text-[10px] px-1.5 py-0 h-4 font-medium bg-red-500 text-white border-red-600">
                            {contextInfo.unreadCount} new
                          </Badge>
                        )
                      );
                    })()}

                    {/* Action Menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className={cn(
                            "h-7 w-7 p-0 rounded-lg flex items-center justify-center transition-all flex-shrink-0",
                            isSelected
                              ? "hover:bg-white/20 text-white"
                              : "hover:bg-gray-100",
                          )}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-56"
                      >
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          <span className="font-medium">
                            Edit Client
                          </span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Key className="w-4 h-4 mr-2" />
                          Send Credentials
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="w-4 h-4 mr-2" />
                          Send Email
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Send Text
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Users className="w-4 h-4 mr-2" />
                          Assign Client Group
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <UserPlus className="w-4 h-4 mr-2" />
                          Change Assigned Person
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Calendar className="w-4 h-4 mr-2" />
                          Create Meeting
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <CreditCard className="w-4 h-4 mr-2" />
                          Create Subscription
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <StickyNote className="w-4 h-4 mr-2" />
                          Add Note
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Plus className="w-4 h-4 mr-2" />
                          Create Task
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Key className="w-4 h-4 mr-2" />
                          Reset Password
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600 font-medium">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Client
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* BOTTOM SECTION: Wide Content Area (90% width) */}
                <div
                  className="mt-3 ml-4"
                  style={{ width: "calc(100% - 1rem)" }}
                >
                  {/* Tags Preview (when collapsed) */}
                  {!isExpanded && (
                    <div
                      onClick={() => handleClientClick(client)}
                      className="cursor-pointer"
                    >
                      <div className="flex flex-wrap gap-1 items-center">
                        {client.tags
                          .slice(0, 6)
                          .map((tag, idx) => (
                            <Badge
                              key={idx}
                              variant={
                                isSelected
                                  ? "secondary"
                                  : "outline"
                              }
                              className={cn(
                                "text-xs",
                                isSelected &&
                                  "bg-white/20 text-white border-white/30",
                              )}
                            >
                              {tag}
                            </Badge>
                          ))}
                        {client.tags.length > 6 && (
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs",
                              isSelected &&
                                "bg-white/20 text-white border-white/30",
                            )}
                          >
                            +{client.tags.length - 6}
                          </Badge>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                              className={cn(
                                "w-5 h-5 rounded flex items-center justify-center transition-all",
                                isSelected
                                  ? "bg-white/20 hover:bg-white/30 text-white"
                                  : "bg-gray-100 hover:bg-gray-200 text-gray-600",
                              )}
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="start"
                            className="w-56"
                          >
                            <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">
                              Manage Groups
                            </div>
                            <DropdownMenuSeparator />
                            {availableGroups.map((group) => {
                              const hasGroup =
                                client.tags.includes(group);
                              return (
                                <DropdownMenuItem
                                  key={group}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const newTags = hasGroup
                                      ? client.tags.filter(
                                          (t) => t !== group,
                                        )
                                      : [...client.tags, group];
                                    onUpdateClient(client.id, {
                                      tags: newTags,
                                    });
                                  }}
                                  className="cursor-pointer flex items-center justify-between"
                                >
                                  <span>{group}</span>
                                  {hasGroup && (
                                    <CheckSquare className="w-4 h-4 icon-brand" />
                                  )}
                                </DropdownMenuItem>
                              );
                            })}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  )}

                  {/* Expanded View */}
                  {isExpanded && (
                    <div>
                      {/* Client Groups */}
                      <div>
                        <div
                          className={cn(
                            "text-[10px] uppercase tracking-wider mb-2 font-semibold",
                            isSelected
                              ? "text-white/70"
                              : "text-gray-500",
                          )}
                        >
                          Client Groups
                        </div>
                        <div className="flex flex-wrap gap-1 items-center">
                          {client.tags.map((tag, idx) => (
                            <Badge
                              key={idx}
                              variant={
                                isSelected
                                  ? "secondary"
                                  : "outline"
                              }
                              className={cn(
                                "text-xs",
                                isSelected &&
                                  "bg-white/20 text-white border-white/30",
                              )}
                            >
                              {tag}
                            </Badge>
                          ))}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                }}
                                className={cn(
                                  "w-5 h-5 rounded flex items-center justify-center transition-all",
                                  isSelected
                                    ? "bg-white/20 hover:bg-white/30 text-white"
                                    : "bg-gray-100 hover:bg-gray-200 text-gray-600",
                                )}
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="start"
                              className="w-56"
                            >
                              <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">
                                Manage Groups
                              </div>
                              <DropdownMenuSeparator />
                              {availableGroups.map((group) => {
                                const hasGroup =
                                  client.tags.includes(group);
                                return (
                                  <DropdownMenuItem
                                    key={group}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const newTags = hasGroup
                                        ? client.tags.filter(
                                            (t) => t !== group,
                                          )
                                        : [
                                            ...client.tags,
                                            group,
                                          ];
                                      onUpdateClient(
                                        client.id,
                                        { tags: newTags },
                                      );
                                    }}
                                    className="cursor-pointer flex items-center justify-between"
                                  >
                                    <span>{group}</span>
                                    {hasGroup && (
                                      <CheckSquare className="w-4 h-4 icon-brand" />
                                    )}
                                  </DropdownMenuItem>
                                );
                              })}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      {/* Divider */}
                      <div
                        className={cn(
                          "my-3 border-t",
                          isSelected
                            ? "border-white/20"
                            : "border-gray-200",
                        )}
                      />

                      {/* Assigned To */}
                      <div
                        className={cn(
                          "flex items-center gap-2 text-xs",
                          isSelected
                            ? "text-white/80"
                            : "text-gray-600",
                        )}
                      >
                        <User className="w-3 h-3" />
                        <span>Assigned to: </span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              onClick={(e) =>
                                e.stopPropagation()
                              }
                              className={cn(
                                "font-medium hover:underline cursor-pointer",
                                isSelected
                                  ? "text-white"
                                  : "text-gray-900 hover:text-purple-700",
                              )}
                            >
                              {client.assignedTo}
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="start"
                            className="w-48"
                          >
                            {teamMembers.map((member) => (
                              <DropdownMenuItem
                                key={member}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onUpdateClient(client.id, {
                                    assignedTo: member,
                                  });
                                }}
                                className={cn(
                                  "cursor-pointer",
                                  client.assignedTo ===
                                    member &&
                                    "bg-purple-50 text-purple-700",
                                )}
                              >
                                <User className="w-4 h-4 mr-2" />
                                {member}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Quick Actions - Single Row */}
                      <div className="mt-3">
                        <div
                          className={cn(
                            "text-[10px] uppercase tracking-wider mb-2 font-semibold",
                            isSelected
                              ? "text-white/70"
                              : "text-gray-500",
                          )}
                        >
                          Quick Actions
                        </div>
                        <div className="grid grid-cols-8 gap-1">
                          {/* Email */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle email
                            }}
                            className={cn(
                              "flex flex-col items-center gap-1 transition-all",
                              isSelected
                                ? "text-white hover:opacity-80"
                                : "text-gray-600 hover:text-purple-700",
                            )}
                          >
                            <div
                              className={cn(
                                "w-9 h-9 rounded-full flex items-center justify-center transition-all",
                                isSelected
                                  ? "bg-white/20 hover:bg-white/30"
                                  : "bg-purple-50 hover:bg-purple-100",
                              )}
                            >
                              <Mail className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] font-medium">
                              Email
                            </span>
                          </button>

                          {/* Text */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle text
                            }}
                            className={cn(
                              "flex flex-col items-center gap-1 transition-all",
                              isSelected
                                ? "text-white hover:opacity-80"
                                : "text-gray-600 hover:text-purple-700",
                            )}
                          >
                            <div
                              className={cn(
                                "w-9 h-9 rounded-full flex items-center justify-center transition-all",
                                isSelected
                                  ? "bg-white/20 hover:bg-white/30"
                                  : "bg-purple-50 hover:bg-purple-100",
                              )}
                            >
                              <MessageSquare className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] font-medium">
                              Text
                            </span>
                          </button>

                          {/* Chat */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle chat
                            }}
                            className={cn(
                              "flex flex-col items-center gap-1 transition-all",
                              isSelected
                                ? "text-white hover:opacity-80"
                                : "text-gray-600 hover:text-purple-700",
                            )}
                          >
                            <div
                              className={cn(
                                "w-9 h-9 rounded-full flex items-center justify-center transition-all",
                                isSelected
                                  ? "bg-white/20 hover:bg-white/30"
                                  : "bg-purple-50 hover:bg-purple-100",
                              )}
                            >
                              <MessagesSquare className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] font-medium">
                              Chat
                            </span>
                          </button>

                          {/* Task */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle task
                            }}
                            className={cn(
                              "flex flex-col items-center gap-1 transition-all",
                              isSelected
                                ? "text-white hover:opacity-80"
                                : "text-gray-600 hover:text-purple-700",
                            )}
                          >
                            <div
                              className={cn(
                                "w-9 h-9 rounded-full flex items-center justify-center transition-all",
                                isSelected
                                  ? "bg-white/20 hover:bg-white/30"
                                  : "bg-purple-50 hover:bg-purple-100",
                              )}
                            >
                              <CheckCheck className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] font-medium">
                              Task
                            </span>
                          </button>

                          {/* Note */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle note
                            }}
                            className={cn(
                              "flex flex-col items-center gap-1 transition-all",
                              isSelected
                                ? "text-white hover:opacity-80"
                                : "text-gray-600 hover:text-purple-700",
                            )}
                          >
                            <div
                              className={cn(
                                "w-9 h-9 rounded-full flex items-center justify-center transition-all",
                                isSelected
                                  ? "bg-white/20 hover:bg-white/30"
                                  : "bg-purple-50 hover:bg-purple-100",
                              )}
                            >
                              <StickyNote className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] font-medium">
                              Note
                            </span>
                          </button>

                          {/* Request Docs */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle request doc
                            }}
                            className={cn(
                              "flex flex-col items-center gap-1 transition-all",
                              isSelected
                                ? "text-white hover:opacity-80"
                                : "text-gray-600 hover:text-purple-700",
                            )}
                          >
                            <div
                              className={cn(
                                "w-9 h-9 rounded-full flex items-center justify-center transition-all",
                                isSelected
                                  ? "bg-white/20 hover:bg-white/30"
                                  : "bg-purple-50 hover:bg-purple-100",
                              )}
                            >
                              <Upload className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] font-medium">
                              Docs
                            </span>
                          </button>

                          {/* Signature */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle signature
                            }}
                            className={cn(
                              "flex flex-col items-center gap-1 transition-all",
                              isSelected
                                ? "text-white hover:opacity-80"
                                : "text-gray-600 hover:text-purple-700",
                            )}
                          >
                            <div
                              className={cn(
                                "w-9 h-9 rounded-full flex items-center justify-center transition-all",
                                isSelected
                                  ? "bg-white/20 hover:bg-white/30"
                                  : "bg-purple-50 hover:bg-purple-100",
                              )}
                            >
                              <FileSignature className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] font-medium">
                              Signature
                            </span>
                          </button>

                          {/* More (dropdown) */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                }}
                                className={cn(
                                  "flex flex-col items-center gap-1 transition-all",
                                  isSelected
                                    ? "text-white hover:opacity-80"
                                    : "text-gray-600 hover:text-purple-700",
                                )}
                              >
                                <div
                                  className={cn(
                                    "w-9 h-9 rounded-full flex items-center justify-center transition-all",
                                    isSelected
                                      ? "bg-white/20 hover:bg-white/30"
                                      : "bg-purple-50 hover:bg-purple-100",
                                  )}
                                >
                                  <MoreHorizontal className="w-4 h-4" />
                                </div>
                                <span className="text-[10px] font-medium">
                                  More
                                </span>
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="w-48"
                            >
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Handle organizer
                                }}
                              >
                                <FolderOpen className="w-4 h-4 mr-2" />
                                Organizer
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Handle meeting
                                }}
                              >
                                <Calendar className="w-4 h-4 mr-2" />
                                Meeting
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Client Groups Dialog */}
      <ClientGroupsDialog
        open={showGroupsDialog}
        onOpenChange={setShowGroupsDialog}
        groups={clientGroups}
        onUpdateGroups={setClientGroups}
      />

      {/* Quick Add Client Dialog */}
      <AddQuickClientDialog
        open={showQuickAddDialog}
        onOpenChange={setShowQuickAddDialog}
        clientGroups={clientGroups}
      />

      {/* Bulk Action Dialogs */}
      <AssignToDialog
        isOpen={showAssignToDialog}
        onClose={() => setShowAssignToDialog(false)}
        selectedCount={selectedClientIds.size}
        onAssign={(teamMemberIds) => {
          console.log(
            "Assigning to team members:",
            teamMemberIds,
          );
          console.log(
            "Selected clients:",
            Array.from(selectedClientIds),
          );
        }}
      />

      <CreateFoldersDialog
        isOpen={showCreateFoldersDialog}
        onClose={() => setShowCreateFoldersDialog(false)}
        selectedCount={selectedClientIds.size}
        onCreateFolders={(template) => {
          console.log(
            "Creating folders from template:",
            template,
          );
          console.log(
            "For clients:",
            Array.from(selectedClientIds),
          );
        }}
      />

      <CreateProjectDialog
        isOpen={showCreateProjectDialog}
        onClose={() => setShowCreateProjectDialog(false)}
        selectedCount={selectedClientIds.size}
        onCreateProject={(data) => {
          console.log("Creating project:", data);
          console.log(
            "For clients:",
            Array.from(selectedClientIds),
          );
        }}
      />

      <InviteToMeetingDialog
        isOpen={showInviteToMeetingDialog}
        onClose={() => setShowInviteToMeetingDialog(false)}
        selectedCount={selectedClientIds.size}
        onInvite={(meetingId) => {
          console.log("Inviting to meeting:", meetingId);
          console.log(
            "Selected clients:",
            Array.from(selectedClientIds),
          );
        }}
      />

      <SendLoginDialog
        isOpen={showSendLoginDialog}
        onClose={() => setShowSendLoginDialog(false)}
        selectedCount={selectedClientIds.size}
        onSendLogin={() => {
          console.log("Sending login instructions via email");
          console.log(
            "To clients:",
            Array.from(selectedClientIds),
          );
        }}
      />

      <BulkDeleteDialog
        isOpen={showBulkDeleteDialog}
        onClose={() => setShowBulkDeleteDialog(false)}
        selectedCount={selectedClientIds.size}
        clientNames={Array.from(selectedClientIds).map((id) => {
          const client = clients.find((c) => c.id === id);
          return client?.name || "Unknown Client";
        })}
        onConfirmDelete={() => {
          console.log(
            "Deleting clients:",
            Array.from(selectedClientIds),
          );
          setSelectedClientIds(new Set());
        }}
      />

      {/* Full Add Client Wizard - Now a dedicated page at /clients/add */}
      {/* Import Clients Wizard - Now a dedicated page at /clients/import */}
    </div>
  );
}