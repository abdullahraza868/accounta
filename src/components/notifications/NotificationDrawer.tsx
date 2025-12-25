import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../ui/sheet';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Settings as SettingsIcon,
  Bell,
  Check,
  X,
  MessageSquare,
  Mail as MailIcon,
  Smartphone,
  Clock,
  RefreshCw,
  Search,
  Volume2,
  VolumeX,
  ChevronDown,
  ExternalLink,
  Moon,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { cn } from '../ui/utils';
import {
  NotificationChannel,
  NotificationFrequency,
  NotificationCategory,
} from '../../types/notifications';
import { getNotificationsByCategory, CATEGORY_INFO, getNotificationExample } from '../../data/notificationTypes';

interface NotificationDrawerProps {
  category: NotificationCategory;
  trigger?: React.ReactNode;
  onNavigateToSettings?: () => void;
}

export function NotificationDrawer({ category, trigger, onNavigateToSettings }: NotificationDrawerProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [openPopupDropdown, setOpenPopupDropdown] = useState<string | null>(null);
  const [showCustomWarning, setShowCustomWarning] = useState(false);

  // Track original state for each notification to compare
  const [originalSettings] = useState<Record<string, {
    channels: NotificationChannel[];
    digestEnabled: boolean;
    digestFrequency?: NotificationFrequency;
    popupSound?: boolean;
  }>>({});

  // Mock settings (in real app, get from context/store)
  const [categoryDefaults, setCategoryDefaults] = useState<NotificationChannel[]>(['popup', 'email']);
  const [categoryPopupSound, setCategoryPopupSound] = useState(true);
  const [customSettings, setCustomSettings] = useState<Record<string, {
    channels: NotificationChannel[];
    digestEnabled: boolean;
    digestFrequency?: NotificationFrequency;
    popupSound?: boolean;
  }>>({});

  const notifications = getNotificationsByCategory(category);
  const categoryInfo = CATEGORY_INFO[category];

  const filteredNotifications = searchQuery
    ? notifications.filter(n =>
        n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : notifications;

  const getEffectiveChannels = (notificationId: string): NotificationChannel[] => {
    return customSettings[notificationId]?.channels || categoryDefaults;
  };

  const getEffectivePopupSound = (notificationId: string): boolean => {
    return customSettings[notificationId]?.popupSound ?? categoryPopupSound;
  };

  const isCustom = (notificationId: string): boolean => {
    const current = customSettings[notificationId];
    if (!current) return false;

    // Check if current state differs from defaults
    const defaultChannels = categoryDefaults;
    const channelsDiffer = JSON.stringify([...current.channels].sort()) !== JSON.stringify([...defaultChannels].sort());
    const popupSoundDiffer = current.popupSound !== categoryPopupSound;
    const digestDiffer = current.digestEnabled !== false; // Default digest is false

    return channelsDiffer || popupSoundDiffer || digestDiffer;
  };

  const toggleCategoryChannel = (channel: NotificationChannel) => {
    const newDefaults = categoryDefaults.includes(channel)
      ? categoryDefaults.filter(c => c !== channel)
      : [...categoryDefaults, channel];
    setCategoryDefaults(newDefaults);
    toast.success('Category defaults updated');
    
    // Show custom warning briefly
    setShowCustomWarning(true);
    setTimeout(() => setShowCustomWarning(false), 5000);
  };

  const toggleCategoryPopupSound = () => {
    setCategoryPopupSound(!categoryPopupSound);
    toast.success('Category defaults updated');
    
    // Show custom warning briefly
    setShowCustomWarning(true);
    setTimeout(() => setShowCustomWarning(false), 5000);
  };

  const toggleNotificationChannel = (notificationId: string, channel: NotificationChannel) => {
    const currentChannels = getEffectiveChannels(notificationId);
    const newChannels = currentChannels.includes(channel)
      ? currentChannels.filter(c => c !== channel)
      : [...currentChannels, channel];
    
    const newSettings = {
      channels: newChannels,
      digestEnabled: customSettings[notificationId]?.digestEnabled || false,
      digestFrequency: customSettings[notificationId]?.digestFrequency,
      popupSound: customSettings[notificationId]?.popupSound ?? categoryPopupSound,
    };

    // Check if this matches defaults (logic fix #3)
    const matchesDefaults = 
      JSON.stringify([...newSettings.channels].sort()) === JSON.stringify([...categoryDefaults].sort()) &&
      newSettings.popupSound === categoryPopupSound &&
      !newSettings.digestEnabled;

    if (matchesDefaults) {
      // Remove custom setting - it matches defaults
      const updated = { ...customSettings };
      delete updated[notificationId];
      setCustomSettings(updated);
    } else {
      setCustomSettings({
        ...customSettings,
        [notificationId]: newSettings,
      });
    }
  };

  const toggleNotificationPopupSound = (notificationId: string) => {
    const current = customSettings[notificationId];
    const currentChannels = current?.channels || categoryDefaults;
    const newPopupSound = !(current?.popupSound ?? categoryPopupSound);
    
    const newSettings = {
      channels: currentChannels,
      digestEnabled: current?.digestEnabled || false,
      digestFrequency: current?.digestFrequency,
      popupSound: newPopupSound,
    };

    // Check if this matches defaults (logic fix #3)
    const matchesDefaults = 
      JSON.stringify([...newSettings.channels].sort()) === JSON.stringify([...categoryDefaults].sort()) &&
      newSettings.popupSound === categoryPopupSound &&
      !newSettings.digestEnabled;

    if (matchesDefaults) {
      const updated = { ...customSettings };
      delete updated[notificationId];
      setCustomSettings(updated);
    } else {
      setCustomSettings({
        ...customSettings,
        [notificationId]: newSettings,
      });
    }
  };

  const toggleDigest = (notificationId: string) => {
    const current = customSettings[notificationId];
    const newDigestEnabled = !current?.digestEnabled;
    
    const newSettings = {
      channels: current?.channels || categoryDefaults,
      digestEnabled: newDigestEnabled,
      digestFrequency: newDigestEnabled ? 'hourly' : current?.digestFrequency,
      popupSound: current?.popupSound ?? categoryPopupSound,
    };

    // Check if this matches defaults (logic fix #3)
    const matchesDefaults = 
      JSON.stringify([...newSettings.channels].sort()) === JSON.stringify([...categoryDefaults].sort()) &&
      newSettings.popupSound === categoryPopupSound &&
      !newSettings.digestEnabled;

    if (matchesDefaults) {
      const updated = { ...customSettings };
      delete updated[notificationId];
      setCustomSettings(updated);
    } else {
      setCustomSettings({
        ...customSettings,
        [notificationId]: newSettings,
      });
    }
  };

  const updateDigestFrequency = (notificationId: string, frequency: NotificationFrequency) => {
    const current = customSettings[notificationId];
    if (current) {
      setCustomSettings({
        ...customSettings,
        [notificationId]: {
          ...current,
          digestFrequency: frequency,
        },
      });
    }
  };

  const resetToDefaults = (notificationId: string) => {
    const newSettings = { ...customSettings };
    delete newSettings[notificationId];
    setCustomSettings(newSettings);
    toast.success('Reset to category defaults');
  };

  const defaultTrigger = (
    <Button variant="outline" size="sm" className="gap-2">
      <SettingsIcon className="w-4 h-4" />
      Notifications
    </Button>
  );

  // Get custom notifications for warning message
  const customNotifications = filteredNotifications
    .map((n, idx) => ({ ...n, index: idx + 1 }))
    .filter(n => isCustom(n.id));

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger || defaultTrigger}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto px-6">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${categoryInfo.color}20` }}
            >
              <Bell
                className="w-5 h-5"
                style={{ color: categoryInfo.color }}
              />
            </div>
            {categoryInfo.label}
          </SheetTitle>
          <SheetDescription>
            Manage how you receive {categoryInfo.label.toLowerCase()}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Quick Links */}
          <div className="flex flex-col gap-2 p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
            <Button
              variant="ghost"
              size="sm"
              className="justify-start gap-2 h-auto py-2"
              onClick={() => {
                if (onNavigateToSettings) {
                  onNavigateToSettings();
                  setOpen(false);
                }
              }}
            >
              <SettingsIcon className="w-4 h-4" />
              <span className="text-xs">View All Notification Settings</span>
              <ExternalLink className="w-3 h-3 ml-auto" />
            </Button>
            <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400">
              <Moon className="w-3.5 h-3.5" />
              <span>Quiet Hours and global settings available in main settings</span>
            </div>
          </div>

          {/* Category Defaults */}
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
            <h3 className="text-sm font-medium mb-3">Category Defaults</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
              These settings apply to all notifications unless customized individually
            </p>
            <div className="flex gap-2 flex-wrap">
              {/* Pop Up Alerts with Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setOpenPopupDropdown(openPopupDropdown === 'category' ? null : 'category')}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-all border-2",
                    categoryDefaults.includes('popup')
                      ? "border-purple-500 bg-white dark:bg-gray-800 text-purple-700 dark:text-purple-300"
                      : "border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300 dark:hover:border-gray-600"
                  )}
                >
                  {categoryDefaults.includes('popup') && <Check className="w-4 h-4" />}
                  {categoryDefaults.includes('popup') && categoryPopupSound ? (
                    <Volume2 className="w-4 h-4" />
                  ) : categoryDefaults.includes('popup') ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <MessageSquare className="w-4 h-4" />
                  )}
                  Pop Up Alerts
                  <ChevronDown className="w-3 h-3" />
                </button>

                {/* Dropdown Menu */}
                {openPopupDropdown === 'category' && (
                  <>
                    {/* Backdrop */}
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setOpenPopupDropdown(null)}
                    />
                    {/* Dropdown */}
                    <div className="absolute left-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg z-50 min-w-[200px]">
                      <button
                        onClick={() => {
                          // Turn on popup with sound
                          if (!categoryDefaults.includes('popup')) {
                            toggleCategoryChannel('popup');
                            if (!categoryPopupSound) {
                              toggleCategoryPopupSound();
                            }
                          } else if (!categoryPopupSound) {
                            toggleCategoryPopupSound();
                          }
                          setOpenPopupDropdown(null);
                        }}
                        className={cn(
                          "w-full px-3 py-2 text-left text-xs flex items-center gap-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg",
                          categoryDefaults.includes('popup') && categoryPopupSound && "bg-purple-50 dark:bg-purple-900/20"
                        )}
                      >
                        <Volume2 className="w-4 h-4" />
                        <span className="flex-1">Popup with sound</span>
                        {categoryDefaults.includes('popup') && categoryPopupSound && <Check className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => {
                          // Turn on popup without sound
                          if (!categoryDefaults.includes('popup')) {
                            toggleCategoryChannel('popup');
                            if (categoryPopupSound) {
                              toggleCategoryPopupSound();
                            }
                          } else if (categoryPopupSound) {
                            toggleCategoryPopupSound();
                          }
                          setOpenPopupDropdown(null);
                        }}
                        className={cn(
                          "w-full px-3 py-2 text-left text-xs flex items-center gap-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700",
                          categoryDefaults.includes('popup') && !categoryPopupSound && "bg-purple-50 dark:bg-purple-900/20"
                        )}
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span className="flex-1">Popup</span>
                        {categoryDefaults.includes('popup') && !categoryPopupSound && <Check className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => {
                          // Turn off popup
                          if (categoryDefaults.includes('popup')) {
                            toggleCategoryChannel('popup');
                          }
                          setOpenPopupDropdown(null);
                        }}
                        className={cn(
                          "w-full px-3 py-2 text-left text-xs flex items-center gap-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg",
                          !categoryDefaults.includes('popup') && "bg-purple-50 dark:bg-purple-900/20"
                        )}
                      >
                        <X className="w-4 h-4" />
                        <span className="flex-1">No popup</span>
                        {!categoryDefaults.includes('popup') && <Check className="w-4 h-4" />}
                      </button>
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={() => toggleCategoryChannel('email')}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-all border-2",
                  categoryDefaults.includes('email')
                    ? "border-blue-500 bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-300"
                    : "border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300 dark:hover:border-gray-600"
                )}
              >
                {categoryDefaults.includes('email') ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <X className="w-4 h-4" />
                )}
                <MailIcon className="w-4 h-4" />
                Email
              </button>

              <button
                onClick={() => toggleCategoryChannel('sms')}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-all border-2",
                  categoryDefaults.includes('sms')
                    ? "border-green-500 bg-white dark:bg-gray-800 text-green-700 dark:text-green-300"
                    : "border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300 dark:hover:border-gray-600"
                )}
              >
                {categoryDefaults.includes('sms') ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <X className="w-4 h-4" />
                )}
                <Smartphone className="w-4 h-4" />
                SMS
              </button>
            </div>

            {/* Custom Notifications Warning - Refinement #1 */}
            <AnimatePresence>
              {showCustomWarning && customNotifications.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <div className="text-xs text-blue-800 dark:text-blue-200">
                        Notification{customNotifications.length !== 1 ? 's' : ''} <span className="font-semibold">{customNotifications.map(n => n.index).join(', ')}</span> {customNotifications.length !== 1 ? 'are' : 'is'} not affected by this change because {customNotifications.length !== 1 ? 'they have' : 'it has'} custom settings. 
                        Look for the <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] border border-blue-400 bg-blue-100 dark:bg-blue-900/40 mx-1">Custom</span> badge below.
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Search */}
          <div className="relative">
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

          {/* Notification List */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">
              Individual Notifications ({filteredNotifications.length})
            </h3>

            {filteredNotifications.map((notification, index) => {
              const channels = getEffectiveChannels(notification.id);
              const isCustomSetting = isCustom(notification.id);
              const settings = customSettings[notification.id];
              const hasDigest = settings?.digestEnabled || false;
              const popupSound = getEffectivePopupSound(notification.id);
              const hasPopup = channels.includes('popup');

              return (
                <div
                  key={notification.id}
                  className="px-3 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium">{notification.name}</h4>
                        {isCustomSetting && (
                          <Badge variant="outline" className="text-xs border-blue-400 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20">
                            Custom
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        {notification.description}
                      </p>

                      {/* Refinement #5: Add actual notification text example */}
                      <div className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 px-2 py-1.5 rounded mb-3 border-l-2 border-purple-400 dark:border-purple-600">
                        <span className="text-xs text-gray-500 dark:text-gray-500 italic">Example:</span> &ldquo;{getNotificationExample(notification.id)}&rdquo;
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-2">
                      {/* Number Badge */}
                      <span className="text-2xl text-gray-900 dark:text-gray-100 opacity-20 font-medium min-w-[32px] text-right leading-none">
                        {index + 1}
                      </span>
                      
                      {/* Refinement #2: Add "Reset" text next to icon */}
                      {isCustomSetting && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => resetToDefaults(notification.id)}
                          className="gap-1"
                          title="Reset to category defaults"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span className="text-xs">Reset</span>
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Channel Toggles */}
                  <div className="flex flex-wrap gap-2 mb-2">
                    {/* Refinement #4: Pop Up with improved 3-option dropdown matching main settings */}
                    <div className="relative">
                      <button
                        onClick={() => setOpenPopupDropdown(openPopupDropdown === notification.id ? null : notification.id)}
                        className={cn(
                          "px-2 py-1 rounded text-xs flex items-center gap-1 transition-all border",
                          hasPopup
                            ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300"
                            : "border-gray-200 dark:border-gray-700 text-gray-500"
                        )}
                      >
                        {hasPopup && <Check className="w-3 h-3" />}
                        {hasPopup && popupSound ? (
                          <Volume2 className="w-3 h-3" />
                        ) : hasPopup ? (
                          <VolumeX className="w-3 h-3" />
                        ) : (
                          <MessageSquare className="w-3 h-3" />
                        )}
                        Pop Up
                        <ChevronDown className="w-2.5 h-2.5" />
                      </button>

                      {/* Dropdown Menu */}
                      {openPopupDropdown === notification.id && (
                        <>
                          {/* Backdrop */}
                          <div 
                            className="fixed inset-0 z-40" 
                            onClick={() => setOpenPopupDropdown(null)}
                          />
                          {/* Dropdown */}
                          <div className="absolute left-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg z-50 min-w-[180px]">
                            <button
                              onClick={() => {
                                // Turn on popup with sound
                                if (!hasPopup) {
                                  toggleNotificationChannel(notification.id, 'popup');
                                  if (!popupSound) {
                                    toggleNotificationPopupSound(notification.id);
                                  }
                                } else if (!popupSound) {
                                  toggleNotificationPopupSound(notification.id);
                                }
                                setOpenPopupDropdown(null);
                              }}
                              className={cn(
                                "w-full px-3 py-2 text-left text-xs flex items-center gap-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg",
                                hasPopup && popupSound && "bg-purple-50 dark:bg-purple-900/20"
                              )}
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                              <span className="flex-1">Popup with sound</span>
                              {hasPopup && popupSound && <Check className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={() => {
                                // Turn on popup without sound
                                if (!hasPopup) {
                                  toggleNotificationChannel(notification.id, 'popup');
                                  if (popupSound) {
                                    toggleNotificationPopupSound(notification.id);
                                  }
                                } else if (popupSound) {
                                  toggleNotificationPopupSound(notification.id);
                                }
                                setOpenPopupDropdown(null);
                              }}
                              className={cn(
                                "w-full px-3 py-2 text-left text-xs flex items-center gap-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700",
                                hasPopup && !popupSound && "bg-purple-50 dark:bg-purple-900/20"
                              )}
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span className="flex-1">Popup</span>
                              {hasPopup && !popupSound && <Check className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={() => {
                                // Turn off popup
                                if (hasPopup) {
                                  toggleNotificationChannel(notification.id, 'popup');
                                }
                                setOpenPopupDropdown(null);
                              }}
                              className={cn(
                                "w-full px-3 py-2 text-left text-xs flex items-center gap-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg",
                                !hasPopup && "bg-purple-50 dark:bg-purple-900/20"
                              )}
                            >
                              <X className="w-3.5 h-3.5" />
                              <span className="flex-1">No popup</span>
                              {!hasPopup && <Check className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </>
                      )}
                    </div>

                    <button
                      onClick={() => toggleNotificationChannel(notification.id, 'email')}
                      className={cn(
                        "px-2 py-1 rounded text-xs flex items-center gap-1 transition-all border",
                        channels.includes('email')
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                          : "border-gray-200 dark:border-gray-700 text-gray-500"
                      )}
                    >
                      {channels.includes('email') ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <X className="w-3 h-3" />
                      )}
                      <MailIcon className="w-3 h-3" />
                      Email
                    </button>

                    <button
                      onClick={() => toggleNotificationChannel(notification.id, 'sms')}
                      className={cn(
                        "px-2 py-1 rounded text-xs flex items-center gap-1 transition-all border",
                        channels.includes('sms')
                          ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                          : "border-gray-200 dark:border-gray-700 text-gray-500"
                      )}
                    >
                      {channels.includes('sms') ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <X className="w-3 h-3" />
                      )}
                      <Smartphone className="w-3 h-3" />
                      SMS
                    </button>

                    <button
                      onClick={() => toggleDigest(notification.id)}
                      className={cn(
                        "px-2 py-1 rounded text-xs flex items-center gap-1 transition-all border",
                        hasDigest
                          ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300"
                          : "border-gray-200 dark:border-gray-700 text-gray-500"
                      )}
                    >
                      <Clock className="w-3 h-3" />
                      Email Digest
                    </button>
                  </div>

                  {/* Digest Frequency Selector */}
                  {hasDigest && (
                    <div className="mt-3">
                      <Select
                        value={settings?.digestFrequency || 'hourly'}
                        onValueChange={(v) => updateDigestFrequency(notification.id, v as NotificationFrequency)}
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
              );
            })}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
