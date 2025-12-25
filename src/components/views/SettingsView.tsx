import { 
  Building2, 
  Palette, 
  Navigation, 
  Mail, 
  LayoutGrid, 
  Calendar, 
  CalendarDays,
  Link2,
  Bell,
  Download,
  Settings,
  Repeat,
  FileText,
  CreditCard,
  FolderOpen
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';

type SettingCard = {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  iconBg: string;
  onClick?: () => void;
};

const settingsCards: SettingCard[] = [
  {
    id: 'application',
    icon: Settings,
    title: 'Application Settings',
    description: 'Configure global preferences including date formats, signature request defaults, and more.',
    iconBg: 'bg-purple-500'
  },
  {
    id: 'company',
    icon: Building2,
    title: 'Company Settings',
    description: 'Enter firm details, manage your team, roles, and multi-factor authentication.',
    iconBg: 'bg-indigo-600'
  },
  {
    id: 'branding',
    icon: Palette,
    title: 'Platform Branding',
    description: 'Set a visual identity for your Acounta profile, including brand colors and logos.',
    iconBg: 'bg-gray-400'
  },
  {
    id: 'navigation',
    icon: Navigation,
    title: 'Navigation',
    description: 'Customize menus, links, and other elements to suit your needs.',
    iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600'
  },
  {
    id: 'email',
    icon: Mail,
    title: 'Email Customization',
    description: 'Create and manage custom email templates and payment reminder strategies.',
    iconBg: 'bg-gray-400'
  },
  {
    id: 'payment-reminder',
    icon: CreditCard,
    title: 'Payment Reminder Strategy',
    description: 'Configure email dunning reminders for subscriptions with payment methods on file.',
    iconBg: 'bg-purple-600'
  },
  {
    id: 'invoice-reminder',
    icon: FileText,
    title: 'Invoice Reminder Strategy',
    description: 'Configure payment reminders for invoices and subscriptions without payment methods.',
    iconBg: 'bg-blue-600'
  },
  {
    id: 'payment-retry',
    icon: Repeat,
    title: 'Payment Retry Strategy',
    description: 'Configure automatic payment retry attempts before email reminders begin.',
    iconBg: 'bg-orange-600'
  },
  {
    id: 'dashboard',
    icon: LayoutGrid,
    title: 'Dashboard Modules',
    description: 'Customize dashboard views for you and your team.',
    iconBg: 'bg-gray-400'
  },
  {
    id: 'schedule',
    icon: Calendar,
    title: 'Schedule Settings',
    description: 'Customize schedules for you and your team.',
    iconBg: 'bg-gray-400'
  },
  {
    id: 'schedule-widget',
    icon: CalendarDays,
    title: 'Schedule Widget Settings',
    description: 'Customize schedule widget to embed it on your websites.',
    iconBg: 'bg-gray-400'
  },
  {
    id: 'connected',
    icon: Link2,
    title: 'Connected Accounts',
    description: 'Add or remove connected accounts for syncing of emails and calendars.',
    iconBg: 'bg-gray-400'
  },
  {
    id: 'reminders',
    icon: Bell,
    title: 'Reminder Management',
    description: 'Add or remove reminders for sign document, upload documents, pay invoices and more.',
    iconBg: 'bg-gray-400'
  },
  {
    id: 'folders',
    icon: FolderOpen,
    title: 'Folder Management',
    description: 'Organize your documents into folders for better accessibility.',
    iconBg: 'bg-amber-600'
  }
];

export function SettingsView() {
  const navigate = useNavigate();
  
  const handleCardClick = (cardId: string) => {
    if (cardId === 'application') {
      navigate('/application-settings');
    } else if (cardId === 'company') {
      navigate('/company-settings');
    } else if (cardId === 'navigation') {
      navigate('/navigation');
    } else if (cardId === 'branding') {
      navigate('/platform-branding');
    } else if (cardId === 'email') {
      navigate('/email-customization');
    } else if (cardId === 'payment-reminder') {
      navigate('/payment-reminder-strategy');
    } else if (cardId === 'invoice-reminder') {
      navigate('/invoice-reminder-strategy');
    } else if (cardId === 'payment-retry') {
      navigate('/payment-retry-strategy');
    } else if (cardId === 'folders') {
      navigate('/folders');
    }
  };
  
  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
      {/* Settings Grid */}
      <div className="flex-1 overflow-auto bg-gradient-to-br from-gray-50 via-purple-50/20 to-gray-50 dark:from-gray-900 dark:via-purple-950/10 dark:to-gray-900">
        <div className="max-w-[1400px] mx-auto p-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-gray-900 dark:text-gray-100 mb-2">Settings</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your account and application preferences</p>
          </div>

          {/* Settings Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {settingsCards.map((card) => (
              <div
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm hover:shadow-lg hover:border-purple-200/50 dark:hover:border-purple-700/50 transition-all duration-300 p-8 flex flex-col items-center text-center cursor-pointer"
              >
                {/* Icon */}
                <div className={`w-20 h-20 rounded-full ${card.iconBg} dark:bg-gray-600 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-300`}>
                  <card.icon className="w-10 h-10 text-white" />
                </div>

                {/* Title */}
                <h3 className="text-gray-900 dark:text-gray-100 mb-3">{card.title}</h3>

                {/* Description */}
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 flex-1 leading-relaxed">
                  {card.description}
                </p>

                {/* Edit Button */}
                <Button
                  variant="outline"
                  className="w-full hover:bg-gradient-to-br hover:from-purple-50 hover:to-purple-100 dark:hover:from-purple-900/30 dark:hover:to-purple-800/30 hover:border-purple-300 dark:hover:border-purple-600 hover:text-purple-700 dark:hover:text-purple-300 transition-all duration-200 pointer-events-none"
                >
                  Edit
                </Button>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-gray-200/50 text-center">
            <p className="text-xs text-gray-500">
              Copyright © 2025, Acounta ® Inc. All Rights Reserved.{' '}
              <a href="#" className="text-purple-600 hover:text-purple-700 underline">
                923-ACOUNTA (226-8682)
              </a>
            </p>
            <div className="flex items-center justify-center gap-4 mt-3">
              <a href="#" className="text-xs text-gray-500 hover:text-purple-600">
                Terms & Conditions
              </a>
              <span className="text-gray-300">•</span>
              <a href="#" className="text-xs text-gray-500 hover:text-purple-600">
                Privacy Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}