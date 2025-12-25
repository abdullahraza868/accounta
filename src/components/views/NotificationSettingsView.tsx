import { useState, useMemo, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  User,
  Briefcase,
  CheckSquare,
  Calendar,
  FileText,
  Repeat,
  PenLine,
  Download,
  Users,
  UserCircle,
  Settings,
  Shield,
  Search,
  ChevronDown,
  ChevronUp,
  Bell,
  Moon,
  RefreshCw,
  Check,
  X,
  AlertCircle,
  Smartphone,
  Mail as MailIcon,
  MessageSquare,
  Clock,
  Edit2,
  Save,
  Power,
  Volume2,
  VolumeX,
  RotateCcw,
  Wand2,
  LayoutDashboard,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../ui/utils';
import {
  NotificationChannel,
  NotificationCategory,
  NotificationFrequency,
  UserRole,
  NotificationPriority,
} from '../../types/notifications';
import { ALL_NOTIFICATION_TYPES, CATEGORY_INFO, getNotificationsByCategory, WIZARD_QUESTION_GROUPS, getPrioritySettings } from '../../data/notificationTypes';
import { NotificationSetupWizard, WizardAnswers } from '../NotificationSetupWizard';
import { generateSmartCategoryDefaults, DEFAULT_QUIET_HOURS } from '../../data/notificationDefaults';
import { NotificationDefaultsDebug } from '../NotificationDefaultsDebug';

// Icon mapping
const ICON_MAP: Record<string, any> = {
  User,
  Briefcase,
  CheckSquare,
  Calendar,
  FileText,
  Repeat,
  PenLine,
  Download,
  Users,
  UserCircle,
  Settings,
  Shield,
};

// Mock user preferences (in real app, this would come from API/context)
const INITIAL_USER_SETTINGS = {
  userId: 'user-1',
  role: 'manager' as UserRole,
  categoryDefaults: generateSmartCategoryDefaults(),
  preferences: [],
  customMessages: {} as Record<string, string>, // Custom notification messages
  customTitles: {} as Record<string, string>, // Custom notification titles
  quietHours: DEFAULT_QUIET_HOURS,
};

// Helper function to generate example notification text
const getNotificationExample = (notificationId: string): string => {
  const examples: Record<string, string> = {
    'client-new-registration': 'John Smith has created a new account',
    'client-document-uploaded': "Sarah Johnson uploaded 'Tax Documents 2024.pdf'",
    'client-payment-made': 'Payment of $1,250.00 received from Acme Corp',
    'client-portal-login': 'Michael Brown logged in from Chrome on Windows',
    'client-message-sent': "Lisa Anderson: 'Can we schedule a meeting next week?'",
    'client-profile-updated': 'David Martinez updated their contact information',
    'client-invitation-accepted': 'Jennifer Wilson accepted your invitation',
    'invoice-overdue': 'Invoice #2024-001 is now 5 days overdue',
    'invoice-paid': 'Invoice #2024-003 has been paid in full',
    'invoice-viewed': 'Client viewed Invoice #2024-005',
    'signature-completed': 'All parties have signed Form 8879',
    'signature-declined': 'Client declined to sign Engagement Letter',
    'task-assigned': "New task assigned: 'Review Q4 financials'",
    'task-due-soon': "Task 'Prepare tax return' is due in 2 hours",
  };
  return examples[notificationId] || 'Example notification message';
};

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

type ViewMode = 'overview' | NotificationCategory;

export function NotificationSettingsView() {
  const [userSettings, setUserSettings] = useState(() => {
    const savedSettings = localStorage.getItem('notificationSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        // Ensure parsed object has required properties
        if (parsed && typeof parsed === 'object') {
          return {
            ...INITIAL_USER_SETTINGS,
            ...parsed,
            // Ensure arrays exist even if missing in saved data
            categoryDefaults: parsed.categoryDefaults || INITIAL_USER_SETTINGS.categoryDefaults,
            preferences: parsed.preferences || [],
            customMessages: parsed.customMessages || {},
            customTitles: parsed.customTitles || {},
            quietHours: parsed.quietHours || DEFAULT_QUIET_HOURS,
          };
        }
      } catch (e) {
        // Failed to parse, use defaults
        console.error('Failed to parse notification settings:', e);
      }
    }
    
    // First time or failed to load - use smart defaults
    return INITIAL_USER_SETTINGS;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [filterChannel, setFilterChannel] = useState<NotificationChannel | 'all'>('all');
  const [expandedNotifications, setExpandedNotifications] = useState<Set<string>>(new Set());
  const [editingNotificationId, setEditingNotificationId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [editingTitleText, setEditingTitleText] = useState('');
  const [openPopupDropdown, setOpenPopupDropdown] = useState<{type: 'category' | 'notification', id: string} | null>(null);
  const [selectedView, setSelectedView] = useState<ViewMode>('overview');
  const [showCustomWarning, setShowCustomWarning] = useState(false);
  
  // Wizard state
  const [showWizard, setShowWizard] = useState(() => {
    // Check if user has completed wizard before
    const completed = localStorage.getItem('notificationWizardCompleted');
    return !completed; // Show wizard on first visit
  });
  const [wizardCompleted, setWizardCompleted] = useState(() => {
    return localStorage.getItem('notificationWizardCompleted') === 'true';
  });
  const [showResetDialog, setShowResetDialog] = useState(false);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('notificationSettings', JSON.stringify(userSettings));
  }, [userSettings]);

  // Get category defaults
  const getCategoryDefaults = (category: NotificationCategory): NotificationChannel[] => {
    if (!userSettings?.categoryDefaults) return [];
    return userSettings.categoryDefaults.find(cd => cd.category === category)?.channels || [];
  };

  // Get category digest settings
  const getCategoryDigest = (category: NotificationCategory) => {
    if (!userSettings?.categoryDefaults) {
      return {
        digestEnabled: false,
        digestFrequency: 'hourly' as NotificationFrequency,
        digestWeekDay: 0,
      };
    }
    const catDefault = userSettings.categoryDefaults.find(cd => cd.category === category);
    return {
      digestEnabled: catDefault?.digestEnabled || false,
      digestFrequency: catDefault?.digestFrequency || 'hourly' as NotificationFrequency,
      digestWeekDay: catDefault?.digestWeekDay || 0,
    };
  };

  // Helper: Check if notification settings match category defaults
  const doesMatchDefaults = (
    notificationId: string,
    category: NotificationCategory,
    channels: NotificationChannel[],
    digestEnabled?: boolean,
    digestFrequency?: NotificationFrequency
  ): boolean => {
    const categoryDefaults = getCategoryDefaults(category);
    const categoryDigest = getCategoryDigest(category);
    
    // Check if channels match
    const channelsMatch = 
      channels.length === categoryDefaults.length &&
      channels.every(c => categoryDefaults.includes(c));
    
    // Check if digest settings match (if provided)
    const digestMatches = 
      digestEnabled === undefined || 
      (digestEnabled === categoryDigest.digestEnabled && 
       (!digestEnabled || digestFrequency === categoryDigest.digestFrequency));
    
    return channelsMatch && digestMatches;
  };

  // Get effective channels for a notification (custom or category default)
  const getEffectiveChannels = (notificationId: string, category: NotificationCategory): NotificationChannel[] => {
    if (!userSettings?.preferences) return getCategoryDefaults(category);
    const pref = userSettings.preferences.find(p => p.notificationId === notificationId);
    return pref?.channels || getCategoryDefaults(category);
  };

  // Get effective digest settings for a notification
  const getEffectiveDigest = (notificationId: string, category: NotificationCategory) => {
    const categoryDigest = getCategoryDigest(category);
    if (!userSettings?.preferences) return categoryDigest;
    const pref = userSettings.preferences.find(p => p.notificationId === notificationId);
    return {
      digestEnabled: pref?.digestEnabled ?? categoryDigest.digestEnabled,
      digestFrequency: pref?.digestFrequency ?? categoryDigest.digestFrequency,
    };
  };

  // Get effective popup sound setting
  const getEffectivePopupSound = (notificationId: string, category: NotificationCategory): boolean => {
    if (!userSettings?.preferences || !userSettings?.categoryDefaults) return true;
    const pref = userSettings.preferences.find(p => p.notificationId === notificationId);
    const categoryDefault = userSettings.categoryDefaults.find(cd => cd.category === category);
    return pref?.popupSound ?? categoryDefault?.popupSound ?? true;
  };

  // Check if notification has custom settings
  const hasCustomSettings = (notificationId: string, category: NotificationCategory): boolean => {
    if (!userSettings?.preferences) return false;
    const pref = userSettings.preferences.find(p => p.notificationId === notificationId);
    if (!pref) return false;
    
    // Get the defaults
    const defaultChannels = getCategoryDefaults(category);
    const defaultDigest = getCategoryDigest(category);
    const categoryDefault = userSettings.categoryDefaults.find(cd => cd.category === category);
    const defaultPopupSound = categoryDefault?.popupSound ?? true;
    
    // Check if current state differs from defaults
    const currentChannels = pref.channels;
    const channelsDiffer = JSON.stringify([...currentChannels].sort()) !== JSON.stringify([...defaultChannels].sort());
    const digestDiffer = pref.digestEnabled !== defaultDigest.digestEnabled || 
                         (pref.digestEnabled && pref.digestFrequency !== defaultDigest.digestFrequency);
    const popupSoundDiffer = pref.popupSound !== defaultPopupSound;
    
    return channelsDiffer || digestDiffer || popupSoundDiffer;
  };

  // Toggle notification channel
  const toggleNotificationChannel = (notificationId: string, category: NotificationCategory, channel: NotificationChannel) => {
    const currentChannels = getEffectiveChannels(notificationId, category);
    const newChannels = currentChannels.includes(channel)
      ? currentChannels.filter(c => c !== channel)
      : [...currentChannels, channel];
    
    const existingPref = userSettings.preferences.find(p => p.notificationId === notificationId);
    
    if (existingPref) {
      // Update existing preference
      setUserSettings({
        ...userSettings,
        preferences: userSettings.preferences.map(p =>
          p.notificationId === notificationId
            ? { ...p, channels: newChannels, isCustom: true }
            : p
        ),
      });
    } else {
      // Create new preference
      const categoryDigest = getCategoryDigest(category);
      const categoryDefault = userSettings.categoryDefaults.find(cd => cd.category === category);
      setUserSettings({
        ...userSettings,
        preferences: [
          ...userSettings.preferences,
          {
            notificationId,
            channels: newChannels,
            isCustom: true,
            digestEnabled: categoryDigest.digestEnabled,
            digestFrequency: categoryDigest.digestFrequency,
            popupSound: categoryDefault?.popupSound ?? true,
          },
        ],
      });
    }
  };

  // Toggle category channel
  const toggleCategoryChannel = (category: NotificationCategory, channel: NotificationChannel) => {
    const currentDefaults = getCategoryDefaults(category);
    const newDefaults = currentDefaults.includes(channel)
      ? currentDefaults.filter(c => c !== channel)
      : [...currentDefaults, channel];
    
    setUserSettings({
      ...userSettings,
      categoryDefaults: userSettings.categoryDefaults.map(cd =>
        cd.category === category
          ? { ...cd, channels: newDefaults }
          : cd
      ),
    });
    
    // Show custom warning if there are custom notifications
    const notifications = getNotificationsByCategory(category);
    const customCount = notifications.filter(n => hasCustomSettings(n.id, category)).length;
    if (customCount > 0) {
      setShowCustomWarning(true);
      setTimeout(() => setShowCustomWarning(false), 5000);
    }
    
    toast.success(`Category defaults updated for ${CATEGORY_INFO[category].label}`);
  };

  // Toggle notification digest
  const toggleNotificationDigest = (notificationId: string, category: NotificationCategory) => {
    const currentDigest = getEffectiveDigest(notificationId, category);
    const existingPref = userSettings.preferences.find(p => p.notificationId === notificationId);
    
    if (existingPref) {
      // Update existing preference
      setUserSettings({
        ...userSettings,
        preferences: userSettings.preferences.map(p =>
          p.notificationId === notificationId
            ? { ...p, digestEnabled: !p.digestEnabled, isCustom: true }
            : p
        ),
      });
    } else {
      // Create new preference with toggled digest
      const currentChannels = getEffectiveChannels(notificationId, category);
      const categoryDigest = getCategoryDigest(category);
      const categoryDefault = userSettings.categoryDefaults.find(cd => cd.category === category);
      setUserSettings({
        ...userSettings,
        preferences: [
          ...userSettings.preferences,
          {
            notificationId,
            channels: currentChannels,
            isCustom: true,
            digestEnabled: !categoryDigest.digestEnabled,
            digestFrequency: categoryDigest.digestFrequency,
            popupSound: categoryDefault?.popupSound ?? true,
          },
        ],
      });
    }
  };

  // Update digest frequency
  const updateDigestFrequency = (notificationId: string, category: NotificationCategory, frequency: NotificationFrequency) => {
    const existingPref = userSettings.preferences.find(p => p.notificationId === notificationId);
    
    if (existingPref) {
      setUserSettings({
        ...userSettings,
        preferences: userSettings.preferences.map(p =>
          p.notificationId === notificationId
            ? { ...p, digestFrequency: frequency, isCustom: true }
            : p
        ),
      });
    }
  };

  // Update category digest settings
  const updateCategoryDigest = (category: NotificationCategory, updates: { digestEnabled?: boolean; digestFrequency?: NotificationFrequency; digestWeekDay?: number }) => {
    setUserSettings({
      ...userSettings,
      categoryDefaults: userSettings.categoryDefaults.map(cd =>
        cd.category === category
          ? { ...cd, ...updates }
          : cd
      ),
    });
  };

  // Update quiet hours
  const updateQuietHours = (updates: Partial<typeof userSettings.quietHours>) => {
    setUserSettings({
      ...userSettings,
      quietHours: {
        ...userSettings.quietHours,
        ...updates,
      },
    });
  };

  // Toggle popup sound for a category default
  const toggleCategoryPopupSound = (category: NotificationCategory) => {
    setUserSettings({
      ...userSettings,
      categoryDefaults: userSettings.categoryDefaults.map(cd =>
        cd.category === category
          ? { ...cd, popupSound: !cd.popupSound }
          : cd
      ),
    });
    
    // Show custom warning if there are custom notifications
    const notifications = getNotificationsByCategory(category);
    const customCount = notifications.filter(n => hasCustomSettings(n.id, category)).length;
    if (customCount > 0) {
      setShowCustomWarning(true);
      setTimeout(() => setShowCustomWarning(false), 5000);
    }
    
    const catDefault = userSettings.categoryDefaults.find(cd => cd.category === category);
    toast.success(catDefault?.popupSound ? 'Pop-up sound disabled for category' : 'Pop-up sound enabled for category');
  };

  // Toggle popup sound for an individual notification
  const toggleNotificationPopupSound = (notificationId: string, category: NotificationCategory) => {
    const existingPref = userSettings.preferences.find(p => p.notificationId === notificationId);
    const categoryDefault = userSettings.categoryDefaults.find(cd => cd.category === category);
    
    if (existingPref) {
      // Update existing preference
      setUserSettings({
        ...userSettings,
        preferences: userSettings.preferences.map(p =>
          p.notificationId === notificationId
            ? { ...p, popupSound: !p.popupSound, isCustom: true }
            : p
        ),
      });
    } else {
      // Create new preference with custom popup sound setting
      const notification = ALL_NOTIFICATION_TYPES.find(n => n.id === notificationId);
      setUserSettings({
        ...userSettings,
        preferences: [
          ...userSettings.preferences,
          {
            notificationId,
            channels: categoryDefault?.channels || notification?.defaultChannels || [],
            isCustom: true,
            digestEnabled: categoryDefault?.digestEnabled || false,
            digestFrequency: categoryDefault?.digestFrequency || 'hourly',
            popupSound: !(categoryDefault?.popupSound ?? true), // Toggle from category default
          },
        ],
      });
    }
    
    const currentSound = existingPref?.popupSound ?? categoryDefault?.popupSound ?? true;
    toast.success(currentSound ? 'Pop-up sound disabled' : 'Pop-up sound enabled');
  };

  // Convert military time (24-hour) to 12-hour format with AM/PM
  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  // Reset notification to category defaults
  const resetNotificationToDefaults = (notificationId: string) => {
    setUserSettings({
      ...userSettings,
      preferences: userSettings.preferences.filter(p => p.notificationId !== notificationId),
    });
    toast.success('Reset to category defaults');
  };

  // Reset all to defaults
  const handleResetToDefaults = () => {
    setShowResetDialog(true);
  };

  const confirmResetToDefaults = () => {
    setUserSettings(INITIAL_USER_SETTINGS);
    setShowResetDialog(false);
    toast.success('All settings reset to defaults');
  };

  // Run wizard
  const handleRunWizard = () => {
    setShowWizard(true);
  };

  const handleWizardComplete = (answers: WizardAnswers) => {
    // Update settings based on wizard answers
    const newCategoryDefaults = userSettings.categoryDefaults.map(cd => {
      const roleQuestions = WIZARD_QUESTION_GROUPS[userSettings.role];
      const question = roleQuestions.find(q => q.category === cd.category);
      
      if (question) {
        const selectedAnswer = answers[cd.category];
        const answerConfig = question.answers.find(a => a.id === selectedAnswer);
        
        if (answerConfig) {
          return {
            ...cd,
            channels: answerConfig.channels,
            digestEnabled: answerConfig.digestEnabled || false,
            digestFrequency: answerConfig.digestFrequency || cd.digestFrequency,
          };
        }
      }
      
      return cd;
    });

    setUserSettings({
      ...userSettings,
      categoryDefaults: newCategoryDefaults,
      preferences: [], // Clear individual preferences
    });

    setShowWizard(false);
    setWizardCompleted(true);
    localStorage.setItem('notificationWizardCompleted', 'true');
    toast.success('Notification preferences configured!');
  };

  // Get all categories
  const allCategories = Object.keys(CATEGORY_INFO) as NotificationCategory[];

  // Get counts for each category
  const getCategoryCounts = (category: NotificationCategory) => {
    const notifications = getNotificationsByCategory(category);
    const enabled = notifications.filter(n => {
      const channels = getEffectiveChannels(n.id, category);
      return channels.length > 0;
    }).length;
    return { total: notifications.length, enabled };
  };

  // Filter notifications for current view
  const currentNotifications = useMemo(() => {
    if (selectedView === 'overview') return [];
    
    let notifications = getNotificationsByCategory(selectedView);
    
    // Apply search filter
    if (searchQuery) {
      notifications = notifications.filter(n =>
        n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply channel filter
    if (filterChannel !== 'all') {
      notifications = notifications.filter(n => {
        const channels = getEffectiveChannels(n.id, selectedView);
        return channels.includes(filterChannel);
      });
    }
    
    return notifications;
  }, [selectedView, searchQuery, filterChannel, userSettings]);

  return (
    <div className="h-full flex flex-col md:flex-row overflow-hidden">
      {/* Wizard Modal */}
      <AnimatePresence>
        {showWizard && (
          <NotificationSetupWizard
            userRole={userSettings.role}
            onComplete={handleWizardComplete}
            onSkip={() => {
              setShowWizard(false);
              setWizardCompleted(true);
              localStorage.setItem('notificationWizardCompleted', 'true');
            }}
          />
        )}
      </AnimatePresence>

      {/* Left Sidebar Navigation */}
      <div className="w-full md:w-64 lg:w-72 flex-shrink-0 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 overflow-y-auto">
        <div className="p-4 space-y-1">
          {/* Divider */}
          <div className="pb-1">
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-3 mb-1">
              NOTIFICATION CATEGORIES
            </div>
          </div>

          {/* Overview */}
          <button
            onClick={() => setSelectedView('overview')}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left",
              selectedView === 'overview'
                ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                : "hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300"
            )}
          >
            <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
            <span className="flex-1 font-medium">Overview</span>
          </button>

          {/* Categories */}
          {allCategories.map(category => {
            const categoryInfo = CATEGORY_INFO[category];
            const IconComponent = ICON_MAP[categoryInfo.icon];
            const { total, enabled } = getCategoryCounts(category);
            const isLocked = category === 'security';

            return (
              <button
                key={category}
                onClick={() => setSelectedView(category)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left group",
                  selectedView === category
                    ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300",
                  isLocked && "opacity-90"
                )}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${categoryInfo.color}20` }}
                >
                  <IconComponent
                    className="w-4 h-4"
                    style={{ color: categoryInfo.color }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "font-medium truncate",
                      selectedView === category
                        ? "text-purple-700 dark:text-purple-300"
                        : "text-gray-900 dark:text-gray-100"
                    )}>
                      {categoryInfo.label}
                    </span>
                    {isLocked && (
                      <Shield className="w-3 h-3 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                    )}
                  </div>
                  <div className={cn(
                    "text-xs",
                    selectedView === category
                      ? "text-purple-600 dark:text-purple-400"
                      : "text-gray-500 dark:text-gray-400"
                  )}>
                    {enabled}/{total} active
                  </div>
                </div>
                {selectedView === category && (
                  <ChevronRight className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                )}
              </button>
            );
          })}

          {/* Quiet Hours Active Banner - Below Categories */}
          {userSettings.quietHours.enabled && (
            <Card className="p-3 mt-4 bg-gradient-to-br from-purple-50 via-purple-50/50 to-purple-100/30 dark:from-purple-900/20 dark:via-purple-900/10 dark:to-purple-800/10 border-purple-200 dark:border-purple-800">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-100 to-purple-200/50 dark:from-purple-900/40 dark:to-purple-800/30 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Moon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-0.5">
                    Quiet Hours Active
                  </div>
                  <div className="text-xs text-purple-600 dark:text-purple-400 mb-2">
                    Notifications muted
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-gray-700 dark:text-gray-300">
                      <span>Start</span>
                      <span className="font-medium">{formatTime(userSettings.quietHours.startTime)}</span>
                    </div>
                    <div className="flex justify-between text-gray-700 dark:text-gray-300">
                      <span>End</span>
                      <span className="font-medium">{formatTime(userSettings.quietHours.endTime)}</span>
                    </div>
                  </div>
                  {userSettings.quietHours.allowUrgent && (
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-purple-600 dark:text-purple-400">
                      <Check className="w-3 h-3" />
                      <span>Urgent allowed</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-5xl">
          {selectedView === 'overview' ? (
            // Overview Content
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Notification Settings
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Manage how and when you receive notifications across all categories
                </p>
              </div>

              {/* Global Actions */}
              <div className="space-y-4 mb-6">
                {/* Quiet Hours - Top Priority */}
                <Card 
                  className="p-5 bg-gradient-to-br from-purple-50/50 via-purple-50/30 to-transparent dark:from-purple-900/10 dark:via-purple-900/5 dark:to-transparent border-2 border-purple-200 dark:border-purple-800 cursor-pointer transition-all hover:shadow-lg"
                  onClick={() => updateQuietHours({ enabled: !userSettings.quietHours.enabled })}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100/80 to-purple-50/40 dark:from-purple-900/30 dark:to-purple-900/10 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <Moon className="w-5 h-5 text-purple-500 dark:text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                            Quiet Hours
                          </h3>
                          <p className="text-sm text-purple-600 dark:text-purple-400">
                            Mute non-urgent notifications during specific hours
                          </p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                          {userSettings.quietHours.enabled ? (
                            <>
                              <button
                                onClick={() => updateQuietHours({ enabled: true })}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium bg-gradient-to-br from-green-600 to-green-700 text-white shadow-sm border border-green-700 transition-all"
                              >
                                <Check className="w-4 h-4" />
                                Turn On
                              </button>
                              <button
                                onClick={() => updateQuietHours({ enabled: false })}
                                className="px-3 py-1.5 rounded-md text-sm font-normal bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 opacity-60 hover:opacity-100 transition-opacity"
                              >
                                Turn Off
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => updateQuietHours({ enabled: true })}
                                className="px-3 py-1.5 rounded-md text-sm font-normal bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 opacity-60 hover:opacity-100 transition-opacity"
                              >
                                Turn On
                              </button>
                              <button
                                onClick={() => updateQuietHours({ enabled: false })}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium bg-gradient-to-br from-green-600 to-green-700 text-white shadow-sm border border-green-700 transition-all"
                              >
                                <Check className="w-4 h-4" />
                                Turn Off
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {userSettings.quietHours.enabled && (
                        <div className="space-y-4 mt-4" onClick={(e) => e.stopPropagation()}>
                          {/* Time Range */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm text-gray-700 dark:text-gray-300 mb-2 block">Start Time</Label>
                              <Input
                                type="time"
                                value={userSettings.quietHours.startTime}
                                onChange={(e) =>
                                  updateQuietHours({ startTime: e.target.value })
                                }
                                className="bg-gray-50 dark:bg-gray-800"
                              />
                            </div>
                            <div>
                              <Label className="text-sm text-gray-700 dark:text-gray-300 mb-2 block">End Time</Label>
                              <Input
                                type="time"
                                value={userSettings.quietHours.endTime}
                                onChange={(e) =>
                                  updateQuietHours({ endTime: e.target.value })
                                }
                                className="bg-gray-50 dark:bg-gray-800"
                              />
                            </div>
                          </div>

                          {/* Morning Email Summary Info - 60% width, centered */}
                          <div className="w-[60%] mx-auto">
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                              <MailIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                              <div>
                                <div className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-0.5">
                                  Morning Email Summary
                                </div>
                                <div className="text-xs text-blue-700 dark:text-blue-300">
                                  Non-urgent notifications during quiet hours will be sent as one email at{' '}
                                  <span className="font-semibold">{formatTime(userSettings.quietHours.endTime)}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Allow Urgent Section - Multiple Visual Indicators */}
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => updateQuietHours({ allowUrgent: true })}
                                  className={cn(
                                    "flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm transition-colors",
                                    userSettings.quietHours.allowUrgent
                                      ? "bg-green-600 text-white font-semibold border-2 border-green-700"
                                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 border-2 border-transparent font-normal"
                                  )}
                                >
                                  {userSettings.quietHours.allowUrgent && (
                                    <Check className="w-4 h-4" />
                                  )}
                                  Yes
                                </button>
                                <button
                                  onClick={() => updateQuietHours({ allowUrgent: false })}
                                  className={cn(
                                    "flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm transition-colors",
                                    !userSettings.quietHours.allowUrgent
                                      ? "bg-green-600 text-white font-semibold border-2 border-green-700"
                                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 border-2 border-transparent font-normal"
                                  )}
                                >
                                  {!userSettings.quietHours.allowUrgent && (
                                    <Check className="w-4 h-4" />
                                  )}
                                  No
                                </button>
                              </div>
                              <span className="text-sm text-purple-600 dark:text-purple-400">
                                Allow urgent notifications during quiet hours
                              </span>
                            </div>
                          </div>

                          {/* Urgent Notifications List */}
                          {userSettings.quietHours.allowUrgent && (
                            <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
                              <div className="flex items-start gap-3">
                                <Bell className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                  <div className="text-sm font-medium text-orange-600 dark:text-orange-400 mb-1">
                                    Urgent Notifications
                                  </div>
                                  <div className="text-xs text-orange-600 dark:text-orange-400 mb-3">
                                    The following security notifications will override quiet hours:
                                  </div>
                                  <div className="space-y-2">
                                    <div className="flex items-start gap-2">
                                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0 mt-1.5" />
                                      <div>
                                        <div className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                                          New Device Login
                                        </div>
                                        <div className="text-xs text-orange-600 dark:text-orange-400">
                                          Login from a new device detected
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0 mt-1.5" />
                                      <div>
                                        <div className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                                          Password Changed
                                        </div>
                                        <div className="text-xs text-orange-600 dark:text-orange-400">
                                          Your password was changed
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0 mt-1.5" />
                                      <div>
                                        <div className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                                          Suspicious Activity
                                        </div>
                                        <div className="text-xs text-orange-600 dark:text-orange-400">
                                          Suspicious account activity detected
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>

                {/* Wizard and Reset in 2 columns - More Prominent */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={handleRunWizard}
                    className="flex flex-col items-start gap-2 px-5 py-4 rounded-lg border-2 border-purple-200 dark:border-purple-700 bg-gradient-to-br from-purple-50/50 to-transparent dark:from-purple-900/20 dark:to-transparent hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-md transition-all text-left"
                  >
                    <div className="flex items-center gap-2">
                      <Wand2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      <span className="font-semibold text-gray-900 dark:text-gray-100">Quick Setup Wizard</span>
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Configure all notifications in few easy steps</span>
                  </button>
                  <button
                    onClick={handleResetToDefaults}
                    className="flex flex-col items-start gap-2 px-5 py-4 rounded-lg border-2 border-orange-200 dark:border-orange-700 bg-gradient-to-br from-orange-50/50 to-transparent dark:from-orange-900/20 dark:to-transparent hover:border-orange-300 dark:hover:border-orange-600 hover:shadow-md transition-all text-left"
                  >
                    <div className="flex items-center gap-2">
                      <RotateCcw className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      <span className="font-semibold text-gray-900 dark:text-gray-100">Reset All to Defaults</span>
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Restore original notification settings</span>
                  </button>
                </div>
              </div>

              {/* Reserved space for teaching/onboarding content */}
              {/* TODO: Add educational content and onboarding guidance here */}
            </>
          ) : (
            // Category Detail Content
            <>
              {/* Category Header */}
              <div className="mb-6">
                <button
                  onClick={() => setSelectedView('overview')}
                  className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-3 transition-colors"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                  Back to Overview
                </button>

                <div className="flex items-center gap-4 mb-2">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${CATEGORY_INFO[selectedView].color}20` }}
                  >
                    {(() => {
                      const IconComponent = ICON_MAP[CATEGORY_INFO[selectedView].icon];
                      return (
                        <IconComponent
                          className="w-7 h-7"
                          style={{ color: CATEGORY_INFO[selectedView].color }}
                        />
                      );
                    })()}
                  </div>
                  <div>
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                      {CATEGORY_INFO[selectedView].label}
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {currentNotifications.length} notification{currentNotifications.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </div>

              {/* Category Defaults */}
              <Card className="p-6 mb-6 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
                <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                  Category Defaults
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  These settings apply to all notifications in this category unless customized individually
                </p>


                
                <div className="flex flex-wrap gap-2">
                  {/* Pop Up with Dropdown */}
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (selectedView !== 'security') {
                          const dropdownId = `category-${selectedView}`;
                          setOpenPopupDropdown(openPopupDropdown?.id === dropdownId ? null : { type: 'category', id: dropdownId });
                        }
                      }}
                      disabled={selectedView === 'security'}
                      className={cn(
                        "px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-all border-2",
                        getCategoryDefaults(selectedView).includes('popup')
                          ? "border-purple-500 bg-white dark:bg-gray-800 text-purple-700 dark:text-purple-300"
                          : "border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300 dark:hover:border-gray-600",
                        selectedView === 'security' && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {getCategoryDefaults(selectedView).includes('popup') && <Check className="w-4 h-4" />}
                      {getCategoryDefaults(selectedView).includes('popup') && (userSettings.categoryDefaults.find(cd => cd.category === selectedView)?.popupSound ?? true) ? (
                        <Volume2 className="w-4 h-4" />
                      ) : getCategoryDefaults(selectedView).includes('popup') ? (
                        <VolumeX className="w-4 h-4" />
                      ) : (
                        <MessageSquare className="w-4 h-4" />
                      )}
                      Pop Up Alerts
                      {selectedView !== 'security' && <ChevronDown className="w-3 h-3" />}
                    </button>

                    {/* Dropdown Menu */}
                    {openPopupDropdown?.type === 'category' && openPopupDropdown?.id === `category-${selectedView}` && (
                      <>
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenPopupDropdown(null);
                          }}
                        />
                        <div className="absolute left-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg z-50 min-w-[200px]">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const categoryDefault = userSettings.categoryDefaults.find(cd => cd.category === selectedView);
                              const currentPopupSound = categoryDefault?.popupSound ?? true;
                              if (!getCategoryDefaults(selectedView).includes('popup')) {
                                toggleCategoryChannel(selectedView, 'popup');
                                if (!currentPopupSound) {
                                  toggleCategoryPopupSound(selectedView);
                                }
                              } else if (!currentPopupSound) {
                                toggleCategoryPopupSound(selectedView);
                              }
                              setOpenPopupDropdown(null);
                            }}
                            className={cn(
                              "w-full px-3 py-2 text-left text-sm flex items-center gap-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg",
                              getCategoryDefaults(selectedView).includes('popup') && (userSettings.categoryDefaults.find(cd => cd.category === selectedView)?.popupSound ?? true) && "bg-purple-50 dark:bg-purple-900/20"
                            )}
                          >
                            <MessageSquare className="w-4 h-4" />
                            <span className="flex-1">Popup</span>
                            {getCategoryDefaults(selectedView).includes('popup') && !(userSettings.categoryDefaults.find(cd => cd.category === selectedView)?.popupSound ?? true) && <Check className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const categoryDefault = userSettings.categoryDefaults.find(cd => cd.category === selectedView);
                              const currentPopupSound = categoryDefault?.popupSound ?? true;
                              if (!getCategoryDefaults(selectedView).includes('popup')) {
                                toggleCategoryChannel(selectedView, 'popup');
                                if (currentPopupSound) {
                                  toggleCategoryPopupSound(selectedView);
                                }
                              } else if (currentPopupSound) {
                                toggleCategoryPopupSound(selectedView);
                              }
                              setOpenPopupDropdown(null);
                            }}
                            className={cn(
                              "w-full px-3 py-2 text-left text-sm flex items-center gap-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700",
                              getCategoryDefaults(selectedView).includes('popup') && !(userSettings.categoryDefaults.find(cd => cd.category === selectedView)?.popupSound ?? true) && "bg-purple-50 dark:bg-purple-900/20"
                            )}
                          >
                            <X className="w-4 h-4" />
                            <span className="flex-1">No popup</span>
                            {!getCategoryDefaults(selectedView).includes('popup') && <Check className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const categoryDefault = userSettings.categoryDefaults.find(cd => cd.category === selectedView);
                              const currentPopupSound = categoryDefault?.popupSound ?? true;
                              if (!getCategoryDefaults(selectedView).includes('popup')) {
                                toggleCategoryChannel(selectedView, 'popup');
                                if (!currentPopupSound) {
                                  toggleCategoryPopupSound(selectedView);
                                }
                              } else if (!currentPopupSound) {
                                toggleCategoryPopupSound(selectedView);
                              }
                              setOpenPopupDropdown(null);
                            }}
                            className={cn(
                              "w-full px-3 py-2 text-left text-sm flex items-center gap-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg",
                              getCategoryDefaults(selectedView).includes('popup') && (userSettings.categoryDefaults.find(cd => cd.category === selectedView)?.popupSound ?? true) && "bg-purple-50 dark:bg-purple-900/20"
                            )}
                          >
                            <Volume2 className="w-4 h-4" />
                            <span className="flex-1">Popup with sound</span>
                            {getCategoryDefaults(selectedView).includes('popup') && (userSettings.categoryDefaults.find(cd => cd.category === selectedView)?.popupSound ?? true) && <Check className="w-4 h-4" />}
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  <button
                    onClick={() => toggleCategoryChannel(selectedView, 'email')}
                    disabled={selectedView === 'security'}
                    className={cn(
                      "px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-all border-2",
                      getCategoryDefaults(selectedView).includes('email')
                        ? "border-blue-500 bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-300"
                        : "border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300 dark:hover:border-gray-600",
                      selectedView === 'security' && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {getCategoryDefaults(selectedView).includes('email') ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    <MailIcon className="w-4 h-4" />
                    Email
                  </button>

                  <button
                    onClick={() => toggleCategoryChannel(selectedView, 'sms')}
                    disabled={selectedView === 'security'}
                    className={cn(
                      "px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-all border-2",
                      getCategoryDefaults(selectedView).includes('sms')
                        ? "border-green-500 bg-white dark:bg-gray-800 text-green-700 dark:text-green-300"
                        : "border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300 dark:hover:border-gray-600",
                      selectedView === 'security' && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {getCategoryDefaults(selectedView).includes('sms') ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    <Smartphone className="w-4 h-4" />
                    SMS
                  </button>
                </div>

                {/* Custom Notifications Warning - Shows on interaction */}
                <AnimatePresence>
                  {showCustomWarning && (() => {
                    const customNotifications = currentNotifications
                      .map((n, idx) => ({ ...n, index: idx + 1 }))
                      .filter(n => hasCustomSettings(n.id, selectedView));
                    
                    if (customNotifications.length > 0) {
                      const notificationNumbers = customNotifications.map(n => n.index).join(', ');
                      return (
                        <motion.div
                          initial={{ opacity: 0, height: 0, marginTop: 0 }}
                          animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                          exit={{ opacity: 0, height: 0, marginTop: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                              <div className="text-xs text-blue-800 dark:text-blue-200">
                                Notification{customNotifications.length !== 1 ? 's' : ''} <span className="font-semibold">{notificationNumbers}</span> {customNotifications.length !== 1 ? 'are' : 'is'} not affected by this change because {customNotifications.length !== 1 ? 'they have' : 'it has'} custom settings. 
                                Look for the <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] border border-blue-400 bg-blue-100 dark:bg-blue-900/40 mx-1">Custom</span> badge below.
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    }
                    return null;
                  })()}
                </AnimatePresence>

                {selectedView === 'security' && (
                  <p className="text-xs text-amber-700 dark:text-amber-400 mt-3 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Security notifications cannot be disabled and are always delivered via all channels
                  </p>
                )}
              </Card>

              {/* Search and Filter */}
              <Card className="p-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search notifications..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 pr-9"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        title="Clear search"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <Select value={filterChannel} onValueChange={(v) => setFilterChannel(v as any)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Channels</SelectItem>
                      <SelectItem value="popup">Pop Up Alerts Only</SelectItem>
                      <SelectItem value="email">Email Only</SelectItem>
                      <SelectItem value="sms">SMS Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </Card>

              {/* Notifications List */}
              {currentNotifications.length === 0 ? (
                <Card className="p-12 text-center">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-medium mb-2">No notifications found</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {searchQuery || filterChannel !== 'all'
                      ? 'Try adjusting your search or filter criteria'
                      : 'No notifications available in this category'}
                  </p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {currentNotifications.map((notification, index) => {
                    const channels = getEffectiveChannels(notification.id, selectedView);
                    const { digestEnabled, digestFrequency } = getEffectiveDigest(notification.id, selectedView);
                    const hasCustom = hasCustomSettings(notification.id, selectedView);
                    const isExpanded = expandedNotifications.has(notification.id);
                    const popupSound = getEffectivePopupSound(notification.id, selectedView);
                    const hasPopup = channels.includes('popup');

                    return (
                      <Card key={notification.id} className="p-4">
                        <div className="flex items-center gap-4">
                          {/* Number Badge - Modern, centered, bigger */}
                          <div className="flex-shrink-0 flex items-center justify-center">
                            <span className="text-4xl text-gray-400 dark:text-gray-600 opacity-40 font-light tracking-tight">
                              {String(index + 1).padStart(2, '0')}
                            </span>
                          </div>

                          <div className="flex-1">
                            {/* Header with Title and Custom Badge */}
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                  {notification.name}
                                </h4>
                                {hasCustom && (
                                  <Badge variant="outline" className="text-xs border-blue-400 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20">
                                    Custom
                                  </Badge>
                                )}
                              </div>
                              
                              {hasCustom && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => resetNotificationToDefaults(notification.id)}
                                  title="Reset to category defaults"
                                  className="gap-1"
                                >
                                  <RefreshCw className="w-3.5 h-3.5" />
                                  <span className="text-xs">Reset</span>
                                </Button>
                              )}
                            </div>

                            {/* Description */}
                            <p className="text-xs text-gray-500 dark:text-gray-500 mb-2">
                              {notification.description}
                            </p>

                            {/* Example Message - More distinct styling */}
                            <div className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 px-2 py-1.5 rounded mb-3 border-l-2 border-purple-400 dark:border-purple-600">
                              <span className="text-xs text-gray-500 dark:text-gray-500 italic">Example:</span> &ldquo;{getNotificationExample(notification.id)}&rdquo;
                            </div>

                            {/* Channel Toggles - Indented with subtle background */}
                            <div className="ml-4 pl-4 py-3 border-l-2 border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 rounded-r">
                              <div className="flex flex-wrap gap-2 items-center">
                              {/* Pop Up with Dropdown - Fixed width for alignment */}
                              <div className="relative w-[180px]">
                                <button
                                  onClick={() => {
                                    const dropdownId = `notification-${notification.id}`;
                                    setOpenPopupDropdown(openPopupDropdown?.id === dropdownId ? null : { type: 'notification', id: dropdownId });
                                  }}
                                  className={cn(
                                    "w-full px-3 py-1.5 rounded text-xs flex items-center gap-2 transition-all border",
                                    hasPopup
                                      ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300"
                                      : "border-gray-200 dark:border-gray-700 text-gray-500"
                                  )}
                                >
                                  {hasPopup && popupSound ? (
                                    <>
                                      <Volume2 className="w-3.5 h-3.5" />
                                      <span className="flex-1">Popup with sound</span>
                                    </>
                                  ) : hasPopup ? (
                                    <>
                                      <MessageSquare className="w-3.5 h-3.5" />
                                      <span className="flex-1">Popup</span>
                                    </>
                                  ) : (
                                    <>
                                      <X className="w-3.5 h-3.5" />
                                      <span className="flex-1">No popup</span>
                                    </>
                                  )}
                                  <ChevronDown className="w-3 h-3" />
                                </button>

                                {/* Dropdown */}
                                {openPopupDropdown?.type === 'notification' && openPopupDropdown?.id === `notification-${notification.id}` && (
                                  <>
                                    <div 
                                      className="fixed inset-0 z-40" 
                                      onClick={() => setOpenPopupDropdown(null)}
                                    />
                                    <div className="absolute left-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg z-50 w-full">
                                      <button
                                        onClick={() => {
                                          if (!hasPopup) {
                                            toggleNotificationChannel(notification.id, selectedView, 'popup');
                                            if (popupSound) {
                                              toggleNotificationPopupSound(notification.id, selectedView);
                                            }
                                          } else if (popupSound) {
                                            toggleNotificationPopupSound(notification.id, selectedView);
                                          }
                                          setOpenPopupDropdown(null);
                                        }}
                                        className={cn(
                                          "w-full px-3 py-2 text-left text-xs flex items-center gap-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg",
                                          hasPopup && !popupSound && "bg-purple-50 dark:bg-purple-900/20"
                                        )}
                                      >
                                        <MessageSquare className="w-3.5 h-3.5" />
                                        <span className="flex-1">Popup</span>
                                        {hasPopup && !popupSound && <Check className="w-3.5 h-3.5" />}
                                      </button>
                                      <button
                                        onClick={() => {
                                          if (hasPopup) {
                                            toggleNotificationChannel(notification.id, selectedView, 'popup');
                                          }
                                          setOpenPopupDropdown(null);
                                        }}
                                        className={cn(
                                          "w-full px-3 py-2 text-left text-xs flex items-center gap-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700",
                                          !hasPopup && "bg-purple-50 dark:bg-purple-900/20"
                                        )}
                                      >
                                        <X className="w-3.5 h-3.5" />
                                        <span className="flex-1">No popup</span>
                                        {!hasPopup && <Check className="w-3.5 h-3.5" />}
                                      </button>
                                      <button
                                        onClick={() => {
                                          if (!hasPopup) {
                                            toggleNotificationChannel(notification.id, selectedView, 'popup');
                                            if (!popupSound) {
                                              toggleNotificationPopupSound(notification.id, selectedView);
                                            }
                                          } else if (!popupSound) {
                                            toggleNotificationPopupSound(notification.id, selectedView);
                                          }
                                          setOpenPopupDropdown(null);
                                        }}
                                        className={cn(
                                          "w-full px-3 py-2 text-left text-xs flex items-center gap-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg",
                                          hasPopup && popupSound && "bg-purple-50 dark:bg-purple-900/20"
                                        )}
                                      >
                                        <Volume2 className="w-3.5 h-3.5" />
                                        <span className="flex-1">Popup with sound</span>
                                        {hasPopup && popupSound && <Check className="w-3.5 h-3.5" />}
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>

                              <button
                                onClick={() => toggleNotificationChannel(notification.id, selectedView, 'email')}
                                className={cn(
                                  "px-2 py-1 rounded text-xs flex items-center gap-1 transition-all border",
                                  channels.includes('email')
                                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                                    : "border-gray-200 dark:border-gray-700 text-gray-500"
                                )}
                              >
                                {channels.includes('email') ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                <MailIcon className="w-3 h-3" />
                                Email
                              </button>

                              <button
                                onClick={() => toggleNotificationChannel(notification.id, selectedView, 'sms')}
                                className={cn(
                                  "px-2 py-1 rounded text-xs flex items-center gap-1 transition-all border",
                                  channels.includes('sms')
                                    ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                                    : "border-gray-200 dark:border-gray-700 text-gray-500"
                                )}
                              >
                                {channels.includes('sms') ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                <Smartphone className="w-3 h-3" />
                                SMS
                              </button>

                              <button
                                onClick={() => toggleNotificationDigest(notification.id, selectedView)}
                                className={cn(
                                  "px-2 py-1 rounded text-xs flex items-center gap-1 transition-all border",
                                  digestEnabled
                                    ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300"
                                    : "border-gray-200 dark:border-gray-700 text-gray-500"
                                )}
                              >
                                <Clock className="w-3 h-3" />
                                Email Digest
                              </button>
                              </div>

                              {/* Digest Frequency Selector */}
                              {digestEnabled && (
                                <div className="mt-3">
                                  <Select
                                    value={digestFrequency}
                                    onValueChange={(v) => updateDigestFrequency(notification.id, selectedView, v as NotificationFrequency)}
                                  >
                                    <SelectTrigger className="w-full h-8 text-xs">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="hourly">Hourly</SelectItem>
                                      <SelectItem value="2-hours">Every 2 Hours</SelectItem>
                                      <SelectItem value="4-hours">Every 4 Hours</SelectItem>
                                      <SelectItem value="beginning-of-day">Beginning of Day</SelectItem>
                                      <SelectItem value="end-of-day">End of Day</SelectItem>
                                      <SelectItem value="weekly">Weekly</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent aria-describedby="reset-notification-description">
          <DialogHeader>
            <DialogTitle>Reset All Notification Settings?</DialogTitle>
            <DialogDescription id="reset-notification-description">
              This will restore all notification settings to their original default values. 
              Any customizations you've made will be permanently lost. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResetDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={confirmResetToDefaults}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset to Defaults
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
