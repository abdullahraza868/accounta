import { useState } from "react";
import {
  Camera,
  Save,
  User,
  Bell,
  Video,
  Shield,
  Calendar,
  Briefcase,
  Settings,
  CheckCircle,
  AlertCircle,
  Clock,
  Plane,
  Umbrella,
  Heart,
  TrendingUp,
  FileText,
  Plus,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../components/ui/avatar";
import { Switch } from "../../../components/ui/switch";
import { Card, CardContent } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/tabs";
import { useAuth } from "../../../contexts/AuthContext";
import { apiService } from "../../../services/ApiService";
import { toast } from "sonner@2.0.3";
import { MeetingPlatformSetupDialog } from "../../../components/company-settings-tabs/MeetingPlatformSetupDialog";
import { StandaloneHRBenefits } from "../../../components/StandaloneHRBenefits";
import { StandaloneMyTimeEntry } from "../../../components/StandaloneMyTimeEntry";
import { StandaloneMyAnalytics } from "../../../components/StandaloneMyAnalytics";
import { StandaloneMyPayroll } from "../../../components/StandaloneMyPayroll";

type MeetingPlatform = "zoom" | "google-meet" | "teams";

type PersonalIntegration = {
  id: string;
  platform: MeetingPlatform;
  accountEmail: string;
  status: "connected" | "disconnected";
  connectedAt: Date;
};

export function MyAccountView() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [isSaving, setIsSaving] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] =
    useState(false);

  // Meeting platform dialog state
  const [meetingDialogOpen, setMeetingDialogOpen] =
    useState(false);
  const [selectedPlatform, setSelectedPlatform] =
    useState<MeetingPlatform>("zoom");

  // Form state
  const [formData, setFormData] = useState({
    firstName: user?.name?.split(" ")[0] || "",
    middleName: "",
    lastName: user?.name?.split(" ")[1] || "User",
    email: user?.emailAddress || "",
    phoneNumber: "",
    phoneCountryCode: "+91",
  });

  // Personal integrations (meeting platforms)
  const [personalIntegrations, setPersonalIntegrations] =
    useState<PersonalIntegration[]>([
      {
        id: "zoom-1",
        platform: "zoom",
        accountEmail: "john@example.com",
        status: "connected",
        connectedAt: new Date(
          Date.now() - 7 * 24 * 60 * 60 * 1000,
        ),
      },
    ]);

  // Notification preferences
  const [notificationPreferences, setNotificationPreferences] =
    useState({
      emailNotifications: true,
      smsNotifications: false,
      taskReminders: true,
      deadlineAlerts: true,
      clientMessages: true,
      documentUploads: true,
      calendarReminders: true,
      weeklyDigest: false,
    });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await apiService.updateProfile({
        name: formData.firstName,
        surname: formData.lastName,
        emailAddress: formData.email,
        phoneNumber: formData.phoneNumber
          ? `${formData.phoneCountryCode}${formData.phoneNumber}`
          : undefined,
      });
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(
        "Failed to update profile. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleConnectMeetingPlatform = (
    platform: MeetingPlatform,
  ) => {
    setSelectedPlatform(platform);
    setMeetingDialogOpen(true);
  };

  const handleMeetingPlatformConnected = (data: any) => {
    const newIntegration: PersonalIntegration = {
      id: `${data.platform}-${Date.now()}`,
      platform: data.platform,
      accountEmail: data.accountEmail,
      status: "connected",
      connectedAt: new Date(),
    };
    setPersonalIntegrations((prev) => [
      ...prev,
      newIntegration,
    ]);
    setMeetingDialogOpen(false);
    toast.success(`${data.platform} connected successfully!`);
  };

  const handleDisconnectIntegration = (
    integrationId: string,
  ) => {
    setPersonalIntegrations((prev) =>
      prev.map((int) =>
        int.id === integrationId
          ? { ...int, status: "disconnected" as const }
          : int,
      ),
    );
    toast.success("Integration disconnected");
  };

  const handleSaveNotificationPreferences = async () => {
    try {
      // TODO: Save to API
      toast.success("Notification preferences saved!");
    } catch (error) {
      toast.error("Failed to save preferences");
    }
  };

  const initials =
    `${formData.firstName.charAt(0)}${formData.lastName.charAt(0)}`.toUpperCase();

  const platformConfig = {
    zoom: { name: "Zoom", icon: Video, color: "blue" },
    "google-meet": {
      name: "Google Meet",
      icon: Calendar,
      color: "green",
    },
    teams: {
      name: "Microsoft Teams",
      icon: Video,
      color: "purple",
    },
  };

  return (
    <div
      className="flex-1 flex min-w-0 overflow-hidden"
    >
      {/* Left Sidebar - Sections List */}
      <aside className="w-72 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-gray-900 dark:text-gray-100">My Account</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage your personal settings
          </p>
        </div>
        
        {/* Sections Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'profile'
                  ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/30'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <User className="w-5 h-5 flex-shrink-0" />
              <span className="truncate">Profile</span>
            </button>

            <button
              onClick={() => setActiveTab('integrations')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'integrations'
                  ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/30'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Video className="w-5 h-5 flex-shrink-0" />
              <span className="truncate">My Integrations</span>
            </button>

            <button
              onClick={() => setActiveTab('schedule')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'schedule'
                  ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/30'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Clock className="w-5 h-5 flex-shrink-0" />
              <span className="truncate">Schedule Settings</span>
            </button>

            <button
              onClick={() => setActiveTab('notifications')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'notifications'
                  ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/30'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Bell className="w-5 h-5 flex-shrink-0" />
              <span className="truncate">Notifications</span>
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'security'
                  ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/30'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Shield className="w-5 h-5 flex-shrink-0" />
              <span className="truncate">Security</span>
            </button>

            <button
              onClick={() => setActiveTab('hr')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'hr'
                  ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/30'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Briefcase className="w-5 h-5 flex-shrink-0" />
              <span className="truncate">HR & Time Off</span>
            </button>

            <button
              onClick={() => setActiveTab('timeentry')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'timeentry'
                  ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/30'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Clock className="w-5 h-5 flex-shrink-0" />
              <span className="truncate">Time Entry</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'analytics'
                  ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/30'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <TrendingUp className="w-5 h-5 flex-shrink-0" />
              <span className="truncate">My Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab('payroll')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'payroll'
                  ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/30'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <FileText className="w-5 h-5 flex-shrink-0" />
              <span className="truncate">My Payroll</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="h-full overflow-auto bg-gray-50 dark:bg-gray-900" style={{ background: "var(--bgColorRightPanel, inherit)" }}>
          <div className="max-w-5xl mx-auto p-8">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <Card
                className="border shadow-sm"
                style={{
                  background: "var(--bgColor, #ffffff)",
                  borderColor: "var(--stokeColor, #e5e7eb)",
                }}
              >
                <CardContent className="pt-8">
                  {/* Avatar Section */}
                  <div className="flex flex-col items-center mb-8">
                    <div className="relative group">
                      <Avatar
                        className="w-32 h-32 border-4"
                        style={{
                          borderColor:
                            "var(--stokeColor, #e5e7eb)",
                        }}
                      >
                        <AvatarFallback
                          className="text-3xl text-white"
                          style={{
                            background:
                              "var(--primaryColor, #7c3aed)",
                          }}
                        >
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <button
                        className="absolute bottom-0 right-0 p-2 rounded-full bg-white dark:bg-gray-800 border-2 shadow-lg transition-transform hover:scale-110"
                        style={{
                          borderColor:
                            "var(--stokeColor, #e5e7eb)",
                        }}
                        onClick={() =>
                          toast.info("Photo upload coming soon!")
                        }
                      >
                        <Camera
                          className="w-4 h-4"
                          style={{
                            color: "var(--primaryColor, #7c3aed)",
                          }}
                        />
                      </button>
                    </div>
                    <h2 className="mt-4 text-gray-900 dark:text-gray-100">
                      {formData.firstName} {formData.lastName}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Firm Account
                    </p>
                    <Button
                      variant="ghost"
                      className="mt-2 text-sm"
                      style={{
                        color: "var(--primaryColor, #7c3aed)",
                      }}
                      onClick={() =>
                        toast.info(
                          "Reset photo functionality coming soon!",
                        )
                      }
                    >
                      Reset Profile Photo
                    </Button>
                  </div>

                  {/* Form Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="firstName">
                        First Name
                      </Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) =>
                          handleInputChange(
                            "firstName",
                            e.target.value,
                          )
                        }
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="middleName">
                        Middle Name
                      </Label>
                      <Input
                        id="middleName"
                        value={formData.middleName}
                        onChange={(e) =>
                          handleInputChange(
                            "middleName",
                            e.target.value,
                          )
                        }
                        className="mt-2"
                        placeholder="Optional"
                      />
                    </div>

                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) =>
                          handleInputChange(
                            "lastName",
                            e.target.value,
                          )
                        }
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">Email address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange(
                            "email",
                            e.target.value,
                          )
                        }
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="flex gap-2 mt-2">
                        <Select
                          value={formData.phoneCountryCode}
                          onValueChange={(value) =>
                            handleInputChange(
                              "phoneCountryCode",
                              value,
                            )
                          }
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="+1">
                              🇺🇸 +1
                            </SelectItem>
                            <SelectItem value="+44">
                              🇬🇧 +44
                            </SelectItem>
                            <SelectItem value="+91">
                              🇮🇳 +91
                            </SelectItem>
                            <SelectItem value="+86">
                              🇨🇳 +86
                            </SelectItem>
                            <SelectItem value="+81">
                              🇯🇵 +81
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phoneNumber}
                          onChange={(e) =>
                            handleInputChange(
                              "phoneNumber",
                              e.target.value,
                            )
                          }
                          placeholder="94184 21598"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-center mt-8">
                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="px-12 bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Personal Integrations Tab */}
            {activeTab === 'integrations' && (
              <div className="space-y-6">
                <Card
                  className="border shadow-sm"
                  style={{
                    background: "var(--bgColor, #ffffff)",
                    borderColor: "var(--stokeColor, #e5e7eb)",
                  }}
                >
                  <CardContent className="pt-6">
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        Personal Meeting Accounts
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Connect your personal meeting accounts to
                        use them for client appointments. These
                        override the firm's default meeting
                        platform.
                      </p>
                    </div>

                    {/* Connected Integrations */}
                    {personalIntegrations.length > 0 && (
                      <div className="space-y-3 mb-6">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Connected Accounts
                        </h4>
                        {personalIntegrations.map(
                          (integration) => {
                            const config =
                              platformConfig[
                                integration.platform
                              ];
                            const Icon = config.icon;

                            return (
                              <Card
                                key={integration.id}
                                className="p-4 border-2"
                                style={{
                                  borderColor:
                                    "var(--stokeColor, #e5e7eb)",
                                }}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div
                                      className={`w-10 h-10 rounded-lg bg-${config.color}-100 dark:bg-${config.color}-900/30 flex items-center justify-center`}
                                    >
                                      <Icon
                                        className={`w-5 h-5 text-${config.color}-600 dark:text-${config.color}-400`}
                                      />
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <p className="font-semibold text-gray-900 dark:text-gray-100">
                                          {config.name}
                                        </p>
                                        {integration.status ===
                                        "connected" ? (
                                          <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300">
                                            <CheckCircle className="w-3 h-3 mr-1" />
                                            Connected
                                          </Badge>
                                        ) : (
                                          <Badge className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300">
                                            <AlertCircle className="w-3 h-3 mr-1" />
                                            Disconnected
                                          </Badge>
                                        )}
                                      </div>
                                      <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {integration.accountEmail}
                                      </p>
                                      <p className="text-xs text-gray-500 dark:text-gray-500">
                                        Connected{" "}
                                        {integration.connectedAt.toLocaleDateString()}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    {integration.status ===
                                    "connected" ? (
                                      <>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() =>
                                            handleDisconnectIntegration(
                                              integration.id,
                                            )
                                          }
                                        >
                                          Disconnect
                                        </Button>
                                      </>
                                    ) : (
                                      <Button
                                        size="sm"
                                        onClick={() =>
                                          handleConnectMeetingPlatform(
                                            integration.platform,
                                          )
                                        }
                                        className="bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
                                      >
                                        Reconnect
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </Card>
                            );
                          },
                        )}
                      </div>
                    )}

                    {/* Available Platforms to Connect */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Available Platforms
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {(
                          [
                            "zoom",
                            "google-meet",
                            "teams",
                          ] as MeetingPlatform[]
                        ).map((platform) => {
                          const config = platformConfig[platform];
                          const Icon = config.icon;
                          const isConnected =
                            personalIntegrations.some(
                              (int) =>
                                int.platform === platform &&
                                int.status === "connected",
                            );

                          if (isConnected) return null;

                          return (
                            <Card
                              key={platform}
                              className="p-4 border-2 hover:border-purple-300 dark:hover:border-purple-700 transition-colors cursor-pointer"
                              onClick={() =>
                                handleConnectMeetingPlatform(
                                  platform,
                                )
                              }
                            >
                              <div className="flex flex-col items-center text-center gap-3">
                                <div
                                  className={`w-12 h-12 rounded-lg bg-${config.color}-100 dark:bg-${config.color}-900/30 flex items-center justify-center`}
                                >
                                  <Icon
                                    className={`w-6 h-6 text-${config.color}-600 dark:text-${config.color}-400`}
                                  />
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                                    {config.name}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Click to connect
                                  </p>
                                </div>
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <Card
                className="border shadow-sm"
                style={{
                  background: "var(--bgColor, #ffffff)",
                  borderColor: "var(--stokeColor, #e5e7eb)",
                }}
              >
                <CardContent className="pt-6">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Notification Preferences
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Choose how and when you want to receive
                      notifications
                    </p>
                  </div>

                  <div className="space-y-6">
                    {/* Delivery Methods */}
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-4">
                        Delivery Methods
                      </h4>
                      <div className="space-y-4">
                        <div
                          className="flex items-center justify-between p-4 rounded-lg border"
                          style={{
                            borderColor:
                              "var(--stokeColor, #e5e7eb)",
                          }}
                        >
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              Email Notifications
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Receive notifications via email
                            </p>
                          </div>
                          <Switch
                            checked={
                              notificationPreferences.emailNotifications
                            }
                            onCheckedChange={(checked) =>
                              setNotificationPreferences(
                                (prev) => ({
                                  ...prev,
                                  emailNotifications: checked,
                                }),
                              )
                            }
                          />
                        </div>

                        <div
                          className="flex items-center justify-between p-4 rounded-lg border"
                          style={{
                            borderColor:
                              "var(--stokeColor, #e5e7eb)",
                          }}
                        >
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              SMS Notifications
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Receive notifications via text
                              message
                            </p>
                          </div>
                          <Switch
                            checked={
                              notificationPreferences.smsNotifications
                            }
                            onCheckedChange={(checked) =>
                              setNotificationPreferences(
                                (prev) => ({
                                  ...prev,
                                  smsNotifications: checked,
                                }),
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>

                    {/* Notification Types */}
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-4">
                        Notification Types
                      </h4>
                      <div className="space-y-4">
                        {[
                          {
                            key: "taskReminders",
                            label: "Task Reminders",
                            desc: "Get reminded about upcoming tasks and deadlines",
                          },
                          {
                            key: "deadlineAlerts",
                            label: "Deadline Alerts",
                            desc: "Critical alerts for approaching deadlines",
                          },
                          {
                            key: "clientMessages",
                            label: "Client Messages",
                            desc: "When clients send you messages",
                          },
                          {
                            key: "documentUploads",
                            label: "Document Uploads",
                            desc: "When clients upload new documents",
                          },
                          {
                            key: "calendarReminders",
                            label: "Calendar Reminders",
                            desc: "Reminders for upcoming appointments",
                          },
                          {
                            key: "weeklyDigest",
                            label: "Weekly Digest",
                            desc: "Summary of your week every Sunday",
                          },
                        ].map((item) => (
                          <div
                            key={item.key}
                            className="flex items-center justify-between p-4 rounded-lg border"
                            style={{
                              borderColor:
                                "var(--stokeColor, #e5e7eb)",
                            }}
                          >
                            <div>
                              <p className="font-medium text-gray-900 dark:text-gray-100">
                                {item.label}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {item.desc}
                              </p>
                            </div>
                            <Switch
                              checked={
                                notificationPreferences[
                                  item.key as keyof typeof notificationPreferences
                                ] as boolean
                              }
                              onCheckedChange={(checked) =>
                                setNotificationPreferences(
                                  (prev) => ({
                                    ...prev,
                                    [item.key]: checked,
                                  }),
                                )
                              }
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-center mt-8">
                    <Button
                      onClick={handleSaveNotificationPreferences}
                      className="px-12 bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Preferences
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <Card
                className="border shadow-sm"
                style={{
                  background: "var(--bgColor, #ffffff)",
                  borderColor: "var(--stokeColor, #e5e7eb)",
                }}
              >
                <CardContent className="pt-6">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Security Settings
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Manage your account security and
                      authentication
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div
                      className="flex items-center justify-between p-4 rounded-lg border"
                      style={{
                        borderColor: "var(--stokeColor, #e5e7eb)",
                      }}
                    >
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          Two-Factor Authentication
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Add an extra layer of security to your
                          account
                        </p>
                      </div>
                      <Switch
                        checked={twoFactorEnabled}
                        onCheckedChange={setTwoFactorEnabled}
                      />
                    </div>

                    <div
                      className="p-4 rounded-lg border"
                      style={{
                        borderColor: "var(--stokeColor, #e5e7eb)",
                      }}
                    >
                      <p className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                        Password
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Last changed 30 days ago
                      </p>
                      <Button
                        variant="outline"
                        onClick={() =>
                          (window.location.href =
                            "/change-password")
                        }
                      >
                        Change Password
                      </Button>
                    </div>

                    <div
                      className="p-4 rounded-lg border"
                      style={{
                        borderColor: "var(--stokeColor, #e5e7eb)",
                      }}
                    >
                      <p className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                        Active Sessions
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        You're currently signed in on 2 devices
                      </p>
                      <Button variant="outline">
                        Manage Sessions
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Schedule Settings Tab */}
            {activeTab === 'schedule' && (
              <Card
                className="border shadow-sm"
                style={{
                  background: "var(--bgColor, #ffffff)",
                  borderColor: "var(--stokeColor, #e5e7eb)",
                }}
              >
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <Clock className="w-16 h-16 mx-auto mb-4 text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Personal Schedule Settings
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-4">
                      This will include your personal meeting
                      types, availability schedule, calendar
                      integration settings, and booking
                      preferences.
                    </p>
                    <p className="text-sm text-gray-500">
                      Same functionality as firm-level schedule
                      settings (Settings → Company Settings →
                      Schedule Settings), but specific to your
                      personal account. Users can create their own
                      meeting types and set their own availability
                      independently.
                    </p>
                    <Button
                      className="mt-6 bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
                      onClick={() =>
                        toast.info(
                          "Personal schedule settings coming in next phase",
                        )
                      }
                    >
                      Set Up My Schedule
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* HR Tab (Coming Soon) */}
            {activeTab === 'hr' && (
              <div className="space-y-6">
                <div className="min-h-screen">
                  <StandaloneHRBenefits />
                </div>
              </div>
            )}

            {/* Time Entry Tab */}
            {activeTab === 'timeentry' && (
              <StandaloneMyTimeEntry />
            )}

            {/* My Analytics Tab */}
            {activeTab === 'analytics' && (
              <StandaloneMyAnalytics />
            )}

            {/* My Payroll Tab */}
            {activeTab === 'payroll' && (
              <StandaloneMyPayroll />
            )}
          </div>

          {/* Footer */}
          <div
            className="mt-8 pt-6 border-t text-center"
            style={{ borderColor: "var(--stokeColor, #e5e7eb)" }}
          >
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Copyright © 2025, Acounta ® Inc. All Rights
              Reserved.{" "}
              <a
                href="tel:923-226-8682"
                className="hover:underline"
                style={{ color: "var(--primaryColor, #7c3aed)" }}
              >
                923-ACOUNTA (226-8682)
              </a>
            </p>
            <div className="flex items-center justify-center gap-4 mt-3">
              <a
                href="#"
                className="text-xs text-gray-500 dark:text-gray-400 hover:underline"
                style={{ color: "var(--primaryColor, #7c3aed)" }}
              >
                Terms & Conditions
              </a>
              <span className="text-gray-300">•</span>
              <a
                href="#"
                className="text-xs text-gray-500 dark:text-gray-400 hover:underline"
                style={{ color: "var(--primaryColor, #7c3aed)" }}
              >
                Privacy Policy
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Meeting Platform Setup Dialog */}
      <MeetingPlatformSetupDialog
        open={meetingDialogOpen}
        onOpenChange={setMeetingDialogOpen}
        platform={selectedPlatform}
        level="personal"
        onComplete={handleMeetingPlatformConnected}
      />
    </div>
  );
}