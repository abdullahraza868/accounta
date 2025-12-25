// Notification System Types

export type NotificationChannel = 'popup' | 'email' | 'sms';

export type NotificationFrequency = 'hourly' | '2-hours' | '4-hours' | 'beginning-of-day' | 'end-of-day' | 'weekly';

export type NotificationPriority = 'urgent' | 'important' | 'normal' | 'low' | 'off';

export type NotificationCategory = 
  | 'client'
  | 'project'
  | 'task'
  | 'organizer'
  | 'invoice'
  | 'subscription'
  | 'signature'
  | 'incoming-documents'
  | 'team'
  | 'hr'
  | 'system'
  | 'security';

export type UserRole = 'admin' | 'partner' | 'manager' | 'staff';

export interface NotificationType {
  id: string;
  category: NotificationCategory;
  name: string;
  description: string;
  locked?: boolean; // Cannot be disabled (e.g., security alerts)
  isUrgent?: boolean; // Can override quiet hours
  defaultChannels: NotificationChannel[];
  priority: NotificationPriority; // Default priority level for this notification
}

export interface NotificationPreference {
  notificationId: string;
  channels: NotificationChannel[];
  isCustom: boolean; // false = using category defaults, true = custom override
  digestEnabled: boolean;
  digestFrequency?: NotificationFrequency;
  digestWeekDay?: number; // 0-6 for Sunday-Saturday, used when digestFrequency is 'weekly'
  popupSound?: boolean; // Enable/disable sound for popup notifications (only applies if popup is in channels)
}

export interface CategoryDefaults {
  category: NotificationCategory;
  channels: NotificationChannel[];
  digestEnabled?: boolean;
  digestFrequency?: NotificationFrequency;
  digestWeekDay?: number; // 0-6 for Sunday-Saturday
  popupSound?: boolean; // Enable/disable sound for popup notifications (only applies if popup is in channels)
}

export interface QuietHours {
  enabled: boolean;
  startTime: string; // "22:00"
  endTime: string; // "08:00"
  allowUrgent: boolean; // Allow urgent notifications during quiet hours
}

export interface UserNotificationSettings {
  userId: string;
  role: UserRole;
  categoryDefaults: CategoryDefaults[];
  preferences: NotificationPreference[];
  quietHours: QuietHours;
}