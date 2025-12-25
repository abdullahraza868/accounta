import { NotificationCategory, NotificationChannel, NotificationFrequency } from '../types/notifications';
import { getNotificationsByCategory, getPrioritySettings } from './notificationTypes';

/**
 * SMART NOTIFICATION DEFAULTS
 * 
 * This system automatically calculates the best default settings for each category
 * based on the priority levels of the notifications it contains.
 * 
 * Priority Mapping:
 * - URGENT: Popup + Email + SMS with sound (critical security/financial alerts)
 * - IMPORTANT: Popup + Email silent (time-sensitive but not critical)
 * - NORMAL: Email only + Digest every 4 hours (informational updates that can be batched)
 * - LOW: Email + Digest beginning-of-day (low priority updates, batched daily)
 * 
 * Calculated Defaults by Category (based on actual notification priority distribution):
 * 
 * ✓ CLIENT: Popup + Email (silent)
 *   - 7/12 notifications are "important" (payments, messages, appointments, document requests)
 *   - Examples: Payment Received, Client Message, Appointment Booked
 * 
 * ✓ PROJECT: Email only
 *   - 5/10 notifications are "normal" (updates, comments, milestones)
 *   - Examples: Project Created, Status Changed, Comment Added
 * 
 * ✓ TASK: Popup + Email (silent)
 *   - 4/8 notifications are "important" (assignments, due dates, mentions)
 *   - Examples: Task Assigned, Task Due Soon, Mentioned in Task
 * 
 * ✓ ORGANIZER: Popup + Email (silent)
 *   - 3/6 notifications are "important" (reminders, invitations, cancellations)
 *   - Examples: Event Reminder, Event Cancelled, Event Invitation
 * 
 * ✓ INVOICE: Popup + Email (silent)
 *   - 4/8 notifications are "important" (sent, paid, overdue)
 *   - 2/8 are "urgent" (payment failed, disputed)
 *   - Examples: Invoice Paid, Invoice Overdue, Invoice Sent
 * 
 * ✓ SUBSCRIPTION: Popup + Email (silent)
 *   - 3/5 notifications are "important" (renewals, upgrades)
 *   - 2/5 are "urgent" (payment failed, cancelled)
 *   - Examples: Renewal Upcoming, Subscription Renewed
 * 
 * ✓ SIGNATURE: Popup + Email (silent)
 *   - 4/7 notifications are "important" (signed, declined, completed, expired)
 *   - Examples: Document Signed, All Recipients Signed, Document Expired
 * 
 * ✓ INCOMING-DOCUMENTS: Email only
 *   - 2/5 notifications are "normal" (received, processed)
 *   - 2/5 are "low" (scan completed, OCR completed)
 *   - Examples: Document Received, Document Processed
 * 
 * ✓ TEAM: Email only
 *   - 4/6 notifications are "normal" (member changes, assignments, announcements)
 *   - Examples: Team Member Added, Team Assignment, Team Announcement
 * 
 * ✓ HR: Email only
 *   - 3/5 notifications are "normal" (approvals, reviews, documents)
 *   - Examples: Time Off Approved, Performance Review, HR Document Ready
 * 
 * ✓ SYSTEM: Email only
 *   - 2/4 notifications are "normal", 2/4 are "low" (tied)
 *   - Examples: Maintenance Scheduled, System Error, Update Available
 * 
 * ✓ SECURITY: Popup + Email + SMS with sound (ALWAYS URGENT)
 *   - 3/3 notifications are "urgent" and locked
 *   - Examples: New Device Login, Password Changed, Suspicious Activity
 */

export interface CategoryDefault {
  category: NotificationCategory;
  channels: NotificationChannel[];
  digestEnabled: boolean;
  digestFrequency: NotificationFrequency;
  popupSound: boolean;
}

/**
 * Generate smart category defaults based on notification priorities
 * This function analyzes all notifications in each category and applies
 * settings based on the most common priority level.
 */
export const generateSmartCategoryDefaults = (): CategoryDefault[] => {
  const categories: NotificationCategory[] = [
    'client', 
    'project', 
    'task', 
    'organizer', 
    'invoice', 
    'subscription',
    'signature', 
    'incoming-documents', 
    'team', 
    'hr', 
    'system', 
    'security'
  ];

  return categories.map(category => {
    // Security category always gets all channels with sound
    if (category === 'security') {
      return {
        category,
        channels: ['popup', 'email', 'sms'] as NotificationChannel[],
        digestEnabled: false,
        digestFrequency: 'hourly' as NotificationFrequency,
        popupSound: true,
      };
    }

    // Get all notifications in this category
    const notifications = getNotificationsByCategory(category);
    
    // Determine the most common priority in this category
    const priorityCounts = notifications.reduce((acc, n) => {
      acc[n.priority] = (acc[n.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Get the most common priority (sort by count descending, then alphabetically for ties)
    const mostCommonPriority = Object.entries(priorityCounts)
      .sort(([keyA, countA], [keyB, countB]) => {
        if (countB !== countA) return countB - countA;
        // For ties, prioritize higher urgency
        const priorityOrder = ['urgent', 'important', 'normal', 'low'];
        return priorityOrder.indexOf(keyA) - priorityOrder.indexOf(keyB);
      })[0]?.[0] || 'normal';
    
    // Apply priority-based settings
    const settings = getPrioritySettings(mostCommonPriority);
    
    return {
      category,
      channels: settings.channels,
      digestEnabled: settings.digestEnabled || false,
      digestFrequency: settings.digestFrequency || 'beginning-of-day' as NotificationFrequency,
      popupSound: settings.popupSound || false,
    };
  });
};

/**
 * Get a summary of what the defaults will be for display/debugging
 */
export const getDefaultsSummary = () => {
  const defaults = generateSmartCategoryDefaults();
  
  return defaults.map(def => {
    const notifications = getNotificationsByCategory(def.category);
    const priorityCounts = notifications.reduce((acc, n) => {
      acc[n.priority] = (acc[n.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostCommonPriority = Object.entries(priorityCounts)
      .sort(([keyA, countA], [keyB, countB]) => {
        if (countB !== countA) return countB - countA;
        const priorityOrder = ['urgent', 'important', 'normal', 'low'];
        return priorityOrder.indexOf(keyA) - priorityOrder.indexOf(keyB);
      })[0]?.[0] || 'normal';
    
    return {
      category: def.category,
      totalNotifications: notifications.length,
      priorityCounts,
      dominantPriority: mostCommonPriority,
      channels: def.channels,
      popupSound: def.popupSound,
      digestEnabled: def.digestEnabled,
      digestFrequency: def.digestFrequency,
    };
  });
};

/**
 * Default quiet hours settings
 */
export const DEFAULT_QUIET_HOURS = {
  enabled: false,
  startTime: '22:00',
  endTime: '08:00',
  allowUrgent: true,
};