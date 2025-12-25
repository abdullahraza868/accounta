import React, { createContext, useContext, useState, useEffect } from 'react';
import accountaLogo from 'figma:asset/30eae3907a12e58c0f2fee0d1b43b11006b4eed4.png';

export type DateFormat = 'MM-DD-YYYY' | 'DD-MM-YYYY' | 'YYYY-MM-DD';
export type TimeFormat = '12-hour' | '24-hour';

export type AppSettings = {
  dateFormat: DateFormat;
  timeFormat: TimeFormat;
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
  mobileLogoUrl: string;
};

type AppSettingsContextType = {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  formatDate: (date: Date | string) => string;
  formatTime: (date: Date | string) => string;
  formatDateTime: (date: Date | string) => string;
};

const defaultSettings: AppSettings = {
  dateFormat: 'MM-DD-YYYY',
  timeFormat: '12-hour',
  primaryColor: '#7c3aed', // Purple/Violet 600
  secondaryColor: '#a78bfa', // Purple/Violet 400
  logoUrl: accountaLogo, // Client portal logo (desktop) - Default to Acounta logo
  mobileLogoUrl: accountaLogo, // Client portal logo (mobile) - Default to Acounta logo
};

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined);

export function AppSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const savedSettings = localStorage.getItem('appSettings');
    return savedSettings ? { ...defaultSettings, ...JSON.parse(savedSettings) } : defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
    
    // Update CSS variables for primary and secondary colors
    document.documentElement.style.setProperty('--primaryColor', settings.primaryColor);
    document.documentElement.style.setProperty('--secondaryColor', settings.secondaryColor);
  }, [settings]);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const formatDate = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(d.getTime())) return 'Invalid Date';
    
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const year = d.getFullYear();

    switch (settings.dateFormat) {
      case 'MM-DD-YYYY':
        return `${month}-${day}-${year}`;
      case 'DD-MM-YYYY':
        return `${day}-${month}-${year}`;
      case 'YYYY-MM-DD':
        return `${year}-${month}-${day}`;
      default:
        return `${month}-${day}-${year}`;
    }
  };

  const formatTime = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(d.getTime())) return 'Invalid Date';
    
    const hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    
    if (settings.timeFormat === '24-hour') {
      return `${String(hours).padStart(2, '0')}:${minutes}`;
    } else {
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      return `${displayHours}:${minutes} ${ampm}`;
    }
  };

  const formatDateTime = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(d.getTime())) return 'Invalid Date';
    
    const dateStr = formatDate(d);
    const timeStr = formatTime(d);
    
    return `${dateStr}\n${timeStr}`;
  };

  return (
    <AppSettingsContext.Provider value={{ settings, updateSettings, formatDate, formatTime, formatDateTime }}>
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings() {
  const context = useContext(AppSettingsContext);
  if (context === undefined) {
    throw new Error('useAppSettings must be used within an AppSettingsProvider');
  }
  return context;
}